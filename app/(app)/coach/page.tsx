'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

const STARTERS = [
  'Give me a beginner workout plan',
  'What should I eat after a run?',
  'How do I improve sleep quality?',
  'Best foods for building muscle',
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hey! I'm your FitLife AI Coach 👋 I can help with workout plans, nutrition advice, recovery tips, and anything fitness-related. What's on your mind?",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    const next: Message[] = [...messages, { role: 'user', content: msg }];
    setMessages(next); setInput(''); setLoading(true);
    try {
      const res = await fetch('/api/coach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: next.slice(-7) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? 'Sorry, could not respond.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally { setLoading(false); }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-sm">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Coach</h1>
          <p className="text-xs text-gray-400">Powered by Groq · offline fallback available</p>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 shadow-sm">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-sm shadow-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 shadow-sm">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2.5">
              <span className="inline-flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter prompts */}
      {messages.length === 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {STARTERS.map(s => (
            <button key={s} onClick={() => send(s)}
              className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); send(); }} className="mt-3 flex gap-2">
        <input type="text" className="input flex-1" placeholder="Ask your coach anything…"
          value={input} onChange={e => setInput(e.target.value)} disabled={loading} />
        <button type="submit" className="btn-primary px-4" disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
