import sqlite3 from "sqlite3";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, "idea360.db");

let isPostgres = false;
let pgPool = null;
const sqliteDb = new (sqlite3.verbose()).Database(dbFilePath);

// Initialize SQLite tables immediately so local DB is always ready
initSqliteTables();

const dbUrl = process.env.DATABASE_URL;

if (dbUrl && (dbUrl.includes("postgres://") || dbUrl.includes("postgresql://")) && !dbUrl.includes("YOUR_PASSWORD")) {
  pgPool = new pg.Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("render") || dbUrl.includes("neon") ? { rejectUnauthorized: false } : false
  });
}

export function initDb() {
  if (pgPool) {
    pgPool.connect().then(async (client) => {
      await client.query(`
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
      `);
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`).catch(() => {});
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(100)`).catch(() => {});
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS otps (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp_code VARCHAR(10) NOT NULL,
            expires_at VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch (e) {
        await client.query(`DROP TABLE IF EXISTS otps;`);
        await client.query(`
          CREATE TABLE otps (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp_code VARCHAR(10) NOT NULL,
            expires_at VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }
      await client.query(`
        CREATE TABLE IF NOT EXISTS ideas (
          id BIGINT PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          category VARCHAR(100) NOT NULL,
          author VARCHAR(255) NOT NULL,
          author_email VARCHAR(255),
          problem_statement TEXT,
          description TEXT,
          expected_outcome TEXT,
          attachment JSONB,
          status VARCHAR(100) NOT NULL DEFAULT 'Pending Review',
          evaluator_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      isPostgres = true;
      console.log("🐘 PostgreSQL Database Server Connected Successfully!");
      client.release();
    }).catch((err) => {
      console.warn("📁 Local SQLite Mode Active (PostgreSQL not connected):", err.message);
      isPostgres = false;
    });
  } else {
    console.log(`📁 Zero-Password Mode: Using Local SQLite Database File (${dbFilePath}).`);
  }
}

function initSqliteTables() {
  sqliteDb.serialize(() => {
    sqliteDb.run(`
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
    `);

    // Safely add missing columns to users table if table was created in an earlier schema version
    sqliteDb.run(`ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0`, () => {});
    sqliteDb.run(`ALTER TABLE users ADD COLUMN employee_id TEXT`, () => {});

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        otp_code TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS ideas (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        author TEXT NOT NULL,
        author_email TEXT,
        problem_statement TEXT,
        description TEXT,
        expected_outcome TEXT,
        attachment TEXT,
        status TEXT NOT NULL DEFAULT 'Pending Review',
        evaluator_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ SQLite Tables (users, otps, ideas) Verified!");
  });
}

// ----------------------------------------------------
// DATABASE HELPER METHODS
// ----------------------------------------------------

export async function findUserByEmail(email) {
  if (isPostgres) {
    const res = await pgPool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email.trim()]);
    return res.rows[0] || null;
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.get("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", [email.trim()], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }
}

export async function createUser({ username, email, hashedPassword, role, employeeId }) {
  if (isPostgres) {
    const res = await pgPool.query(
      `INSERT INTO users (username, email, password, role, employee_id, is_verified)
       VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING *`,
      [username, email.toLowerCase(), hashedPassword, role, employeeId || ""]
    );
    return res.rows[0];
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(
        `INSERT INTO users (username, email, password, role, employee_id, is_verified) VALUES (?, ?, ?, ?, ?, 0)`,
        [username, email.toLowerCase(), hashedPassword, role, employeeId || ""],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, username, email, role, employeeId, is_verified: 0 });
        }
      );
    });
  }
}

