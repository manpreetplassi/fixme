'use client';

import { Check, X } from 'lucide-react';
import { PendingAction } from '@/lib/api/chat';

function describeAction(action: PendingAction) {
  const payload = action.payload ?? {};
  if (action.type === 'money_entry_create') {
    const amount = payload.amount ? `₹${payload.amount}` : 'an unpriced entry';
    const category = payload.category ? ` — ${payload.category}` : '';
    const reason = payload.reason ?? payload.name ?? 'money entry';
    return `Add ${amount}${category} — ${reason}`;
  }
  if (action.type === 'money_entry_update') return `Update money entry ${payload.id ?? ''}`.trim();
  if (action.type === 'money_entry_delete') return `Delete money entry ${payload.id ?? ''}`.trim();
  if (action.type === 'routine_item_create') return `Create routine item — ${payload.title ?? 'Untitled'}`;
  if (action.type === 'routine_item_update') return `Update routine item ${payload.id ?? ''}`.trim();
  if (action.type === 'routine_item_mark_done') return `Mark routine item ${payload.item_id ?? ''} as ${payload.status ?? 'done'}`.trim();
  return 'Review proposed change';
}

export function PendingActionCard({
  action,
  confirmed,
  onConfirm,
  onCancel,
}: {
  action: PendingAction;
  confirmed?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (confirmed) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
        <span className="font-bold">Saved</span>
        <span className="ml-2">{describeAction(action)}</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-amber-500 px-2 py-1 text-xs font-bold text-white">Pending</span>
        <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">{describeAction(action)}</p>
      </div>
      <pre className="mt-2 max-h-36 overflow-auto rounded bg-white/70 p-2 text-xs text-slate-700 dark:bg-slate-950/70 dark:text-slate-200">{JSON.stringify(action.payload, null, 2)}</pre>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onConfirm} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-600">
          <Check className="h-4 w-4" />
          Confirm
        </button>
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-white dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}
