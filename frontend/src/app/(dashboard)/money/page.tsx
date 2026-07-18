'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useCreateMoneyEntry, useDeleteMoneyEntry, useMoneyEntries, useUpdateMoneyEntry } from '@/hooks/use-money-tracker';

type MoneyEntry = {
  id: string;
  amount: string | number;
  log_date: string;
  reason: string | null;
};

type MoneyForm = {
  amount: string;
  log_date: string;
  reason: string;
};

const today = new Date().toISOString().slice(0, 10);
const emptyForm: MoneyForm = { amount: '', log_date: today, reason: '' };

function formFromEntry(entry?: MoneyEntry): MoneyForm {
  return {
    amount: entry?.amount ? Number(entry.amount).toString() : '',
    log_date: entry?.log_date ?? today,
    reason: entry?.reason ?? '',
  };
}

function toPayload(form: MoneyForm) {
  return {
    amount: Number(form.amount),
    log_date: form.log_date,
    reason: form.reason.trim() || undefined,
  };
}

export default function MoneyPage() {
  const entries = useMoneyEntries();
  const createEntry = useCreateMoneyEntry();
  const updateEntry = useUpdateMoneyEntry();
  const deleteEntry = useDeleteMoneyEntry();
  const [form, setForm] = useState<MoneyForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const items: MoneyEntry[] = entries.data ?? [];
  const totalSaved = useMemo(() => items.reduce((sum, entry) => sum + Number(entry.amount), 0), [items]);
  const isSaving = createEntry.isPending || updateEntry.isPending || deleteEntry.isPending;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (entry: MoneyEntry) => {
    setForm(formFromEntry(entry));
    setEditingId(entry.id);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = toPayload(form);
    if (!payload.amount || !payload.log_date) return;

    if (editingId) {
      updateEntry.mutate({ id: editingId, payload }, { onSuccess: resetForm });
      return;
    }

    createEntry.mutate(payload, { onSuccess: resetForm });
  };

  return (
    <div>
      <PageHeader title="Money Tracker" subtitle="Track avoided spends and keep reward progress visible." />

      <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
        <p className="text-xs uppercase tracking-[0.25em]">Total saved</p>
        <p className="mt-2 text-3xl font-black">Rs. {totalSaved.toFixed(2)}</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 grid gap-4 rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-medium">
            Amount
            <input type="number" min="0" step="0.01" required className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Date
            <input type="date" required className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" value={form.log_date} onChange={(event) => setForm((current) => ({ ...current, log_date: event.target.value }))} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Reason
            <input className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Skipped delivery, cooked at home" value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} />
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {editingId ? (
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900">
              <X className="h-4 w-4" />
              Cancel
            </button>
          ) : null}
          <button disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300">
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isSaving ? 'Saving...' : editingId ? 'Save Entry' : 'Add Entry'}
          </button>
        </div>
      </form>

      {entries.isLoading ? <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">Loading money entries...</p> : null}
      {entries.isError ? <p className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Could not load money entries.</p> : null}
      {!entries.isLoading && !entries.isError && items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">No savings logged yet. Add your first avoided spend above.</p>
      ) : null}

      <div className="grid gap-4">
        {items.map((entry) => (
          <article key={entry.id} className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{entry.log_date}</p>
              <h2 className="mt-2 text-xl font-bold">Rs. {Number(entry.amount).toFixed(2)}</h2>
              {entry.reason ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{entry.reason}</p> : null}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => startEdit(entry)} disabled={isSaving} title="Edit money entry" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => deleteEntry.mutate(entry.id, { onSuccess: resetForm })} disabled={isSaving} title="Delete money entry" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
