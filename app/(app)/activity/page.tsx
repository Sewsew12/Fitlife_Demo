'use client';

import { useEffect, useState } from 'react';

const TYPES = ['Running', 'Walking', 'Cycling', 'Swimming', 'Gym / Weights', 'Yoga', 'HIIT', 'Other'];

interface Activity {
  id: number;
  type: string;
  duration: number;
  calories: number;
  notes: string;
  logged_at: string;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ type: 'Running', duration: '', calories: '', notes: '' });

  async function load() {
    const res = await fetch('/api/activity');
    const data = await res.json();
    setActivities(data.activities ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Failed to save.');
    } else {
      setForm({ type: 'Running', duration: '', calories: '', notes: '' });
      load();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/activity?id=${id}`, { method: 'DELETE' });
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }

  function fmt(iso: string) {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Activity Log</h1>

      {/* Form */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Log a Workout</h2>
        {error && <div className="mb-3 text-red-600 text-sm bg-red-50 p-2 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Activity type</label>
            <select
              className="input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <input
              type="number" min="1" className="input" placeholder="30"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Calories burned (optional)</label>
            <input
              type="number" min="0" className="input" placeholder="200"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input
              type="text" className="input" placeholder="Morning run…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : '+ Add Activity'}
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">History</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : activities.length === 0 ? (
          <p className="text-gray-400 text-sm">No activities logged yet. Add your first one above!</p>
        ) : (
          <ul className="space-y-3">
            {activities.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 p-3 bg-brand-50 rounded-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">{a.type}</span>
                    <span className="badge bg-brand-100 text-brand-700">{a.duration} min</span>
                    {a.calories > 0 && (
                      <span className="badge bg-violet-100 text-violet-700">{a.calories} kcal</span>
                    )}
                  </div>
                  {a.notes && <p className="text-xs text-gray-500 mt-0.5">{a.notes}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{fmt(a.logged_at)}</p>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-sm mt-0.5"
                  aria-label="Delete"
                >✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
