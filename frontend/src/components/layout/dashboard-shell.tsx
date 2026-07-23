'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BarChart3, Bike, BookOpen, BookHeart, CalendarCheck, ChevronRight, Film, HeartPulse, House, IndianRupee, LogOut, Settings, SquareCheckBig } from 'lucide-react';
import { useAuth, useLogout } from '@/hooks/use-auth';
import { useNavVisibility } from '@/hooks/use-nav-visibility';
import { ProfileDrawer } from './profile-drawer';

export const navItems = [
  { href: '/today', label: 'Today', icon: CalendarCheck },
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/tracker', label: 'History', icon: SquareCheckBig },
  { href: '/money', label: 'Money', icon: IndianRupee },
  { href: '/lifestyle', label: 'Lifestyle', icon: HeartPulse },
  { href: '/reels', label: 'Reels Vault', icon: Film },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/learning', label: 'Learning', icon: BookOpen },
  { href: '/reflections', label: 'Reflections', icon: BookHeart },
  { href: '/hobbies', label: 'Hobbies', icon: Bike },
  // Settings is always visible — managed separately
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const logout = useLogout();
  const { isHidden, ready } = useNavVisibility();
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (auth.error || (!auth.isLoading && !auth.data)) {
      router.replace('/login');
    }
  }, [auth.data, auth.error, auth.isLoading, router]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      if (currentScrollY < 24) {
        setMobileNavVisible(true);
      } else if (Math.abs(delta) > 8) {
        setMobileNavVisible(delta < 0);
      }
      lastScrollY.current = Math.max(currentScrollY, 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (auth.isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading your dashboard...</div>;
  }

  if (auth.error || !auth.data) return null;

  async function handleLogout() {
    await logout.mutateAsync();
    router.push('/login');
  }

  // visible items for sidebar/bottom nav (hidden ones filtered out, settings always shown)
  const visibleItems = ready ? navItems.filter((item) => !isHidden(item.href)) : navItems;

  const allNavWithSettings = [...navItems, { href: '/settings', label: 'Settings', icon: Settings }];
  const currentItem = allNavWithSettings.find((item) => item.href === pathname) ?? allNavWithSettings[0];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#ecfeff_45%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_25%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#020617_100%)]">
      {/* Mobile top header */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/90 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">FixMe</p>
            <h1 className="truncate text-lg font-black">{currentItem.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setProfileOpen(true)}
              className="tap-target inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {auth.data.name.split(' ')[0]}
              <ChevronRight className="h-3 w-3" />
            </button>
            <button onClick={handleLogout} className="tap-target inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-3 py-4 mobile-bottom-safe lg:flex-row lg:px-4 lg:py-6 lg:pb-6">
        {/* Desktop sidebar */}
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 overflow-y-auto rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70 lg:block">
          {/* Clickable user block */}
          <button
            onClick={() => setProfileOpen(true)}
            className="mb-6 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-sm font-black text-white">
              {auth.data.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">FixMe</p>
              <p className="truncate font-black">{auth.data.name}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          </button>

          <nav className="space-y-1">
            {visibleItems.map((item) => {
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
            {/* Settings always visible */}
            <Link
              href="/settings"
              className={clsx(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                pathname === '/settings' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900',
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>

          <button onClick={handleLogout} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-red-300 hover:text-red-500 dark:text-slate-300">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className={clsx(
          'fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-14px_44px_rgba(15,23,42,0.16)] backdrop-blur transition-transform duration-300 ease-out dark:border-white/10 dark:bg-slate-950/90 lg:hidden',
          mobileNavVisible ? 'translate-y-0' : 'translate-y-[calc(100%+1rem)]',
        )}
      >
        <div className="flex overflow-x-auto scrollbar-none">
          {[...visibleItems, { href: '/settings', label: 'Settings', icon: Settings }].map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'tap-target flex min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-bold transition',
                  active ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500',
                )}
              >
                <Icon className={clsx('h-5 w-5', active && 'drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]')} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Profile drawer */}
      <ProfileDrawer
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        userName={auth.data.name}
      />
    </div>
  );
}
