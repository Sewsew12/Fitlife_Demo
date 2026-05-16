'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Sign up failed.'); }
      else { router.push('/dashboard'); router.refresh(); }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Create your account</h1>
      <p className="mb-6 text-sm text-gray-500">Start your fitness journey today</p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" className="input pl-10" placeholder="Jane Smith"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              required autoComplete="name" />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="email" className="input pl-10" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              required autoComplete="email" />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="password" className="input pl-10" placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              required minLength={6} autoComplete="new-password" />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? 'Creating account…' : <><UserPlus className="h-4 w-4" /> Create account</>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-violet-600 hover:underline">Sign in</Link>
      </p>
    </>
  );
}
