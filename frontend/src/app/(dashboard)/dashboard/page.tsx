'use client';

import clsx from 'clsx';
import { PageHeader } from '@/components/layout/page-header';
import { useTodayScore } from '@/hooks/use-daily-logs';
import { useWeeklyAnalytics } from '@/hooks/use-analytics';
import { useScreenSummary } from '@/hooks/use-today';
import { useLifestyleAnalytics } from '@/hooks/use-lifestyle';

export default function DashboardPage() {
  const score = useTodayScore();
  const weekly = useWeeklyAnalytics();
  const screen = useScreenSummary();
  const lifestyle = useLifestyleAnalytics('week');
  const isLoading = score.isLoading || weekly.isLoading || screen.isLoading || lifestyle.isLoading;
  const isError = score.isError || weekly.isError || screen.isError || lifestyle.isError;

  const cards = [
    { label: 'Today Score', value: score.data?.dailyScore ?? '--', accent: 'from-emerald-500 to-cyan-500', progress: Number(score.data?.dailyScore ?? 0) },
    { label: 'Completed Tasks', value: score.data?.tasksCompleted ?? '--', accent: 'from-sky-500 to-indigo-500', progress: Math.min(Number(score.data?.tasksCompleted ?? 0) * 20, 100) },
    { label: 'Weekly Average', value: weekly.data?.avgScore ? Math.round(weekly.data.avgScore) : '--', accent: 'from-amber-500 to-rose-500', progress: Number(weekly.data?.avgScore ?? 0) },
  ];

  return (
    <div>
      <PageHeader title="Momentum Dashboard" subtitle="Quick view of score, consistency, and where the week is leaning." />
      {isLoading ? <p className="mb-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">Loading dashboard metrics...</p> : null}
      {isError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Could not load dashboard metrics.</p> : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>
      {!isLoading && !isError && score.data?.tasksCompleted === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">
          No tasks completed today yet. Start from Tracker to build today&apos;s score.
        </p>
      ) : null}
      {screen.data ? (
        <section className="app-card mt-4 p-4 sm:mt-6 sm:p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-black">Screen check-ins</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Last 7 days.</p>
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {screen.data.streak} clean day{screen.data.streak !== 1 ? 's' : ''} streak
            </p>
          </div>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {screen.data.week.map((day) => (
              <div key={day.date} className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-center dark:border-slate-800 dark:bg-slate-900/70 sm:p-3">
                <p className="mb-2 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">{day.date.slice(5)}</p>
                <div className="flex justify-center">
                  <StatusDot watched={day.check_in?.watched} done={Boolean(day.check_in)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {lifestyle.data ? (
        <section className="app-card mt-4 p-4 sm:mt-6 sm:p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-black">Lifestyle pulse</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Meals, sleep, movement, mood, and productivity this week.</p>
            </div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">{lifestyle.data.consistency}% consistency</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <LifestyleMetric label="Avg sleep" value={`${Number(lifestyle.data.averageSleep ?? 0).toFixed(1)}h`} />
            <LifestyleMetric label="Home cooked" value={`${lifestyle.data.homeCookedPercent ?? 0}%`} />
            <LifestyleMetric label="Outside meals" value={lifestyle.data.outsideMeals ?? 0} />
            <LifestyleMetric label="Coding hours" value={`${lifestyle.data.codingHours ?? 0}h`} />
            <LifestyleMetric label="Fruit days" value={lifestyle.data.fruitDays ?? 0} />
            <LifestyleMetric label="Gym days" value={lifestyle.data.gymDays ?? 0} />
            <LifestyleMetric label="Sabzi" value={lifestyle.data.mostCommonSabzi ?? '--'} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(lifestyle.data.insights ?? []).slice(0, 4).map((insight: string) => (
              <p key={insight} className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100">{insight}</p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function LifestyleMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, accent, progress }: { label: string; value: string | number; accent: string; progress: number }) {
  const width = Math.max(0, Math.min(progress, 100));

  return (
    <div className="game-card overflow-hidden">
      <div className={`mb-4 h-1.5 rounded-full bg-gradient-to-r ${accent}`} style={{ width: `${width || 8}%` }} />
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black sm:text-4xl">{value}</p>
      <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{width ? `${Math.round(width)}% progress` : 'Ready to start'}</p>
    </div>
  );
}

function StatusDot({ watched, done }: { watched?: boolean; done: boolean }) {
  return (
    <span
      title={done ? (watched ? 'watched' : 'clean') : 'not checked'}
      className={clsx(
        'inline-flex h-5 w-5 rounded-full ring-2 ring-white dark:ring-slate-950',
        !done && 'bg-slate-300 dark:bg-slate-700',
        done && watched === false && 'bg-emerald-500',
        done && watched === true && 'bg-red-500',
      )}
    />
  );
}
