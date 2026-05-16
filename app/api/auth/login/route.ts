import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { createSession, sessionCookieOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const supabase = getDb();

    const { data: user } = await supabase
      .from('demo_users')
      .select('id, name, email, password_hash')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = await createSession({ userId: user.id, email: user.email, name: user.name });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (err) {
    console.error('login error', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
