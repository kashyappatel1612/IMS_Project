import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/idea360_db";

console.log("🔍 Testing PostgreSQL Connection...");
console.log("Connection URL:", connectionString.replace(/:[^:@]+@/, ":****@"));

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("render") || connectionString.includes("neon")
    ? { rejectUnauthorized: false }
    : false
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ SUCCESS: Successfully connected to PostgreSQL Database!");

    console.log("⚙️ Creating Database Tables (users, ideas) if they don't exist...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'User',
        employee_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

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
    console.log("🎉 Tables Verified & Ready in PostgreSQL!");

    const resUsers = await client.query("SELECT COUNT(*) FROM users;");
    console.log(`📊 Total Users in PostgreSQL DB: ${resUsers.rows[0].count}`);

    const resIdeas = await client.query("SELECT COUNT(*) FROM ideas;");
    console.log(`💡 Total Ideas in PostgreSQL DB: ${resIdeas.rows[0].count}`);

    client.release();
    process.exit(0);
  } catch (err) {
    console.error("❌ CONNECTION ERROR:", err.message);
    process.exit(1);
  }
}

testConnection();
