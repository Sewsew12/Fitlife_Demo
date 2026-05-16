'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Timer, Flame, Dumbbell } from 'lucide-react';

const TYPES = ['Running', 'Walking', 'Cycling', 'Swimming', 'Gym / Weights', 'Yoga', 'HIIT', 'Other'];

const TYPE_COLORS: Record<string, string> = {
  'Running':       'bg-sky-100 text-sky-700',
  'Walking':       'bg-green-100 text-green-700',
  'Cycling':       'bg-amber-100 text-amber-700',
  'Swimming':      'bg-blue-100 text-blue-700',
  'Gym / Weights': 'bg-violet-100 text-violet-700',
  'Yoga':          'bg-pink-100 text-pink-700',
  'HIIT':          'bg-red-100 text-red-700',
  'Other':         'bg-gray-100 text-gray-700',
};

interface Activity {
  id: number; type: string; duration: number; calories: number; notes: string; logged_at: string;
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
    e.preventDefault(); setError(''); setSubmitting(true);
    const res = await fetch('/api/activity', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Failed to save.'); }
    else { setForm({ type: 'Running', duration: '', calories: '', notes: '' }); load(); }
    setSubmitting(false);
  }

  async function del(id: number) {
    await fetch(`/api/activity?id=${id}`, { method: 'DELETE' });
    setActivities(prev => prev.filter(a => a.id !== id));
  }

  const totalToday = (() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = activities.filter(a => a.logged_at.startsWith(todayStr));
    return { mins: today.reduce((s, a) => s + a.duration, 0), cal: today.reduce((s, a) => s + a.calories, 0) };
  })();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-sm text-gray-500">Track your workouts and movement</p>
      </div>

      {/* Today summary */}
      {!loading && activities.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-sky-100 bg-gradient-to-b from-white to-sky-50/80 p-4 shadow-sm ring-1 ring-sky-100/60">
            <Timer className="mb-2 h-5 w-5 text-sky-500" />
            <p className="text-xs text-gray-500">Active today</p>
            <p className="text-2xl font-bold text-gray-900">{totalToday.mins}<span className="ml-1 text-xs font-normal text-gray-400">min</span></p>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-gradient-to-b from-white to-orange-50/80 p-4 shadow-sm ring-1 ring-orange-100/60">
            <Flame className="mb-2 h-5 w-5 text-orange-500" />
            <p className="text-xs text-gray-500">Burned today</p>
            <p className="text-2xl font-bold text-gray-900">{totalToday.cal}<span className="ml-1 text-xs font-normal text-gray-400">kcal</span></p>
          </div>
        </div>
      )}

      {/* Log form */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-sm">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <h2 className="font-semibold text-gray-900">Log a Workout</h2>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Activity type</label>
            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <input type="number" min="1" className="input" placeholder="30"
              value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required />
          </div>
          <div>
            <label className="label">Calories burned <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="number" min="0" className="input" placeholder="200"
              value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} />
          </div>
          <div>
            <label className="label">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" className="input" placeholder="Morning run…"
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : <><Plus className="h-4 w-4" /> Add Activity</>}
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">History</h2>
          {!loading && <span className="ml-auto text-xs text-gray-400">{activities.length} sessions</span>}
        </div>

        {loading ? (
          <div className="flex h-24 items-center justify-center text-sm text-gray-400">Loading…</div>
        ) : activities.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <Dumbbell className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No activities yet. Log your first workout above!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {activities.map(a => (
              <li key={a.id} className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 p-3 hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Dumbbell className="h-4 w-4 text-violet-500" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-900">{a.type}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[a.type] ?? 'bg-gray-100 text-gray-700'}`}>
                        {a.duration} min
                      </span>
                      {a.calories > 0 && (
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                          {a.calories} kcal
                        </span>
                      )}
                    </div>
                    {a.notes && <p className="mt-0.5 text-xs text-gray-500">{a.notes}</p>}
                    <p className="mt-0.5 text-xs text-gray-400">
                      {new Date(a.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button onClick={() => del(a.id)}
                  className="mt-0.5 rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
