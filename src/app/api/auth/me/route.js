import { getUserFromRequest } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }

    // Get user details
    const result = await query(
      'SELECT id, email, full_name FROM users WHERE id = $1',
      [user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }

    const userData = result.rows[0];

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 401 }
    );
  }
}
