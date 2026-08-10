import os
import random
import smtplib
import bcrypt
import jwt
import threading
from datetime import datetime, timedelta, timezone
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from fastapi import FastAPI, HTTPException, status, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import schemas
import database

from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[SERVER STARTUP] Idea360 API Server initialized successfully.")
    yield

app = FastAPI(
    title="Idea360 API Server",
    description="Python FastAPI Backend for Idea360 Innovation Portal",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS (Supports localhost, 127.0.0.1 and custom domains with credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET", "idea360_super_secret_key_2026")
SMTP_USER = (os.getenv("SMTP_USER") or "").strip()
SMTP_PASS = (os.getenv("SMTP_PASS") or "").replace(" ", "")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")

def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Verifies JWT Bearer token from request Authorization header if present."""
    if not authorization:
        return {"id": 0, "username": "Guest", "role": "User", "email": ""}
    try:
        token = authorization.replace("Bearer ", "").strip()
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except Exception as err:
        print("[JWT VERIFY WARNING]", err)
        return {"id": 0, "username": "Guest", "role": "User", "email": ""}

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt(10)
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception as e:
        print("Password verification error:", e)
        return False

def generate_jwt_token(user_id: int, email: str, role: str, username: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(days=7)
    payload = {
        "id": user_id,
        "email": email,
        "role": role,
        "username": username,
        "exp": expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def send_otp_email_smtp(to_email: str, otp_code: str):
    print(f"\n==================================================")
    print(f"[OTP GENERATED & READY] EMAIL: {to_email} | CODE: {otp_code}")
    print(f"==================================================\n")
    
    if not (SMTP_USER and SMTP_PASS):
        print(f"[EMAIL NOTICE] SMTP_USER or SMTP_PASS missing in backend/.env. Using console OTP code: {otp_code}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Idea360 OTP Code: {otp_code}"
    msg["From"] = SMTP_USER
    msg["To"] = to_email

    plain_text = f"Your Idea360 verification OTP code is: {otp_code}\nThis code will expire in 15 minutes."
    
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
      <h2 style="color: #4f46e5; margin-top: 0;">Idea360 Email Verification</h2>
      <p>Your one-time verification code for registration is:</p>
      <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; margin: 20px 0;">
        {otp_code}
      </div>
      <p style="font-size: 13px; color: #64748b;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
    </div>
    """
    
    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
            print(f"[SUCCESS] OTP Email delivered to {to_email} via Gmail SMTP!")
            return
    except Exception as err1:
        print(f"[SMTP Port 587 Warning: {err1}], trying Port 465...")

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
            print(f"[SUCCESS] OTP Email delivered to {to_email} via Gmail SSL!")
    except Exception as err2:
        print(f"[ERROR] Failed to send email to {to_email}: {err2}")

# ==========================================
# ROUTES
# ==========================================

@app.get("/api/health")
def health_check():
    return {"status": "OK", "message": "Idea360 Production Auth API Server (FastAPI) is running!"}

@app.post("/api/auth/register")
def register(req: schemas.RegisterRequest):
    if not req.username or not req.email or not req.password:
        raise HTTPException(status_code=400, detail="Name, email, and password are required.")

    clean_email = req.email.strip().lower()
    existing = database.find_user_by_email(clean_email)
    
    if existing:
        if existing.get("is_verified"):
            raise HTTPException(status_code=400, detail="Email address is already registered & verified! Please sign in.")
        else:
            # Update password for existing unverified user
            hashed_pwd = hash_password(req.password)
            database.update_user_profile_in_db(
                email=clean_email,
                username=req.username,
                employee_id=req.employeeId or "",
                hashed_password=hashed_pwd
            )
    else:
        hashed_pwd = hash_password(req.password)
        database.create_user(
            username=req.username,
            email=clean_email,
            hashed_password=hashed_pwd,
            role=req.role or "User",
            employee_id=req.employeeId or ""
        )

    otp_code = str(random.randint(100000, 999999))
    database.save_otp_to_db(clean_email, otp_code)
    
    # Dispatch email in parallel background thread for instant (<10ms) HTTP response
    threading.Thread(target=send_otp_email_smtp, args=(clean_email, otp_code), daemon=True).start()

    return {
        "message": f"Verification OTP sent to {clean_email}! Please check your email inbox.",
        "requiresOtp": True,
        "email": clean_email
    }

@app.post("/api/auth/verify-otp")
def verify_otp(req: schemas.VerifyOtpRequest):
    if not req.email or not req.otpCode:
        raise HTTPException(status_code=400, detail="Email and OTP code are required.")

    clean_email = req.email.strip().lower()
    is_valid = database.verify_otp_in_db(clean_email, req.otpCode)
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code! Please check your email and try again.")

    database.mark_user_as_verified(clean_email)
    user = database.find_user_by_email(clean_email)

    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    token = generate_jwt_token(
        user_id=user["id"],
        email=user["email"],
        role=user["role"],
        username=user["username"]
    )

    return {
        "message": "Email verified successfully! Session active.",
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "employeeId": user.get("employee_id") or ""
        }
    }

@app.post("/api/auth/resend-otp")
def resend_otp(req: schemas.ResendOtpRequest):
    if not req.email:
        raise HTTPException(status_code=400, detail="Email is required.")

    clean_email = req.email.strip().lower()
    otp_code = str(random.randint(100000, 999999))
    database.save_otp_to_db(clean_email, otp_code)

    # Dispatch email in parallel background thread for instant (<10ms) HTTP response
    threading.Thread(target=send_otp_email_smtp, args=(clean_email, otp_code), daemon=True).start()
    print(f"[RESEND OTP] Sent to {clean_email}")

    return {
        "message": f"New 6-digit OTP code sent to {clean_email}! Please check your email inbox."
    }

@app.post("/api/auth/login")
def login(req: schemas.LoginRequest):
    if not req.email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    clean_email = req.email.strip().lower()
    user = database.find_user_by_email(clean_email)
    
    if not user:
        raise HTTPException(
            status_code=404, 
            detail=f"Account not found for '{clean_email}'. You must register an account first before signing in!"
        )

    # 1. Verify Password Match
    is_match = verify_password(req.password, user["password"])
    if not is_match:
        raise HTTPException(
            status_code=401, 
            detail="Incorrect password! Please check your password and try again."
        )

    # 2. Verify Email OTP Verification Status
    if not user.get("is_verified"):
        raise HTTPException(
            status_code=403, 
            detail="Account registration is incomplete! Please complete 6-digit email OTP verification first."
        )

    # 3. Verify Account Registered Role Match
    registered_role = user.get("role") or "User"
    if req.role and registered_role != req.role:
        raise HTTPException(
            status_code=403,
            detail=f"This account is registered as '{registered_role}'. You cannot sign in under '{req.role}' role!"
        )

    token = generate_jwt_token(
        user_id=user["id"],
        email=user["email"],
        role=registered_role,
        username=user["username"]
    )

    return {
        "message": "Login successful!",
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": registered_role,
            "employeeId": user.get("employee_id") or req.employeeId or ""
        }
    }

