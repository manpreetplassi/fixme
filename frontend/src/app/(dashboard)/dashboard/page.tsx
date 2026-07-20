'use client';

import clsx from 'clsx';
import { PageHeader } from '@/components/layout/page-header';
import { useTodayScore } from '@/hooks/use-daily-logs';
import { useWeeklyAnalytics } from '@/hooks/use-analytics';
import { useScreenSummary } from '@/hooks/use-today';

export default function DashboardPage() {
  const score = useTodayScore();
  const weekly = useWeeklyAnalytics();
  const screen = useScreenSummary();
  const isLoading = score.isLoading || weekly.isLoading || screen.isLoading;
  const isError = score.isError || weekly.isError || screen.isError;

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
      {screen.data ? (
        <section className="mt-6 rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-black">Screen check-ins</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Last 7 days, morning and night.</p>
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {screen.data.streaks.morning} clean mornings / {screen.data.streaks.night} clean nights
            </p>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {screen.data.week.map((day) => (
              <div key={day.date} className="rounded-lg border border-slate-200 p-3 text-center dark:border-slate-800">
                <p className="mb-2 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">{day.date.slice(5)}</p>
                <div className="flex justify-center gap-2">
                  <StatusDot label="Morning" watched={day.morning?.watched} done={Boolean(day.morning)} />
                  <StatusDot label="Night" watched={day.night?.watched} done={Boolean(day.night)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function StatusDot({ label, watched, done }: { label: string; watched?: boolean; done: boolean }) {
  return (
    <span
      title={`${label}: ${done ? (watched ? 'watched' : 'clean') : 'not checked'}`}
      className={clsx(
        'inline-flex h-5 w-5 rounded-full ring-2 ring-white dark:ring-slate-950',
        !done && 'bg-slate-300 dark:bg-slate-700',
        done && watched === false && 'bg-emerald-500',
        done && watched === true && 'bg-red-500',
      )}
    />
  );
}
