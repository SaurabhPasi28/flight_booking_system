import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const flightId = searchParams.get('flightId');
    const sessionId = searchParams.get('sessionId');

    if (!flightId) {
      return NextResponse.json(
        { success: false, error: 'Flight ID required' },
        { status: 400 }
      );
    }

    // Get booking attempts for this flight in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const attemptsResult = await query(
      'SELECT COUNT(*) as count FROM booking_attempts WHERE flight_id = $1 AND attempt_time > $2',
      [flightId, fiveMinutesAgo]
    );

    const attemptCount = parseInt(attemptsResult.rows[0].count);

    // Get base price
    const priceResult = await query(
      'SELECT base_price FROM flights WHERE flight_id = $1',
      [flightId]
    );

    if (priceResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Flight not found' },
        { status: 404 }
      );
    }

    const basePrice = parseFloat(priceResult.rows[0].base_price);

    // Apply surge pricing: 10% increase for every 3 attempts
    const surgeMultiplier = Math.floor(attemptCount / 3) * 0.1;
    const finalPrice = basePrice * (1 + surgeMultiplier);

    // Calculate time until reset (10 minutes from oldest attempt in window)
    let resetTime = null;
    if (attemptCount > 0) {
      const oldestAttemptResult = await query(
        'SELECT attempt_time FROM booking_attempts WHERE flight_id = $1 AND attempt_time > $2 ORDER BY attempt_time ASC LIMIT 1',
        [flightId, fiveMinutesAgo]
      );
      
      if (oldestAttemptResult.rows.length > 0) {
        const oldestAttempt = new Date(oldestAttemptResult.rows[0].attempt_time);
        const resetDate = new Date(oldestAttempt.getTime() + 10 * 60 * 1000);
        resetTime = Math.max(0, Math.floor((resetDate - new Date()) / 1000)); // seconds until reset
      }
    }

    return NextResponse.json({
      success: true,
      basePrice,
      finalPrice,
      attemptCount,
      surgeApplied: surgeMultiplier > 0,
      surgePercentage: Math.floor(surgeMultiplier * 100),
      resetTimeSeconds: resetTime
    });
  } catch (error) {
    console.error('Error calculating surge price:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate surge pricing' },
      { status: 500 }
    );
  }
}
