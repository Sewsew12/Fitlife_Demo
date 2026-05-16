/**
 * Seeds a demo user: demo@fitlife.app / Demo123!
 * Run: node scripts/seed.mjs
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js';
import { hashSync } from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

const email = 'demo@fitlife.app';
const name  = 'Demo User';
const hash  = hashSync('Demo123!', 10);

// Upsert demo user
const { data: user, error: uErr } = await supabase
  .from('demo_users')
  .upsert({ email, name, password_hash: hash }, { onConflict: 'email' })
  .select('id')
  .single();

if (uErr) { console.error('❌ User upsert failed:', uErr.message); process.exit(1); }
const userId = user.id;

// Seed activities
const activities = [
  { type: 'Running',       duration: 30, calories: 320, notes: 'Morning run' },
  { type: 'Gym / Weights', duration: 45, calories: 280, notes: 'Upper body day' },
  { type: 'Cycling',       duration: 60, calories: 450, notes: 'Weekend ride' },
  { type: 'Yoga',          duration: 40, calories:  90, notes: 'Evening stretch' },
  { type: 'HIIT',          duration: 25, calories: 350, notes: '' },
];
await supabase.from('demo_activities').insert(
  activities.map((a, i) => ({
    ...a,
    user_id: userId,
    logged_at: new Date(Date.now() - i * 86_400_000).toISOString(),
  }))
);

// Seed food logs
const foods = [
  { name: 'Oatmeal with banana',       calories: 320, protein: 10, carbs: 58, fat:  6, meal_type: 'breakfast' },
  { name: 'Grilled chicken & rice',    calories: 520, protein: 45, carbs: 60, fat:  8, meal_type: 'lunch' },
  { name: 'Protein shake',             calories: 180, protein: 25, carbs:  8, fat:  4, meal_type: 'snack' },
  { name: 'Salmon & sweet potato',     calories: 480, protein: 38, carbs: 52, fat: 12, meal_type: 'dinner' },
  { name: 'Greek yogurt with berries', calories: 150, protein: 12, carbs: 20, fat:  3, meal_type: 'snack' },
];
await supabase.from('demo_food_logs').insert(foods.map((f) => ({ ...f, user_id: userId })));

console.log('✅  Seeded demo@fitlife.app / Demo123!');
