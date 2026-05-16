'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTERS = [
  'Give me a beginner workout plan',
  'What should I eat after a run?',
  'How do I improve my sleep quality?',
  'Best foods for building muscle',
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hey there! I'm your FitLife AI Coach 👋 I can help with workout plans, nutrition advice, recovery tips, and anything fitness-related. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: newMessages.slice(-7).map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply ?? 'Sorry, I could not respond right now.' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-0px)] max-w-2xl mx-auto w-full p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">AI Coach</h1>
        <p className="text-sm text-gray-400">Powered by Groq · falls back to built-in responses offline</p>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto card p-4 space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs mr-2 mt-0.5 shrink-0">
                🤖
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-sm'
                  : 'bg-gray-100 text-gray-800 rounded-tl-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs mr-2 shrink-0">🤖</div>
            <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-tl-sm">
              <span className="inline-flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter chips */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex gap-2"
      >
        <input
          type="text"
          className="input flex-1"
          placeholder="Ask your coach anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="btn-primary px-5"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
