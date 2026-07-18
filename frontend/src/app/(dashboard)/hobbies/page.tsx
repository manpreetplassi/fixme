'use client';

import { FormEvent, useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import {
  useCreateHobby,
  useCreateHobbyLog,
  useDeleteHobby,
  useDeleteHobbyLog,
  useHobbies,
  useHobbyLogs,
  useUpdateHobby,
  useUpdateHobbyLog,
} from '@/hooks/use-hobbies';

type Hobby = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  default_points_per_instance: number;
  suggested_minutes_per_day: number;
};

type HobbyLog = {
  id: string;
  hobby: Hobby;
  log_date: string;
  duration_minutes: number;
  points_earned: number;
  notes: string | null;
};

type HobbyForm = {
  name: string;
  category: string;
  description: string;
  icon: string;
  default_points_per_instance: string;
  suggested_minutes_per_day: string;
};

type LogForm = {
  hobby_id: string;
  duration_minutes: string;
  notes: string;
};

const emptyHobbyForm: HobbyForm = {
  name: '',
  category: '',
  description: '',
  icon: '',
  default_points_per_instance: '5',
  suggested_minutes_per_day: '15',
};

const emptyLogForm: LogForm = { hobby_id: '', duration_minutes: '', notes: '' };

function hobbyFormFrom(hobby?: Hobby): HobbyForm {
  return {
    name: hobby?.name ?? '',
    category: hobby?.category ?? '',
    description: hobby?.description ?? '',
    icon: hobby?.icon ?? '',
    default_points_per_instance: hobby?.default_points_per_instance?.toString() ?? '5',
    suggested_minutes_per_day: hobby?.suggested_minutes_per_day?.toString() ?? '15',
  };
}

function logFormFrom(log?: HobbyLog): LogForm {
  return {
    hobby_id: log?.hobby.id ?? '',
    duration_minutes: log?.duration_minutes?.toString() ?? '',
    notes: log?.notes ?? '',
  };
}

