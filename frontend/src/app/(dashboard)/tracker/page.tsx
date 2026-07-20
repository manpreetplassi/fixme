'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Check, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useCreateDailyLog, useCreateDailyTask, useDailyLogs, useDailyTasks, useDeleteDailyLog, useDeleteDailyTask, useUpdateDailyLog, useUpdateDailyTask } from '@/hooks/use-daily-logs';

type DailyTask = {
  id: string;
  name: string;
  description: string | null;
  day_type: string;
  points: number;
  priority: string;
  category: string;
  display_order: number;
  is_enabled: boolean;
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

type TaskForm = {
  name: string;
  description: string;
  day_type: string;
  priority: string;
  points: string;
  category: string;
  icon: string;
  display_order: string;
};

const statusOptions = [
  { value: 'completed', label: 'Done' },
  { value: 'not_started', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'cheated', label: 'Cheated' },
];

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900',
  not_started: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800',
  failed: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-900',
  cheated: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900',
};

const priorityOptions = ['critical', 'high', 'medium', 'low'];
const dayTypeOptions = ['weekday', 'weekend', 'travel'];

const emptyTaskForm: TaskForm = {
  name: '',
  description: '',
  day_type: 'weekday',
  priority: 'medium',
  points: '5',
  category: 'habits',
  icon: '',
  display_order: '0',
};

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

function taskFormFromTask(task?: DailyTask): TaskForm {
  return {
    name: task?.name ?? '',
    description: task?.description ?? '',
    day_type: task?.day_type ?? 'weekday',
    priority: task?.priority ?? 'medium',
    points: task?.points?.toString() ?? '5',
    category: task?.category ?? 'habits',
    icon: '',
    display_order: task?.display_order?.toString() ?? '0',
  };
}

function taskPayload(form: TaskForm) {
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    day_type: form.day_type,
    priority: form.priority,
    points: Number(form.points),
    category: form.category.trim(),
    icon: form.icon.trim() || undefined,
    display_order: Number(form.display_order || 0),
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
  const createTask = useCreateDailyTask();
  const updateTask = useUpdateDailyTask();
  const deleteTask = useDeleteDailyTask();
  const [creatingTaskId, setCreatingTaskId] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [form, setForm] = useState<LogForm>(formFromLog());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<TaskForm>({ ...emptyTaskForm, day_type: dayType });

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

  const resetTaskForm = () => {
    setShowTaskForm(false);
    setEditingTaskId(null);
    setTaskForm({ ...emptyTaskForm, day_type: dayType });
  };

  const startTaskEdit = (task: DailyTask) => {
    setShowTaskForm(true);
    setEditingTaskId(task.id);
    setTaskForm(taskFormFromTask(task));
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

  const quickSave = (task: DailyTask, log: DailyLog | undefined, status: string) => {
    if (log) {
      updateLog.mutate({ id: log.id, payload: { status } }, { onSuccess: resetForm });
      return;
    }

    createLog.mutate(
      {
        task_id: task.id,
        log_date: today,
        status,
      },
      { onSuccess: resetForm },
    );
  };

  const submitTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingTaskId) {
      updateTask.mutate({ id: editingTaskId, payload: taskPayload(taskForm) }, { onSuccess: resetTaskForm });
      return;
    }
    createTask.mutate(taskPayload(taskForm), { onSuccess: resetTaskForm });
  };

  const isSaving = createLog.isPending || updateLog.isPending || deleteLog.isPending || createTask.isPending || updateTask.isPending || deleteTask.isPending;
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

      <section className="mb-4 rounded-lg border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black">Tracker tasks</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Create, edit, or remove the task templates that appear below.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowTaskForm((current) => !current);
              setEditingTaskId(null);
              setTaskForm({ ...emptyTaskForm, day_type: dayType });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            New task
          </button>
        </div>

        {showTaskForm ? (
          <form onSubmit={submitTask} className="mt-5 grid gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="grid gap-3 md:grid-cols-4">
              <label className="grid gap-1 text-sm font-medium md:col-span-2">
                Name
                <input required value={taskForm.name} onChange={(event) => setTaskForm((current) => ({ ...current, name: event.target.value }))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950" />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Category
                <input required value={taskForm.category} onChange={(event) => setTaskForm((current) => ({ ...current, category: event.target.value }))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950" />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Points
                <input required type="number" min="0" value={taskForm.points} onChange={(event) => setTaskForm((current) => ({ ...current, points: event.target.value }))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950" />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Day type
                <select value={taskForm.day_type} onChange={(event) => setTaskForm((current) => ({ ...current, day_type: event.target.value }))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
                  {dayTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Priority
                <select value={taskForm.priority} onChange={(event) => setTaskForm((current) => ({ ...current, priority: event.target.value }))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
                  {priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Icon
                <input value={taskForm.icon} onChange={(event) => setTaskForm((current) => ({ ...current, icon: event.target.value }))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950" />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Order
                <input type="number" min="0" value={taskForm.display_order} onChange={(event) => setTaskForm((current) => ({ ...current, display_order: event.target.value }))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950" />
              </label>
            </div>
            <label className="grid gap-1 text-sm font-medium">
              Description
              <textarea value={taskForm.description} onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))} rows={2} className="resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950" />
            </label>
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={resetTaskForm} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900">
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                {editingTaskId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingTaskId ? 'Save task' : 'Create task'}
              </button>
            </div>
          </form>
        ) : null}
      </section>

      {!isLoading && !isError ? (
        <section className="mb-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-black/10 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <p className="text-xs text-slate-500 dark:text-slate-400">Tasks</p>
            <p className="mt-1 text-2xl font-black">{(tasks.data ?? []).length}</p>
          </div>
          <div className="rounded-lg border border-black/10 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <p className="text-xs text-slate-500 dark:text-slate-400">Logged</p>
            <p className="mt-1 text-2xl font-black">{(logs.data ?? []).length}</p>
          </div>
          <div className="rounded-lg border border-black/10 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <p className="text-xs text-slate-500 dark:text-slate-400">Done</p>
            <p className="mt-1 text-2xl font-black">{(logs.data ?? []).filter((log: DailyLog) => log.status === 'completed').length}</p>
          </div>
          <div className="rounded-lg border border-black/10 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <p className="text-xs text-slate-500 dark:text-slate-400">Points</p>
            <p className="mt-1 text-2xl font-black">{(logs.data ?? []).reduce((sum: number, log: DailyLog) => sum + Number(log.points_earned), 0)}</p>
          </div>
        </section>
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
                      <span className={`mr-2 rounded-full px-2 py-1 text-xs font-bold ring-1 ${statusStyles[log.status] ?? statusStyles.not_started}`}>
                        {log.status.replace('_', ' ')}
                      </span>
                      {log.points_earned} pts
                      {log.duration_minutes ? ` / ${log.duration_minutes} min` : ''}
                      {log.rating ? ` / ${log.rating}/5` : ''}
                    </p>
                  ) : null}
                  {log?.notes ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{log.notes}</p> : null}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => quickSave(task, log, 'completed')}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <Check className="h-4 w-4" />
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSave(task, log, 'not_started')}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-900"
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSave(task, log, 'failed')}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
                  >
                    Failed
                  </button>
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
                      Details
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startTaskEdit(task)}
                    disabled={isSaving}
                    title="Edit task"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTask.mutate(task.id, { onSuccess: resetForm })}
                    disabled={isSaving}
                    title="Remove task and its logs"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
