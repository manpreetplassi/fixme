'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/hooks/use-auth';

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState('demo@fixme.app');
  const [password, setPassword] = useState('Demo@123');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login.mutateAsync({ email, password });
    router.push('/dashboard');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">FixMe</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">Sign in to your streak board</h1>
      </div>
      <label className="block text-sm font-medium">
        Email
        <input className="mt-2 w-full rounded-2xl border bg-transparent px-4 py-3 outline-none" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input type="password" className="mt-2 w-full rounded-2xl border bg-transparent px-4 py-3 outline-none" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <button className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-600" disabled={login.isPending}>
        {login.isPending ? 'Signing in...' : 'Sign in'}
      </button>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Need an account? <Link className="font-semibold text-emerald-600" href="/register">Create one</Link>
      </p>
    </form>
  );
}
