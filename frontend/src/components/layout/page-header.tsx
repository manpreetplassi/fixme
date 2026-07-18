export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-[0_12px_48px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
      <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">FixMe Dashboard</p>
      <h1 className="mt-3 text-3xl font-black">{title}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  );
}
