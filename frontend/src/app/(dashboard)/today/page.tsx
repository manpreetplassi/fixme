'use client';

import clsx from 'clsx';
import { Bell, BellOff, Check, Clock, Moon, Plus, Send, Sun, Trash2, Video, X } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { TodayRoutineItem } from '@/lib/api/today';
import { useCreateRoutineItem, useDeleteRoutineItem, useSaveScreenCheckIn, useSendReminderDigest, useSetRoutineDone, useToday } from '@/hooks/use-today';
import { useLifestyleToday } from '@/hooks/use-lifestyle';

const priorityClass: Record<string, string> = {
  urgent: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-900',
  important: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900',
  low: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800',
};

const categoryClass: Record<string, string> = {
  screen: 'text-cyan-600 dark:text-cyan-300',
  health: 'text-emerald-600 dark:text-emerald-300',
  learning: 'text-sky-600 dark:text-sky-300',
  money: 'text-lime-600 dark:text-lime-300',
  habit: 'text-violet-600 dark:text-violet-300',
};

const cleanPayload = { watched: false };

type RoutineForm = {
  title: string;
  category: string;
  time_block: string;
  priority: 'urgent' | 'important' | 'low';
  repeat_rule: 'daily' | 'weekdays' | 'weekly' | 'once';
  reminder_enabled: boolean;
};

const initialForm: RoutineForm = {
  title: '',
  category: 'health',
  time_block: '',
  priority: 'important',
  repeat_rule: 'daily',
  reminder_enabled: false,
};

