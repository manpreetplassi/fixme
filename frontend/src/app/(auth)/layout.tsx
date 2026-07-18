export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.20),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ecfeff_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),_transparent_25%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden rounded-[2rem] border border-black/10 bg-white/50 p-10 backdrop-blur lg:block dark:border-white/10 dark:bg-slate-950/40">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-600">Daily Recovery System</p>
          <h2 className="mt-6 text-5xl font-black leading-tight">Turn discipline into something visible, honest, and hard to ignore.</h2>
          <div className="mt-10 grid gap-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-3xl border bg-white/70 p-5 dark:bg-slate-900/60">Daily tracker with weighted habits and blocker-aware scoring.</div>
            <div className="rounded-3xl border bg-white/70 p-5 dark:bg-slate-900/60">Reels vault and learning logs to turn inspiration into reusable systems.</div>
            <div className="rounded-3xl border bg-white/70 p-5 dark:bg-slate-900/60">Reflections, money saved, and streaks so progress feels concrete.</div>
          </div>
        </section>
        <div className="flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
}
