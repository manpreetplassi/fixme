'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Check, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useCreateDailyLog, useDailyLogs, useDailyTasks, useDeleteDailyLog, useUpdateDailyLog } from '@/hooks/use-daily-logs';

type DailyTask = {
  id: string;
  name: string;
  points: number;
  priority: string;
  category: string;
};

type DailyLog = {
  id: string;
  task: DailyTask;
  log_date: string;
  status: string;
  points_earned: number;
  duration_minutes: number | null;
  rating: number | null;
  notes: string | null;
  money_saved: string | number;
};

type LogForm = {
  status: string;
  duration_minutes: string;
  rating: string;
  notes: string;
  money_saved: string;
};

const statusOptions = [
  { value: 'completed', label: 'Done' },
  { value: 'not_started', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'cheated', label: 'Cheated' },
];

function formFromLog(log?: DailyLog): LogForm {
  return {
    status: log?.status ?? 'completed',
    duration_minutes: log?.duration_minutes?.toString() ?? '',
    rating: log?.rating?.toString() ?? '',
    notes: log?.notes ?? '',
    money_saved: log?.money_saved ? Number(log.money_saved).toString() : '',
  };
}

function toPayload(form: LogForm) {
  return {
    status: form.status,
    duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
    rating: form.rating ? Number(form.rating) : undefined,
    notes: form.notes.trim() || undefined,
    money_saved: form.money_saved ? Number(form.money_saved) : undefined,
  };
}

export default function TrackerPage() {
  const today = new Date().toISOString().slice(0, 10);
  const dayType = useMemo(() => (new Date().getDay() === 0 || new Date().getDay() === 6 ? 'weekend' : 'weekday'), []);
  const tasks = useDailyTasks(dayType);
  const logs = useDailyLogs(today);
  const createLog = useCreateDailyLog();
  const updateLog = useUpdateDailyLog();
  const deleteLog = useDeleteDailyLog();
  const [creatingTaskId, setCreatingTaskId] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [form, setForm] = useState<LogForm>(formFromLog());

  const logsByTaskId = useMemo(() => {
    return new Map((logs.data ?? []).map((log: DailyLog) => [log.task.id, log]));
  }, [logs.data]);

  const startCreate = (taskId: string) => {
    setCreatingTaskId(taskId);
    setEditingLogId(null);
    setForm(formFromLog());
  };

  const startEdit = (log: DailyLog) => {
    setEditingLogId(log.id);
    setCreatingTaskId(null);
    setForm(formFromLog(log));
  };

  const resetForm = () => {
    setCreatingTaskId(null);
    setEditingLogId(null);
    setForm(formFromLog());
  };

  const submitCreate = (event: FormEvent, taskId: string) => {
    event.preventDefault();
    createLog.mutate(
      {
        task_id: taskId,
        log_date: today,
        ...toPayload(form),
      },
      { onSuccess: resetForm },
    );
  };

  const submitUpdate = (event: FormEvent, logId: string) => {
    event.preventDefault();
    updateLog.mutate(
      {
        id: logId,
        payload: toPayload(form),
      },
      { onSuccess: resetForm },
    );
  };

  const isSaving = createLog.isPending || updateLog.isPending || deleteLog.isPending;
  const isLoading = tasks.isLoading || logs.isLoading;
  const isError = tasks.isError || logs.isError;

  return (
    <div>
      <PageHeader title="Daily Tracker" subtitle="Create, edit, review, and clean up today's task logs." />
      {isLoading ? <p className="mb-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">Loading tracker tasks...</p> : null}
      {isError ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Could not load tracker data.</p> : null}
      {!isLoading && !isError && (tasks.data ?? []).length === 0 ? (
        <p className="mb-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">No tasks are enabled for this day type.</p>
      ) : null}

      <div className="grid gap-4">
        {(tasks.data ?? []).map((task: DailyTask) => {
          const log = logsByTaskId.get(task.id) as DailyLog | undefined;
          const isCreating = creatingTaskId === task.id;
          const isEditing = editingLogId === log?.id;

          return (
            <div
              key={task.id}
              className="rounded-lg border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{task.priority}</p>
                  <h2 className="mt-2 text-lg font-bold">{task.name}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {task.category} / {task.points} pts
                  </p>
                  {log ? (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                      {log.status.replace('_', ' ')} / {log.points_earned} pts
                      {log.duration_minutes ? ` / ${log.duration_minutes} min` : ''}
                      {log.rating ? ` / ${log.rating}/5` : ''}
                    </p>
                  ) : null}
                  {log?.notes ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{log.notes}</p> : null}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {log ? (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(log)}
                        disabled={isSaving}
                        title="Edit log"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteLog.mutate(log.id, { onSuccess: resetForm })}
                        disabled={isSaving}
                        title="Delete log"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startCreate(task.id)}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <Plus className="h-4 w-4" />
                      Log
                    </button>
                  )}
                </div>
              </div>

              {isCreating || isEditing ? (
                <form onSubmit={(event) => (isEditing && log ? submitUpdate(event, log.id) : submitCreate(event, task.id))} className="mt-5 grid gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <div className="grid gap-3 md:grid-cols-4">
                    <label className="grid gap-1 text-sm font-medium">
                      Status
                      <select
                        value={form.status}
                        onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1 text-sm font-medium">
                      Minutes
                      <input
                        type="number"
                        min="0"
                        value={form.duration_minutes}
                        onChange={(event) => setForm((current) => ({ ...current, duration_minutes: event.target.value }))}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                      />
                    </label>
                    <label className="grid gap-1 text-sm font-medium">
                      Rating
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={form.rating}
                        onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                      />
                    </label>
                    <label className="grid gap-1 text-sm font-medium">
                      Money saved
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.money_saved}
                        onChange={(event) => setForm((current) => ({ ...current, money_saved: event.target.value }))}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                      />
                    </label>
                  </div>

                  <label className="grid gap-1 text-sm font-medium">
                    Notes
                    <textarea
                      value={form.notes}
                      onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                      rows={3}
                      className="resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                    />
                  </label>

                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                      {isEditing ? <Save className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      {isEditing ? 'Save' : 'Create'}
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