@app.put("/api/auth/profile")
def update_profile(req: schemas.ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    if not req.email or not req.username:
        raise HTTPException(status_code=400, detail="Email and full name are required.")

    clean_email = req.email.strip().lower()
    user = database.find_user_by_email(clean_email)
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    hashed_pwd = None
    if req.newPassword:
        if not req.currentPassword:
            raise HTTPException(status_code=400, detail="Current password is required to set a new password.")
        
        is_match = verify_password(req.currentPassword, user["password"])
        if not is_match:
            raise HTTPException(status_code=400, detail="Incorrect current password! Profile update aborted.")
            
        hashed_pwd = hash_password(req.newPassword)

    updated_user = database.update_user_profile_in_db(
        email=clean_email,
        username=req.username,
        employee_id=req.employeeId,
        hashed_password=hashed_pwd
    )

    token = generate_jwt_token(
        user_id=user["id"],
        email=user["email"],
        role=user["role"],
        username=req.username.strip()
    )

    return {
        "message": "Profile updated successfully in database!",
        "token": token,
        "user": {
            "id": user["id"],
            "username": req.username.strip(),
            "email": user["email"],
            "role": user["role"],
            "employeeId": req.employeeId or user.get("employee_id") or ""
        }
    }

@app.get("/api/ideas")
def get_ideas(current_user: dict = Depends(get_current_user)):
    try:
        ideas = database.get_all_ideas_from_db()
        return ideas
    except Exception as err:
        print("Get Ideas Error:", err)
        raise HTTPException(status_code=500, detail="Failed to fetch ideas from database.")



@app.post("/api/ideas", status_code=status.HTTP_201_CREATED)
def create_idea(req: schemas.IdeaCreateRequest, current_user: dict = Depends(get_current_user)):
    if not req.title or not req.category or not req.problemStatement or not req.description:
        raise HTTPException(status_code=400, detail="Title, category, problem statement, and description are required.")

    try:
        idea_dict = req.model_dump()
        idea_dict["embeddingVector"] = []
        idea_dict["duplicityScore"] = 0.0
        idea_dict["duplicityStatus"] = "No Duplicate Matches (0.0% Match)"
        idea_dict["status"] = "Pending Review"

        saved_idea = database.save_idea_to_db(idea_dict)
        return {
            "message": "Idea submitted successfully for Initial Screening!",
            "idea": saved_idea
        }
    except Exception as err:
        print("Save Idea Error:", err)
        raise HTTPException(status_code=500, detail="Failed to save idea to database.")



@app.delete("/api/ideas/clear-all")
def clear_all_ideas():
    try:
        database.delete_all_ideas_from_db()
        return {"message": "All saved ideas and analysis reports deleted successfully!"}
    except Exception as err:
        print("Clear Ideas Error:", err)
        raise HTTPException(status_code=500, detail="Failed to clear ideas.")

@app.patch("/api/ideas/{idea_id}/status")
def update_idea_status(idea_id: int, req: schemas.IdeaStatusUpdateRequest, current_user: dict = Depends(get_current_user)):
    try:
        updated = database.update_idea_status_in_db(idea_id, req.status, req.evaluatorNotes)
        if not updated:
            raise HTTPException(status_code=404, detail="Idea not found.")
        return {"message": f'Idea status updated to "{req.status}"!', "idea": updated}
    except HTTPException:
        raise
    except Exception as err:
        print("Update Status Error:", err)
        raise HTTPException(status_code=500, detail="Failed to update status.")

@app.patch("/api/ideas/{idea_id}/allocation")
def update_idea_allocation(idea_id: int, payload: dict, current_user: dict = Depends(get_current_user)):
    try:
        updated = database.update_idea_allocation_in_db(idea_id, payload)
        if not updated:
            raise HTTPException(status_code=404, detail="Idea not found.")
        return {"message": "Idea allocation updated successfully!", "idea": updated}
    except HTTPException:
        raise
    except Exception as err:
        print("Update Allocation Error:", err)
        raise HTTPException(status_code=500, detail="Failed to update allocation.")

@app.get("/api/analysis-reports")
def get_analysis_reports(current_user: dict = Depends(get_current_user)):
    try:
        reports = database.get_all_analysis_reports_from_db()
        return reports
    except Exception as err:
        print("Get Analysis Reports Error:", err)
        raise HTTPException(status_code=500, detail="Failed to fetch analysis reports from database.")

@app.post("/api/analysis-reports", status_code=status.HTTP_201_CREATED)
def create_analysis_report(req: schemas.AnalysisReportCreateRequest, current_user: dict = Depends(get_current_user)):
    if not req.ideaTitle or not req.baName or not req.reportTitle or not req.summary:
        raise HTTPException(status_code=400, detail="Idea title, BA name, report title, and summary are required.")

    try:
        saved_report = database.save_analysis_report_to_db(req.model_dump())
        return {"message": "Analysis Report submitted to Project Manager successfully!", "report": saved_report}
    except Exception as err:
        print("Save Analysis Report Error:", err)
        raise HTTPException(status_code=500, detail="Failed to save analysis report to database.")

@app.patch("/api/analysis-reports/{report_id}/status")
def update_analysis_report_status(report_id: int, req: schemas.AnalysisReportStatusUpdateRequest, current_user: dict = Depends(get_current_user)):
    try:
        updated = database.update_analysis_report_status_in_db(report_id, req.status, req.pmNotes)
        if not updated:
            raise HTTPException(status_code=404, detail="Analysis report not found.")
        return {"message": f'Analysis report status updated to "{req.status}"!', "report": updated}
    except HTTPException:
        raise
    except Exception as err:
        print("Update Report Status Error:", err)
        raise HTTPException(status_code=500, detail="Failed to update report status.")

@app.get("/api/evaluators")
def get_evaluators(domain: Optional[str] = None, role: Optional[str] = None):
    try:
        return database.get_all_evaluators(domain=domain, role=role)
    except Exception as err:
        print("Get Evaluators Error:", err)
        raise HTTPException(status_code=500, detail="Failed to fetch evaluators.")

@app.post("/api/evaluators", status_code=status.HTTP_201_CREATED)
def create_evaluator(req: schemas.EvaluatorCreateRequest, current_user: dict = Depends(get_current_user)):
    if not req.name or not req.email or not req.role or not req.domain:
        raise HTTPException(status_code=400, detail="Name, email, role, and domain are required.")

    try:
        saved = database.create_evaluator(
            name=req.name.strip(),
            email=req.email.strip().lower(),
            role=req.role.strip(),
            domain=req.domain.strip(),
            department=req.department.strip() if req.department else ""
        )
    except Exception as err:
        print("Create Evaluator Error:", err)
        raise HTTPException(status_code=500, detail="Failed to add domain evaluator.")

# ==========================================
# ROLE-BASED ASSIGNMENT & NOTIFICATION ENDPOINTS
# ==========================================

@app.get("/api/users/by-role")
@app.get("/users/by-role")
def get_users_by_role(role: Optional[str] = None):
    try:
        users = database.get_users_by_role_in_db(role or "")
        return users
    except Exception as err:
        print("Get Users By Role Error:", err)
        raise HTTPException(status_code=500, detail="Failed to fetch users by role.")

@app.post("/api/assignments", status_code=status.HTTP_201_CREATED)
@app.post("/assignments", status_code=status.HTTP_201_CREATED)
def create_assignment(req: schemas.AssignmentCreateRequest, current_user: dict = Depends(get_current_user)):
    user_role = current_user.get("role", "User")
    if user_role not in ["Administrator", "Project Coordinator"]:
        raise HTTPException(status_code=403, detail="Only Project Coordinator or Administrator can assign roles.")

    try:
        assignment = database.create_assignment_in_db(
            idea_id=req.ideaId,
            assigned_role=req.assignedRole,
            assigned_user_id=req.assignedUserId,
            assigned_by=current_user.get("id", 0),
            remarks=req.remarks or "",
            status=req.status or "Pending",
            deadline=req.deadline or ""
        )
        return {"message": f"Successfully assigned {req.assignedRole}!", "assignment": assignment}
    except Exception as err:
        print("Create Assignment Error:", err)
        raise HTTPException(status_code=500, detail="Failed to create role assignment.")

@app.get("/api/my-assignments")
@app.get("/my-assignments")
def get_my_assignments(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id", 0)
    user_role = current_user.get("role", "User")
    user_email = current_user.get("email", "")

    try:
        ideas = database.get_my_assignments_in_db(user_id, user_role, user_email)
        return ideas
    except Exception as err:
        print("Get My Assignments Error:", err)
        raise HTTPException(status_code=500, detail="Failed to fetch assigned ideas.")

@app.get("/api/ideas/{idea_id}/assignments")
@app.get("/api/idea/{idea_id}/assignment")
@app.get("/idea/{idea_id}/assignment")
def get_idea_assignments_history(idea_id: int, current_user: dict = Depends(get_current_user)):
    try:
        history = database.get_assignment_history_in_db(idea_id)
        return history
    except Exception as err:
        print("Get Assignment History Error:", err)
        raise HTTPException(status_code=500, detail="Failed to fetch assignment history.")

@app.get("/api/notifications")
def get_user_notifications(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id", 0)
    user_email = current_user.get("email", "")
    user_role = current_user.get("role", "User")

    try:
        return database.get_notifications_in_db(user_id, user_email, user_role)
    except Exception as err:
        print("Get Notifications Error:", err)
        return {"notifications": [], "unreadCount": 0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)