export default function TodayPage() {
  const today = useToday();
  const setDone = useSetRoutineDone();
  const saveCheckIn = useSaveScreenCheckIn();
  const createItem = useCreateRoutineItem();
  const deleteItem = useDeleteRoutineItem();
  const reminderDigest = useSendReminderDigest();
  const lifestyle = useLifestyleToday();
  const [form, setForm] = useState<RoutineForm>(initialForm);
  const [detailPeriod, setDetailPeriod] = useState<'morning' | 'night' | null>(null);
  const [contentType, setContentType] = useState('reel_short');
  const [titleNote, setTitleNote] = useState('');
  const [stoppedAt, setStoppedAt] = useState('');

  const localActivePeriod = getLocalActivePeriod();
  const activeCheck = useMemo(
    () => today.data?.items.find((item) => item.type === 'screen_checkin' && item.period === localActivePeriod),
    [localActivePeriod, today.data],
  );

  const completeCount = today.data?.items.filter((item) => item.is_done).length ?? 0;
  const totalCount = today.data?.items.length ?? 0;

  async function submitRoutine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createItem.mutateAsync({
      ...form,
      time_block: form.time_block || null,
    });
    setForm(initialForm);
  }

  async function submitWatched(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detailPeriod) return;
    await saveCheckIn.mutateAsync({
      watched: true,
      period: detailPeriod,
      content_type: contentType,
      title_note: titleNote || undefined,
      stopped_watching_at: detailPeriod === 'night' ? stoppedAt || undefined : undefined,
    });
    setDetailPeriod(null);
    setTitleNote('');
    setStoppedAt('');
  }

  async function markClean(period?: 'morning' | 'night') {
    await saveCheckIn.mutateAsync({ ...cleanPayload, period });
  }

  return (
    <div>
      <PageHeader title="Today" subtitle="One routine for habits, health, learning, money, and screen discipline." />

      {today.isLoading ? <p className="mb-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">Loading today&apos;s routine...</p> : null}
      {today.isError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Could not load today&apos;s routine.</p> : null}

      {today.data ? (
        <>
          <section className="mb-4 grid grid-cols-3 gap-2 sm:mb-6 sm:gap-4">
            <div className="game-card p-3 sm:p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Routine progress</p>
              <p className="mt-2 text-2xl font-black sm:mt-3 sm:text-3xl">{completeCount}/{totalCount}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${totalCount ? (completeCount / totalCount) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="game-card p-3 sm:p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Clean mornings</p>
              <p className="mt-2 text-2xl font-black sm:mt-3 sm:text-3xl">{today.data.screen.streaks.morning}</p>
            </div>
            <div className="game-card p-3 sm:p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Clean nights</p>
              <p className="mt-2 text-2xl font-black sm:mt-3 sm:text-3xl">{today.data.screen.streaks.night}</p>
            </div>
          </section>

          {lifestyle.data ? (
            <section className="app-card mb-4 p-4 sm:mb-6 sm:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Lifestyle today</p>
                  <h2 className="mt-2 text-2xl font-black">{lifestyle.data.score.percentage}% logged</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Meals {lifestyle.data.meals.length} / Activities {lifestyle.data.activities.length} / Score {lifestyle.data.score.percentage}%
                  </p>
                </div>
                <Link href="/lifestyle" className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                  Open journal
                </Link>
              </div>
            </section>
          ) : null}

          {activeCheck && !activeCheck.is_done ? (
            <section className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">Current check-in</p>
                  <h2 className="mt-2 text-2xl font-black">{activeCheck.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => markClean(activeCheck.period)} disabled={saveCheckIn.isPending} className="tap-target inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:bg-slate-300 sm:flex-none">
                    <Check className="h-4 w-4" />
                    Nothing watched
                  </button>
                  <button onClick={() => setDetailPeriod(activeCheck.period ?? null)} disabled={saveCheckIn.isPending} className="tap-target inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-300 px-4 py-3 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-800 dark:hover:bg-emerald-950 sm:flex-none">
                    <Video className="h-4 w-4" />
                    Watched
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {detailPeriod ? (
            <form onSubmit={submitWatched} className="app-card mb-4 grid gap-3 p-4 sm:mb-6 sm:gap-4 sm:p-5 md:grid-cols-4">
              <select value={contentType} onChange={(event) => setContentType(event.target.value)} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800">
                <option value="reel_short">Reel / short</option>
                <option value="youtube">YouTube</option>
                <option value="movie">Movie</option>
                <option value="show">Show</option>
                <option value="other">Other</option>
              </select>
              <input value={titleNote} onChange={(event) => setTitleNote(event.target.value)} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800 md:col-span-2" placeholder="Optional title or note" />
              {detailPeriod === 'night' ? <input type="time" value={stoppedAt} onChange={(event) => setStoppedAt(event.target.value)} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" /> : null}
              <div className="flex gap-2 md:col-span-4">
                <button className="tap-target inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:bg-slate-300 sm:flex-none" disabled={saveCheckIn.isPending}>
                  <Check className="h-4 w-4" />
                  Save check-in
                </button>
                <button type="button" onClick={() => setDetailPeriod(null)} className="tap-target inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 sm:flex-none">
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          <section className="app-card mb-4 p-4 sm:mb-6 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-black">Time-blocked routine</h2>
              <button onClick={() => reminderDigest.mutate(today.data.date)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900">
                <Send className="h-4 w-4" />
                Send digest
              </button>
            </div>
            <div className="space-y-3">
              {today.data.items.map((item) => (
                <RoutineRow
                  key={item.id}
                  item={item}
                  onDone={() => (item.type === 'routine' ? setDone.mutate({ id: item.id, payload: { is_done: !item.is_done, date: today.data.date } }) : markClean(item.period))}
                  onWatched={() => setDetailPeriod(item.period ?? null)}
                  onDelete={() => deleteItem.mutate(item.id)}
                  busy={setDone.isPending || saveCheckIn.isPending || deleteItem.isPending}
                />
              ))}
            </div>
          </section>

          <form onSubmit={submitRoutine} className="app-card grid gap-3 p-4 sm:p-5 md:grid-cols-6">
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800 md:col-span-2" placeholder="Routine item" required />
            <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Category" required />
            <input type="time" value={form.time_block} onChange={(event) => setForm((current) => ({ ...current, time_block: event.target.value }))} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
            <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as RoutineForm['priority'] }))} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800">
              <option value="urgent">Urgent</option>
              <option value="important">Important</option>
              <option value="low">Low</option>
            </select>
            <select value={form.repeat_rule} onChange={(event) => setForm((current) => ({ ...current, repeat_rule: event.target.value as RoutineForm['repeat_rule'] }))} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800">
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekly">Weekly</option>
              <option value="once">Once</option>
            </select>
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
              <input type="checkbox" checked={form.reminder_enabled} onChange={(event) => setForm((current) => ({ ...current, reminder_enabled: event.target.checked }))} />
              Reminder
            </label>
            <button disabled={createItem.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:bg-slate-300 md:col-span-5">
              <Plus className="h-4 w-4" />
              Add routine item
            </button>
          </form>
        </>
      ) : null}
    </div>
  );
}

function RoutineRow({ item, onDone, onWatched, onDelete, busy }: { item: TodayRoutineItem; onDone: () => void; onWatched: () => void; onDelete: () => void; busy: boolean }) {
  const isScreen = item.type === 'screen_checkin';
  return (
    <article className={clsx('flex flex-col gap-4 rounded-2xl border p-3 sm:p-4 md:flex-row md:items-center md:justify-between', item.is_done ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20' : 'border-black/10 bg-white/70 dark:border-white/10 dark:bg-slate-950/50')}>
      <div className="flex items-start gap-3">
        <button onClick={onDone} disabled={busy} className={clsx('tap-target mt-1 inline-flex shrink-0 items-center justify-center rounded-2xl border', item.is_done ? 'bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700')}>
          {item.is_done ? <Check className="h-4 w-4" /> : null}
        </button>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{item.title}</h3>
            <span className={clsx('rounded-full px-2 py-1 text-xs font-bold ring-1', priorityClass[item.priority])}>{item.priority}</span>
            {item.overdue ? <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">overdue</span> : null}
          </div>
          <p className={clsx('mt-1 text-sm', categoryClass[item.category] ?? 'text-slate-500 dark:text-slate-400')}>{item.category} / {item.repeat_rule}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {item.time_block ? (
          <span className="tap-target inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
            <Clock className="h-4 w-4" />
            {item.time_block}
          </span>
        ) : null}
        <span title={item.reminder_enabled ? 'Reminder enabled' : 'Reminder off'} className="tap-target inline-flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800">
          {item.reminder_enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </span>
        {isScreen ? (
          <button onClick={onWatched} disabled={busy || item.is_done} className="tap-target inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-900 sm:flex-none">
            {item.period === 'morning' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Watched
          </button>
        ) : (
          <button onClick={onDelete} disabled={busy} title="Delete routine item" className="tap-target inline-flex items-center justify-center rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </article>
  );
}

function getLocalActivePeriod() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour >= 18) return 'night';
  return null;
}
