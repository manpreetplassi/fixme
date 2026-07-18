'use client';

import { FormEvent, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useCreateLearningLog, useLearningLogs } from '@/hooks/use-learning-logs';

export default function LearningPage() {
  const logs = useLearningLogs();
  const createLog = useCreateLearningLog();
  const [title, setTitle] = useState('');
  const [keyNotes, setKeyNotes] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createLog.mutateAsync({ title, key_notes: keyNotes });
    setTitle('');
    setKeyNotes('');
  }

  return (
    <div>
      <PageHeader title="Learning Logs" subtitle="Capture work learnings while they are fresh and make them reusable for future you." />
      <form onSubmit={handleSubmit} className="mb-6 grid gap-4 rounded-[2rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-slate-950/60">
        <input className="rounded-2xl border bg-transparent px-4 py-3" placeholder="What did you learn?" value={title} onChange={(event) => setTitle(event.target.value)} />
        <textarea className="min-h-28 rounded-2xl border bg-transparent px-4 py-3" placeholder="Key notes" value={keyNotes} onChange={(event) => setKeyNotes(event.target.value)} />
        <button className="rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-white">{createLog.isPending ? 'Saving...' : 'Add Log'}</button>
      </form>
      <div className="grid gap-4">
        {(logs.data?.data ?? []).map((log: { id: string; title: string; key_notes: string; created_at: string }) => (
          <article key={log.id} className="rounded-[2rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-slate-950/60">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{new Date(log.created_at).toLocaleDateString()}</p>
            <h2 className="mt-2 text-xl font-bold">{log.title}</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{log.key_notes}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
