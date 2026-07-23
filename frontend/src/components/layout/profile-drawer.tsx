'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { TimePicker } from '@/components/ui/time-picker';
import { getProfile, updateGoals, updateProfile } from '@/lib/api/users';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
  userName: string;
}

export function ProfileDrawer({ open, onClose, userName }: ProfileDrawerProps) {
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
    addiction_label: '',
  });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
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
          addiction_label: profile.addiction_label ?? 'addiction',
        });
      })
      .finally(() => setIsLoading(false));
  }, [open]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await updateProfile({
        name: form.name,
        email: form.email,
        bio: form.bio,
        preferred_hobbies: form.preferred_hobbies.split(',').map((h) => h.trim()).filter(Boolean),
        addiction_label: form.addiction_label.trim() || 'addiction',
      });
      await updateGoals({
        wake_target: form.wake_target,
        sleep_target: form.sleep_target,
        exercise_minutes_target: Number(form.exercise_minutes_target || 0),
        daily_zomato_avoidance_savings: Number(form.daily_zomato_avoidance_savings || 0),
        weekly_reward_threshold: Number(form.weekly_reward_threshold || 0),
      });
      setMessage('Saved.');
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage('Could not save.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!open) return null;

  const initials = userName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto bg-white shadow-2xl dark:bg-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">Profile</p>
          <button onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 px-6 py-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-black text-white">
            {initials}
          </div>
          <div>
            <p className="text-xl font-black">{form.name || userName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{form.email}</p>
            {form.bio ? <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{form.bio}</p> : null}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-6 pb-8">
          {isLoading ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">Loading...</p>
          ) : null}

          {message ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{message}</p>
          ) : null}

          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Personal</p>

          {([
            ['name', 'Name'],
            ['email', 'Email'],
            ['bio', 'Bio'],
            ['preferred_hobbies', 'Preferred Hobbies'],
            ['addiction_label', 'Addiction Label (private)'],
          ] as const).map(([key, label]) => (
            <label key={key} className="block text-sm font-medium">
              {label}
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-4 py-2.5 text-sm dark:border-slate-800"
                value={form[key] ?? ''}
                onChange={(e) => setForm((c) => ({ ...c, [key]: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </label>
          ))}

          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Goals</p>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium">
              Wake target
              <TimePicker value={form.wake_target} onChange={(v) => setForm((c) => ({ ...c, wake_target: v }))} />
            </label>
            <label className="block text-sm font-medium">
              Sleep target
              <TimePicker value={form.sleep_target} onChange={(v) => setForm((c) => ({ ...c, sleep_target: v }))} />
            </label>
          </div>

          {([
            ['exercise_minutes_target', 'Exercise Minutes / day'],
            ['daily_zomato_avoidance_savings', 'Daily Savings Target (₹)'],
            ['weekly_reward_threshold', 'Weekly Reward Threshold (₹)'],
          ] as const).map(([key, label]) => (
            <label key={key} className="block text-sm font-medium">
              {label}
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-4 py-2.5 text-sm dark:border-slate-800"
                value={form[key] ?? ''}
                onChange={(e) => setForm((c) => ({ ...c, [key]: e.target.value }))}
                disabled={isLoading || isSaving}
              />
            </label>
          ))}

          <button
            disabled={isLoading || isSaving}
            className="mt-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSaving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </aside>
    </>
  );
}
