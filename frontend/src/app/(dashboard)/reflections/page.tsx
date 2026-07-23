'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useCreateReflection, useDeleteReflection, useReflectionWeek, useUpdateReflection } from '@/hooks/use-reflections';
import { getAddictionLabel } from '@/lib/api/users';

type Reflection = {
  id: string;
  reflection_date: string;
  what_went_well: string | null;
  what_didnt_work: string | null;
  primary_blocker: string | null;
  blocker_details: string | null;
  solution_to_try: string | null;
  mood: string | null;
  energy_level: number | null;
  masturbation_happened: boolean;
  masturbation_trigger_log: string | null;
  daily_score: number;
};

type ReflectionForm = {
  what_went_well: string;
  what_didnt_work: string;
  primary_blocker: string;
  blocker_details: string;
  solution_to_try: string;
  mood: string;
  energy_level: string;
  masturbation_happened: boolean;
  masturbation_trigger_log: string;
};

const emptyForm: ReflectionForm = {
  what_went_well: '',
  what_didnt_work: '',
  primary_blocker: '',
  blocker_details: '',
  solution_to_try: '',
  mood: '',
  energy_level: '',
  masturbation_happened: false,
  masturbation_trigger_log: '',
};

function formFromReflection(reflection?: Reflection): ReflectionForm {
  return {
    what_went_well: reflection?.what_went_well ?? '',
    what_didnt_work: reflection?.what_didnt_work ?? '',
    primary_blocker: reflection?.primary_blocker ?? '',
    blocker_details: reflection?.blocker_details ?? '',
    solution_to_try: reflection?.solution_to_try ?? '',
    mood: reflection?.mood ?? '',
    energy_level: reflection?.energy_level?.toString() ?? '',
    masturbation_happened: reflection?.masturbation_happened ?? false,
    masturbation_trigger_log: reflection?.masturbation_trigger_log ?? '',
  };
}

function toPayload(form: ReflectionForm) {
  return {
    what_went_well: form.what_went_well.trim() || undefined,
    what_didnt_work: form.what_didnt_work.trim() || undefined,
    primary_blocker: form.primary_blocker.trim() || undefined,
    blocker_details: form.blocker_details.trim() || undefined,
    solution_to_try: form.solution_to_try.trim() || undefined,
    mood: form.mood.trim() || undefined,
    energy_level: form.energy_level ? Number(form.energy_level) : undefined,
    masturbation_happened: form.masturbation_happened,
    masturbation_trigger_log: form.masturbation_trigger_log.trim() || undefined,
  };
}

export default function ReflectionsPage() {
  const reflections = useReflectionWeek();
  const createReflection = useCreateReflection();
  const updateReflection = useUpdateReflection();
  const deleteReflection = useDeleteReflection();
  const [form, setForm] = useState<ReflectionForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addictionLabel, setAddictionLabel] = useState('addiction');

  useEffect(() => {
    void getAddictionLabel().then(setAddictionLabel);
  }, []);

  const items: Reflection[] = reflections.data ?? [];
  const isSaving = createReflection.isPending || updateReflection.isPending || deleteReflection.isPending;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (reflection: Reflection) => {
    setForm(formFromReflection(reflection));
    setEditingId(reflection.id);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = toPayload(form);

    if (editingId) {
      updateReflection.mutate({ id: editingId, payload }, { onSuccess: resetForm });
      return;
    }

    createReflection.mutate(payload, { onSuccess: resetForm });
  };

  return (
    <div>
      <PageHeader title="Reflections" subtitle="Review the week, name blockers, and keep tomorrow easier to start." />

      <form onSubmit={handleSubmit} className="mb-6 grid gap-4 rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium">
            What went well
            <textarea className="min-h-24 resize-none rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" value={form.what_went_well} onChange={(event) => setForm((current) => ({ ...current, what_went_well: event.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            What did not work
            <textarea className="min-h-24 resize-none rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" value={form.what_didnt_work} onChange={(event) => setForm((current) => ({ ...current, what_didnt_work: event.target.value }))} />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-medium">
            Primary blocker
            <input className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" value={form.primary_blocker} onChange={(event) => setForm((current) => ({ ...current, primary_blocker: event.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Mood
            <input className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" value={form.mood} onChange={(event) => setForm((current) => ({ ...current, mood: event.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Energy
            <input type="number" min="1" max="5" className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" value={form.energy_level} onChange={(event) => setForm((current) => ({ ...current, energy_level: event.target.value }))} />
          </label>
        </div>

        <label className="grid gap-1 text-sm font-medium">
          Blocker details
          <textarea className="min-h-20 resize-none rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" value={form.blocker_details} onChange={(event) => setForm((current) => ({ ...current, blocker_details: event.target.value }))} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Solution to try
          <textarea className="min-h-20 resize-none rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" value={form.solution_to_try} onChange={(event) => setForm((current) => ({ ...current, solution_to_try: event.target.value }))} />
        </label>

        <label className="flex items-center gap-3 text-sm font-medium">
          <input type="checkbox" checked={form.masturbation_happened} onChange={(event) => setForm((current) => ({ ...current, masturbation_happened: event.target.checked }))} />
          {addictionLabel.charAt(0).toUpperCase() + addictionLabel.slice(1)} happened
        </label>

        {form.masturbation_happened ? (
          <label className="grid gap-1 text-sm font-medium">
            Trigger
            <input className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" value={form.masturbation_trigger_log} onChange={(event) => setForm((current) => ({ ...current, masturbation_trigger_log: event.target.value }))} />
          </label>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          {editingId ? (
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900">
              <X className="h-4 w-4" />
              Cancel
            </button>
          ) : null}
          <button disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300">
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isSaving ? 'Saving...' : editingId ? 'Save Reflection' : 'Add Reflection'}
          </button>
        </div>
      </form>

      {reflections.isLoading ? <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">Loading reflections...</p> : null}
      {reflections.isError ? <p className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Could not load reflections.</p> : null}
      {!reflections.isLoading && !reflections.isError && items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">No reflections yet. Add one above.</p>
      ) : null}

      <div className="grid gap-4">
        {items.map((reflection) => (
          <article key={reflection.id} className="rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{reflection.reflection_date} / score {reflection.daily_score}</p>
                <h2 className="mt-2 text-xl font-bold">{reflection.primary_blocker ?? 'General reflection'}</h2>
                {reflection.what_went_well ? <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{reflection.what_went_well}</p> : null}
                {reflection.what_didnt_work ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{reflection.what_didnt_work}</p> : null}
                {reflection.solution_to_try ? <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-300">{reflection.solution_to_try}</p> : null}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={() => startEdit(reflection)} disabled={isSaving} title="Edit reflection" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => deleteReflection.mutate(reflection.id, { onSuccess: resetForm })} disabled={isSaving} title="Delete reflection" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
