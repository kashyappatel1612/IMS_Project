import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  initDb,
  findUserByEmail,
  createUser,
  saveOtpToDb,
  verifyOtpInDb,
  markUserAsVerified,
  getAllIdeasFromDb,
  saveIdeaToDb,
  updateIdeaStatusInDb,
  updateUserProfileInDb
} from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "idea360_super_secret_key_2026";

app.use(cors());
app.use(express.json({ limit: "25mb" }));

// Initialize DB Tables
initDb();

// Nodemailer Transporter (Pooled SSL Port 465 for Instant Delivery)
const smtpUser = (process.env.SMTP_USER || "").trim();
const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: 465,
  secure: true,
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: smtpUser,
    pass: smtpPass
  },
  tls: { rejectUnauthorized: false }
});

// Helper function to send email OTP
async function sendOtpEmail(toEmail, otpCode) {
  const mailOptions = {
    from: `"Idea360 Portal" <${smtpUser || "noreply.idea360@gmail.com"}>`,
    to: toEmail,
    subject: "🔐 Idea360 - Email Verification OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
        <h2 style="color: #4f46e5; margin-top: 0;">Idea360 Email Verification</h2>
        <p>Your one-time verification code for registration is:</p>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="font-size: 13px; color: #64748b;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    if (smtpUser && smtpPass) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`⚡ INSTANT EMAIL DELIVERED TO ${toEmail} | Message ID: ${info.messageId}`);
    } else {
      console.log(`✉️ REAL EMAIL NOTICE: Set SMTP_USER and SMTP_PASS in backend/.env to deliver to real inbox.`);
      console.log(`🔑 OTP Code for ${toEmail}: ${otpCode}`);
    }
  } catch (err) {
    console.error(`❌ Email Delivery Error to ${toEmail}:`, err.message);
    console.log(`🔑 OTP Code for ${toEmail}: ${otpCode}`);
  }
}

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Idea360 Production Auth API Server is running!" });
});

// ==========================================
// PRODUCTION AUTH ROUTES (JWT + OTP)
// ==========================================

// 1. Step 1: Register User / Admin (Generates OTP)
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, role, employeeId } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      if (existing.is_verified) {
        return res.status(400).json({ error: "Email address is already registered & verified! Please sign in." });
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await createUser({
        username: username.trim(),
        email: email.trim(),
        hashedPassword,
        role: role || "User",
        employeeId: employeeId || ""
      });
    }

    // Generate 6-digit random OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await saveOtpToDb(email.trim(), otpCode);
    
    // Dispatch email asynchronously so HTTP response is instant
    sendOtpEmail(email.trim(), otpCode).catch(err => console.error("Async send email error:", err));

    res.status(200).json({
      message: `Verification OTP sent to ${email.trim()}! Please check your email inbox.`,
      requiresOtp: true,
      email: email.trim()
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Database error during registration." });
  }
});

// 2. Step 2: Verify OTP & Activate Account
app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    return res.status(400).json({ error: "Email and OTP code are required." });
  }

  try {
    const isValid = await verifyOtpInDb(email, otpCode);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired OTP code! Please check your email and try again." });
    }

    await markUserAsVerified(email);
    const user = await findUserByEmail(email);

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Email verified successfully! Session active.",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id
      }
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ error: "Database error during OTP verification." });
  }
});

// 3. Resend OTP Code
app.post("/api/auth/resend-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await saveOtpToDb(email.trim(), otpCode);
    
    // Dispatch email asynchronously so HTTP response is instant
    sendOtpEmail(email.trim(), otpCode).catch(err => console.error("Async resend email error:", err));

    console.log(`✉️ REAL RESEND OTP SENT to ${email.trim()}`);

    res.json({
      message: `New 6-digit OTP code sent to ${email.trim()}! Please check your email inbox.`
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to resend OTP." });
  }
});

// 4. Sign In (JWT Token)
app.post("/api/auth/login", async (req, res) => {
  const { email, password, role, employeeId } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Account not found! Check your email or register first." });
    }

    if (user.role && user.role !== role) {
      return res.status(400).json({
        error: `This account is registered as "${user.role}". You cannot sign in under "${role}" role!`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password! Please try again." });
    }

    // Auto-mark verified if not marked yet
    if (!user.is_verified) {
      await markUserAsVerified(email);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id || employeeId
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Database error during login." });
  }
});

// 5. Update Profile (Existing User Row in DB)
app.put("/api/auth/profile", async (req, res) => {
  const { email, username, employeeId, currentPassword, newPassword } = req.body;

  if (!email || !username) {
    return res.status(400).json({ error: "Email and full name are required." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    let hashedPassword = null;
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to set a new password." });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Incorrect current password! Profile update aborted." });
      }
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await updateUserProfileInDb({
      email,
      username,
      employeeId,
      hashedPassword
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, username: username.trim() },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Profile updated successfully in database!",
      token,
      user: {
        id: user.id,
        username: username.trim(),
        email: user.email,
        role: user.role,
        employeeId: employeeId || user.employee_id
      }
    });
  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ error: "Failed to update profile in database." });
  }
});

// ==========================================
// IDEAS ROUTES (Database Operations)
// ==========================================

app.get("/api/ideas", async (req, res) => {
  try {
    const ideas = await getAllIdeasFromDb();
    res.json(ideas);
  } catch (err) {
    console.error("Get Ideas Error:", err);
    res.status(500).json({ error: "Failed to fetch ideas from database." });
  }
});

app.post("/api/ideas", async (req, res) => {
  const { title, category, author, authorEmail, problemStatement, description, expectedOutcome, attachment } = req.body;

  if (!title || !category || !problemStatement || !description) {
    return res.status(400).json({ error: "Title, category, problem statement, and description are required." });
  }

  try {
    const saved = await saveIdeaToDb({
      id: Date.now(),
      title: title.trim(),
      category,
      author: author || "User",
      authorEmail: authorEmail || "",
      problemStatement: problemStatement.trim(),
      description: description.trim(),
      expectedOutcome: expectedOutcome || "",
      attachment
    });

    res.status(201).json({ message: "Idea saved successfully!", idea: saved });
  } catch (err) {
    console.error("Save Idea Error:", err);
    res.status(500).json({ error: "Failed to save idea to database." });
  }
});

app.patch("/api/ideas/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, evaluatorNotes } = req.body;

  try {
    const updated = await updateIdeaStatusInDb(id, status, evaluatorNotes);
    res.json({ message: `Idea status updated to "${status}"!`, idea: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Idea360 Production Auth API Server running at http://localhost:${PORT}`);
});
