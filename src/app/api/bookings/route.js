import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

// Helper function to generate PNR
function generatePNR() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = '';
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

// Calculate surge pricing
async function calculateSurgePrice(flightId, sessionId) {
  try {
    // Get booking attempts for this flight in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const attemptsResult = await query(
      'SELECT COUNT(*) as count FROM booking_attempts WHERE flight_id = $1 AND session_id = $2 AND attempt_time > $3',
      [flightId, sessionId, fiveMinutesAgo]
    );

    const attemptCount = parseInt(attemptsResult.rows[0].count);

    // Get base price
    const priceResult = await query(
      'SELECT base_price FROM flights WHERE flight_id = $1',
      [flightId]
    );

    const basePrice = parseFloat(priceResult.rows[0].base_price);

    // Apply surge pricing: 10% increase for every 3 attempts
    const surgeMultiplier = Math.floor(attemptCount / 3) * 0.1;
    const finalPrice = basePrice * (1 + surgeMultiplier);

    return {
      basePrice,
      finalPrice,
      attemptCount,
      surgeApplied: surgeMultiplier > 0
    };
  } catch (error) {
    console.error('Error calculating surge price:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { 
      flightId, 
      passengerName, 
      passengerAge,
      passengerGender,
      passengerType,
      documentNumber,
      phoneNumber,
      classType,
      flightDate,
      sessionId,
      finalPrice
    } = await request.json();

    if (!flightId || !passengerName || !passengerAge || !passengerGender || !phoneNumber || !flightDate || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Record booking attempt
    await query(
      'INSERT INTO booking_attempts (flight_id, session_id) VALUES ($1, $2)',
      [flightId, sessionId]
    );

    // Calculate price with surge (for verification)
    const pricing = await calculateSurgePrice(flightId, sessionId);

    // Check wallet balance for this user
    const walletResult = await query('SELECT balance FROM wallet WHERE user_id = $1', [user.id]);
    const currentBalance = parseFloat(walletResult.rows[0]?.balance || 0);

    if (currentBalance < pricing.finalPrice) {
      return NextResponse.json(
        { success: false, error: 'Insufficient wallet balance' },
        { status: 400 }
      );
    }

    // Get flight details
    const flightResult = await query(
      'SELECT * FROM flights WHERE flight_id = $1',
      [flightId]
    );

    if (flightResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Flight not found' },
        { status: 404 }
      );
    }

    const flight = flightResult.rows[0];

    // Generate PNR
    const pnr = generatePNR();

    // Use provided finalPrice (already calculated on frontend with class, child discount, surge)
    const bookingPrice = finalPrice || pricing.finalPrice;

    // Create booking with all passenger details
    const bookingResult = await query(
      `INSERT INTO bookings (
        pnr, flight_id, passenger_name, passenger_age, passenger_gender, 
        passenger_type, document_number, phone_number, class_type, 
        final_price, flight_date, user_id, booking_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        pnr, flightId, passengerName, passengerAge, passengerGender,
        passengerType || 'adult', documentNumber || null, phoneNumber, classType || 'economy',
        bookingPrice, flightDate, user.id, 'upcoming'
      ]
    );

    // Deduct from wallet
    const newBalance = currentBalance - bookingPrice;
    await query(
      'UPDATE wallet SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [newBalance, user.id]
    );

    return NextResponse.json({
      success: true,
      booking: bookingResult.rows[0],
      flight: flight,
      pricing: pricing,
      newBalance: newBalance
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let queryText = `
      SELECT b.*, f.airline, f.departure_city, f.arrival_city, f.departure_time, f.arrival_time, f.duration_minutes
      FROM bookings b 
      JOIN flights f ON b.flight_id = f.flight_id 
      WHERE b.user_id = $1
    `;
    
    const params = [user.id];
    
    if (status && status !== 'all') {
      queryText += ` AND b.booking_status = $2`;
      params.push(status);
    }
    
    queryText += ` ORDER BY b.booking_date DESC`;

    const result = await query(queryText, params);

    return NextResponse.json({
      success: true,
      bookings: result.rows
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
