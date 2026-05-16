'use client';

import { useEffect, useState } from 'react';
import { Trophy, Target, Flame, Dumbbell, UtensilsCrossed, CheckCircle2 } from 'lucide-react';

interface Challenge {
  id: number; title: string; description: string; icon: React.ReactNode;
  target: number; unit: string; xp: number; category: 'activity' | 'nutrition' | 'consistency';
  completed: boolean; progress: number;
}

const CAT_STYLES = {
  activity:    { badge: 'bg-sky-100 text-sky-700',    icon: <Dumbbell className="h-4 w-4" /> },
  nutrition:   { badge: 'bg-green-100 text-green-700', icon: <UtensilsCrossed className="h-4 w-4" /> },
  consistency: { badge: 'bg-amber-100 text-amber-700', icon: <Flame className="h-4 w-4" /> },
};

const BASE: Omit<Challenge, 'completed' | 'progress' | 'icon'>[] = [
  { id: 1, title: '7-Day Streak',      description: 'Log at least one activity every day for 7 days.',        target: 7,   unit: 'days',     xp: 200, category: 'consistency' },
  { id: 2, title: 'Burn 500 kcal',     description: 'Burn 500 calories in a single workout session.',          target: 500, unit: 'kcal',     xp: 150, category: 'activity' },
  { id: 3, title: '60-Min Workout',    description: 'Complete a single workout lasting 60 minutes or more.',   target: 60,  unit: 'min',      xp: 100, category: 'activity' },
  { id: 4, title: 'Protein Power',     description: 'Hit 120 g of protein in a single day.',                   target: 120, unit: 'g',        xp: 120, category: 'nutrition' },
  { id: 5, title: 'Calorie Conscious', description: 'Log all meals and stay within your 2,000 kcal goal.',    target: 1,   unit: 'day',      xp: 80,  category: 'nutrition' },
  { id: 6, title: '10 Sessions',       description: 'Log 10 workout sessions in total.',                       target: 10,  unit: 'sessions', xp: 300, category: 'consistency' },
  { id: 7, title: 'Log 5 Meals',       description: 'Log 5 different meals in a single day.',                  target: 5,   unit: 'meals',    xp: 90,  category: 'nutrition' },
  { id: 8, title: 'Variety Champion',  description: 'Log 5 different activity types.',                         target: 5,   unit: 'types',    xp: 180, category: 'activity' },
];

const ICONS: Record<number, React.ReactNode> = {
  1: '🔥', 2: '⚡', 3: '⏱', 4: '💪', 5: '🥗', 6: '🏅', 7: '🍽', 8: '🌈',
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filter, setFilter] = useState<'all' | 'activity' | 'nutrition' | 'consistency'>('all');
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    async function build() {
      const [actRes, foodRes] = await Promise.all([
        fetch('/api/activity').then(r => r.json()),
        fetch('/api/food').then(r => r.json()),
      ]);
      const acts: { type: string; duration: number; calories: number; logged_at: string }[] = actRes.activities ?? [];
      const foods: { calories: number; protein: number; logged_at: string }[] = foodRes.food ?? [];

      const actDays = new Set(acts.map(a => a.logged_at?.split('T')[0]));
      let streak = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        if (actDays.has(d.toISOString().split('T')[0])) streak++;
        else break;
      }

      const proteinByDay: Record<string, number> = {};
      foods.forEach(f => { const d = f.logged_at?.split('T')[0] ?? ''; proteinByDay[d] = (proteinByDay[d] ?? 0) + f.protein; });
      const maxDayProtein = Math.max(0, ...Object.values(proteinByDay));
      const todayMeals = foods.filter(f => f.logged_at?.startsWith(new Date().toISOString().split('T')[0])).length;

      const prog: Record<number, number> = {
        1: streak,
        2: Math.max(0, ...acts.map(a => a.calories ?? 0)),
        3: Math.max(0, ...acts.map(a => a.duration ?? 0)),
        4: maxDayProtein,
        5: todayMeals > 0 ? 1 : 0,
        6: acts.length,
        7: todayMeals,
        8: new Set(acts.map(a => a.type)).size,
      };

      const built: Challenge[] = BASE.map(c => ({
        ...c,
        icon: ICONS[c.id],
        progress: Math.min(prog[c.id] ?? 0, c.target),
        completed: (prog[c.id] ?? 0) >= c.target,
      }));
      setChallenges(built);
      setTotalXp(built.filter(c => c.completed).reduce((s, c) => s + c.xp, 0));
    }
    build();
  }, []);

  const visible = challenges.filter(c => filter === 'all' || c.category === filter);
  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Challenges</h1>
          <p className="text-sm text-gray-500">Complete challenges to earn XP and track growth</p>
        </div>
        {totalXp > 0 && (
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-100 px-3 py-1.5 shadow-sm">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-700">{totalXp} XP</span>
          </div>
        )}
      </div>

      {/* Progress banner */}
      {challenges.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 p-4 shadow-xl ring-1 ring-white/10 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Your progress</p>
              <p className="text-2xl font-bold text-white">{completedCount} / {challenges.length} completed</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
              🏆
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${(completedCount / challenges.length) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'activity', 'nutrition', 'consistency'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-violet-200 hover:text-violet-700'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Challenge cards */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {visible.map(c => {
          const pct = Math.round((c.progress / c.target) * 100);
          const cat = CAT_STYLES[c.category];
          return (
            <div key={c.id}
              className={`relative rounded-2xl border p-4 shadow-sm transition-all sm:p-5 ${
                c.completed
                  ? 'border-emerald-200 bg-gradient-to-b from-white to-emerald-50/80 ring-1 ring-emerald-100/60'
                  : 'border-gray-100 bg-white hover:border-violet-100 hover:shadow-md'
              }`}>
              {c.completed && (
                <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-emerald-500" />
              )}
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl shadow-sm ${
                  c.completed ? 'bg-emerald-100' : 'bg-gray-50 border border-gray-100'
                }`}>
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-gray-900">{c.title}</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cat.badge}`}>
                      {cat.icon}{c.category}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      +{c.xp} XP
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-gray-500">{c.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>{c.progress} / {c.target} {c.unit}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full transition-all duration-700 ${
                      c.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-500 to-indigo-500'
                    }`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Target className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">No challenges in this category yet.</p>
        </div>
      )}
    </div>
  );
}
