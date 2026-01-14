const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'flight_booking',
    password: process.env.DB_PASSWORD || 'root',
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log('🔄 Setting up database...');

    // Read and execute schema
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSQL);
    console.log('✅ Schema created successfully');

    // Read and execute seed data
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await pool.query(seedSQL);
    console.log('✅ Data seeded successfully');

    // Read and execute migration
    const migrationSQL = fs.readFileSync(path.join(__dirname, 'migration.sql'), 'utf8');
    await pool.query(migrationSQL);
    console.log('✅ Migration completed successfully');

    console.log('🎉 Database setup complete!');
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase();
