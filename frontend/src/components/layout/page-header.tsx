export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="app-card mb-4 overflow-hidden p-4 sm:mb-6 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-600 sm:text-xs">FixMe Dashboard</p>
          <h1 className="mt-2 text-2xl font-black leading-tight sm:mt-3 sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-black text-white shadow-lg shadow-emerald-500/25 sm:flex">
          XP
        </div>
      </div>
    </div>
  );
}
