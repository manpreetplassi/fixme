'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { deleteMyData, getDataCounts } from '@/lib/api/users';
import { navItems } from '@/components/layout/dashboard-shell';
import { useNavVisibility } from '@/hooks/use-nav-visibility';

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
  const { hidden, toggle } = useNavVisibility();

  // delete-data state
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  useEffect(() => {
    void getDataCounts()
      .then(setCounts)
      .catch(() => setCounts({}))
      .finally(() => setCountsLoading(false));
  }, []);

  function toggleCategory(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const impliedWarnings = CATEGORIES.filter(
    (cat) => cat.dependsOn?.some((dep) => selected.has(dep)) && !selected.has(cat.key),
  );

  async function handleDelete() {
    setDeleting(true);
    setDeleteMessage(null);
    try {
      const result = await deleteMyData(Array.from(selected));
      const total = Object.values(result.deleted).reduce((a, b) => a + b, 0);
      setDeleteMessage(`Deleted ${total} records across ${Object.keys(result.deleted).length} categories.`);
      setSelected(new Set());
      setConfirming(false);
      const fresh = await getDataCounts();
      setCounts(fresh);
    } catch {
      setDeleteMessage('Deletion failed. Please try again.');
      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  }

  const selectedCategories = Array.from(selected);
  const totalSelected = selectedCategories.reduce((sum, key) => sum + (counts[key] ?? 0), 0);

  return (
    <div className="grid gap-6">
      <PageHeader title="Settings" subtitle="Manage your navigation, data, and app preferences." />

      {/* Nav visibility */}
      <div className="grid gap-4 rounded-lg border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
        <div>
          <p className="text-base font-semibold">Navigation tabs</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Hide tabs you don&apos;t use. Hidden tabs are still accessible from Settings. Changes are saved locally on this device.
          </p>
        </div>
        <div className="grid gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const visible = !hidden.has(item.href);
            return (
              <div
                key={item.href}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${visible ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${visible ? '' : 'text-slate-400 line-through dark:text-slate-600'}`}>
                    {item.label}
                  </span>
                </div>
                <button
                  onClick={() => toggle(item.href)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    visible
                      ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900'
                  }`}
                >
                  {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {visible ? 'Visible' : 'Hidden'}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-600">Settings tab is always visible and cannot be hidden.</p>
      </div>

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
                  <input type="checkbox" checked={selected.has(cat.key)} onChange={() => toggleCategory(cat.key)} className="h-4 w-4 accent-red-500" />
                  <span className="text-sm">{cat.label}</span>
                </span>
                <span className="text-xs tabular-nums text-slate-400">{counts[cat.key] ?? 0} rows</span>
              </label>
            ))}
          </div>
        )}

        {impliedWarnings.length > 0 && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
            Warning: Deleting{' '}
            {impliedWarnings.flatMap((w) => w.dependsOn ?? []).filter((dep) => selected.has(dep)).map((dep) => CATEGORIES.find((c) => c.key === dep)?.label ?? dep).join(', ')}{' '}
            will leave orphaned data in {impliedWarnings.map((w) => w.label).join(', ')}.
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
              Categories: {selectedCategories.map((k) => CATEGORIES.find((c) => c.key === k)?.label ?? k).join(', ')}
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting} className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {deleting ? 'Deleting...' : 'Yes, delete permanently'}
              </button>
              <button onClick={() => setConfirming(false)} disabled={deleting} className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
