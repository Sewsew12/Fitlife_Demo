'use client';

import { useEffect, useState } from 'react';

interface Challenge {
  id: number;
  title: string;
  description: string;
  icon: string;
  target: number;
  unit: string;
  xp: number;
  category: 'activity' | 'nutrition' | 'consistency';
  completed: boolean;
  progress: number;
}

const BASE_CHALLENGES: Omit<Challenge, 'completed' | 'progress'>[] = [
  { id: 1, title: '7-Day Streak',       description: 'Log at least one activity every day for 7 days.',           icon: '🔥', target: 7,   unit: 'days',    xp: 200, category: 'consistency' },
  { id: 2, title: 'Burn 500 kcal',      description: 'Burn 500 calories in a single workout session.',             icon: '⚡', target: 500, unit: 'kcal',    xp: 150, category: 'activity' },
  { id: 3, title: '60-Minute Workout',  description: 'Complete a single workout lasting 60 minutes or more.',      icon: '⏱', target: 60,  unit: 'min',     xp: 100, category: 'activity' },
  { id: 4, title: 'Protein Power',      description: 'Hit 120 g of protein in a single day.',                     icon: '💪', target: 120, unit: 'g',       xp: 120, category: 'nutrition' },
  { id: 5, title: 'Calorie Conscious',  description: 'Stay within 100 kcal of your 2,000 kcal daily goal.',       icon: '🥗', target: 1,   unit: 'day',     xp: 80,  category: 'nutrition' },
  { id: 6, title: '10 Sessions',        description: 'Log 10 workout sessions in total.',                         icon: '🏅', target: 10,  unit: 'sessions', xp: 300, category: 'consistency' },
  { id: 7, title: 'Log 5 Meals',        description: 'Log 5 different meals in a single day.',                    icon: '🍽', target: 5,   unit: 'meals',   xp: 90,  category: 'nutrition' },
  { id: 8, title: 'Variety Champion',   description: 'Log 5 different activity types.',                           icon: '🌈', target: 5,   unit: 'types',   xp: 180, category: 'activity' },
];

const CAT_COLORS: Record<string, string> = {
  activity:    'bg-indigo-100 text-indigo-700',
  nutrition:   'bg-green-100 text-green-700',
  consistency: 'bg-amber-100 text-amber-700',
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filter, setFilter] = useState<'all' | 'activity' | 'nutrition' | 'consistency'>('all');

  useEffect(() => {
    async function buildChallenges() {
      const [actRes, foodRes] = await Promise.all([
        fetch('/api/activity').then((r) => r.json()),
        fetch('/api/food').then((r) => r.json()),
      ]);

      const acts: { type: string; duration: number; calories: number; logged_at: string }[] = actRes.activities ?? [];
      const foods: { calories: number; protein: number; logged_at: string }[] = actRes.food ?? foodRes.food ?? [];

      const totalSessions  = acts.length;
      const actTypes       = new Set(acts.map((a) => a.type)).size;
      const maxSingleCal   = acts.reduce((m, a) => Math.max(m, a.calories ?? 0), 0);
      const maxSingleDur   = acts.reduce((m, a) => Math.max(m, a.duration ?? 0), 0);

      // per-day protein
      const proteinByDay: Record<string, number> = {};
      foods.forEach((f) => {
        const day = f.logged_at?.split('T')[0] ?? '';
        proteinByDay[day] = (proteinByDay[day] ?? 0) + (f.protein ?? 0);
      });
      const maxDayProtein = Math.max(0, ...Object.values(proteinByDay));

      // meals logged today
      const todayStr = new Date().toISOString().split('T')[0];
      const todayMeals = foods.filter((f) => f.logged_at?.startsWith(todayStr)).length;

      // streak
      const actDays = new Set(acts.map((a) => a.logged_at?.split('T')[0]));
      let streak = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (actDays.has(d.toISOString().split('T')[0])) streak++;
        else break;
      }

      const progress: Record<number, number> = {
        1: streak,
        2: maxSingleCal,
        3: maxSingleDur,
        4: maxDayProtein,
        5: 1, // demo: always show some progress
        6: totalSessions,
        7: todayMeals,
        8: actTypes,
      };

      setChallenges(
        BASE_CHALLENGES.map((c) => ({
          ...c,
          progress: Math.min(progress[c.id] ?? 0, c.target),
          completed: (progress[c.id] ?? 0) >= c.target,
        }))
      );
    }

    buildChallenges();
  }, []);

  const visible = challenges.filter((c) => filter === 'all' || c.category === filter);

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Challenges</h1>
      <p className="text-sm text-gray-400 mb-6">Complete challenges to earn XP and track your growth.</p>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'activity', 'nutrition', 'consistency'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-brand-600 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-brand-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {visible.map((c) => {
          const pct = Math.round((c.progress / c.target) * 100);
          return (
            <div
              key={c.id}
              className={`card relative overflow-hidden transition-all ${
                c.completed ? 'border-emerald-300 bg-emerald-50' : ''
              }`}
            >
              {c.completed && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
              )}
              <div className="flex items-start gap-3">
                <span className="text-2xl">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-sm">{c.title}</h3>
                    <span className={`badge ${CAT_COLORS[c.category]}`}>{c.category}</span>
                    <span className="badge bg-yellow-100 text-yellow-700">+{c.xp} XP</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{c.description}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{c.progress} / {c.target} {c.unit}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${c.completed ? 'bg-emerald-500' : 'bg-brand-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
