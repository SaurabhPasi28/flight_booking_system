const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("❌ DATABASE_URL is not set");
  }

  const isNeon = process.env.DATABASE_URL.includes("neon.tech");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isNeon ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log("🔄 Setting up database...");
    console.log("🌍 Neon DB:", isNeon);

    const schemaSQL = fs.readFileSync(
      path.join(__dirname, "schema.sql"),
      "utf8"
    );
    await pool.query(schemaSQL);

    const seedSQL = fs.readFileSync(
      path.join(__dirname, "seed.sql"),
      "utf8"
    );
    await pool.query(seedSQL);

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, "migration.sql"),
      "utf8"
    );
    await pool.query(migrationSQL);

    console.log("🎉 Database setup completed");
  } catch (err) {
    console.error("❌ Database setup failed:", err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

setupDatabase();
