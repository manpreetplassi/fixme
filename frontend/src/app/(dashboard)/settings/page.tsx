'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { getProfile, updateGoals, updateProfile } from '@/lib/api/users';

export default function SettingsPage() {
  const [form, setForm] = useState<Record<string, string>>({
    name: '',
    bio: '',
    wake_target: '',
    sleep_target: '',
    exercise_minutes_target: '',
    weekly_reward_threshold: '',
  });

  useEffect(() => {
    void getProfile().then((profile) => {
      setForm({
        name: profile.name ?? '',
        bio: profile.bio ?? '',
        wake_target: profile.wake_target ?? '',
        sleep_target: profile.sleep_target ?? '',
        exercise_minutes_target: String(profile.exercise_minutes_target ?? ''),
        weekly_reward_threshold: String(profile.weekly_reward_threshold ?? ''),
      });
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateProfile({ name: form.name, bio: form.bio });
    await updateGoals({
      wake_target: form.wake_target,
      sleep_target: form.sleep_target,
      exercise_minutes_target: Number(form.exercise_minutes_target),
      weekly_reward_threshold: Number(form.weekly_reward_threshold),
    });
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Keep your profile and goals aligned with the habits you are trying to build." />
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-[2rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-slate-950/60">
        {[
          ['name', 'Name'],
          ['bio', 'Bio'],
          ['wake_target', 'Wake Target'],
          ['sleep_target', 'Sleep Target'],
          ['exercise_minutes_target', 'Exercise Minutes'],
          ['weekly_reward_threshold', 'Reward Threshold'],
        ].map(([key, label]) => (
          <label key={key} className="block text-sm font-medium">
            {label}
            <input className="mt-2 w-full rounded-2xl border bg-transparent px-4 py-3" value={form[key] ?? ''} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} />
          </label>
        ))}
        <button className="rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white">Save settings</button>
      </form>
    </div>
  );
}
