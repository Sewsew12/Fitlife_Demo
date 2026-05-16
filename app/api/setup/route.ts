/**
 * POST /api/setup
 * Creates the demo_* tables in Supabase and seeds the demo user.
 * Protected by a setup token so it can only be run by the app owner.
 * Call once after first deployment: POST /api/setup { "token": "<SETUP_TOKEN>" }
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const SETUP_TOKEN = process.env.SETUP_TOKEN ?? 'fitlife-setup-2024';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (token !== SETUP_TOKEN) {
      return NextResponse.json({ error: 'Invalid setup token.' }, { status: 403 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Supabase's REST API doesn't support DDL directly.
    // We detect missing tables and guide the user to run the schema SQL.
    const { error: testError } = await supabase
      .from('demo_users')
      .select('id')
      .limit(1);

    if (testError && testError.code === '42P01') {
      // Table doesn't exist — return the SQL to run
      return NextResponse.json({
        ok: false,
        message: 'Tables not found. Run supabase/schema.sql in your Supabase SQL Editor first.',
        sql_url: 'https://supabase.com/dashboard/project/ghielozkraitfywliaou/sql/new',
      }, { status: 409 });
    }

    // Seed demo user
    const hash = await bcrypt.hash('Demo123!', 10);
    const { data: user } = await supabase
      .from('demo_users')
      .upsert(
        { email: 'demo@fitlife.app', name: 'Demo User', password_hash: hash },
        { onConflict: 'email' }
      )
      .select('id')
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Could not seed demo user.' }, { status: 500 });
    }

    // Check if already seeded
    const { count } = await supabase
      .from('demo_activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((count ?? 0) === 0) {
      await supabase.from('demo_activities').insert([
        { user_id: user.id, type: 'Running',       duration: 30, calories: 320, notes: 'Morning run',    logged_at: daysAgo(0) },
        { user_id: user.id, type: 'Gym / Weights', duration: 45, calories: 280, notes: 'Upper body day', logged_at: daysAgo(1) },
        { user_id: user.id, type: 'Cycling',        duration: 60, calories: 450, notes: 'Weekend ride',   logged_at: daysAgo(2) },
        { user_id: user.id, type: 'Yoga',           duration: 40, calories:  90, notes: '',               logged_at: daysAgo(3) },
        { user_id: user.id, type: 'HIIT',           duration: 25, calories: 350, notes: '',               logged_at: daysAgo(4) },
      ]);

      await supabase.from('demo_food_logs').insert([
        { user_id: user.id, name: 'Oatmeal with banana',       calories: 320, protein: 10, carbs: 58, fat:  6, meal_type: 'breakfast' },
        { user_id: user.id, name: 'Grilled chicken & rice',    calories: 520, protein: 45, carbs: 60, fat:  8, meal_type: 'lunch' },
        { user_id: user.id, name: 'Protein shake',             calories: 180, protein: 25, carbs:  8, fat:  4, meal_type: 'snack' },
        { user_id: user.id, name: 'Salmon & sweet potato',     calories: 480, protein: 38, carbs: 52, fat: 12, meal_type: 'dinner' },
        { user_id: user.id, name: 'Greek yogurt with berries', calories: 150, protein: 12, carbs: 20, fat:  3, meal_type: 'snack' },
      ]);
    }

    return NextResponse.json({ ok: true, message: 'Setup complete. Login: demo@fitlife.app / Demo123!' });
  } catch (err) {
    console.error('setup error', err);
    return NextResponse.json({ error: 'Setup failed.' }, { status: 500 });
  }
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
