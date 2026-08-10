import os
import time
import json
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

def get_db_connection():
    import psycopg2
    import psycopg2.extras
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def seed_users():
    import bcrypt
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sample_users = [
        {"username": "Mayur Patel", "email": "mayur@imsgroup.com", "role": "Business Analyst", "employeeId": "EMP-BA-01"},
        {"username": "Mohit Verma", "email": "mohit@imsgroup.com", "role": "Business Analyst", "employeeId": "EMP-BA-02"},
        {"username": "Sanjay Gupta", "email": "sanjay@imsgroup.com", "role": "Business Analyst", "employeeId": "EMP-BA-03"},
        {"username": "Amit Kapoor", "email": "amit.kapoor@imsgroup.com", "role": "Business Reviewer", "employeeId": "EMP-REV-01"},
        {"username": "Priya Mehta", "email": "priya.mehta@imsgroup.com", "role": "Functional Reviewer", "employeeId": "EMP-REV-02"},
        {"username": "Dr. Rajesh Sharma", "email": "rajesh.sharma@imsgroup.com", "role": "Technical Reviewer", "employeeId": "EMP-REV-03"},
        {"username": "Expert Reviewer", "email": "reviewer@imsgroup.com", "role": "Reviewer", "employeeId": "EMP-REV-04"},
        {"username": "Priya Nair", "email": "priya.nair@imsgroup.com", "role": "Project Manager", "employeeId": "EMP-PM-01"},
        {"username": "Rajesh Kapoor", "email": "rajesh.kapoor@imsgroup.com", "role": "Project Manager", "employeeId": "EMP-PM-02"},
        {"username": "Anjali Desai", "email": "anjali.desai@imsgroup.com", "role": "QA Lead", "employeeId": "EMP-QA-01"},
        {"username": "Project Coordinator", "email": "pc@imsgroup.com", "role": "Project Coordinator", "employeeId": "EMP-PC-01"},
        {"username": "Administrator", "email": "admin@imsgroup.com", "role": "Administrator", "employeeId": "EMP-ADM-01"}
    ]

    pwd_hash = bcrypt.hashpw("Password@123".encode('utf-8')[:72], bcrypt.gensalt(10)).decode('utf-8')

    for u in sample_users:
        cursor.execute(
            """INSERT INTO users (username, email, password, role, employee_id, is_verified)
               VALUES (%s, %s, %s, %s, %s, TRUE)
               ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, username = EXCLUDED.username""",
            (u["username"], u["email"], pwd_hash, u["role"], u["employeeId"])
        )
    conn.commit()
    cursor.close()
    conn.close()

