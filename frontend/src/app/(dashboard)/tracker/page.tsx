'use client';

import clsx from 'clsx';
import { CalendarDays, CheckCircle2, CircleDashed, Clock, Coins, SkipForward, XCircle } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { getToday, TodayRoutineItem } from '@/lib/api/today';
import { useToday } from '@/hooks/use-today';

const statusStyles: Record<string, string> = {
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900',
  not_started: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800',
  failed: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-900',
  skipped: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900',
};

const statusIcons: Record<string, typeof CheckCircle2> = {
  done: CheckCircle2,
  completed: CheckCircle2,
  failed: XCircle,
  skipped: SkipForward,
  not_started: CircleDashed,
};

export default function TrackerHistoryPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const history = useToday(selectedDate);
  const heatmapDates = useMemo(() => lastDays(new Date().toISOString().slice(0, 10), 35), []);
  const heatmap = useQueries({
    queries: heatmapDates.map((date) => ({
      queryKey: ['today', date],
      queryFn: () => getToday(date),
      staleTime: 60_000,
    })),
  });

  const totals = useMemo(() => {
    const items = history.data?.items ?? [];
    return {
      total: items.length,
      done: items.filter((item) => item.is_done).length,
      failed: items.filter((item) => item.status === 'failed').length,
      skipped: items.filter((item) => item.status === 'skipped').length,
      points: items.reduce((sum, item) => sum + Number(item.points_earned ?? 0), 0),
    };
  }, [history.data]);

  const heatmapCells = heatmapDates.map((date, index) => {
    const items = heatmap[index].data?.items.filter((item) => item.type === 'routine') ?? [];
    const completed = items.filter((item) => item.is_done).length;
    const score = items.length ? completed / items.length : 0;
    return { date, completed, total: items.length, score };
  });

  const currentStreak = [...heatmapCells].reverse().reduce((count, day) => {
    if (count === -1) return -1;
    if (day.total === 0) return count;
    return day.score >= 0.8 ? count + 1 : -1;
  }, 0);
  const milestone = [7, 30, 90].includes(currentStreak) ? currentStreak : null;

  return (
    <div>
      <PageHeader title="History" subtitle="Browse past routine completions from the unified Today timeline." />

      <section className="app-card mb-4 p-4 sm:mb-6 sm:p-5">
        <div className="mb-5">
          <div className="grid grid-cols-7 gap-1">
            {heatmapCells.map((day) => (
              <button
                key={day.date}
                type="button"
                title={`${day.date}: ${day.completed}/${day.total} completed`}
                onClick={() => setSelectedDate(day.date)}
                className={clsx('h-9 rounded-md ring-1 ring-black/5 dark:ring-white/10', intensityClass(day.score), selectedDate === day.date ? 'outline outline-2 outline-slate-950 dark:outline-white' : '')}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Less complete</span>
            {milestone ? <span className="rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">Day {milestone} milestone</span> : null}
            <span>More complete</span>
          </div>
        </div>

        <label className="grid max-w-xs gap-2 text-sm font-semibold">
          <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <CalendarDays className="h-4 w-4" />
            Date
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="tap-target rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950"
          />
        </label>
      </section>

      {history.isLoading ? <p className="mb-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">Loading history...</p> : null}
      {history.isError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Could not load history.</p> : null}

      {history.data ? (
        <>
          <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            <Metric label="Items" value={totals.total} />
            <Metric label="Done" value={totals.done} />
            <Metric label="Failed" value={totals.failed} />
            <Metric label="Skipped" value={totals.skipped} />
            <Metric label="Points" value={totals.points} />
          </section>

          {history.data.items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">No routine items were scheduled for this date.</p>
          ) : (
            <div className="grid gap-3">
              {history.data.items.map((item) => (
                <HistoryRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="game-card p-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function HistoryRow({ item }: { item: TodayRoutineItem }) {
  const Icon = statusIcons[item.status] ?? CircleDashed;

  return (
    <article className="app-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ring-1', statusStyles[item.status] ?? statusStyles.not_started)}>
              <Icon className="h-3.5 w-3.5" />
              {item.status.replace('_', ' ')}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">{[item.parent_tag ?? item.category, item.sub_tag].filter(Boolean).join(' / ')}</span>
          </div>
          <h2 className="mt-2 truncate text-lg font-bold">{item.title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.repeat_rule}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          {item.time_block ? (
            <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <Clock className="h-4 w-4" />
              {item.time_block}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
            <CheckCircle2 className="h-4 w-4" />
            {item.score ?? 0}/10
          </span>
          {item.duration_minutes ? (
            <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <Clock className="h-4 w-4" />
              {item.duration_minutes} min
            </span>
          ) : null}
          {item.linked_money_entry_id ? (
            <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <Coins className="h-4 w-4" />
              Linked
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function lastDays(endDate: string, count: number) {
  const end = new Date(`${endDate}T00:00:00`);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (count - 1 - index));
    return date.toISOString().slice(0, 10);
  });
}

function intensityClass(score: number) {
  if (score >= 0.85) return 'bg-emerald-600';
  if (score >= 0.6) return 'bg-emerald-400';
  if (score >= 0.3) return 'bg-emerald-200 dark:bg-emerald-900';
  if (score > 0) return 'bg-slate-300 dark:bg-slate-700';
  return 'bg-slate-100 dark:bg-slate-900';
}
