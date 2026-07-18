'use client';

import { PageHeader } from '@/components/layout/page-header';
import { useBlockerAnalytics, useHabitAnalytics, useWeeklyAnalytics } from '@/hooks/use-analytics';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AnalyticsPage() {
  const weekly = useWeeklyAnalytics();
  const habits = useHabitAnalytics();
  const blockers = useBlockerAnalytics();
  const isLoading = weekly.isLoading || habits.isLoading || blockers.isLoading;
  const isError = weekly.isError || habits.isError || blockers.isError;
  const bestHabits = habits.data?.bestHabits ?? [];
  const blockerTrend = blockers.data?.trend ?? [];
  const scoreTrend = weekly.data?.dailyScores ?? [];

  return (
    <div>
      <PageHeader title="Weekly Analytics" subtitle="See patterns in blockers, habit quality, and total score without hunting through logs." />
      {isLoading ? <p className="mb-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">Loading analytics...</p> : null}
      {isError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Could not load analytics.</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
          <h2 className="text-xl font-bold">Summary</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Total score: {weekly.data?.totalScore ?? '--'}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Money saved: {weekly.data?.moneySaved ?? '--'}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Active streaks: {weekly.data?.streaksActive ?? '--'}</p>
        </section>
        <section className="rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
          <h2 className="text-xl font-bold">Blockers</h2>
          {blockerTrend.length ? (
            <div className="mt-4 grid gap-2">
              {blockerTrend.map((item: { blocker: string; count: number }) => (
                <div key={item.blocker} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
                  <span>{item.blocker}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No blocker data yet.</p>
          )}
        </section>
      </div>
      <section className="mt-6 rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
        <h2 className="text-xl font-bold">Score Trend</h2>
        {scoreTrend.length ? (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No score trend yet.</p>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
        <h2 className="text-xl font-bold">Blocker Frequency</h2>
        {blockerTrend.length ? (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockerTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="blocker" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No blocker chart yet.</p>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
        <h2 className="text-xl font-bold">Best Habits</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {bestHabits.map((habit: { id: string; habit_name: string; current_count: number }) => (
            <div key={habit.id} className="rounded-2xl border p-4">
              <p className="font-semibold">{habit.habit_name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Current streak: {habit.current_count}</p>
            </div>
          ))}
        </div>
        {bestHabits.length ? (
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestHabits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="habit_name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="current_count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}
        {!bestHabits.length ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No habit streaks yet.</p> : null}
      </section>
    </div>
  );
}
