'use client';

import { PageHeader } from '@/components/layout/page-header';
import { useTodayScore } from '@/hooks/use-daily-logs';
import { useWeeklyAnalytics } from '@/hooks/use-analytics';

export default function DashboardPage() {
  const score = useTodayScore();
  const weekly = useWeeklyAnalytics();

  const cards = [
    { label: 'Today Score', value: score.data?.dailyScore ?? '--' },
    { label: 'Completed Tasks', value: score.data?.tasksCompleted ?? '--' },
    { label: 'Weekly Average', value: weekly.data?.avgScore ? Math.round(weekly.data.avgScore) : '--' },
  ];

  return (
    <div>
      <PageHeader title="Momentum Dashboard" subtitle="Quick view of score, consistency, and where the week is leaning." />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[2rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-slate-950/60">
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="mt-3 text-4xl font-black">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
