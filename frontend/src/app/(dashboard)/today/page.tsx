'use client';

import clsx from 'clsx';
import { Bell, BellOff, Check, Clock, Monitor, MonitorOff, Plus, Send, Trash2, Video, X } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { TodayRoutineItem } from '@/lib/api/today';
import { useCreateRoutineItem, useDeleteRoutineItem, useDeleteScreenCheckIn, useSaveScreenCheckIn, useSendReminderDigest, useSetRoutineDone, useToday } from '@/hooks/use-today';
import { useLifestyleToday } from '@/hooks/use-lifestyle';
import { TimePicker } from '@/components/ui/time-picker';

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

const PERIOD_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night'];

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
  const deleteCheckIn = useDeleteScreenCheckIn();
  const createItem = useCreateRoutineItem();
  const deleteItem = useDeleteRoutineItem();
  const reminderDigest = useSendReminderDigest();
  const lifestyle = useLifestyleToday();
  const [form, setForm] = useState<RoutineForm>(initialForm);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [period, setPeriod] = useState('Evening');
  const [watched, setWatched] = useState(false);
  const [contentType, setContentType] = useState('reel_short');
  const [titleNote, setTitleNote] = useState('');
  const [stoppedAt, setStoppedAt] = useState('');

  const screenItem = useMemo(
    () => today.data?.items.find((item) => item.type === 'screen_checkin'),
    [today.data],
  );

  const completeCount = today.data?.items.filter((item) => item.is_done).length ?? 0;
  const totalCount = today.data?.items.length ?? 0;

  async function submitRoutine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createItem.mutateAsync({ ...form, time_block: form.time_block || null });
    setForm(initialForm);
  }

  async function submitCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveCheckIn.mutateAsync({
      watched,
      period,
      content_type: watched ? contentType : undefined,
      title_note: watched && titleNote ? titleNote : undefined,
      stopped_watching_at: watched && stoppedAt ? stoppedAt : undefined,
    });
    setShowCheckInForm(false);
    setWatched(false);
    setTitleNote('');
    setStoppedAt('');
  }

  const busy = saveCheckIn.isPending || deleteCheckIn.isPending;

  return (
    <div>
      <PageHeader title="Today" subtitle="One routine for habits, health, learning, money, and screen discipline." />

      {today.isLoading ? <p className="mb-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">Loading today&apos;s routine...</p> : null}
      {today.isError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Could not load today&apos;s routine.</p> : null}

      {today.data ? (
        <>
          <section className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:gap-4">
            <div className="game-card p-3 sm:p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Routine progress</p>
              <p className="mt-2 text-2xl font-black sm:mt-3 sm:text-3xl">{completeCount}/{totalCount}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${totalCount ? (completeCount / totalCount) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="game-card p-3 sm:p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Clean screen days</p>
              <p className="mt-2 text-2xl font-black sm:mt-3 sm:text-3xl">{today.data.screen.streak}</p>
              <div className="mt-3 flex gap-1">
                {today.data.screen.week.map((day) => (
                  <span
                    key={day.date}
                    title={day.date}
                    className={clsx('h-2 flex-1 rounded-full', !day.check_in ? 'bg-slate-200 dark:bg-slate-800' : day.check_in.watched ? 'bg-red-400' : 'bg-emerald-500')}
                  />
                ))}
              </div>
            </div>
          </section>

          {lifestyle.data ? (
            <section className="app-card mb-4 p-4 sm:mb-6 sm:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Lifestyle today</p>
                  <h2 className="mt-2 text-2xl font-black">{lifestyle.data.score.percentage}% logged</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Meals {lifestyle.data.meals.length} / Activities {lifestyle.data.activities.length}
                  </p>
                </div>
                <Link href="/lifestyle" className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                  Open journal
                </Link>
              </div>
            </section>
          ) : null}

          {/* Screen check-in card */}
          {screenItem ? (
            <section className={clsx('app-card mb-4 p-4 sm:mb-6 sm:p-5', screenItem.is_done ? 'border-emerald-200 dark:border-emerald-900' : '')}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-cyan-500" />
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">Screen check-in</p>
                  </div>
                  {screenItem.is_done && screenItem.check_in ? (
                    <div className="mt-2">
                      <p className="font-semibold">
                        {screenItem.check_in.watched ? '📺 Watched something' : '✅ Nothing watched'}
                        <span className="ml-2 text-sm font-normal text-slate-500">· {screenItem.check_in.period}</span>
                      </p>
                      {screenItem.check_in.watched ? (
                        <p className="mt-1 text-sm text-slate-500">
                          {screenItem.check_in.content_type?.replace('_', ' ')}
                          {screenItem.check_in.title_note ? ` · ${screenItem.check_in.title_note}` : ''}
                          {screenItem.check_in.stopped_watching_at ? ` · stopped at ${screenItem.check_in.stopped_watching_at}` : ''}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Did you watch reels, YouTube, or any video today?</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!screenItem.is_done ? (
                    <button onClick={() => setShowCheckInForm(true)} disabled={busy} className="tap-target inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-600 disabled:opacity-60">
                      <Video className="h-4 w-4" />
                      Log screen
                    </button>
                  ) : null}
                  {screenItem.is_done ? (
                    <>
                      <button onClick={() => setShowCheckInForm(true)} disabled={busy} className="tap-target inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60 dark:border-slate-800 dark:hover:bg-slate-900">
                        Edit
                      </button>
                      <button onClick={() => deleteCheckIn.mutate(today.data.date)} disabled={busy} className="tap-target inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40">
                        <MonitorOff className="h-4 w-4" />
                        Reset
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              {showCheckInForm ? (
                <form onSubmit={submitCheckIn} className="mt-4 grid gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 md:grid-cols-4">
                  <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800">
                    {PERIOD_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    <option value="custom">Custom...</option>
                  </select>
                  {period === 'custom' ? (
                    <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="e.g. After lunch" className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
                  ) : null}
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                    <input type="checkbox" checked={watched} onChange={(e) => setWatched(e.target.checked)} />
                    Watched something
                  </label>
                  {watched ? (
                    <>
                      <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800">
                        <option value="reel_short">Reel / Short</option>
                        <option value="youtube">YouTube</option>
                        <option value="movie">Movie</option>
                        <option value="show">Show</option>
                        <option value="other">Other</option>
                      </select>
                      <input value={titleNote} onChange={(e) => setTitleNote(e.target.value)} placeholder="Title or note (optional)" className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800 md:col-span-2" />
                      <label className="grid gap-1 text-xs font-semibold text-slate-500">
                        Stopped at
                        <TimePicker value={stoppedAt} onChange={setStoppedAt} />
                      </label>
                    </>
                  ) : null}
                  <div className="flex gap-2 md:col-span-4">
                    <button className="tap-target inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-600 disabled:opacity-60" disabled={busy}>
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                    <button type="button" onClick={() => setShowCheckInForm(false)} className="tap-target inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900">
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
            </section>
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
              {today.data.items.filter((item) => item.type === 'routine').map((item) => (
                <RoutineRow
                  key={item.id}
                  item={item}
                  onDone={() => setDone.mutate({ id: item.id, payload: { is_done: !item.is_done, date: today.data.date } })}
                  onDelete={() => deleteItem.mutate(item.id)}
                  busy={setDone.isPending || deleteItem.isPending}
                />
              ))}
            </div>
          </section>

          <form onSubmit={submitRoutine} className="app-card grid gap-3 p-4 sm:p-5 md:grid-cols-6">
            <input value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800 md:col-span-2" placeholder="Routine item" required />
            <input value={form.category} onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Category" required />
            <TimePicker value={form.time_block} onChange={(v) => setForm((c) => ({ ...c, time_block: v }))} />
            <select value={form.priority} onChange={(e) => setForm((c) => ({ ...c, priority: e.target.value as RoutineForm['priority'] }))} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800">
              <option value="urgent">Urgent</option>
              <option value="important">Important</option>
              <option value="low">Low</option>
            </select>
            <select value={form.repeat_rule} onChange={(e) => setForm((c) => ({ ...c, repeat_rule: e.target.value as RoutineForm['repeat_rule'] }))} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800">
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekly">Weekly</option>
              <option value="once">Once</option>
            </select>
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
              <input type="checkbox" checked={form.reminder_enabled} onChange={(e) => setForm((c) => ({ ...c, reminder_enabled: e.target.checked }))} />
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

function RoutineRow({ item, onDone, onDelete, busy }: { item: TodayRoutineItem; onDone: () => void; onDelete: () => void; busy: boolean }) {
  return (
    <article className={clsx('flex flex-col gap-4 rounded-2xl border p-3 sm:p-4 md:flex-row md:items-center md:justify-between', item.is_done ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20' : 'border-black/10 bg-white/70 dark:border-white/10 dark:bg-slate-950/50')}>
      <div className="flex items-start gap-3">
        <button onClick={onDone} disabled={busy} className={clsx('tap-target mt-1 inline-flex shrink-0 items-center justify-center rounded-2xl border', item.is_done ? 'bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700')}>
          {item.is_done ? <Check className="h-4 w-4" /> : null}
        </button>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{item.title}</h3>
            <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ring-1', priorityClass[item.priority])}>{item.priority}</span>
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
        <button onClick={onDelete} disabled={busy} title="Delete routine item" className="tap-target inline-flex items-center justify-center rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
