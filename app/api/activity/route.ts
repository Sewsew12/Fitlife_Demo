import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getDb();
  const { data, error } = await supabase
    .from('demo_activities')
    .select('*')
    .eq('user_id', session.userId)
    .order('logged_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activities: data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { type, duration, calories, notes } = await req.json();
    if (!type || !duration || Number(duration) < 1) {
      return NextResponse.json({ error: 'Type and duration are required.' }, { status: 400 });
    }

    const supabase = getDb();
    const { data, error } = await supabase
      .from('demo_activities')
      .insert({
        user_id: session.userId,
        type,
        duration: Number(duration),
        calories: Number(calories ?? 0),
        notes: notes ?? '',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ activity: data }, { status: 201 });
  } catch (err) {
    console.error('activity POST error', err);
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
    .from('demo_activities')
    .delete()
    .eq('id', Number(id))
    .eq('user_id', session.userId);

  return NextResponse.json({ ok: true });
}
