import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getDb();
  const { data, error } = await supabase
    .from('demo_food_logs')
    .select('*')
    .eq('user_id', session.userId)
    .order('logged_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ food: data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, calories, protein, carbs, fat, meal_type } = await req.json();
    if (!name || !calories || Number(calories) < 1) {
      return NextResponse.json({ error: 'Name and calories are required.' }, { status: 400 });
    }

    const supabase = getDb();
    const { data, error } = await supabase
      .from('demo_food_logs')
      .insert({
        user_id: session.userId,
        name: name.trim(),
        calories: Number(calories),
        protein: Number(protein ?? 0),
        carbs: Number(carbs ?? 0),
        fat: Number(fat ?? 0),
        meal_type: meal_type ?? 'snack',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ food: data }, { status: 201 });
  } catch (err) {
    console.error('food POST error', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const supabase = getDb();
  await supabase
    .from('demo_food_logs')
    .delete()
    .eq('id', Number(id))
    .eq('user_id', session.userId);

  return NextResponse.json({ ok: true });
}
