'use client';

import { useEffect, useState } from 'react';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
type MealType = typeof MEAL_TYPES[number];

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: 'bg-amber-100 text-amber-700',
  lunch:     'bg-green-100 text-green-700',
  dinner:    'bg-indigo-100 text-indigo-700',
  snack:     'bg-pink-100 text-pink-700',
};

interface FoodLog {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: MealType;
  logged_at: string;
}

export default function FoodPage() {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', calories: '', protein: '', carbs: '', fat: '', meal_type: 'lunch' as MealType,
  });

  async function load() {
    const res = await fetch('/api/food');
    const data = await res.json();
    setLogs(data.food ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await fetch('/api/food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Failed to save.');
    } else {
      setForm({ name: '', calories: '', protein: '', carbs: '', fat: '', meal_type: 'lunch' });
      load();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/food?id=${id}`, { method: 'DELETE' });
    setLogs((prev) => prev.filter((f) => f.id !== id));
  }

  // Today's logs only
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter((l) => l.logged_at.startsWith(todayStr));
  const totals = todayLogs.reduce(
    (acc, l) => ({
      cal: acc.cal + l.calories,
      protein: acc.protein + l.protein,
      carbs: acc.carbs + l.carbs,
      fat: acc.fat + l.fat,
    }),
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  function fmt(iso: string) {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Food Diary</h1>

      {/* Today's summary */}
      {todayLogs.length > 0 && (
        <div className="card mb-6 bg-gradient-to-r from-brand-50 to-violet-50 border-brand-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Today&apos;s Totals</h2>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: 'Calories', val: Math.round(totals.cal), unit: 'kcal' },
              { label: 'Protein',  val: Math.round(totals.protein), unit: 'g' },
              { label: 'Carbs',    val: Math.round(totals.carbs),   unit: 'g' },
              { label: 'Fat',      val: Math.round(totals.fat),     unit: 'g' },
            ].map(({ label, val, unit }) => (
              <div key={label}>
                <div className="text-xl font-bold text-brand-700">{val}<span className="text-xs font-normal text-gray-400 ml-0.5">{unit}</span></div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Log a Meal</h2>
        {error && <div className="mb-3 text-red-600 text-sm bg-red-50 p-2 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Food / meal name</label>
            <input type="text" className="input" placeholder="e.g. Chicken & rice bowl"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Calories (kcal)</label>
            <input type="number" min="1" className="input" placeholder="450"
              value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} required />
          </div>
          <div>
            <label className="label">Meal type</label>
            <select className="input" value={form.meal_type}
              onChange={(e) => setForm({ ...form, meal_type: e.target.value as MealType })}>
              {MEAL_TYPES.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Protein (g)</label>
            <input type="number" min="0" className="input" placeholder="30"
              value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} />
          </div>
          <div>
            <label className="label">Carbs (g)</label>
            <input type="number" min="0" className="input" placeholder="55"
              value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
          </div>
          <div>
            <label className="label">Fat (g)</label>
            <input type="number" min="0" className="input" placeholder="12"
              value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : '+ Add Meal'}
            </button>
          </div>
        </form>
      </div>

      {/* Log history */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">All Entries</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-400 text-sm">No meals logged yet. Add your first one above!</p>
        ) : (
          <ul className="space-y-3">
            {logs.map((f) => (
              <li key={f.id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{f.name}</span>
                    <span className={`badge ${MEAL_COLORS[f.meal_type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {f.meal_type}
                    </span>
                    <span className="badge bg-orange-100 text-orange-700">{f.calories} kcal</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    P {Math.round(f.protein)}g · C {Math.round(f.carbs)}g · F {Math.round(f.fat)}g
                    {' · '}{fmt(f.logged_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(f.id)}
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
