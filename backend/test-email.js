import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const userEmail = (process.env.SMTP_USER || "").trim();
const userPass = (process.env.SMTP_PASS || "").replace(/\s+/g, ""); // Remove any spaces

console.log("🔍 Testing Email Delivery via Gmail SMTP...");
console.log("Sender Email:", userEmail);
console.log("App Password Length:", userPass.length);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: userEmail,
    pass: userPass
  }
});

async function sendTest() {
  try {
    const info = await transporter.sendMail({
      from: `"Idea360 Portal" <${userEmail}>`,
      to: "kp2054170@gmail.com",
      subject: "🔑 Test Verification OTP - Idea360",
      html: `<h2>Your OTP is: 998877</h2>`
    });

    console.log("✅ EMAIL DELIVERED SUCCESSFULLY!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
  } catch (err) {
    console.error("❌ EMAIL SEND ERROR:", err);
  }
}

sendTest();
