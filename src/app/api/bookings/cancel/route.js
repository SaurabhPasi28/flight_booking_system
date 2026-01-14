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

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID required' },
        { status: 400 }
      );
    }

    // Get booking details
    const bookingResult = await query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [bookingId, user.id]
    );

    if (bookingResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = bookingResult.rows[0];

    // Check if booking is already cancelled or completed
    if (booking.booking_status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Booking already cancelled' },
        { status: 400 }
      );
    }

    if (booking.booking_status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel completed booking' },
        { status: 400 }
      );
    }

    // Check if flight date has passed
    const flightDate = new Date(booking.flight_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (flightDate < today) {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel past bookings' },
        { status: 400 }
      );
    }

    // Calculate refund (90% refund, 10% cancellation fee)
    const refundAmount = parseFloat(booking.final_price) * 0.9;

    // Update booking status
    await query(
      'UPDATE bookings SET booking_status = $1 WHERE id = $2',
      ['cancelled', bookingId]
    );

    // Refund to wallet
    const walletResult = await query(
      'SELECT balance FROM wallet WHERE user_id = $1',
      [user.id]
    );

    const currentBalance = parseFloat(walletResult.rows[0].balance);
    const newBalance = currentBalance + refundAmount;

    await query(
      'UPDATE wallet SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [newBalance, user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      refundAmount,
      newBalance
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
