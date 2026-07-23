'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { deleteMyData, getDataCounts, getProfile, updateGoals, updateProfile } from '@/lib/api/users';

const CATEGORIES: { key: string; label: string; dependsOn?: string[] }[] = [
  { key: 'routine_completions', label: 'Routine completion history' },
  { key: 'routine_items', label: 'Routine items (today tasks)', dependsOn: ['routine_completions'] },
  { key: 'money_tracker', label: 'Money entries' },
  { key: 'learning_logs', label: 'Learning logs' },
  { key: 'reflections', label: 'Reflections' },
  { key: 'lifestyle_activities', label: 'Lifestyle activities' },
  { key: 'meal_entries', label: 'Meal entries' },
  { key: 'hobby_logs', label: 'Hobby logs' },
  { key: 'streaks', label: 'Streaks' },
];

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

  // delete-data state
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

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
      .catch(() => setMessage('Could not load profile settings.'))
      .finally(() => setIsLoading(false));

    void getDataCounts()
      .then(setCounts)
      .catch(() => setCounts({}))
      .finally(() => setCountsLoading(false));
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
          .map((h) => h.trim())
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

  function toggleCategory(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  // categories that are implicitly required by a selected item but not yet checked
  const impliedWarnings = CATEGORIES.filter(
    (cat) => cat.dependsOn?.some((dep) => selected.has(dep)) && !selected.has(cat.key),
  );

  async function handleDelete() {
    setDeleting(true);
    setDeleteMessage(null);
    try {
      const result = await deleteMyData([...selected]);
      const total = Object.values(result.deleted).reduce((a, b) => a + b, 0);
      setDeleteMessage(`Deleted ${total} records across ${Object.keys(result.deleted).length} categories.`);
      setSelected(new Set());
      setConfirming(false);
      // refresh counts
      const fresh = await getDataCounts();
      setCounts(fresh);
    } catch {
      setDeleteMessage('Deletion failed. Please try again.');
      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  }

  const totalSelected = [...selected].reduce((sum, key) => sum + (counts[key] ?? 0), 0);

  return (
    <div className="grid gap-6">
      <PageHeader title="Settings" subtitle="Keep your profile and goals aligned with the habits you are trying to build." />

      {/* Profile & Goals form */}
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
              onChange={(e) => setForm((c) => ({ ...c, [key]: e.target.value }))}
              disabled={isLoading || isSaving}
            />
          </label>
        ))}
        <button disabled={isLoading || isSaving} className="rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
          {isSaving ? 'Saving...' : 'Save settings'}
        </button>
      </form>

      {/* Delete My Data */}
      <div className="grid gap-4 rounded-lg border border-red-200 bg-white/80 p-6 shadow-sm dark:border-red-900/40 dark:bg-slate-950/70">
        <div>
          <p className="text-base font-semibold text-red-600 dark:text-red-400">Delete my data</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select the categories you want to permanently remove. Reels Vault is excluded. This cannot be undone.
          </p>
        </div>

        {countsLoading ? (
          <p className="text-sm text-slate-500">Loading counts...</p>
        ) : (
          <div className="grid gap-2">
            {CATEGORIES.map((cat) => (
              <label key={cat.key} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(cat.key)}
                    onChange={() => toggleCategory(cat.key)}
                    className="h-4 w-4 accent-red-500"
                  />
                  <span className="text-sm">{cat.label}</span>
                </span>
                <span className="text-xs tabular-nums text-slate-400">{counts[cat.key] ?? 0} rows</span>
              </label>
            ))}
          </div>
        )}

        {impliedWarnings.length > 0 && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
            ⚠ Deleting{' '}
            {impliedWarnings
              .flatMap((w) => w.dependsOn ?? [])
              .filter((dep) => selected.has(dep))
              .map((dep) => CATEGORIES.find((c) => c.key === dep)?.label ?? dep)
              .join(', ')}{' '}
            will leave orphaned data in{' '}
            {impliedWarnings.map((w) => w.label).join(', ')}.
          </p>
        )}

        {deleteMessage && (
          <p className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">{deleteMessage}</p>
        )}

        {!confirming ? (
          <button
            disabled={selected.size === 0 || deleting}
            onClick={() => setConfirming(true)}
            className="rounded-lg border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            Delete selected ({selected.size} {selected.size === 1 ? 'category' : 'categories'}, ~{totalSelected} rows)
          </button>
        ) : (
          <div className="grid gap-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              You are about to permanently delete ~{totalSelected} rows from {selected.size}{' '}
              {selected.size === 1 ? 'category' : 'categories'}. This cannot be undone.
            </p>
            <p className="text-sm text-red-600 dark:text-red-500">
              Categories:{' '}
              {[...selected]
                .map((k) => CATEGORIES.find((c) => c.key === k)?.label ?? k)
                .join(', ')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Yes, delete permanently'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