export default function HobbiesPage() {
  const hobbies = useHobbies();
  const logs = useHobbyLogs();
  const createHobby = useCreateHobby();
  const updateHobby = useUpdateHobby();
  const deleteHobby = useDeleteHobby();
  const createLog = useCreateHobbyLog();
  const updateLog = useUpdateHobbyLog();
  const deleteLog = useDeleteHobbyLog();
  const [hobbyForm, setHobbyForm] = useState<HobbyForm>(emptyHobbyForm);
  const [logForm, setLogForm] = useState<LogForm>(emptyLogForm);
  const [editingHobbyId, setEditingHobbyId] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const hobbyItems: Hobby[] = hobbies.data ?? [];
  const logItems: HobbyLog[] = logs.data ?? [];
  const isSaving =
    createHobby.isPending || updateHobby.isPending || deleteHobby.isPending || createLog.isPending || updateLog.isPending || deleteLog.isPending;

  const resetHobbyForm = () => {
    setHobbyForm(emptyHobbyForm);
    setEditingHobbyId(null);
  };

  const resetLogForm = () => {
    setLogForm(emptyLogForm);
    setEditingLogId(null);
  };

  const submitHobby = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      name: hobbyForm.name.trim(),
      category: hobbyForm.category.trim(),
      description: hobbyForm.description.trim() || undefined,
      icon: hobbyForm.icon.trim() || undefined,
      default_points_per_instance: Number(hobbyForm.default_points_per_instance),
      suggested_minutes_per_day: Number(hobbyForm.suggested_minutes_per_day),
    };
    if (!payload.name || !payload.category) return;

    if (editingHobbyId) {
      updateHobby.mutate({ id: editingHobbyId, payload }, { onSuccess: resetHobbyForm });
      return;
    }
    createHobby.mutate(payload, { onSuccess: resetHobbyForm });
  };

  const submitLog = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      hobby_id: logForm.hobby_id,
      duration_minutes: logForm.duration_minutes ? Number(logForm.duration_minutes) : undefined,
      notes: logForm.notes.trim() || undefined,
    };
    if (!payload.hobby_id && !editingLogId) return;

    if (editingLogId) {
      updateLog.mutate({ id: editingLogId, payload }, { onSuccess: resetLogForm });
      return;
    }
    createLog.mutate(payload, { onSuccess: resetLogForm });
  };

  return (
    <div>
      <PageHeader title="Hobbies" subtitle="Manage your hobby catalog and log practice sessions." />

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={submitHobby} className="grid gap-4 rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
          <h2 className="text-lg font-bold">{editingHobbyId ? 'Edit hobby' : 'Create hobby'}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Name" value={hobbyForm.name} onChange={(event) => setHobbyForm((current) => ({ ...current, name: event.target.value }))} required />
            <input className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Category" value={hobbyForm.category} onChange={(event) => setHobbyForm((current) => ({ ...current, category: event.target.value }))} required />
            <input className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Icon" value={hobbyForm.icon} onChange={(event) => setHobbyForm((current) => ({ ...current, icon: event.target.value }))} />
            <input className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Description" value={hobbyForm.description} onChange={(event) => setHobbyForm((current) => ({ ...current, description: event.target.value }))} />
            <input type="number" min="0" className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Points" value={hobbyForm.default_points_per_instance} onChange={(event) => setHobbyForm((current) => ({ ...current, default_points_per_instance: event.target.value }))} />
            <input type="number" min="0" className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Suggested minutes" value={hobbyForm.suggested_minutes_per_day} onChange={(event) => setHobbyForm((current) => ({ ...current, suggested_minutes_per_day: event.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            {editingHobbyId ? (
              <button type="button" onClick={resetHobbyForm} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-800">
                <X className="h-4 w-4" />
                Cancel
              </button>
            ) : null}
            <button disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-300">
              {editingHobbyId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingHobbyId ? 'Save Hobby' : 'Add Hobby'}
            </button>
          </div>
        </form>

        <form onSubmit={submitLog} className="grid gap-4 rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
          <h2 className="text-lg font-bold">{editingLogId ? 'Edit hobby log' : 'Log hobby'}</h2>
          <select className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" value={logForm.hobby_id} onChange={(event) => setLogForm((current) => ({ ...current, hobby_id: event.target.value }))} disabled={Boolean(editingLogId)} required={!editingLogId}>
            <option value="">Select hobby</option>
            {hobbyItems.map((hobby) => (
              <option key={hobby.id} value={hobby.id}>
                {hobby.name}
              </option>
            ))}
          </select>
          <input type="number" min="0" className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Minutes" value={logForm.duration_minutes} onChange={(event) => setLogForm((current) => ({ ...current, duration_minutes: event.target.value }))} />
          <textarea className="min-h-20 resize-none rounded-lg border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" placeholder="Notes" value={logForm.notes} onChange={(event) => setLogForm((current) => ({ ...current, notes: event.target.value }))} />
          <div className="flex justify-end gap-2">
            {editingLogId ? (
              <button type="button" onClick={resetLogForm} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-800">
                <X className="h-4 w-4" />
                Cancel
              </button>
            ) : null}
            <button disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-300">
              {editingLogId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingLogId ? 'Save Log' : 'Add Log'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="grid gap-3">
          <h2 className="text-lg font-bold">Catalog</h2>
          {hobbies.isLoading ? <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">Loading hobbies...</p> : null}
          {!hobbies.isLoading && hobbyItems.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">No hobbies yet.</p> : null}
          {hobbyItems.map((hobby) => (
            <article key={hobby.id} className="flex items-center justify-between gap-4 rounded-lg border border-black/10 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-950/70">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{hobby.category}</p>
                <h3 className="mt-1 font-bold">{hobby.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{hobby.suggested_minutes_per_day} min / {hobby.default_points_per_instance} pts</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setEditingHobbyId(hobby.id); setHobbyForm(hobbyFormFrom(hobby)); }} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-slate-800">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => deleteHobby.mutate(hobby.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 dark:border-red-900/60">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-3">
          <h2 className="text-lg font-bold">Recent Logs</h2>
          {logs.isLoading ? <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">Loading hobby logs...</p> : null}
          {!logs.isLoading && logItems.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">No hobby logs yet.</p> : null}
          {logItems.map((log) => (
            <article key={log.id} className="flex items-center justify-between gap-4 rounded-lg border border-black/10 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-950/70">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{log.log_date}</p>
                <h3 className="mt-1 font-bold">{log.hobby.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{log.duration_minutes} min / {log.points_earned} pts</p>
                {log.notes ? <p className="mt-1 text-sm text-slate-500">{log.notes}</p> : null}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setEditingLogId(log.id); setLogForm(logFormFrom(log)); }} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-slate-800">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => deleteLog.mutate(log.id, { onSuccess: resetLogForm })} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 dark:border-red-900/60">
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
