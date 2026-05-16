import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getDb();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [{ data: activities }, { data: allActs }, { data: foods }] = await Promise.all([
    supabase
      .from('demo_activities')
      .select('duration, calories')
      .eq('user_id', session.userId)
      .gte('logged_at', todayStart.toISOString())
      .lte('logged_at', todayEnd.toISOString()),
    supabase
      .from('demo_activities')
      .select('duration')
      .eq('user_id', session.userId),
    supabase
      .from('demo_food_logs')
      .select('calories, protein, carbs, fat')
      .eq('user_id', session.userId)
      .gte('logged_at', todayStart.toISOString())
      .lte('logged_at', todayEnd.toISOString()),
  ]);

  const actMins = (activities ?? []).reduce((s, a) => s + (a.duration ?? 0), 0);
  const actCal  = (activities ?? []).reduce((s, a) => s + (a.calories ?? 0), 0);
  const foodCal = (foods ?? []).reduce((s, f) => s + (f.calories ?? 0), 0);
  const protein = (foods ?? []).reduce((s, f) => s + (f.protein ?? 0), 0);
  const carbs   = (foods ?? []).reduce((s, f) => s + (f.carbs ?? 0), 0);
  const fat     = (foods ?? []).reduce((s, f) => s + (f.fat ?? 0), 0);
  const totalMin = (allActs ?? []).reduce((s, a) => s + (a.duration ?? 0), 0);

  return NextResponse.json({
    today: {
      activityMinutes: actMins,
      caloriesBurned: actCal,
      caloriesConsumed: foodCal,
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    },
    totals: {
      sessions: (allActs ?? []).length,
      minutesAllTime: totalMin,
    },
    goals: {
      activityMinutes: 60,
      caloriesConsumed: 2000,
      caloriesBurned: 500,
    },
  });
}
