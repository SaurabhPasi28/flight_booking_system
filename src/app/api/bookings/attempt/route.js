import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { flightId, sessionId } = await request.json();

    if (!flightId) {
      return NextResponse.json(
        { success: false, error: 'Flight ID required' },
        { status: 400 }
      );
    }

    // Record the booking attempt with user_id and session_id
    await query(
      'INSERT INTO booking_attempts (flight_id, user_id, session_id, attempt_time) VALUES ($1, $2, $3, NOW())',
      [flightId, user.id, sessionId || 'unknown']
    );

    console.log(`✅ Attempt recorded: User ${user.id}, Flight ${flightId}, Session ${sessionId}`);

    return NextResponse.json({
      success: true,
      message: 'Attempt recorded',
      userId: user.id,
      flightId
    });
  } catch (error) {
    console.error('Record attempt error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record attempt' },
      { status: 500 }
    );
  }
}
