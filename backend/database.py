import os
import time
import json
import sqlite3
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

DB_FILE_PATH = Path(__file__).parent / "idea360.db"
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

IS_POSTGRES = False
pg_module = None

if DATABASE_URL and ("postgres://" in DATABASE_URL or "postgresql://" in DATABASE_URL) and "YOUR_PASSWORD" not in DATABASE_URL:
    try:
        import psycopg2
        import psycopg2.extras
        pg_module = psycopg2
        IS_POSTGRES = True
        print(f"[DATABASE] Using PostgreSQL Server: {DATABASE_URL.split('@')[-1]}")
    except ImportError:
        print("[DATABASE WARNING] psycopg2 not installed, falling back to SQLite.")
        IS_POSTGRES = False
else:
    print(f"[DATABASE] Using Local SQLite Database: {DB_FILE_PATH}")

def get_db_connection():
    if IS_POSTGRES:
        conn = pg_module.connect(DATABASE_URL)
        return conn
    else:
        conn = sqlite3.connect(str(DB_FILE_PATH))
        conn.row_factory = sqlite3.Row
        return conn

def init_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if IS_POSTGRES:
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
        conn.commit()
        cursor.close()
        conn.close()
        print("[OK] PostgreSQL Tables (users, otps, ideas, analysis_reports) Verified!")
    else:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'User',
                employee_id TEXT,
                is_verified INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN employee_id TEXT")
        except Exception:
            pass

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS otps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                otp_code TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ideas (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                functional_area TEXT,
                target_user TEXT,
                author TEXT NOT NULL,
                author_email TEXT,
                problem_statement TEXT,
                description TEXT,
                proposed_solution TEXT,
                expected_benefits TEXT,
                expected_outcome TEXT,
                attachment TEXT,
                status TEXT NOT NULL DEFAULT 'Pending Review',
                evaluator_notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        try:
            cursor.execute("ALTER TABLE ideas ADD COLUMN functional_area TEXT")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE ideas ADD COLUMN target_user TEXT")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE ideas ADD COLUMN proposed_solution TEXT")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE ideas ADD COLUMN expected_benefits TEXT")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE ideas ADD COLUMN embedding_vector TEXT")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE ideas ADD COLUMN duplicity_score REAL DEFAULT 0.0")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE ideas ADD COLUMN duplicity_status TEXT")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE ideas ADD COLUMN matched_idea_id INTEGER")
        except Exception:
            pass

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analysis_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                idea_id INTEGER,
                idea_title TEXT NOT NULL,
                ba_name TEXT NOT NULL,
                ba_email TEXT,
                report_title TEXT NOT NULL,
                summary TEXT,
                estimated_cost TEXT,
                projected_roi TEXT,
                attachment TEXT,
                status TEXT NOT NULL DEFAULT 'Approved by BA',
                pm_notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        conn.close()
        print("[OK] SQLite Tables (users, otps, ideas, analysis_reports) Verified!")

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
    
    if IS_POSTGRES:
        cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(%s)", (clean_email,))
        row = cursor.fetchone()
        user_dict = _row_to_dict(row, cursor.description) if row else None
        cursor.close()
        conn.close()
        return user_dict
    else:
        cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (clean_email,))
        row = cursor.fetchone()
        user_dict = dict(row) if row else None
        conn.close()
        return user_dict

