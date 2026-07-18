'use client';

import { PageHeader } from '@/components/layout/page-header';
import { useTodayScore } from '@/hooks/use-daily-logs';
import { useWeeklyAnalytics } from '@/hooks/use-analytics';

export default function DashboardPage() {
  const score = useTodayScore();
  const weekly = useWeeklyAnalytics();
  const isLoading = score.isLoading || weekly.isLoading;
  const isError = score.isError || weekly.isError;

  const cards = [
    { label: 'Today Score', value: score.data?.dailyScore ?? '--' },
    { label: 'Completed Tasks', value: score.data?.tasksCompleted ?? '--' },
    { label: 'Weekly Average', value: weekly.data?.avgScore ? Math.round(weekly.data.avgScore) : '--' },
  ];

  return (
    <div>
      <PageHeader title="Momentum Dashboard" subtitle="Quick view of score, consistency, and where the week is leaning." />
      {isLoading ? <p className="mb-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">Loading dashboard metrics...</p> : null}
      {isError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Could not load dashboard metrics.</p> : null}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="mt-3 text-4xl font-black">{card.value}</p>
          </div>
        ))}
      </div>
      {!isLoading && !isError && score.data?.tasksCompleted === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">
          No tasks completed today yet. Start from Tracker to build today&apos;s score.
        </p>
      ) : null}
    </div>
  );
}
