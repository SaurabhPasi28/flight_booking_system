require("dotenv").config();
import { Pool } from "pg";

let pool;

export function getPool() {
  if (!pool) {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }

    const isNeon = process.env.DATABASE_URL.includes("neon.tech");
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isNeon ? { rejectUnauthorized: false } : false,
      // Add connection timeout settings
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

export async function query(text, params) {
  const pool = getPool();
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}
