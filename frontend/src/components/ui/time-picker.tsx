'use client';

/** Converts "HH:MM" (24h) → { hour12, minute, ampm } */
function from24(value: string): { hour: string; minute: string; ampm: 'AM' | 'PM' } {
  if (!value) return { hour: '12', minute: '00', ampm: 'AM' };
  const [h, m] = value.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { hour: String(hour12), minute: String(m).padStart(2, '0'), ampm };
}

/** Converts { hour12, minute, ampm } → "HH:MM" (24h) */
function to24(hour: string, minute: string, ampm: 'AM' | 'PM'): string {
  let h = Number(hour) % 12;
  if (ampm === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

interface TimePickerProps {
  label?: string;
  value: string; // "HH:MM" 24h or ""
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TimePicker({ label, value, onChange, placeholder = 'Set time' }: TimePickerProps) {
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
    <div className="mt-1 flex items-center gap-1">
      {/* Hour */}
      <select
        value={value ? parsed.hour : ''}
        onChange={(e) => update('hour', e.target.value || '12')}
        className="w-16 rounded-lg border border-slate-200 bg-transparent px-2 py-2 text-center text-sm font-semibold text-slate-950 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 dark:border-slate-800 dark:text-slate-100"
      >
        {!value && <option value="">--</option>}
        {HOURS.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>

      <span className="text-lg font-black text-slate-400">:</span>

      {/* Minute */}
      <select
        value={value ? parsed.minute : ''}
        onChange={(e) => update('minute', e.target.value || '00')}
        className="w-16 rounded-lg border border-slate-200 bg-transparent px-2 py-2 text-center text-sm font-semibold text-slate-950 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 dark:border-slate-800 dark:text-slate-100"
      >
        {!value && <option value="">--</option>}
        {MINUTES.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      {/* AM / PM toggle */}
      <div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        {(['AM', 'PM'] as const).map((ap) => (
          <button
            key={ap}
            type="button"
            onClick={() => update('ampm', ap)}
            className={
              value && parsed.ampm === ap
                ? 'bg-slate-950 px-3 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-950'
                : 'px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }
          >
            {ap}
          </button>
        ))}
      </div>

      {/* Clear */}
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-400 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
          title="Clear time"
        >
          ✕
        </button>
      ) : null}
    </div>
  );

  if (!label) return inner;

  return (
    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
      {label}
      {inner}
    </label>
  );
}
