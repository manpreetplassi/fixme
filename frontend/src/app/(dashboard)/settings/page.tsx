'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { getProfile, updateGoals, updateProfile } from '@/lib/api/users';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({
    name: '',
    email: '',
    bio: '',
    wake_target: '',
    sleep_target: '',
    exercise_minutes_target: '',
    daily_zomato_avoidance_savings: '',
    weekly_reward_threshold: '',
    preferred_hobbies: '',
  });

  useEffect(() => {
    void getProfile()
      .then((profile) => {
        setForm({
          name: profile.name ?? '',
          email: profile.email ?? '',
          bio: profile.bio ?? '',
          wake_target: profile.wake_target ?? '',
          sleep_target: profile.sleep_target ?? '',
          exercise_minutes_target: String(profile.exercise_minutes_target ?? ''),
          daily_zomato_avoidance_savings: String(profile.daily_zomato_avoidance_savings ?? ''),
          weekly_reward_threshold: String(profile.weekly_reward_threshold ?? ''),
          preferred_hobbies: (profile.preferred_hobbies ?? []).join(', '),
        });
      })
      .catch(() => {
        setMessage('Could not load profile settings.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updateProfile({
        name: form.name,
        email: form.email,
        bio: form.bio,
        preferred_hobbies: form.preferred_hobbies
          .split(',')
          .map((hobby) => hobby.trim())
          .filter(Boolean),
      });
      await updateGoals({
        wake_target: form.wake_target,
        sleep_target: form.sleep_target,
        exercise_minutes_target: Number(form.exercise_minutes_target || 0),
        daily_zomato_avoidance_savings: Number(form.daily_zomato_avoidance_savings || 0),
        weekly_reward_threshold: Number(form.weekly_reward_threshold || 0),
      });
      setMessage('Settings saved.');
    } catch {
      setMessage('Could not save settings.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Keep your profile and goals aligned with the habits you are trying to build." />
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
        {isLoading ? <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">Loading settings...</p> : null}
        {message ? <p className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">{message}</p> : null}
        {[
          ['name', 'Name'],
          ['email', 'Email'],
          ['bio', 'Bio'],
          ['wake_target', 'Wake Target'],
          ['sleep_target', 'Sleep Target'],
          ['exercise_minutes_target', 'Exercise Minutes'],
          ['daily_zomato_avoidance_savings', 'Daily Savings Target'],
          ['weekly_reward_threshold', 'Reward Threshold'],
          ['preferred_hobbies', 'Preferred Hobbies'],
        ].map(([key, label]) => (
          <label key={key} className="block text-sm font-medium">
            {label}
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800"
              value={form[key] ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              disabled={isLoading || isSaving}
            />
          </label>
        ))}
        <button disabled={isLoading || isSaving} className="rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
          {isSaving ? 'Saving...' : 'Save settings'}
        </button>
      </form>
    </div>
  );
}