def create_user(username: str, email: str, hashed_password: str, role: str = "User", employee_id: str = ""):
    clean_email = (email or "").strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if IS_POSTGRES:
        cursor.execute(
            """INSERT INTO users (username, email, password, role, employee_id, is_verified) 
               VALUES (%s, %s, %s, %s, %s, FALSE) RETURNING *""",
            (username.strip(), clean_email, hashed_password, role or "User", employee_id or "")
        )
        row = cursor.fetchone()
        conn.commit()
        user_dict = _row_to_dict(row, cursor.description)
        cursor.close()
        conn.close()
        return user_dict
    else:
        cursor.execute(
            "INSERT INTO users (username, email, password, role, employee_id, is_verified) VALUES (?, ?, ?, ?, ?, 0)",
            (username.strip(), clean_email, hashed_password, role or "User", employee_id or "")
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return {
            "id": user_id,
            "username": username.strip(),
            "email": clean_email,
            "role": role or "User",
            "employee_id": employee_id or "",
            "is_verified": 0
        }

def save_otp_to_db(email: str, otp_code: str):
    clean_email = (email or "").strip().lower()
    clean_otp = str(otp_code or "").strip()
    expires_at_ms = str(int(time.time() * 1000) + 15 * 60 * 1000)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if IS_POSTGRES:
        cursor.execute("DELETE FROM otps WHERE LOWER(email) = LOWER(%s)", (clean_email,))
        cursor.execute(
            "INSERT INTO otps (email, otp_code, expires_at) VALUES (%s, %s, %s)",
            (clean_email, clean_otp, expires_at_ms)
        )
        conn.commit()
        cursor.close()
        conn.close()
    else:
        cursor.execute("DELETE FROM otps WHERE LOWER(email) = LOWER(?)", (clean_email,))
        cursor.execute(
            "INSERT INTO otps (email, otp_code, expires_at) VALUES (?, ?, ?)",
            (clean_email, clean_otp, expires_at_ms)
        )
        conn.commit()
        conn.close()

def verify_otp_in_db(email: str, otp_code: str) -> bool:
    clean_email = (email or "").strip().lower()
    clean_otp = str(otp_code or "").strip()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if IS_POSTGRES:
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
    else:
        cursor.execute(
            "SELECT * FROM otps WHERE LOWER(email) = LOWER(?) AND TRIM(otp_code) = ?",
            (clean_email, clean_otp)
        )
        row = cursor.fetchone()
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
    
    if IS_POSTGRES:
        cursor.execute("UPDATE users SET is_verified = TRUE WHERE LOWER(email) = LOWER(%s)", (clean_email,))
        cursor.execute("DELETE FROM otps WHERE LOWER(email) = LOWER(%s)", (clean_email,))
        conn.commit()
        cursor.close()
        conn.close()
    else:
        cursor.execute("UPDATE users SET is_verified = 1 WHERE LOWER(email) = LOWER(?)", (clean_email,))
        cursor.execute("DELETE FROM otps WHERE LOWER(email) = LOWER(?)", (clean_email,))
        conn.commit()
        conn.close()

def update_user_profile_in_db(email: str, username: str, employee_id: str = "", hashed_password: str = None):
    clean_email = (email or "").strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if IS_POSTGRES:
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
        conn.commit()
        cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(%s)", (clean_email,))
        row = cursor.fetchone()
        user_dict = _row_to_dict(row, cursor.description) if row else None
        cursor.close()
        conn.close()
        return user_dict
    else:
        if hashed_password:
            cursor.execute(
                "UPDATE users SET username = ?, employee_id = ?, password = ? WHERE LOWER(email) = LOWER(?)",
                (username.strip(), employee_id or "", hashed_password, clean_email)
            )
        else:
            cursor.execute(
                "UPDATE users SET username = ?, employee_id = ? WHERE LOWER(email) = LOWER(?)",
                (username.strip(), employee_id or "", clean_email)
            )
        conn.commit()
        cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (clean_email,))
        row = cursor.fetchone()
        user_dict = dict(row) if row else None
        conn.close()
        return user_dict

