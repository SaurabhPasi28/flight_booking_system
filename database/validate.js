// Validate Database Connection and Setup
require("dotenv").config({ path: ".env" });
const { Pool } = require('pg');

async function validateSetup() {
  console.log('🔍 Validating Flight Booking System Setup...\n');

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  const isNeon = process.env.DATABASE_URL.includes("neon.tech");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isNeon ? { rejectUnauthorized: false } : false,
  });

  try {
    // Test connection
    console.log('✓ Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('  ✅ Database connection successful\n');

    // Check flights table
    console.log('✓ Checking flights table...');
    const flightsResult = await pool.query('SELECT COUNT(*) FROM flights');
    const flightCount = parseInt(flightsResult.rows[0].count);
    console.log(`  ✅ Found ${flightCount} flights\n`);

    if (flightCount === 0) {
      console.log('  ⚠️  Warning: No flights found. Run seeding script.\n');
    }

    // Check wallet
    console.log('✓ Checking wallet...');
    const walletResult = await pool.query('SELECT balance FROM wallet LIMIT 1');
    if (walletResult.rows.length > 0) {
      const balance = parseFloat(walletResult.rows[0].balance);
      console.log(`  ✅ Wallet balance: ₹${balance.toLocaleString('en-IN')}\n`);
    } else {
      console.log('  ⚠️  Warning: Wallet not initialized\n');
    }

    // Check bookings
    console.log('✓ Checking bookings table...');
    const bookingsResult = await pool.query('SELECT COUNT(*) FROM bookings');
    const bookingCount = parseInt(bookingsResult.rows[0].count);
    console.log(`  ✅ Found ${bookingCount} bookings\n`);

    console.log('🎉 Setup validation complete!');
    console.log('\n📋 Summary:');
    console.log(`   Flights: ${flightCount}`);
    console.log(`   Bookings: ${bookingCount}`);
    console.log(`   Wallet: Ready\n`);
    console.log('✅ System is ready to use!');
    console.log('   Run: npm run dev');

  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Ensure PostgreSQL is running');
    console.error('   2. Check .env.local credentials');
    console.error('   3. Run: node database/setup.js');
  } finally {
    await pool.end();
  }
}

validateSetup();
