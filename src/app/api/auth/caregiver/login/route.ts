import { NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // In demo mode or Supabase fallback, check our user record
    const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || db.users[0];

    // Issue demo JWT token
    const token = `cg_token_${user.id}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
