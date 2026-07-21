'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BarChart3, Bike, BookOpen, BookHeart, CalendarCheck, Film, HeartPulse, House, IndianRupee, LogOut, Settings, SquareCheckBig } from 'lucide-react';
import { useAuth, useLogout } from '@/hooks/use-auth';

const navItems = [
  { href: '/today', label: 'Today', icon: CalendarCheck },
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/tracker', label: 'Tracker', icon: SquareCheckBig },
  { href: '/money', label: 'Money', icon: IndianRupee },
  { href: '/lifestyle', label: 'Lifestyle', icon: HeartPulse },
  { href: '/reels', label: 'Reels Vault', icon: Film },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/learning', label: 'Learning', icon: BookOpen },
  { href: '/reflections', label: 'Reflections', icon: BookHeart },
  { href: '/hobbies', label: 'Hobbies', icon: Bike },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const primaryMobileItems = navItems.slice(0, 5);
const secondaryMobileItems = navItems.slice(5);

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const logout = useLogout();

  useEffect(() => {
    if (auth.error || (!auth.isLoading && !auth.data)) {
      router.replace('/login');
    }
  }, [auth.data, auth.error, auth.isLoading, router]);

  if (auth.isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading your dashboard...</div>;
  }

  if (auth.error || !auth.data) {
    return null;
  }

  async function handleLogout() {
    await logout.mutateAsync();
    router.push('/login');
  }

  const currentItem = navItems.find((item) => item.href === pathname) ?? navItems[0];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#ecfeff_45%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_25%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#020617_100%)]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/85 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/85 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">FixMe</p>
            <h1 className="truncate text-lg font-black">{currentItem.label}</h1>
          </div>
          <button onClick={handleLogout} className="tap-target inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-3 py-4 mobile-bottom-safe lg:px-4 lg:py-6 lg:pb-6 lg:flex-row">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 overflow-y-auto rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70 lg:block">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">FixMe</p>
            <h1 className="mt-3 text-2xl font-black">{auth.data.name}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Health first. Momentum second. Excuses last.</p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                    pathname === item.href ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button onClick={handleLogout} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-red-300 hover:text-red-500 dark:text-slate-300">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/92 px-3 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-14px_44px_rgba(15,23,42,0.16)] backdrop-blur dark:border-white/10 dark:bg-slate-950/92 lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {primaryMobileItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'tap-target flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold transition',
                  active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-500 active:bg-slate-100 dark:text-slate-300 dark:active:bg-slate-900',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="mx-auto mt-2 flex max-w-md gap-2 overflow-x-auto pb-1">
          {secondaryMobileItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'tap-target inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold',
                  active ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200' : 'border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
