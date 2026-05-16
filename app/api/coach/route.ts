import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCoachReply } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { message, history } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const reply = await getCoachReply(message, history ?? []);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('coach error', err);
    return NextResponse.json({ error: 'Could not reach the coach right now.' }, { status: 500 });
  }
}
