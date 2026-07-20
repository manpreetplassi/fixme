'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BarChart3, Bike, BookOpen, BookHeart, CalendarCheck, Film, HeartPulse, House, IndianRupee, LogOut, Settings, SquareCheckBig } from 'lucide-react';
import { useAuth, useLogout } from '@/hooks/use-auth';

const navItems = [
  { href: '/today', label: 'Today', icon: CalendarCheck },
  { href: '/lifestyle', label: 'Lifestyle', icon: HeartPulse },
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/tracker', label: 'Tracker', icon: SquareCheckBig },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/reels', label: 'Reels Vault', icon: Film },
  { href: '/learning', label: 'Learning', icon: BookOpen },
  { href: '/reflections', label: 'Reflections', icon: BookHeart },
  { href: '/money', label: 'Money', icon: IndianRupee },
  { href: '/hobbies', label: 'Hobbies', icon: Bike },
  { href: '/settings', label: 'Settings', icon: Settings },
];

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#ecfeff_45%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_25%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#020617_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="w-full rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70 lg:w-72">
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
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
