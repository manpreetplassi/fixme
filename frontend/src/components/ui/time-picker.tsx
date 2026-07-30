'use client';

import { Clock, X } from 'lucide-react';

function from24(value: string): { hour: string; minute: string; ampm: 'AM' | 'PM' } {
  if (!value) return { hour: '12', minute: '00', ampm: 'AM' };
  const [h, m] = value.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { hour: String(hour12), minute: String(m).padStart(2, '0'), ampm };
}

function to24(hour: string, minute: string, ampm: 'AM' | 'PM'): string {
  let h = Number(hour) % 12;
  if (ampm === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

interface TimePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
}

export function TimePicker({ label, value, onChange, placeholder = 'No time set', helper }: TimePickerProps) {
  const parsed = from24(value);

  function update(field: 'hour' | 'minute' | 'ampm', next: string) {
    const updated = {
      hour: parsed.hour,
      minute: parsed.minute,
      ampm: parsed.ampm,
      [field]: next,
    };
    onChange(to24(updated.hour, updated.minute, updated.ampm as 'AM' | 'PM'));
  }

  const inner = (
    <div className="mt-2">
      <div className="group flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition duration-200 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100 dark:border-slate-800 dark:bg-slate-950 dark:focus-within:ring-cyan-950/60">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-200">
          <Clock className="h-4 w-4" />
        </span>
        <select
          value={value ? parsed.hour : ''}
          onChange={(event) => update('hour', event.target.value || '12')}
          className="h-10 w-20 rounded-xl border border-slate-200 bg-transparent px-3 text-center text-sm font-bold text-slate-950 outline-none transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-900"
          aria-label="Hour"
        >
          {!value && <option value="">Hour</option>}
          {HOURS.map((hour) => (
            <option key={hour} value={hour}>{hour}</option>
          ))}
        </select>
        <span className="text-lg font-black text-slate-400">:</span>
        <select
          value={value ? parsed.minute : ''}
          onChange={(event) => update('minute', event.target.value || '00')}
          className="h-10 w-24 rounded-xl border border-slate-200 bg-transparent px-3 text-center text-sm font-bold text-slate-950 outline-none transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-900"
          aria-label="Minute"
        >
          {!value && <option value="">Minute</option>}
          {MINUTES.map((minute) => (
            <option key={minute} value={minute}>{minute}</option>
          ))}
        </select>
        <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
          {(['AM', 'PM'] as const).map((ampm) => (
            <button
              key={ampm}
              type="button"
              onClick={() => update('ampm', ampm)}
              className={
                value && parsed.ampm === ampm
                  ? 'rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white shadow-sm transition dark:bg-white dark:text-slate-950'
                  : 'rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }
            >
              {ampm}
            </button>
          ))}
        </div>
        {!value ? <span className="px-2 text-xs font-semibold text-slate-400">{placeholder}</span> : null}
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Clear time"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {helper ? <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{helper}</p> : null}
    </div>
  );

  if (!label) return inner;

  return (
    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
      {label}
      {inner}
    </label>
  );
}