def get_all_ideas_from_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    rows = []
    if IS_POSTGRES:
        cursor.execute("SELECT * FROM ideas ORDER BY created_at DESC;")
        fetched = cursor.fetchall()
        rows = [_row_to_dict(r, cursor.description) for r in fetched]
        cursor.close()
        conn.close()
    else:
        cursor.execute("SELECT * FROM ideas ORDER BY created_at DESC")
        fetched = cursor.fetchall()
        rows = [dict(r) for r in fetched]
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
            "matchedIdeaId": r.get("matched_idea_id")
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

    if IS_POSTGRES:
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
    else:
        attachment_str = json.dumps(attachment_val) if attachment_val is not None else None
        cursor.execute(
            """INSERT INTO ideas 
               (id, title, category, functional_area, target_user, author, author_email, problem_statement, description, proposed_solution, expected_benefits, expected_outcome, attachment, status, embedding_vector, duplicity_score, duplicity_status, matched_idea_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
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
                attachment_str,
                status_val,
                embedding_str,
                duplicity_score,
                duplicity_status,
                matched_idea_id
            )
        )
        conn.commit()
        cursor.execute("SELECT * FROM ideas WHERE id = ?", (idea_id,))
        row = cursor.fetchone()
        r = dict(row)
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
    
    if IS_POSTGRES:
        cursor.execute("UPDATE ideas SET embedding_vector = %s WHERE id = %s", (embedding_str, idea_id))
        conn.commit()
        cursor.close()
        conn.close()
    else:
        cursor.execute("UPDATE ideas SET embedding_vector = ? WHERE id = ?", (embedding_str, idea_id))
        conn.commit()
        conn.close()

def update_idea_duplicity_in_db(idea_id: int, score: float, duplicity_status: str, matched_idea_id: int = None, status: str = None):
    """Updates duplicity score, status, and matched_idea_id for a specific idea in DB."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if IS_POSTGRES:
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
    else:
        if status:
            cursor.execute(
                "UPDATE ideas SET duplicity_score = ?, duplicity_status = ?, matched_idea_id = ?, status = ? WHERE id = ?",
                (score, duplicity_status, matched_idea_id, status, idea_id)
            )
        else:
            cursor.execute(
                "UPDATE ideas SET duplicity_score = ?, duplicity_status = ?, matched_idea_id = ? WHERE id = ?",
                (score, duplicity_status, matched_idea_id, idea_id)
            )
        conn.commit()
        conn.close()

def update_idea_status_in_db(idea_id: int, status: str, evaluator_notes: str = ""):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if IS_POSTGRES:
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
    else:
        cursor.execute(
            "UPDATE ideas SET status = ?, evaluator_notes = ? WHERE id = ?",
            (status, evaluator_notes or "", idea_id)
        )
        conn.commit()
        cursor.execute("SELECT * FROM ideas WHERE id = ?", (idea_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        r = dict(row)
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

# ==========================================
# ANALYSIS REPORT DATABASE HELPERS
# ==========================================

def get_all_analysis_reports_from_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    rows = []
    if IS_POSTGRES:
        cursor.execute("SELECT * FROM analysis_reports ORDER BY created_at DESC;")
        fetched = cursor.fetchall()
        rows = [_row_to_dict(r, cursor.description) for r in fetched]
        cursor.close()
        conn.close()
    else:
        cursor.execute("SELECT * FROM analysis_reports ORDER BY created_at DESC;")
        fetched = cursor.fetchall()
        rows = [dict(r) for r in fetched]
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

    if IS_POSTGRES:
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
    else:
        attachment_str = json.dumps(attachment_val) if attachment_val is not None else None
        cursor.execute(
            """INSERT INTO analysis_reports 
               (idea_id, idea_title, ba_name, ba_email, report_title, summary, estimated_cost, projected_roi, attachment, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (idea_id, idea_title, ba_name, ba_email, report_title, summary, estimated_cost, projected_roi, attachment_str, status_str)
        )
        report_id = cursor.lastrowid
        if idea_id:
            cursor.execute("UPDATE ideas SET status = ? WHERE id = ?", (status_str, idea_id))
        conn.commit()

        row = None
        if report_id:
            cursor.execute("SELECT * FROM analysis_reports WHERE id = ?", (report_id,))
            row = cursor.fetchone()

        if not row:
            cursor.execute("SELECT * FROM analysis_reports ORDER BY id DESC LIMIT 1;")
            row = cursor.fetchone()

        if row:
            r = dict(row)
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
    
    if IS_POSTGRES:
        cursor.execute(
            "UPDATE analysis_reports SET status = %s, pm_notes = %s WHERE id = %s RETURNING *",
            (status, pm_notes or "", report_id)
        )
        row = cursor.fetchone()
        if row and row.get("idea_id"):
            cursor.execute("UPDATE ideas SET status = %s WHERE id = %s", (status, row["idea_id"]))
        conn.commit()
        if not row:
            cursor.close()
            conn.close()
            return None
        r = _row_to_dict(row, cursor.description)
        cursor.close()
        conn.close()
    else:
        cursor.execute(
            "UPDATE analysis_reports SET status = ?, pm_notes = ? WHERE id = ?",
            (status, pm_notes or "", report_id)
        )
        conn.commit()
        cursor.execute("SELECT * FROM analysis_reports WHERE id = ?", (report_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        r = dict(row)
        if r.get("idea_id"):
            cursor.execute("UPDATE ideas SET status = ? WHERE id = ?", (status, r["idea_id"]))
            conn.commit()
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

