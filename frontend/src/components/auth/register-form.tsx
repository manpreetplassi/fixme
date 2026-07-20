'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/hooks/use-auth';

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const [name, setName] = useState('FixMe User');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      await register.mutateAsync({ name: name.trim(), email: email.trim(), password });
      router.push('/today');
    } catch (err) {
      setError(readApiError(err, 'Could not create account. Please check the form.'));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Build Momentum</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">Create your FixMe account</h1>
      </div>
      <label className="block text-sm font-medium">
        Name
        <input className="mt-2 w-full rounded-2xl border bg-transparent px-4 py-3 outline-none" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="block text-sm font-medium">
        Email
        <input className="mt-2 w-full rounded-2xl border bg-transparent px-4 py-3 outline-none" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input type="password" className="mt-2 w-full rounded-2xl border bg-transparent px-4 py-3 outline-none" value={password} onChange={(event) => setPassword(event.target.value)} />
        <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400">Use 8+ chars with uppercase, lowercase, number, and special character.</span>
      </label>
      <button className="w-full rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-600" disabled={register.isPending}>
        {register.isPending ? 'Creating...' : 'Create account'}
      </button>
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Already registered? <Link className="font-semibold text-sky-600" href="/login">Sign in</Link>
      </p>
    </form>
  );
}

function readApiError(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { error?: { message?: string | string[] } } } }).response;
    const message = response?.data?.error?.message;
    return Array.isArray(message) ? message.join(', ') : message ?? fallback;
  }
  return fallback;
}
