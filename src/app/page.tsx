'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiService } from '../services/api';
import Spinner from '../components/Spinner';

export default function AuthPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [interestsInput, setInterestsInput] = useState('');

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-zinc-400">
        <Spinner size="lg" />
        <p className="font-mono text-xs">Restoring Session...</p>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!email || !password) {
      setErrorMsg('Required parameters email and password are missing');
      setLoading(false);
      return;
    }

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (res?.error) {
        setErrorMsg(res.error || 'Authentication rejected: invalid credentials');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!username || !email || !password) {
      setErrorMsg('Required field(s) username, email, or password missing');
      setLoading(false);
      return;
    }

    const interests = interestsInput
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    try {
      await apiService.register({
        username,
        email,
        password,
        role: 'user',
        interests
      });

      setSuccessMsg('User registered successfully. Initiating login...');

      const loginRes = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (loginRes?.error) {
        setErrorMsg('Registration complete. Auto-login failed: please sign in manually.');
        setActiveTab('login');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration rejected by backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-md shadow-2xl flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-mono tracking-tight text-zinc-100">My Note App</h2>
        </div>

        <div className="flex border-b border-zinc-800">
          <button
            className={`flex-1 pb-2 text-center font-mono text-xs font-semibold border-b-2 transition-colors ${activeTab === 'login' ? 'border-indigo-500 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
          >
            Sign In
          </button>
          <button
            className={`flex-1 pb-2 text-center font-mono text-xs font-semibold border-b-2 transition-colors ${activeTab === 'register' ? 'border-indigo-500 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-950/20 border border-red-900 text-red-400 text-xs font-mono p-3 rounded">
            [ERR] {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-950/20 border border-green-900 text-green-400 text-xs font-mono p-3 rounded">
            [OK] {successMsg}
          </div>
        )}

        {activeTab === 'login' ? (
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-zinc-400 font-semibold">Email Address</label>
              <input
                type="email"
                className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-700 outline-none"
                placeholder="mail@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-zinc-400 font-semibold">Password</label>
              <input
                type="password"
                className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-700 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold py-2.5 rounded transition-colors flex items-center justify-center gap-2 mt-2" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleRegister}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-zinc-400 font-semibold">Username</label>
              <input
                type="text"
                className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-700 outline-none"
                placeholder="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-zinc-400 font-semibold">Email Address</label>
              <input
                type="email"
                className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-700 outline-none"
                placeholder="user@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-zinc-400 font-semibold">Password</label>
              <input
                type="password"
                className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-700 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-zinc-400 font-semibold">Interests (comma separated)</label>
              <input
                type="text"
                className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-700 outline-none"
                placeholder="security, databases, compiler"
                value={interestsInput}
                onChange={e => setInterestsInput(e.target.value)}
              />
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold py-2.5 rounded transition-colors flex items-center justify-center gap-2 mt-2" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Register'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
