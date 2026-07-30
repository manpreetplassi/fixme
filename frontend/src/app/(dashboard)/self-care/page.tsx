'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useCareAreas, useCreateCareArea, useDeleteCareArea } from '@/hooks/use-self-care';

const emptyAreaForm = {
  name: '',
  icon: '',
  color: '',
  description: '',
};

export default function SelfCarePage() {
  const areas = useCareAreas();
  const createArea = useCreateCareArea();
  const deleteArea = useDeleteCareArea();
  const [form, setForm] = useState(emptyAreaForm);

  const careAreas = areas.data ?? [];
  const isSaving = createArea.isPending || deleteArea.isPending;

  function submitArea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      icon: form.icon.trim() || undefined,
      color: form.color.trim() || undefined,
      description: form.description.trim() || undefined,
    };
    if (!payload.name) return;
    createArea.mutate(payload, { onSuccess: () => setForm(emptyAreaForm) });
  }

  return (
    <div>
      <PageHeader title="Self Care" subtitle="Build focused care areas, then send the right tasks into your central Today routine." />

      <form onSubmit={submitArea} className="app-card mb-6 grid gap-3 p-4 sm:p-5 md:grid-cols-5">
        <input
          className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800 md:col-span-2"
          placeholder="Care area, e.g. Hair Care"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
        />
        <input
          className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"
          placeholder="Icon"
          value={form.icon}
          onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
        />
        <input
          className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"
          placeholder="Color"
          value={form.color}
          onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
        />
        <input
          className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800 md:col-span-4"
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
        />
        <button disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:bg-slate-300">
          <Plus className="h-4 w-4" />
          Add area
        </button>
      </form>

      {areas.isLoading ? <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">Loading care areas...</p> : null}
      {areas.isError ? <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Could not load self-care areas.</p> : null}

      {!areas.isLoading && careAreas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">No care areas yet.</p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {careAreas.map((area) => (
          <article key={area.id} className="rounded-lg border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">{area.icon || 'self care'}</p>
                <h2 className="mt-2 truncate text-xl font-black">{area.name}</h2>
                {area.description ? <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{area.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => deleteArea.mutate(area.id)}
                disabled={isSaving}
                title="Delete care area"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Tasks</p>
                <p className="mt-1 text-lg font-black">{area.task_count}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">In Today</p>
                <p className="mt-1 text-lg font-black">{area.active_in_routine}</p>
              </div>
            </div>
            <Link href={`/self-care/${area.id}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900">
              Open area
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
