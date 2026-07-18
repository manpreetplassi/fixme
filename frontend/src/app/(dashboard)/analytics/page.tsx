'use client';

import { PageHeader } from '@/components/layout/page-header';
import { useBlockerAnalytics, useHabitAnalytics, useWeeklyAnalytics } from '@/hooks/use-analytics';

export default function AnalyticsPage() {
  const weekly = useWeeklyAnalytics();
  const habits = useHabitAnalytics();
  const blockers = useBlockerAnalytics();

  return (
    <div>
      <PageHeader title="Weekly Analytics" subtitle="See patterns in blockers, habit quality, and total score without hunting through logs." />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-slate-950/60">
          <h2 className="text-xl font-bold">Summary</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Total score: {weekly.data?.totalScore ?? '--'}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Money saved: {weekly.data?.moneySaved ?? '--'}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Active streaks: {weekly.data?.streaksActive ?? '--'}</p>
        </section>
        <section className="rounded-[2rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-slate-950/60">
          <h2 className="text-xl font-bold">Blockers</h2>
          <pre className="mt-3 overflow-auto text-xs text-slate-500 dark:text-slate-400">{JSON.stringify(blockers.data?.thisWeek ?? {}, null, 2)}</pre>
        </section>
      </div>
      <section className="mt-6 rounded-[2rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-slate-950/60">
        <h2 className="text-xl font-bold">Best Habits</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(habits.data?.bestHabits ?? []).map((habit: { id: string; habit_name: string; current_count: number }) => (
            <div key={habit.id} className="rounded-2xl border p-4">
              <p className="font-semibold">{habit.habit_name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Current streak: {habit.current_count}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
