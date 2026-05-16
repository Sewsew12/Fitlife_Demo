import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const jwt = process.env.JWT_SECRET;

  const checks: Record<string, string> = {
    NEXT_PUBLIC_SUPABASE_URL: url ? `✅ set (${url})` : '❌ MISSING',
    SUPABASE_SERVICE_ROLE_KEY: key ? `✅ set (${key.slice(0, 20)}…)` : '❌ MISSING',
    JWT_SECRET: jwt ? '✅ set' : '❌ MISSING',
  };

  if (!url || !key) {
    return NextResponse.json({ ok: false, checks, tables: {}, error: 'Missing env vars' }, { status: 500 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const tables: Record<string, string> = {};
  for (const table of ['demo_users', 'demo_activities', 'demo_food_logs']) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      tables[table] = error.message.includes('does not exist') || error.code === '42P01'
        ? '❌ TABLE MISSING — run supabase/schema.sql'
        : `❌ ${error.message}`;
    } else {
      tables[table] = '✅ exists';
    }
  }

  const allOk = Object.values(tables).every(v => v.startsWith('✅'));
  return NextResponse.json({ ok: allOk, checks, tables }, { status: allOk ? 200 : 500 });
}
