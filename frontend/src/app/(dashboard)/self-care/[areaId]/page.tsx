'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { CareTask } from '@/lib/api/self-care';
import {
  useActivateCareTask,
  useCareAreas,
  useCareTasks,
  useCreateCareTask,
  useDeactivateCareTask,
  useDeleteCareTask,
  useUpdateCareTask,
} from '@/hooks/use-self-care';

type TaskForm = {
  title: string;
  notes: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  priority: 'urgent' | 'important' | 'low';
};

const emptyTaskForm: TaskForm = {
  title: '',
  notes: '',
  frequency: 'daily',
  priority: 'important',
};

function formFromTask(task?: CareTask): TaskForm {
  return {
    title: task?.title ?? '',
    notes: task?.notes ?? '',
    frequency: (task?.frequency as TaskForm['frequency']) ?? 'daily',
    priority: (task?.priority as TaskForm['priority']) ?? 'important',
  };
}

export default function SelfCareAreaPage() {
  const params = useParams<{ areaId: string }>();
  const areaId = params.areaId;
  const areas = useCareAreas();
  const tasks = useCareTasks(areaId);
  const createTask = useCreateCareTask(areaId);
  const updateTask = useUpdateCareTask(areaId);
  const deleteTask = useDeleteCareTask(areaId);
  const activateTask = useActivateCareTask(areaId);
  const deactivateTask = useDeactivateCareTask(areaId);
  const [form, setForm] = useState<TaskForm>(emptyTaskForm);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const area = useMemo(() => areas.data?.find((item) => item.id === areaId), [areaId, areas.data]);
  const careTasks = tasks.data ?? [];
  const isSaving =
    createTask.isPending || updateTask.isPending || deleteTask.isPending || activateTask.isPending || deactivateTask.isPending;

  function resetForm() {
    setForm(emptyTaskForm);
    setEditingTaskId(null);
  }

  function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      notes: form.notes.trim() || undefined,
      frequency: form.frequency,
      priority: form.priority,
    };
    if (!payload.title) return;

    if (editingTaskId) {
      updateTask.mutate({ targetAreaId: areaId, taskId: editingTaskId, payload }, { onSuccess: resetForm });
      return;
    }
    createTask.mutate({ targetAreaId: areaId, payload }, { onSuccess: resetForm });
  }

  return (
    <div>
      <div className="mb-4">
        <Link href="/self-care" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Self Care
        </Link>
      </div>
      <PageHeader title={area?.name ?? 'Care Area'} subtitle={area?.description ?? 'Tune this area into practical tasks, then add the useful ones to Today.'} />

      <form onSubmit={submitTask} className="app-card mb-6 grid gap-3 p-4 sm:p-5 md:grid-cols-5">
        <input
          className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800 md:col-span-2"
          placeholder="Task, e.g. Oil hair before wash"
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          required
        />
        <select
          value={form.frequency}
          onChange={(event) => setForm((current) => ({ ...current, frequency: event.target.value as TaskForm['frequency'] }))}
          className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </select>
        <select
          value={form.priority}
          onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as TaskForm['priority'] }))}
          className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"
        >
          <option value="urgent">Urgent</option>
          <option value="important">Important</option>
          <option value="low">Low</option>
        </select>
        <input
          className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800 md:col-span-4"
          placeholder="Notes"
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
        />
        <div className="flex gap-2">
          {editingTaskId ? (
            <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-800">
              <X className="h-4 w-4" />
              Cancel
            </button>
          ) : null}
          <button disabled={isSaving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:bg-slate-300">
            {editingTaskId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingTaskId ? 'Save' : 'Add task'}
          </button>
        </div>
      </form>

      {tasks.isLoading ? <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">Loading care tasks...</p> : null}
      {tasks.isError ? <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Could not load care tasks.</p> : null}
      {!tasks.isLoading && careTasks.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">No tasks in this area yet.</p> : null}

      <section className="grid gap-3">
        {careTasks.map((task) => (
          <article key={task.id} className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold">{task.title}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">{task.frequency}</span>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{task.priority}</span>
                {task.in_routine ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                    <CheckCircle2 className="h-3 w-3" />
                    Today
                  </span>
                ) : null}
              </div>
              {task.notes ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{task.notes}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {task.in_routine ? (
                <button
                  type="button"
                  onClick={() => deactivateTask.mutate({ targetAreaId: areaId, taskId: task.id })}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  Remove from Today
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => activateTask.mutate({ targetAreaId: areaId, taskId: task.id })}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:bg-slate-300"
                >
                  Add to Today
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setEditingTaskId(task.id);
                  setForm(formFromTask(task));
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300"
                title="Edit care task"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => deleteTask.mutate({ targetAreaId: areaId, taskId: task.id }, { onSuccess: resetForm })}
                disabled={isSaving}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
                title="Delete care task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
