'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, UtensilsCrossed, Flame, Timer, Activity, ArrowRight, Sparkles, Target } from 'lucide-react';
import ProgressRing from '@/app/components/ProgressRing';

interface Stats {
  today: { activityMinutes: number; caloriesBurned: number; caloriesConsumed: number; protein: number; carbs: number; fat: number };
  totals: { sessions: number; minutesAllTime: number };
  goals: { activityMinutes: number; caloriesConsumed: number; caloriesBurned: number };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setStats).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Hero gradient card ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 p-4 shadow-xl ring-1 ring-white/10 sm:p-8">
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-white/70">{today}</p>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              {loading ? 'Loading…' : `Good${new Date().getHours() < 12 ? ' morning' : new Date().getHours() < 18 ? ' afternoon' : ' evening'} 👋`}
            </h1>
            {stats && (
              <p className="mt-1 text-sm text-white/80">
                {stats.today.activityMinutes >= stats.goals.activityMinutes
                  ? "You've hit your activity goal today! 🎉"
                  : `${stats.goals.activityMinutes - stats.today.activityMinutes} mins left to hit your daily goal`}
              </p>
            )}
          </div>

          {/* Progress rings on hero */}
          {stats && (
            <div className="flex gap-4 sm:gap-6">
              <ProgressRing value={stats.today.activityMinutes} max={stats.goals.activityMinutes}
                color="#38bdf8" trackColor="rgba(255,255,255,0.2)" label="Mins" unit="m" size={72} />
              <ProgressRing value={stats.today.caloriesBurned} max={stats.goals.caloriesBurned}
                color="#34d399" trackColor="rgba(255,255,255,0.2)" label="Burned" size={72} />
              <ProgressRing value={stats.today.caloriesConsumed} max={stats.goals.caloriesConsumed}
                color="#c084fc" trackColor="rgba(255,255,255,0.2)" label="Eaten" size={72} />
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="relative mt-4 flex flex-wrap gap-2">
          <Link href="/activity" className="flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/25 transition-colors">
            <Plus className="h-4 w-4" /> Log Activity
          </Link>
          <Link href="/food" className="flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/25 transition-colors">
            <UtensilsCrossed className="h-4 w-4" /> Log Meal
          </Link>
          <Link href="/coach" className="flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/25 transition-colors">
            <Sparkles className="h-4 w-4" /> Ask AI Coach
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-gray-400">Loading stats…</div>
      ) : stats ? (
        <>
          {/* ── Stat cards ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <StatCard icon={<Timer className="h-5 w-5 text-sky-500" />}
              label="Active today" value={`${stats.today.activityMinutes}`} unit="min"
              bg="from-white to-sky-50/80" border="border-sky-100" ring="ring-sky-100/60" />
            <StatCard icon={<Flame className="h-5 w-5 text-orange-500" />}
              label="Burned today" value={`${stats.today.caloriesBurned}`} unit="kcal"
              bg="from-white to-orange-50/80" border="border-orange-100" ring="ring-orange-100/60" />
            <StatCard icon={<UtensilsCrossed className="h-5 w-5 text-emerald-500" />}
              label="Eaten today" value={`${stats.today.caloriesConsumed}`} unit="kcal"
              bg="from-white to-emerald-50/80" border="border-emerald-100" ring="ring-emerald-100/60" />
            <StatCard icon={<Activity className="h-5 w-5 text-violet-500" />}
              label="Total sessions" value={`${stats.totals.sessions}`} unit="all time"
              bg="from-white to-violet-50/80" border="border-violet-100" ring="ring-violet-100/60" />
          </div>

          {/* ── Macro bars ─────────────────────────────────────── */}
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Today&apos;s Macros</h2>
              <Link href="/food" className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:underline">
                Food diary <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Protein', val: stats.today.protein,  max: 120, color: 'bg-violet-500' },
                { label: 'Carbs',   val: stats.today.carbs,    max: 250, color: 'bg-sky-500' },
                { label: 'Fat',     val: stats.today.fat,      max: 70,  color: 'bg-emerald-500' },
              ].map(({ label, val, max, color }) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>{label}</span><span>{Math.round(val)}g / {max}g</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${color} transition-all duration-700`}
                      style={{ width: `${Math.min((val / max) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Challenges nudge ───────────────────────────────── */}
          <Link href="/challenges"
            className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 p-4 shadow-sm hover:border-violet-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-sm">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Active Challenges</p>
                <p className="text-xs text-gray-500">Track your progress and earn XP</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </Link>
        </>
      ) : null}
    </div>
  );
}

function StatCard({ icon, label, value, unit, bg, border, ring }: {
  icon: React.ReactNode; label: string; value: string; unit: string;
  bg: string; border: string; ring: string;
}) {
  return (
    <div className={`rounded-2xl border p-3 shadow-sm ring-1 bg-gradient-to-b ${bg} ${border} ${ring} sm:p-5`}>
      <div className="mb-2">{icon}</div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl">
        {value}<span className="ml-1 text-xs font-normal text-gray-400">{unit}</span>
      </p>
    </div>
  );
}
