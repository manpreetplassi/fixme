'use client';

import { FormEvent, useState } from 'react';
import { CalendarDays, Clock, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { LifestyleActivity } from '@/lib/api/lifestyle';
import { useCreateLifestyleActivity, useDeleteLifestyleActivity, useLifestyleActivities, useUpdateLifestyleActivity } from '@/hooks/use-lifestyle';

type HobbyForm = {
  name: string;
  date: string;
  start_time: string;
  duration_minutes: string;
  notes: string;
};

const todayString = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): HobbyForm => ({
  name: '',
  date: todayString(),
  start_time: '',
  duration_minutes: '',
  notes: '',
});

function formFrom(activity?: LifestyleActivity): HobbyForm {
  return {
    name: activity?.name ?? '',
    date: activity?.activity_date ?? todayString(),
    start_time: activity?.start_time ?? '',
    duration_minutes: activity?.duration_minutes?.toString() ?? '',
    notes: activity?.notes ?? '',
  };
}

export default function HobbiesPage() {
  const hobbies = useLifestyleActivities({ type: 'hobby' });
  const createActivity = useCreateLifestyleActivity();
  const updateActivity = useUpdateLifestyleActivity();
  const deleteActivity = useDeleteLifestyleActivity();
  const [form, setForm] = useState<HobbyForm>(() => emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);

  const hobbyItems: LifestyleActivity[] = hobbies.data ?? [];
  const isSaving = createActivity.isPending || updateActivity.isPending || deleteActivity.isPending;

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
  }

  function submitHobby(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      activity_type: 'hobby',
      name: form.name.trim(),
      date: form.date,
      start_time: form.start_time || undefined,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : 0,
      notes: form.notes.trim() || undefined,
    };
    if (!payload.name || !payload.date) return;

    if (editingId) {
      updateActivity.mutate({ id: editingId, payload }, { onSuccess: resetForm });
      return;
    }
    createActivity.mutate(payload, { onSuccess: resetForm });
  }

  return (
    <div>
      <PageHeader title="Hobbies" subtitle="Log hobby sessions as lifestyle activities." />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={submitHobby} className="app-card grid gap-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Lifestyle activity</p>
              <h2 className="mt-1 text-xl font-black">{editingId ? 'Edit hobby session' : 'Log hobby session'}</h2>
            </div>
            {editingId ? (
              <button type="button" onClick={resetForm} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900" title="Cancel edit">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <label className="grid gap-2 text-sm font-semibold">
            Hobby name
            <input className="form-input" placeholder="Dance practice, bike ride, sketching..." value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold">
              Date
              <span className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="date" className="form-input pl-11" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} required />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Start time
              <span className="relative">
                <Clock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="time" className="form-input pl-11" value={form.start_time} onChange={(event) => setForm((current) => ({ ...current, start_time: event.target.value }))} />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Minutes
              <input type="number" min="0" className="form-input" placeholder="30" value={form.duration_minutes} onChange={(event) => setForm((current) => ({ ...current, duration_minutes: event.target.value }))} />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold">
            Notes
            <textarea className="min-h-28 resize-none rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="What did you practice, enjoy, or notice?" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          </label>

          <button disabled={isSaving || !form.name.trim() || !form.date} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300">
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? 'Save session' : 'Add session'}
          </button>
        </form>

        <section className="grid gap-3">
          <h2 className="text-lg font-bold">Recent hobby sessions</h2>
          {hobbies.isLoading ? <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">Loading hobbies...</p> : null}
          {!hobbies.isLoading && hobbyItems.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">No hobby sessions yet.</p> : null}
          {hobbyItems.map((activity) => (
            <article key={activity.id} className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-950/70 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  {activity.activity_date}
                  {activity.start_time ? ` / ${activity.start_time}` : ''}
                </p>
                <h3 className="mt-1 font-bold">{activity.name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activity.duration_minutes} min</p>
                {activity.notes ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{activity.notes}</p> : null}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setEditingId(activity.id); setForm(formFrom(activity)); }} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900" title="Edit session">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => deleteActivity.mutate(activity.id, { onSuccess: editingId === activity.id ? resetForm : undefined })} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40" title="Delete session">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
