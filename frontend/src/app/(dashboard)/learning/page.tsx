'use client';

import { FormEvent, useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useCreateLearningLog, useDeleteLearningLog, useLearningLogs, useUpdateLearningLog } from '@/hooks/use-learning-logs';

type LearningLog = {
  id: string;
  title: string;
  key_notes: string;
  detailed_description: string | null;
  code_link: string | null;
  tags: string | null;
  created_at: string;
};

type LearningForm = {
  title: string;
  key_notes: string;
  detailed_description: string;
  code_link: string;
  tags: string;
};

const emptyForm: LearningForm = {
  title: '',
  key_notes: '',
  detailed_description: '',
  code_link: '',
  tags: '',
};

function formFromLog(log?: LearningLog): LearningForm {
  return {
    title: log?.title ?? '',
    key_notes: log?.key_notes ?? '',
    detailed_description: log?.detailed_description ?? '',
    code_link: log?.code_link ?? '',
    tags: log?.tags ?? '',
  };
}

function toPayload(form: LearningForm) {
  return {
    title: form.title.trim(),
    key_notes: form.key_notes.trim(),
    detailed_description: form.detailed_description.trim() || undefined,
    code_link: form.code_link.trim() || undefined,
    tags: form.tags.trim() || undefined,
  };
}

export default function LearningPage() {
  const logs = useLearningLogs();
  const createLog = useCreateLearningLog();
  const updateLog = useUpdateLearningLog();
  const deleteLog = useDeleteLearningLog();
  const [form, setForm] = useState<LearningForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isSaving = createLog.isPending || updateLog.isPending || deleteLog.isPending;
  const logItems: LearningLog[] = logs.data?.data ?? [];

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (log: LearningLog) => {
    setEditingId(log.id);
    setForm(formFromLog(log));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = toPayload(form);
    if (!payload.title || !payload.key_notes) return;

    if (editingId) {
      updateLog.mutate({ id: editingId, payload }, { onSuccess: resetForm });
      return;
    }

    createLog.mutate(payload, { onSuccess: resetForm });
  };

  return (
    <div>
      <PageHeader title="Learning Logs" subtitle="Capture, update, and reuse work learnings while they are fresh." />

      <form onSubmit={handleSubmit} className="mb-6 grid gap-4 rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium">
            Title
            <input
              className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"
              placeholder="What did you learn?"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Code link
            <input
              className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"
              placeholder="https://github.com/..."
              value={form.code_link}
              onChange={(event) => setForm((current) => ({ ...current, code_link: event.target.value }))}
            />
          </label>
        </div>

        <label className="grid gap-1 text-sm font-medium">
          Key notes
          <textarea
            className="min-h-28 resize-none rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"
            placeholder="Key notes"
            value={form.key_notes}
            onChange={(event) => setForm((current) => ({ ...current, key_notes: event.target.value }))}
            required
          />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Detailed description
          <textarea
            className="min-h-24 resize-none rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"
            placeholder="Extra context, examples, mistakes, or next steps"
            value={form.detailed_description}
            onChange={(event) => setForm((current) => ({ ...current, detailed_description: event.target.value }))}
          />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Tags
          <input
            className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"
            placeholder="react, backend, debugging"
            value={form.tags}
            onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
          />
        </label>

        <div className="flex flex-wrap justify-end gap-2">
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          ) : null}
          <button
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isSaving ? 'Saving...' : editingId ? 'Save Log' : 'Add Log'}
          </button>
        </div>
      </form>

      {logs.isLoading ? <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">Loading learning logs...</p> : null}
      {logs.isError ? <p className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Could not load learning logs.</p> : null}
      {!logs.isLoading && !logs.isError && logItems.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">No learning logs yet. Add the first one above.</p>
      ) : null}

      <div className="grid gap-4">
        {logItems.map((log) => (
          <article key={log.id} className="rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{new Date(log.created_at).toLocaleDateString()}</p>
                <h2 className="mt-2 text-xl font-bold">{log.title}</h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{log.key_notes}</p>
                {log.detailed_description ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{log.detailed_description}</p> : null}
                {log.tags ? <p className="mt-3 text-xs uppercase tracking-[0.2em] text-sky-500">{log.tags}</p> : null}
                {log.code_link ? (
                  <a className="mt-3 inline-block text-sm font-semibold text-sky-600 hover:underline dark:text-sky-300" href={log.code_link} target="_blank" rel="noreferrer">
                    Open source
                  </a>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(log)}
                  disabled={isSaving}
                  title="Edit learning log"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteLog.mutate(log.id, { onSuccess: resetForm })}
                  disabled={isSaving}
                  title="Delete learning log"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
                >
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