export async function saveOtpToDb(email, otpCode) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanOtp = String(otpCode || "").trim();
  const expiresAtMs = Date.now() + 5 * 60 * 1000; // 5 minutes validity timestamp

  if (isPostgres) {
    await pgPool.query("DELETE FROM otps WHERE LOWER(email) = LOWER($1)", [cleanEmail]);
    await pgPool.query(
      `INSERT INTO otps (email, otp_code, expires_at) VALUES ($1, $2, $3)`,
      [cleanEmail, cleanOtp, expiresAtMs.toString()]
    );
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run("DELETE FROM otps WHERE LOWER(email) = LOWER(?)", [cleanEmail], (err) => {
        if (err) return reject(err);
        sqliteDb.run(
          `INSERT INTO otps (email, otp_code, expires_at) VALUES (?, ?, ?)`,
          [cleanEmail, cleanOtp, expiresAtMs.toString()],
          (err2) => {
            if (err2) reject(err2);
            else resolve(true);
          }
        );
      });
    });
  }
}

export async function verifyOtpInDb(email, otpCode) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanOtp = String(otpCode || "").trim();

  if (isPostgres) {
    const res = await pgPool.query(
      `SELECT * FROM otps WHERE LOWER(email) = LOWER($1) AND TRIM(otp_code) = $2`,
      [cleanEmail, cleanOtp]
    );
    if (res.rows.length === 0) return false;
    const row = res.rows[0];
    
    // Check numeric epoch timestamp
    const expiryTime = Number(row.expires_at);
    if (!isNaN(expiryTime) && expiryTime > 0) {
      if (expiryTime > Date.now()) return true;
    }

    // Relative fallback: if created within 5 minutes
    if (row.created_at) {
      const createdAtTime = new Date(row.created_at).getTime();
      if (!isNaN(createdAtTime) && (Date.now() - createdAtTime) < 5 * 60 * 1000) {
        return true;
      }
    }

    return false;
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.get(
        `SELECT * FROM otps WHERE LOWER(email) = LOWER(?) AND TRIM(otp_code) = ?`,
        [cleanEmail, cleanOtp],
        (err, row) => {
          if (err) reject(err);
          else if (!row) resolve(false);
          else {
            const expiryTime = Number(row.expires_at);
            if (!isNaN(expiryTime) && expiryTime > 0) {
              if (expiryTime > Date.now()) return resolve(true);
            }

            if (row.created_at) {
              const createdAtTime = new Date(row.created_at).getTime();
              if (!isNaN(createdAtTime) && (Date.now() - createdAtTime) < 5 * 60 * 1000) {
                return resolve(true);
              }
            }

            resolve(false);
          }
        }
      );
    });
  }
}

export async function markUserAsVerified(email) {
  if (isPostgres) {
    await pgPool.query("UPDATE users SET is_verified = TRUE WHERE LOWER(email) = LOWER($1)", [email.trim()]);
    await pgPool.query("DELETE FROM otps WHERE LOWER(email) = LOWER($1)", [email.trim()]);
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run("UPDATE users SET is_verified = 1 WHERE LOWER(email) = LOWER(?)", [email.trim()], (err) => {
        if (err) reject(err);
        else {
          sqliteDb.run("DELETE FROM otps WHERE LOWER(email) = LOWER(?)", [email.trim()]);
          resolve(true);
        }
      });
    });
  }
}

export async function getAllIdeasFromDb() {
  if (isPostgres) {
    const res = await pgPool.query("SELECT * FROM ideas ORDER BY created_at DESC");
    return res.rows.map((row) => ({
      id: Number(row.id),
      title: row.title,
      category: row.category,
      author: row.author,
      authorEmail: row.author_email,
      problemStatement: row.problem_statement,
      description: row.description,
      expectedOutcome: row.expected_outcome,
      attachment: typeof row.attachment === "string" ? JSON.parse(row.attachment) : row.attachment,
      status: row.status,
      evaluatorNotes: row.evaluator_notes,
      date: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }));
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.all("SELECT * FROM ideas ORDER BY created_at DESC", [], (err, rows) => {
        if (err) reject(err);
        else {
          const list = (rows || []).map((row) => ({
            id: Number(row.id),
            title: row.title,
            category: row.category,
            author: row.author,
            authorEmail: row.author_email,
            problemStatement: row.problem_statement,
            description: row.description,
            expectedOutcome: row.expected_outcome,
            attachment: row.attachment ? JSON.parse(row.attachment) : null,
            status: row.status,
            evaluatorNotes: row.evaluator_notes,
            date: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          }));
          resolve(list);
        }
      });
    });
  }
}

