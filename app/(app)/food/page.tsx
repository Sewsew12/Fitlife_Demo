'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, UtensilsCrossed } from 'lucide-react';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
type MealType = typeof MEAL_TYPES[number];

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: 'bg-amber-100 text-amber-700',
  lunch:     'bg-green-100 text-green-700',
  dinner:    'bg-indigo-100 text-indigo-700',
  snack:     'bg-pink-100 text-pink-700',
};

interface FoodLog {
  id: number; name: string; calories: number; protein: number;
  carbs: number; fat: number; meal_type: MealType; logged_at: string;
}

export default function FoodPage() {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', meal_type: 'lunch' as MealType });

  async function load() {
    const res = await fetch('/api/food');
    const data = await res.json();
    setLogs(data.food ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSubmitting(true);
    const res = await fetch('/api/food', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Failed.'); }
    else { setForm({ name: '', calories: '', protein: '', carbs: '', fat: '', meal_type: 'lunch' }); load(); }
    setSubmitting(false);
  }

  async function del(id: number) {
    await fetch(`/api/food?id=${id}`, { method: 'DELETE' });
    setLogs(prev => prev.filter(f => f.id !== id));
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.logged_at.startsWith(todayStr));
  const totals = todayLogs.reduce((a, l) => ({
    cal: a.cal + l.calories, protein: a.protein + l.protein,
    carbs: a.carbs + l.carbs, fat: a.fat + l.fat,
  }), { cal: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Food Diary</h1>
        <p className="text-sm text-gray-500">Track your nutrition and daily macros</p>
      </div>

      {/* Daily summary */}
      {todayLogs.length > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-white to-emerald-50/80 p-4 shadow-sm ring-1 ring-emerald-100/60 sm:p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Today&apos;s Totals</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Calories', val: Math.round(totals.cal),     unit: 'kcal', color: 'text-orange-600' },
              { label: 'Protein',  val: Math.round(totals.protein), unit: 'g',    color: 'text-violet-600' },
              { label: 'Carbs',    val: Math.round(totals.carbs),   unit: 'g',    color: 'text-sky-600' },
              { label: 'Fat',      val: Math.round(totals.fat),     unit: 'g',    color: 'text-emerald-600' },
            ].map(({ label, val, unit, color }) => (
              <div key={label}>
                <p className={`text-xl font-bold sm:text-2xl ${color}`}>
                  {val}<span className="ml-0.5 text-xs font-normal text-gray-400">{unit}</span>
                </p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Calorie progress bar */}
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-gray-400">
              <span>Daily goal: 2,000 kcal</span>
              <span>{Math.round((totals.cal / 2000) * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full gradient-purple-blue transition-all duration-700"
                style={{ width: `${Math.min((totals.cal / 2000) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Log form */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <h2 className="font-semibold text-gray-900">Log a Meal</h2>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Food / meal name</label>
            <input type="text" className="input" placeholder="e.g. Chicken & rice bowl"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Calories (kcal)</label>
            <input type="number" min="1" className="input" placeholder="450"
              value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} required />
          </div>
          <div>
            <label className="label">Meal type</label>
            <select className="input" value={form.meal_type}
              onChange={e => setForm({ ...form, meal_type: e.target.value as MealType })}>
              {MEAL_TYPES.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Protein (g) <span className="text-gray-400 font-normal">optional</span></label>
            <input type="number" min="0" className="input" placeholder="30"
              value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} />
          </div>
          <div>
            <label className="label">Carbs (g) <span className="text-gray-400 font-normal">optional</span></label>
            <input type="number" min="0" className="input" placeholder="55"
              value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} />
          </div>
          <div>
            <label className="label">Fat (g) <span className="text-gray-400 font-normal">optional</span></label>
            <input type="number" min="0" className="input" placeholder="12"
              value={form.fat} onChange={e => setForm({ ...form, fat: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : <><Plus className="h-4 w-4" /> Add Meal</>}
            </button>
          </div>
        </form>
      </div>

      {/* Log history */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">All Entries</h2>
          {!loading && <span className="ml-auto text-xs text-gray-400">{logs.length} logged</span>}
        </div>

        {loading ? (
          <div className="flex h-24 items-center justify-center text-sm text-gray-400">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <UtensilsCrossed className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No meals logged yet. Add your first one above!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {logs.map(f => (
              <li key={f.id} className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 p-3 hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <UtensilsCrossed className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-900">{f.name}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${MEAL_COLORS[f.meal_type] ?? 'bg-gray-100 text-gray-700'}`}>
                        {f.meal_type}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                        {f.calories} kcal
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      P {Math.round(f.protein)}g · C {Math.round(f.carbs)}g · F {Math.round(f.fat)}g
                      {' · '}{new Date(f.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button onClick={() => del(f.id)}
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
