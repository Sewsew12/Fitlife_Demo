'use client';

import { useEffect, useState } from 'react';
import ProgressRing from '@/app/components/ProgressRing';
import Link from 'next/link';

interface Stats {
  today: {
    activityMinutes: number;
    caloriesBurned: number;
    caloriesConsumed: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  totals: { sessions: number; minutesAllTime: number };
  goals: { activityMinutes: number; caloriesConsumed: number; caloriesBurned: number };
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className={`card flex flex-col gap-1 border-l-4 ${color ?? 'border-brand-500'}`}>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <p className="text-gray-400 text-sm">{today}</p>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>
      ) : stats ? (
        <>
          {/* Progress Rings */}
          <div className="card mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Today&apos;s Progress</h2>
            <div className="flex flex-wrap gap-6 justify-around">
              <ProgressRing
                value={stats.today.activityMinutes}
                max={stats.goals.activityMinutes}
                color="#4f46e5"
                label="Active mins"
                unit="m"
              />
              <ProgressRing
                value={stats.today.caloriesBurned}
                max={stats.goals.caloriesBurned}
                color="#7c3aed"
                label="Kcal burned"
              />
              <ProgressRing
                value={stats.today.caloriesConsumed}
                max={stats.goals.caloriesConsumed}
                color="#06b6d4"
                label="Kcal consumed"
              />
            </div>
          </div>

          {/* Macro bars */}
          <div className="card mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Today&apos;s Macros</h2>
            <div className="space-y-3">
              {[
                { label: 'Protein', value: stats.today.protein, max: 120, color: 'bg-indigo-500' },
                { label: 'Carbs',   value: stats.today.carbs,   max: 250, color: 'bg-violet-500' },
                { label: 'Fat',     value: stats.today.fat,     max: 70,  color: 'bg-cyan-500' },
              ].map(({ label, value, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{label}</span>
                    <span>{Math.round(value)}g / {max}g</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all`}
                      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stat cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Sessions" value={stats.totals.sessions} sub="all time" color="border-indigo-400" />
            <StatCard label="Total mins" value={stats.totals.minutesAllTime} sub="all time" color="border-violet-400" />
            <StatCard label="Kcal in" value={stats.today.caloriesConsumed} sub="today" color="border-cyan-400" />
            <StatCard label="Kcal out" value={stats.today.caloriesBurned} sub="today" color="border-emerald-400" />
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3">
            <Link href="/activity" className="btn-primary text-sm">+ Log Activity</Link>
            <Link href="/food" className="btn-secondary text-sm">+ Log Meal</Link>
            <Link href="/coach" className="btn-ghost text-sm">Ask AI Coach →</Link>
          </div>
        </>
      ) : (
        <p className="text-gray-500">Could not load stats.</p>
      )}
    </div>
  );
}
