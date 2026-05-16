/**
 * Seeds a demo user: demo@fitlife.app / Demo123!
 * Run: node --env-file=.env.local scripts/seed.mjs
 */
import pkg from 'bcryptjs';
const { hashSync } = pkg;

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!BASE || !KEY) {
  console.error('❌  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  Prefer: 'return=representation',
};

async function rest(path, method = 'GET', body) {
  const res = await fetch(`${BASE}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// Upsert demo user
const hash = hashSync('Demo123!', 10);
const [user] = await rest(
  'demo_users?on_conflict=email',
  'POST',
  { email: 'demo@fitlife.app', name: 'Demo User', password_hash: hash }
);
const userId = user.id;

// Seed activities (only if none exist for this user)
const existing = await rest(`demo_activities?user_id=eq.${userId}&limit=1`);
if (existing.length === 0) {
  const activities = [
    { type: 'Running',       duration: 30, calories: 320, notes: 'Morning run'   },
    { type: 'Gym / Weights', duration: 45, calories: 280, notes: 'Upper body day' },
    { type: 'Cycling',       duration: 60, calories: 450, notes: 'Weekend ride'   },
    { type: 'Yoga',          duration: 40, calories:  90, notes: 'Evening stretch' },
    { type: 'HIIT',          duration: 25, calories: 350, notes: ''               },
  ];
  await rest('demo_activities', 'POST',
    activities.map((a, i) => ({
      ...a,
      user_id: userId,
      logged_at: new Date(Date.now() - i * 86_400_000).toISOString(),
    }))
  );

  await rest('demo_food_logs', 'POST', [
    { user_id: userId, name: 'Oatmeal with banana',       calories: 320, protein: 10, carbs: 58, fat:  6, meal_type: 'breakfast' },
    { user_id: userId, name: 'Grilled chicken & rice',    calories: 520, protein: 45, carbs: 60, fat:  8, meal_type: 'lunch'     },
    { user_id: userId, name: 'Protein shake',             calories: 180, protein: 25, carbs:  8, fat:  4, meal_type: 'snack'     },
    { user_id: userId, name: 'Salmon & sweet potato',     calories: 480, protein: 38, carbs: 52, fat: 12, meal_type: 'dinner'    },
    { user_id: userId, name: 'Greek yogurt with berries', calories: 150, protein: 12, carbs: 20, fat:  3, meal_type: 'snack'     },
  ]);
}

console.log('✅  Seeded demo@fitlife.app / Demo123!');
