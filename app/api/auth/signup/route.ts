import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { createSession, sessionCookieOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const supabase = getDb();

    const { data: existing, error: checkErr } = await supabase
      .from('demo_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (checkErr) {
      console.error('signup check error', checkErr);
      const msg = checkErr.message.includes('does not exist')
        ? 'Database not set up yet. Run supabase/schema.sql in your Supabase SQL Editor first.'
        : checkErr.message;
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('demo_users')
      .insert({ email: email.toLowerCase(), name: name.trim(), password_hash: passwordHash })
      .select('id, email, name')
      .single();

    if (error || !user) {
      console.error('signup db error', error);
      return NextResponse.json({ error: error?.message ?? 'Could not create account.' }, { status: 500 });
    }

    const token = await createSession({ userId: user.id, email: user.email, name: user.name });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (err) {
    console.error('signup error', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
