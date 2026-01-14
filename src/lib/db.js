import { Pool } from "pg";

let pool;

// console.log(process.env.DATABASE_URL,'----------->')
export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  return pool;
}

export async function query(text, params) {
  const pool = getPool();
  return await pool.query(text, params);
}