export async function saveIdeaToDb(idea) {
  const ideaId = idea.id || Date.now();
  const attachmentStr = idea.attachment ? JSON.stringify(idea.attachment) : null;

  if (isPostgres) {
    const res = await pgPool.query(
      `INSERT INTO ideas (id, title, category, author, author_email, problem_statement, description, expected_outcome, attachment, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending Review') RETURNING *`,
      [ideaId, idea.title, idea.category, idea.author, idea.authorEmail, idea.problemStatement, idea.description, idea.expectedOutcome || "", attachmentStr]
    );
    const row = res.rows[0];
    return {
      id: Number(row.id),
      title: row.title,
      category: row.category,
      author: row.author,
      authorEmail: row.author_email,
      problemStatement: row.problem_statement,
      description: row.description,
      expectedOutcome: row.expected_outcome,
      attachment: typeof row.attachment === "string" ? JSON.parse(row.attachment) : row.attachment,
      status: row.status,
      evaluatorNotes: row.evaluator_notes,
      date: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(
        `INSERT INTO ideas (id, title, category, author, author_email, problem_statement, description, expected_outcome, attachment, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Review')`,
        [ideaId, idea.title, idea.category, idea.author, idea.authorEmail, idea.problemStatement, idea.description, idea.expectedOutcome || "", attachmentStr],
        function (err) {
          if (err) reject(err);
          else resolve({
            id: Number(ideaId),
            title: idea.title,
            category: idea.category,
            author: idea.author,
            authorEmail: idea.authorEmail,
            problemStatement: idea.problemStatement,
            description: idea.description,
            expectedOutcome: idea.expectedOutcome || "",
            attachment: idea.attachment || null,
            status: "Pending Review",
            evaluatorNotes: "",
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          });
        }
      );
    });
  }
}

export async function updateIdeaStatusInDb(id, status, evaluatorNotes) {
  if (isPostgres) {
    const res = await pgPool.query(
      `UPDATE ideas SET status = $1, evaluator_notes = COALESCE($2, evaluator_notes) WHERE id = $3 RETURNING *`,
      [status, evaluatorNotes || null, id]
    );
    return res.rows[0];
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(
        `UPDATE ideas SET status = ?, evaluator_notes = COALESCE(?, evaluator_notes) WHERE id = ?`,
        [status, evaluatorNotes || null, id],
        function (err) {
          if (err) reject(err);
          else resolve({ id, status });
        }
      );
    });
  }
}

export async function updateUserProfileInDb({ email, username, employeeId, hashedPassword }) {
  const cleanEmail = email.trim().toLowerCase();

  if (isPostgres) {
    let res;
    if (hashedPassword) {
      res = await pgPool.query(
        `UPDATE users SET username = $1, employee_id = $2, password = $3 WHERE LOWER(email) = $4 RETURNING *`,
        [username.trim(), employeeId || "", hashedPassword, cleanEmail]
      );
    } else {
      res = await pgPool.query(
        `UPDATE users SET username = $1, employee_id = $2 WHERE LOWER(email) = $3 RETURNING *`,
        [username.trim(), employeeId || "", cleanEmail]
      );
    }
    return res.rows[0];
  } else {
    return new Promise((resolve, reject) => {
      if (hashedPassword) {
        sqliteDb.run(
          `UPDATE users SET username = ?, employee_id = ?, password = ? WHERE LOWER(email) = ?`,
          [username.trim(), employeeId || "", hashedPassword, cleanEmail],
          function (err) {
            if (err) reject(err);
            else resolve({ username, email, employeeId });
          }
        );
      } else {
        sqliteDb.run(
          `UPDATE users SET username = ?, employee_id = ? WHERE LOWER(email) = ?`,
          [username.trim(), employeeId || "", cleanEmail],
          function (err) {
            if (err) reject(err);
            else resolve({ username, email, employeeId });
          }
        );
      }
    });
  }
}