def init_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'User',
            employee_id VARCHAR(100),
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;")
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(100);")
    except Exception:
        pass

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS otps (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp_code VARCHAR(10) NOT NULL,
            expires_at VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ideas (
            id BIGINT PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            category VARCHAR(100) NOT NULL,
            functional_area VARCHAR(255),
            target_user VARCHAR(255),
            author VARCHAR(255) NOT NULL,
            author_email VARCHAR(255),
            problem_statement TEXT,
            description TEXT,
            proposed_solution TEXT,
            expected_benefits TEXT,
            expected_outcome TEXT,
            attachment JSONB,
            status VARCHAR(100) NOT NULL DEFAULT 'Pending Review',
            evaluator_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    try:
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS functional_area VARCHAR(255);")
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS target_user VARCHAR(255);")
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS proposed_solution TEXT;")
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS expected_benefits TEXT;")
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS embedding_vector TEXT;")
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS duplicity_score DOUBLE PRECISION DEFAULT 0.0;")
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS duplicity_status VARCHAR(100);")
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS matched_idea_id BIGINT;")
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS assigned_reviewer VARCHAR(255);")
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS reviewer_deadline VARCHAR(100);")
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS assigned_ba VARCHAR(255);")
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS ba_deadline VARCHAR(100);")
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS assigned_pm VARCHAR(255);")
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS pm_deadline VARCHAR(100);")
        cursor.execute("ALTER TABLE ideas ADD COLUMN IF NOT EXISTS coordinator_notes TEXT;")
    except Exception:
        pass

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analysis_reports (
            id SERIAL PRIMARY KEY,
            idea_id BIGINT,
            idea_title VARCHAR(500) NOT NULL,
            ba_name VARCHAR(255) NOT NULL,
            ba_email VARCHAR(255),
            report_title VARCHAR(500) NOT NULL,
            summary TEXT,
            estimated_cost VARCHAR(100),
            projected_roi VARCHAR(100),
            attachment JSONB,
            status VARCHAR(100) NOT NULL DEFAULT 'Approved by BA',
            pm_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS evaluators (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            role VARCHAR(100) NOT NULL,
            domain VARCHAR(100) NOT NULL,
            department VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS idea_assignments (
            id SERIAL PRIMARY KEY,
            idea_id BIGINT NOT NULL,
            assigned_role VARCHAR(100) NOT NULL,
            assigned_user_id INTEGER NOT NULL,
            assigned_by INTEGER,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(100) DEFAULT 'Pending',
            remarks TEXT,
            deadline VARCHAR(100)
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            recipient_user_id INTEGER,
            recipient_email VARCHAR(255),
            recipient_role VARCHAR(100),
            title VARCHAR(500) NOT NULL,
            message TEXT NOT NULL,
            idea_id BIGINT,
            type VARCHAR(100) DEFAULT 'allocation',
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("[OK] PostgreSQL Tables (users, otps, ideas, analysis_reports, evaluators, idea_assignments, notifications) Verified!")
    # Auto seed master evaluators & sample role users
    seed_evaluators()
    seed_users()

def seed_initial_ideas():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if ideas exist
    cursor.execute("SELECT COUNT(*) FROM ideas;")
    cnt = cursor.fetchone()[0]
    if cnt > 0:
        cursor.close()
        conn.close()
        return

    sample_ideas = [
        {
            "id": 1,
            "title": "AI-Driven Automated Invoice & Receipt Reconciliation",
            "category": "Finance",
            "functional_area": "Finance & Accounts",
            "target_user": "Finance Team",
            "author": "Ayushman Raj",
            "authorEmail": "ayushman@imsgroup.com",
            "problem_statement": "Manual invoice matching causes vendor payment delays and human reconciliation errors.",
            "description": "OCR + Machine Learning based document parsing pipeline with SAP ERP integration.",
            "proposed_solution": "Automated matching algorithm for POs and vendor invoices with 99.4% accuracy.",
            "expected_benefits": "75% reduction in invoice processing SLA and 100% audit trail compliance.",
            "status": "Passed Initial Screening",
            "evaluator_notes": "Passed 100-point rubric assessment by Finance Reviewer."
        },
        {
            "id": 2,
            "title": "Smart Retail Inventory & Shelf Monitoring System",
            "category": "Retail",
            "functional_area": "Supply Chain & Retail Stores",
            "target_user": "Store Managers",
            "author": "Priya Sharma",
            "authorEmail": "priya.s@imsgroup.com",
            "problem_statement": "Out-of-stock items lead to revenue loss during peak shopping hours.",
            "description": "IoT camera sensors & real-time stock alert dashboard for retail store managers.",
            "proposed_solution": "Automated restocking alerts sent to warehouse management system.",
            "expected_benefits": "Increase store sales by 12% and reduce stockout duration.",
            "status": "Approved by BA: Vikram Sethi",
            "evaluator_notes": "BRD/FRD completed and forwarded to PM for execution onboarding."
        },
        {
            "id": 3,
            "title": "Next-Gen Supply Chain Predictive Analytics",
            "category": "Retail",
            "functional_area": "Supply Chain Operations",
            "target_user": "Logistics Managers",
            "author": "Rohan Gupta",
            "authorEmail": "rohan.g@imsgroup.com",
            "problem_statement": "Delayed deliveries due to unexpected weather and transit blockages.",
            "description": "Seeded proposal that has passed Stage 2 Feasibility Review and is ready for Stage 3 Business Analysis.",
            "proposed_solution": "Machine learning prediction engine for route optimization.",
            "expected_benefits": "15% reduction in delivery delays and 8% transit cost savings.",
            "status": "Feasibility Approved",
            "evaluator_notes": "All 3 parallel feasibility gates (Business, Functional, Technical) approved by reviewer."
        }
    ]

    for item in sample_ideas:
        cursor.execute(
            """INSERT INTO ideas (id, title, category, functional_area, target_user, author, author_email, problem_statement, description, proposed_solution, expected_benefits, expected_outcome, status, evaluator_notes)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                item["id"], item["title"], item["category"], item["functional_area"], item["target_user"],
                item["author"], item["authorEmail"], item["problem_statement"], item["description"],
                item["proposed_solution"], item["expected_benefits"], item["expected_benefits"],
                item["status"], item["evaluator_notes"]
            )
        )
    conn.commit()
    cursor.close()
    conn.close()
    print("[OK] Sample ideas restored successfully!")

def seed_evaluators():
    DEFAULT_EVALUATORS = [
        {"name": "Dr. Ananya Sharma", "email": "ananya.hr@imsgroup.com", "role": "Reviewer", "domain": "HR", "department": "Human Resources & Talent"},
        {"name": "Vikram Sethi", "email": "vikram.hrba@imsgroup.com", "role": "Business Analyst", "domain": "HR", "department": "HR Business Operations"},
        {"name": "Priya Nair", "email": "priya.hrpm@imsgroup.com", "role": "Project Manager", "domain": "HR", "department": "People Systems PMO"},

        {"name": "Rohan Gupta", "email": "rohan.ecom@imsgroup.com", "role": "Reviewer", "domain": "E-Commerce", "department": "Digital Platforms"},
        {"name": "Neha Verma", "email": "neha.ecomba@imsgroup.com", "role": "Business Analyst", "domain": "E-Commerce", "department": "E-Commerce Analytics"},
        {"name": "Amitav Roy", "email": "amitav.ecompm@imsgroup.com", "role": "Project Manager", "domain": "E-Commerce", "department": "E-Commerce PMO"},

        {"name": "Siddharth Malhotra", "email": "siddharth.retail@imsgroup.com", "role": "Reviewer", "domain": "Retail", "department": "Retail Operations"},
        {"name": "Kavita Reddy", "email": "kavita.retailba@imsgroup.com", "role": "Business Analyst", "domain": "Retail", "department": "Retail Systems"},
        {"name": "Rajesh Kapoor", "email": "rajesh.retailpm@imsgroup.com", "role": "Project Manager", "domain": "Retail", "department": "Store Innovation PMO"},

        {"name": "Meera Joshi", "email": "meera.fin@imsgroup.com", "role": "Reviewer", "domain": "Finance", "department": "Corporate Finance"},
        {"name": "Sanjay Mehta", "email": "sanjay.finba@imsgroup.com", "role": "Business Analyst", "domain": "Finance", "department": "FinTech & Payments"},
        {"name": "Tarun Khanna", "email": "tarun.finpm@imsgroup.com", "role": "Project Manager", "domain": "Finance", "department": "Financial Systems PMO"},

        {"name": "Dr. Sunita Patel", "email": "sunita.health@imsgroup.com", "role": "Reviewer", "domain": "Healthcare", "department": "Health & Safety"},
        {"name": "Arjun Menon", "email": "arjun.healthba@imsgroup.com", "role": "Business Analyst", "domain": "Healthcare", "department": "Clinical Ops BA"},
        {"name": "Deepak Rao", "email": "deepak.healthpm@imsgroup.com", "role": "Project Manager", "domain": "Healthcare", "department": "Health Tech PMO"},

        {"name": "Expert Reviewer", "email": "reviewer@imsgroup.com", "role": "Reviewer", "domain": "IT", "department": "Enterprise IT Architecture"},
        {"name": "Business Analyst Lead", "email": "ba@imsgroup.com", "role": "Business Analyst", "domain": "IT", "department": "IT Strategy & BA"},
        {"name": "Project Manager Lead", "email": "pm@imsgroup.com", "role": "Project Manager", "domain": "IT", "department": "Enterprise PMO"}
    ]

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM evaluators")
        count = cursor.fetchone()[0]
        if count == 0:
            for item in DEFAULT_EVALUATORS:
                cursor.execute(
                    "INSERT INTO evaluators (name, email, role, domain, department) VALUES (%s, %s, %s, %s, %s)",
                    (item["name"], item["email"], item["role"], item["domain"], item["department"])
                )
            conn.commit()
        cursor.close()
        conn.close()
    except Exception as err:
        print("[DATABASE NOTICE] Evaluator Seeding Notice:", err)

def get_all_evaluators(domain=None, role=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM evaluators"
    params = []
    conditions = []

    if domain:
        conditions.append("LOWER(domain) = LOWER(%s)")
        params.append(domain)
    if role:
        conditions.append("LOWER(role) = LOWER(%s)")
        params.append(role)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY domain ASC, role ASC"

    cursor.execute(query, params)
    rows = cursor.fetchall()

    evaluators = []
    if rows:
        for r in rows:
            evaluators.append(_row_to_dict(r, cursor.description))

    cursor.close()
    conn.close()
    return evaluators

def create_evaluator(name, email, role, domain, department=""):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO evaluators (name, email, role, domain, department) VALUES (%s, %s, %s, %s, %s) RETURNING *",
        (name, email, role, domain, department)
    )
    row = cursor.fetchone()
    eval_dict = _row_to_dict(row, cursor.description)
    conn.commit()
    cursor.close()
    conn.close()
    return eval_dict

# Initialize on module load
init_tables()

# ==========================================
# DATABASE HELPER METHODS
# ==========================================

def _row_to_dict(row, cursor_description):
    if row is None:
        return None
    if isinstance(row, dict):
        return row
    if hasattr(row, "keys"):
        return dict(row)
    # List or tuple from psycopg2
    colnames = [desc[0] for desc in cursor_description]
    return dict(zip(colnames, row))

def find_user_by_email(email: str):
    clean_email = (email or "").strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(%s)", (clean_email,))
    row = cursor.fetchone()
    user_dict = _row_to_dict(row, cursor.description) if row else None
    cursor.close()
    conn.close()
    return user_dict
def create_user(username: str, email: str, hashed_password: str, role: str = "User", employee_id: str = ""):
    clean_email = (email or "").strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        """INSERT INTO users (username, email, password, role, employee_id, is_verified) 
           VALUES (%s, %s, %s, %s, %s, FALSE) RETURNING *""",
        (username.strip(), clean_email, hashed_password, role or "User", employee_id or "")
    )
    row = cursor.fetchone()
    
    # If the user is a Reviewer, Business Analyst, or Project Manager, add to evaluators list
    if role in ["Reviewer", "Business Analyst", "Project Manager"]:
        cursor.execute("SELECT COUNT(*) FROM evaluators WHERE LOWER(email) = LOWER(%s)", (clean_email,))
        if cursor.fetchone()[0] == 0:
            cursor.execute(
                "INSERT INTO evaluators (name, email, role, domain, department) VALUES (%s, %s, %s, 'IT', 'Innovation')",
                (username.strip(), clean_email, role)
            )
            
    conn.commit()
    user_dict = _row_to_dict(row, cursor.description)
    cursor.close()
    conn.close()
    return user_dict
def save_otp_to_db(email: str, otp_code: str):
    clean_email = (email or "").strip().lower()
    clean_otp = str(otp_code or "").strip()
    expires_at_ms = str(int(time.time() * 1000) + 15 * 60 * 1000)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM otps WHERE LOWER(email) = LOWER(%s)", (clean_email,))
    cursor.execute(
        "INSERT INTO otps (email, otp_code, expires_at) VALUES (%s, %s, %s)",
        (clean_email, clean_otp, expires_at_ms)
    )
    conn.commit()
    cursor.close()
    conn.close()
def verify_otp_in_db(email: str, otp_code: str) -> bool:
    clean_email = (email or "").strip().lower()
    clean_otp = str(otp_code or "").strip()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM otps WHERE LOWER(email) = LOWER(%s) AND TRIM(otp_code) = %s",
        (clean_email, clean_otp)
    )
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if not row:
        print(f"[VERIFY OTP FAILED] Invalid code '{clean_otp}' for email: {clean_email}")
        return False
    print(f"[VERIFY OTP SUCCESS] Valid code '{clean_otp}' for email: {clean_email}")
    return True
def mark_user_as_verified(email: str):
    clean_email = (email or "").strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE users SET is_verified = TRUE WHERE LOWER(email) = LOWER(%s)", (clean_email,))
    cursor.execute("DELETE FROM otps WHERE LOWER(email) = LOWER(%s)", (clean_email,))
    conn.commit()
    cursor.close()
    conn.close()
def update_user_profile_in_db(email: str, username: str, employee_id: str = "", hashed_password: str = None):
    clean_email = (email or "").strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if hashed_password:
        cursor.execute(
            "UPDATE users SET username = %s, employee_id = %s, password = %s WHERE LOWER(email) = LOWER(%s)",
            (username.strip(), employee_id or "", hashed_password, clean_email)
        )
    else:
        cursor.execute(
            "UPDATE users SET username = %s, employee_id = %s WHERE LOWER(email) = LOWER(%s)",
            (username.strip(), employee_id or "", clean_email)
        )
        
    # Update evaluators table name if user exists there as well
    cursor.execute(
        "UPDATE evaluators SET name = %s WHERE LOWER(email) = LOWER(%s)",
        (username.strip(), clean_email)
    )
    
    conn.commit()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(%s)", (clean_email,))
    row = cursor.fetchone()
    user_dict = _row_to_dict(row, cursor.description) if row else None
    cursor.close()
    conn.close()
    return user_dict
def get_all_ideas_from_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    rows = []
    cursor.execute("SELECT * FROM ideas ORDER BY created_at DESC;")
    fetched = cursor.fetchall()
    rows = [_row_to_dict(r, cursor.description) for r in fetched]
    cursor.close()
    conn.close()
    ideas_list = []
    for r in rows:
        attachment_data = None
        if r.get("attachment"):
            if isinstance(r["attachment"], (dict, list)):
                attachment_data = r["attachment"]
            else:
                try:
                    attachment_data = json.loads(r["attachment"])
                except Exception:
                    attachment_data = r["attachment"]
                    
        formatted_date = ""
        if r.get("created_at"):
            try:
                dt_str = str(r["created_at"]).split(".")[0]
                dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
                formatted_date = dt.strftime("%b %d, %Y")
            except Exception:
                formatted_date = str(r["created_at"])
                
        emb_val = r.get("embedding_vector")
        if isinstance(emb_val, str) and emb_val.strip():
            try:
                emb_val = json.loads(emb_val)
            except Exception:
                emb_val = None

        ideas_list.append({
            "id": int(r["id"]),
            "title": r["title"],
            "category": r["category"],
            "functionalArea": r.get("functional_area") or "",
            "targetUser": r.get("target_user") or "",
            "author": r["author"],
            "authorEmail": r.get("author_email") or "",
            "problemStatement": r.get("problem_statement") or "",
            "description": r.get("description") or "",
            "proposedSolution": r.get("proposed_solution") or "",
            "expectedBenefits": r.get("expected_benefits") or "",
            "expectedOutcome": r.get("expected_outcome") or r.get("expected_benefits") or "",
            "attachment": attachment_data,
            "status": r["status"],
            "evaluatorNotes": r.get("evaluator_notes") or "",
            "date": formatted_date,
            "embeddingVector": emb_val,
            "duplicityScore": float(r.get("duplicity_score") or 0.0),
            "duplicityStatus": r.get("duplicity_status") or "",
            "matchedIdeaId": r.get("matched_idea_id"),
            "assignedReviewer": r.get("assigned_reviewer") or "",
            "reviewerDeadline": r.get("reviewer_deadline") or "",
            "assignedBA": r.get("assigned_ba") or "",
            "baDeadline": r.get("ba_deadline") or "",
            "assignedPM": r.get("assigned_pm") or "",
            "pmDeadline": r.get("pm_deadline") or "",
            "coordinatorNotes": r.get("coordinator_notes") or ""
        })
        
    return ideas_list

def save_idea_to_db(idea_data: dict):
    idea_id = idea_data.get("id") or int(time.time() * 1000)
    attachment_val = idea_data.get("attachment")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    functional_area = idea_data.get("functionalArea") or ""
    target_user = idea_data.get("targetUser") or ""
    proposed_solution = idea_data.get("proposedSolution") or ""
    expected_benefits = idea_data.get("expectedBenefits") or idea_data.get("expectedOutcome") or ""

    embedding_vector_val = []
    embedding_str = None

    duplicity_score = 0.0
    duplicity_status = "Initial Screening Passed"
    matched_idea_id = None

    status_val = idea_data.get("status") or "Pending Review"

    attachment_param = json.dumps(attachment_val) if attachment_val is not None else None
    cursor.execute(
        """INSERT INTO ideas 
           (id, title, category, functional_area, target_user, author, author_email, problem_statement, description, proposed_solution, expected_benefits, expected_outcome, attachment, status, embedding_vector, duplicity_score, duplicity_status, matched_idea_id)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *""",
        (
            idea_id,
            idea_data["title"].strip(),
            idea_data["category"],
            functional_area.strip(),
            target_user.strip(),
            idea_data.get("author", "User"),
            idea_data.get("authorEmail", ""),
            idea_data["problemStatement"].strip(),
            idea_data["description"].strip(),
            proposed_solution.strip(),
            expected_benefits.strip(),
            expected_benefits.strip(),
            attachment_param,
            status_val,
            embedding_str,
            duplicity_score,
            duplicity_status,
            matched_idea_id
        )
    )
    row = cursor.fetchone()
    conn.commit()
    r = _row_to_dict(row, cursor.description)
    cursor.close()
    conn.close()
    attachment_res = None
    if r.get("attachment"):
        if isinstance(r["attachment"], (dict, list)):
            attachment_res = r["attachment"]
        else:
            try:
                attachment_res = json.loads(r["attachment"])
            except Exception:
                attachment_res = r["attachment"]
                
    dt_str = datetime.now().strftime("%b %d, %Y")
    return {
        "id": int(r["id"]),
        "title": r["title"],
        "category": r["category"],
        "functionalArea": r.get("functional_area") or "",
        "targetUser": r.get("target_user") or "",
        "author": r["author"],
        "authorEmail": r.get("author_email") or "",
        "problemStatement": r.get("problem_statement") or "",
        "description": r.get("description") or "",
        "proposedSolution": r.get("proposed_solution") or "",
        "expectedBenefits": r.get("expected_benefits") or "",
        "expectedOutcome": r.get("expected_outcome") or "",
        "attachment": attachment_res,
        "status": r["status"],
        "evaluatorNotes": r.get("evaluator_notes") or "",
        "date": dt_str,
        "embeddingVector": r.get("embedding_vector"),
        "duplicityScore": float(r.get("duplicity_score") or 0.0),
        "duplicityStatus": r.get("duplicity_status") or "",
        "matchedIdeaId": r.get("matched_idea_id")
    }


def update_idea_embedding_in_db(idea_id: int, embedding_vector: list):
    """Updates embedding_vector JSON column for a specific idea."""
    if not embedding_vector:
        return
    conn = get_db_connection()
    cursor = conn.cursor()
    embedding_str = json.dumps(embedding_vector)
    
    cursor.execute("UPDATE ideas SET embedding_vector = %s WHERE id = %s", (embedding_str, idea_id))
    conn.commit()
    cursor.close()
    conn.close()
def update_idea_duplicity_in_db(idea_id: int, score: float, duplicity_status: str, matched_idea_id: int = None, status: str = None):
    """Updates duplicity score, status, and matched_idea_id for a specific idea in DB."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if status:
        cursor.execute(
            "UPDATE ideas SET duplicity_score = %s, duplicity_status = %s, matched_idea_id = %s, status = %s WHERE id = %s",
            (score, duplicity_status, matched_idea_id, status, idea_id)
        )
    else:
        cursor.execute(
            "UPDATE ideas SET duplicity_score = %s, duplicity_status = %s, matched_idea_id = %s WHERE id = %s",
            (score, duplicity_status, matched_idea_id, idea_id)
        )
    conn.commit()
    cursor.close()
    conn.close()
def update_idea_allocation_in_db(idea_id: int, allocation_data: dict):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT status FROM ideas WHERE id = %s", (idea_id,))
    existing_row = cursor.fetchone()
    current_status = existing_row[0] if (existing_row and existing_row[0]) else ""
    
    assigned_reviewer = allocation_data.get("assignedReviewer", "")
    reviewer_deadline = allocation_data.get("reviewerDeadline", "")
    assigned_ba = allocation_data.get("assignedBA", "")
    ba_deadline = allocation_data.get("baDeadline", "")
    assigned_pm = allocation_data.get("assignedPM", "")
    pm_deadline = allocation_data.get("pmDeadline", "")
    coordinator_notes = allocation_data.get("coordinatorNotes", "")
    req_status = allocation_data.get("status", "Assigned by Project Coordinator")

    is_initial_stage = not current_status or current_status in ["Pending PC Allocation", "Submitted"]
    final_status = req_status if is_initial_stage else (req_status if req_status not in ["Assigned by Project Coordinator", "Assigned to Evaluators"] else current_status)

    cursor.execute(
        """UPDATE ideas 
           SET assigned_reviewer = %s, reviewer_deadline = %s, assigned_ba = %s, ba_deadline = %s, assigned_pm = %s, pm_deadline = %s, coordinator_notes = %s, status = %s
           WHERE id = %s RETURNING *""",
        (assigned_reviewer, reviewer_deadline, assigned_ba, ba_deadline, assigned_pm, pm_deadline, coordinator_notes, final_status, idea_id)
    )
    row = cursor.fetchone()
    conn.commit()
    r = _row_to_dict(row, cursor.description) if row else None
    cursor.close()
    conn.close()
    if r:
        return {
            "id": int(r["id"]),
            "title": r["title"],
            "category": r["category"],
            "assignedReviewer": r.get("assigned_reviewer") or "",
            "reviewerDeadline": r.get("reviewer_deadline") or "",
            "assignedBA": r.get("assigned_ba") or "",
            "baDeadline": r.get("ba_deadline") or "",
            "assignedPM": r.get("assigned_pm") or "",
            "pmDeadline": r.get("pm_deadline") or "",
            "coordinatorNotes": r.get("coordinator_notes") or "",
            "status": r["status"]
        }
    return None

def update_idea_status_in_db(idea_id: int, status: str, evaluator_notes: str = ""):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "UPDATE ideas SET status = %s, evaluator_notes = %s WHERE id = %s RETURNING *",
        (status, evaluator_notes or "", idea_id)
    )
    row = cursor.fetchone()
    conn.commit()
    if not row:
        cursor.close()
        conn.close()
        return None
    r = _row_to_dict(row, cursor.description)
    cursor.close()
    conn.close()
    attachment_res = None
    if r.get("attachment"):
        if isinstance(r["attachment"], (dict, list)):
            attachment_res = r["attachment"]
        else:
            try:
                attachment_res = json.loads(r["attachment"])
            except Exception:
                attachment_res = r["attachment"]
                
    return {
        "id": int(r["id"]),
        "title": r["title"],
        "category": r["category"],
        "author": r["author"],
        "authorEmail": r.get("author_email") or "",
        "problemStatement": r.get("problem_statement") or "",
        "description": r.get("description") or "",
        "expectedOutcome": r.get("expected_outcome") or "",
        "attachment": attachment_res,
        "status": r["status"],
        "evaluatorNotes": r.get("evaluator_notes") or "",
        "date": datetime.now().strftime("%b %d, %Y")
    }

def delete_all_ideas_from_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM ideas;")
    cursor.execute("DELETE FROM analysis_reports;")
    conn.commit()
    cursor.close()
    conn.close()
    return True

# ==========================================
# ANALYSIS REPORT DATABASE HELPERS
# ==========================================

def get_all_analysis_reports_from_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    rows = []
    cursor.execute("SELECT * FROM analysis_reports ORDER BY created_at DESC;")
    fetched = cursor.fetchall()
    rows = [_row_to_dict(r, cursor.description) for r in fetched]
    cursor.close()
    conn.close()
    reports_list = []
    for r in rows:
        attachment_data = None
        if r.get("attachment"):
            if isinstance(r["attachment"], (dict, list)):
                attachment_data = r["attachment"]
            else:
                try:
                    attachment_data = json.loads(r["attachment"])
                except Exception:
                    attachment_data = r["attachment"]
                    
        formatted_date = ""
        if r.get("created_at"):
            try:
                dt_str = str(r["created_at"]).split(".")[0]
                dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
                formatted_date = dt.strftime("%b %d, %Y")
            except Exception:
                formatted_date = str(r["created_at"])
                
        reports_list.append({
            "id": int(r["id"]),
            "ideaId": r.get("idea_id"),
            "ideaTitle": r["idea_title"],
            "baName": r["ba_name"],
            "baEmail": r.get("ba_email") or "",
            "reportTitle": r["report_title"],
            "summary": r.get("summary") or "",
            "estimatedCost": r.get("estimated_cost") or "",
            "projectedRoi": r.get("projected_roi") or "",
            "attachment": attachment_data,
            "status": r["status"],
            "pmNotes": r.get("pm_notes") or "",
            "date": formatted_date or datetime.now().strftime("%b %d, %Y")
        })
        
    return reports_list

def save_analysis_report_to_db(report_data: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    idea_id = report_data.get("ideaId")
    idea_title = report_data.get("ideaTitle", "Untitled Idea").strip()
    ba_name = report_data.get("baName", "Business Analyst").strip()
    ba_email = report_data.get("baEmail", "").strip()
    report_title = report_data.get("reportTitle", "Analysis Report").strip()
    summary = report_data.get("summary", "").strip()
    estimated_cost = report_data.get("estimatedCost", "").strip()
    projected_roi = report_data.get("projectedRoi", "").strip()
    attachment_val = report_data.get("attachment")
    status_str = f"Approved by BA: {ba_name}"

    r = {}
    report_id = None

    attachment_param = json.dumps(attachment_val) if attachment_val is not None else None
    cursor.execute(
        """INSERT INTO analysis_reports 
           (idea_id, idea_title, ba_name, ba_email, report_title, summary, estimated_cost, projected_roi, attachment, status)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *""",
        (idea_id, idea_title, ba_name, ba_email, report_title, summary, estimated_cost, projected_roi, attachment_param, status_str)
    )
    row = cursor.fetchone()
    if idea_id:
        cursor.execute("UPDATE ideas SET status = %s WHERE id = %s", (status_str, idea_id))
    conn.commit()
    if row:
        r = _row_to_dict(row, cursor.description)
    cursor.close()
    conn.close()
    if not r:
        return {
            "id": report_id or int(time.time()),
            "ideaId": idea_id,
            "ideaTitle": idea_title,
            "baName": ba_name,
            "baEmail": ba_email,
            "reportTitle": report_title,
            "summary": summary,
            "estimatedCost": estimated_cost,
            "projectedRoi": projected_roi,
            "attachment": attachment_val,
            "status": status_str,
            "pmNotes": "",
            "date": datetime.now().strftime("%b %d, %Y")
        }

    attachment_res = None
    if r.get("attachment"):
        if isinstance(r["attachment"], (dict, list)):
            attachment_res = r["attachment"]
        else:
            try:
                attachment_res = json.loads(r["attachment"])
            except Exception:
                attachment_res = r["attachment"]

    return {
        "id": int(r["id"]),
        "ideaId": r.get("idea_id"),
        "ideaTitle": r["idea_title"],
        "baName": r["ba_name"],
        "baEmail": r.get("ba_email") or "",
        "reportTitle": r["report_title"],
        "summary": r.get("summary") or "",
        "estimatedCost": r.get("estimated_cost") or "",
        "projectedRoi": r.get("projected_roi") or "",
        "attachment": attachment_res,
        "status": r["status"],
        "pmNotes": r.get("pm_notes") or "",
        "date": datetime.now().strftime("%b %d, %Y")
    }

def update_analysis_report_status_in_db(report_id: int, status: str, pm_notes: str = ""):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "UPDATE analysis_reports SET status = %s, pm_notes = %s WHERE id = %s RETURNING *",
        (status, pm_notes or "", report_id)
    )
    row = cursor.fetchone()
    if not row:
        cursor.close()
        conn.close()
        return None
    r = _row_to_dict(row, cursor.description)
    if r.get("idea_id"):
        cursor.execute("UPDATE ideas SET status = %s WHERE id = %s", (status, r["idea_id"]))
    conn.commit()
    cursor.close()
    conn.close()
    attachment_res = None
    if r.get("attachment"):
        if isinstance(r["attachment"], (dict, list)):
            attachment_res = r["attachment"]
        else:
            try:
                attachment_res = json.loads(r["attachment"])
            except Exception:
                attachment_res = r["attachment"]
                
    return {
        "id": int(r["id"]),
        "ideaId": r.get("idea_id"),
        "ideaTitle": r["idea_title"],
        "baName": r["ba_name"],
        "baEmail": r.get("ba_email") or "",
        "reportTitle": r["report_title"],
        "summary": r.get("summary") or "",
        "estimatedCost": r.get("estimated_cost") or "",
        "projectedRoi": r.get("projected_roi") or "",
        "attachment": attachment_res,
        "status": r["status"],
        "pmNotes": r.get("pm_notes") or "",
        "date": datetime.now().strftime("%b %d, %Y")
    }

def seed_users():
    import bcrypt
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sample_users = [
        {"username": "Mayur Patel", "email": "mayur@imsgroup.com", "role": "Business Analyst", "employeeId": "EMP-BA-01"},
        {"username": "Mohit Verma", "email": "mohit@imsgroup.com", "role": "Business Analyst", "employeeId": "EMP-BA-02"},
        {"username": "Sanjay Gupta", "email": "sanjay@imsgroup.com", "role": "Business Analyst", "employeeId": "EMP-BA-03"},
        {"username": "Amit Kapoor", "email": "amit.kapoor@imsgroup.com", "role": "Business Reviewer", "employeeId": "EMP-REV-01"},
        {"username": "Priya Mehta", "email": "priya.mehta@imsgroup.com", "role": "Functional Reviewer", "employeeId": "EMP-REV-02"},
        {"username": "Dr. Rajesh Sharma", "email": "rajesh.sharma@imsgroup.com", "role": "Technical Reviewer", "employeeId": "EMP-REV-03"},
        {"username": "Expert Reviewer", "email": "reviewer@imsgroup.com", "role": "Reviewer", "employeeId": "EMP-REV-04"},
        {"username": "Priya Nair", "email": "priya.nair@imsgroup.com", "role": "Project Manager", "employeeId": "EMP-PM-01"},
        {"username": "Rajesh Kapoor", "email": "rajesh.kapoor@imsgroup.com", "role": "Project Manager", "employeeId": "EMP-PM-02"},
        {"username": "Anjali Desai", "email": "anjali.desai@imsgroup.com", "role": "QA Lead", "employeeId": "EMP-QA-01"},
        {"username": "Project Coordinator", "email": "pc@imsgroup.com", "role": "Project Coordinator", "employeeId": "EMP-PC-01"},
        {"username": "Administrator", "email": "admin@imsgroup.com", "role": "Administrator", "employeeId": "EMP-ADM-01"}
    ]

    pwd_hash = bcrypt.hashpw("Password@123".encode('utf-8')[:72], bcrypt.gensalt(10)).decode('utf-8')

    for u in sample_users:
        cursor.execute(
            """INSERT INTO users (username, email, password, role, employee_id, is_verified)
               VALUES (%s, %s, %s, %s, %s, TRUE)
               ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, username = EXCLUDED.username""",
            (u["username"], u["email"], pwd_hash, u["role"], u["employeeId"])
        )
    conn.commit()
    cursor.close()
    conn.close()

def get_users_by_role_in_db(role_query: str = ""):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if role_query and role_query.strip():
        q_str = f"%{role_query.strip().lower()}%"
        cursor.execute(
            "SELECT id, username, email, role, employee_id FROM users WHERE LOWER(role) LIKE %s OR (%s LIKE '%%reviewer%%' AND LOWER(role) LIKE '%%reviewer%%') ORDER BY username ASC",
            (q_str, q_str)
        )
    else:
        cursor.execute("SELECT id, username, email, role, employee_id FROM users ORDER BY username ASC")
        
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "username": r[1],
            "name": r[1],
            "email": r[2],
            "role": r[3],
            "employeeId": r[4] or ""
        })
    return result

def create_assignment_in_db(idea_id: int, assigned_role: str, assigned_user_id: int, assigned_by: int = 0, remarks: str = "", status: str = "Pending", deadline: str = ""):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get assigned user info
    cursor.execute("SELECT username, email FROM users WHERE id = %s", (assigned_user_id,))
    u_row = cursor.fetchone()
    user_name = u_row[0] if u_row else f"User {assigned_user_id}"
    user_email = u_row[1] if u_row else ""

    # Get assigning user info
    assigned_by_name = "Project Coordinator"
    if assigned_by:
        cursor.execute("SELECT username FROM users WHERE id = %s", (assigned_by,))
        by_row = cursor.fetchone()
        if by_row:
            assigned_by_name = by_row[0]

    # Insert into idea_assignments
    cursor.execute(
        """INSERT INTO idea_assignments (idea_id, assigned_role, assigned_user_id, assigned_by, remarks, status, deadline)
           VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *""",
        (idea_id, assigned_role, assigned_user_id, assigned_by or None, remarks or "", status or "Pending", deadline or "")
    )
    row = cursor.fetchone()
    assignment_dict = _row_to_dict(row, cursor.description)

    # Update idea's role fields in database
    status_str = f"Assigned to {assigned_role}: {user_name}"
    role_lower = assigned_role.lower()
    
    if "reviewer" in role_lower:
        cursor.execute("UPDATE ideas SET assigned_reviewer = %s, reviewer_deadline = %s, status = %s WHERE id = %s",
                       (f"{user_name} ({user_email})", deadline, status_str, idea_id))
    elif "analyst" in role_lower or "ba" in role_lower:
        cursor.execute("UPDATE ideas SET assigned_ba = %s, ba_deadline = %s, status = %s WHERE id = %s",
                       (f"{user_name} ({user_email})", deadline, status_str, idea_id))
    elif "manager" in role_lower or "pm" in role_lower:
        cursor.execute("UPDATE ideas SET assigned_pm = %s, pm_deadline = %s, status = %s WHERE id = %s",
                       (f"{user_name} ({user_email})", deadline, status_str, idea_id))
    else:
        cursor.execute("UPDATE ideas SET status = %s WHERE id = %s", (status_str, idea_id))

    # Get idea title
    cursor.execute("SELECT title FROM ideas WHERE id = %s", (idea_id,))
    idea_row = cursor.fetchone()
    idea_title = idea_row[0] if idea_row else f"IDEA-{idea_id}"

    # Create in-app Notification for assigned user
    notif_msg = f"You have been assigned {assigned_role} for Idea IDEA-{idea_id}: '{idea_title}'. Remarks: {remarks or 'None'}"
    cursor.execute(
        """INSERT INTO notifications (recipient_user_id, recipient_email, recipient_role, title, message, idea_id, type)
           VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        (assigned_user_id, user_email, assigned_role, f"🎯 New Assignment: IDEA-{idea_id}", notif_msg, idea_id, "assignment")
    )

    conn.commit()
    cursor.close()
    conn.close()

    return {
        "id": assignment_dict["id"],
        "ideaId": int(assignment_dict["idea_id"]),
        "assignedRole": assignment_dict["assigned_role"],
        "assignedUserId": int(assignment_dict["assigned_user_id"]),
        "assignedUserName": user_name,
        "assignedUserEmail": user_email,
        "assignedBy": assignment_dict.get("assigned_by"),
        "assignedByName": assigned_by_name,
        "assignedAt": str(assignment_dict.get("assigned_at") or datetime.now()),
        "status": assignment_dict["status"],
        "remarks": assignment_dict.get("remarks") or "",
        "deadline": assignment_dict.get("deadline") or ""
    }

def get_my_assignments_in_db(user_id: int, user_role: str, user_email: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    if user_role in ["Administrator", "Project Coordinator"]:
        cursor.execute("SELECT * FROM ideas ORDER BY created_at DESC")
    else:
        # Strict user-level filtering: ONLY return ideas where user is explicitly assigned
        cursor.execute(
            """SELECT DISTINCT i.* FROM ideas i
               LEFT JOIN idea_assignments a ON i.id = a.idea_id
               WHERE a.assigned_user_id = %s
                  OR LOWER(i.assigned_reviewer) LIKE %s
                  OR LOWER(i.assigned_ba) LIKE %s
                  OR LOWER(i.assigned_pm) LIKE %s
                  OR LOWER(i.author_email) = %s
               ORDER BY i.created_at DESC""",
            (user_id, f"%{user_email.lower()}%", f"%{user_email.lower()}%", f"%{user_email.lower()}%", user_email.lower())
        )

    rows = cursor.fetchall()
    desc = cursor.description
    cursor.close()
    conn.close()

    return [_format_idea_row(r, desc) for r in rows]

def get_assignment_history_in_db(idea_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """SELECT a.id, a.idea_id, a.assigned_role, a.assigned_user_id, a.assigned_by,
                  a.assigned_at, a.status, a.remarks, a.deadline,
                  u_to.username as to_name, u_to.email as to_email,
                  u_by.username as by_name
           FROM idea_assignments a
           LEFT JOIN users u_to ON a.assigned_user_id = u_to.id
           LEFT JOIN users u_by ON a.assigned_by = u_by.id
           WHERE a.idea_id = %s
           ORDER BY a.assigned_at DESC""",
        (idea_id,)
    )

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    history = []
    for r in rows:
        history.append({
            "id": r[0],
            "ideaId": int(r[1]),
            "assignedRole": r[2],
            "assignedUserId": r[3],
            "assignedUserName": r[9] or f"User {r[3]}",
            "assignedUserEmail": r[10] or "",
            "assignedBy": r[4],
            "assignedByName": r[11] or "Project Coordinator",
            "assignedAt": str(r[5]),
            "status": r[6] or "Pending",
            "remarks": r[7] or "",
            "deadline": r[8] or ""
        })
    return history

def get_notifications_in_db(user_id: int, user_email: str, user_role: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """SELECT id, recipient_user_id, recipient_email, recipient_role, title, message, idea_id, type, is_read, created_at
           FROM notifications
           WHERE recipient_user_id = %s
              OR (recipient_email IS NOT NULL AND LOWER(recipient_email) = %s)
              OR (recipient_role IS NOT NULL AND LOWER(recipient_role) = %s)
           ORDER BY created_at DESC LIMIT 50""",
        (user_id, user_email.lower(), user_role.lower())
    )

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    list_res = []
    unread_cnt = 0
    for r in rows:
        is_r = bool(r[8])
        if not is_r:
            unread_cnt += 1
        list_res.append({
            "id": r[0],
            "recipientUserId": r[1],
            "recipientEmail": r[2],
            "recipientRole": r[3],
            "title": r[4],
            "message": r[5],
            "ideaId": r[6],
            "type": r[7],
            "isRead": is_r,
            "createdAt": str(r[9])
        })
    return {"notifications": list_res, "unreadCount": unread_cnt}

