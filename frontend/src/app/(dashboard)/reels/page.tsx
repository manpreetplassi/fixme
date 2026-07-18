'use client';

import { FormEvent, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useReels, useSaveReel } from '@/hooks/use-reels-vault';

export default function ReelsPage() {
  const reels = useReels();
  const saveReel = useSaveReel();
  const [reelUrl, setReelUrl] = useState('');
  const [userNotes, setUserNotes] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveReel.mutateAsync({ reel_url: reelUrl, user_notes: userNotes });
    setReelUrl('');
    setUserNotes('');
  }

  return (
    <div>
      <PageHeader title="Reels Vault" subtitle="Save useful reels once, then turn them into repeatable actions instead of endless scrolling." />
      <form onSubmit={handleSubmit} className="mb-6 grid gap-4 rounded-[2rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-slate-950/60">
        <input className="rounded-2xl border bg-transparent px-4 py-3" placeholder="Instagram reel URL" value={reelUrl} onChange={(event) => setReelUrl(event.target.value)} />
        <textarea className="min-h-28 rounded-2xl border bg-transparent px-4 py-3" placeholder="What makes this worth saving?" value={userNotes} onChange={(event) => setUserNotes(event.target.value)} />
        <button className="rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white">{saveReel.isPending ? 'Saving...' : 'Save Reel'}</button>
      </form>
      <div className="grid gap-4 lg:grid-cols-2">
        {(reels.data?.data ?? []).map((reel: { id: string; title: string; description: string; ai_analysis?: { howItHelpsYou?: string } }) => (
          <article key={reel.id} className="rounded-[2rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-slate-950/60">
            <h2 className="text-xl font-bold">{reel.title}</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{reel.description}</p>
            <p className="mt-4 text-sm font-medium text-emerald-600">{reel.ai_analysis?.howItHelpsYou ?? 'AI summary will appear here.'}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
