import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const result = await query(
      'SELECT balance FROM wallet WHERE user_id = $1',
      [userId]
    );
    
    const balance = result.rows[0]?.balance || 50000.00;

    return NextResponse.json({
      success: true,
      balance: parseFloat(balance)
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet balance' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { amount } = await request.json();

    // Get current balance
    const result = await query(
      'SELECT balance FROM wallet WHERE user_id = $1',
      [user.id]
    );
    
    const currentBalance = parseFloat(result.rows[0]?.balance || 50000.00);

    if (currentBalance < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient wallet balance' },
        { status: 400 }
      );
    }

    // Deduct amount
    const newBalance = currentBalance - amount;
    await query(
      'UPDATE wallet SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [newBalance, user.id]
    );

    return NextResponse.json({
      success: true,
      balance: newBalance
    });
  } catch (error) {
    console.error('Error updating wallet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update wallet' },
      { status: 500 }
    );
  }
}
