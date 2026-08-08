'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageHeader from '../../components/PageHeader';
import Spinner from '../../components/Spinner';
import { apiService } from '../../services/api';
import { IoGitMergeOutline, IoPersonOutline } from 'react-icons/io5';

interface UserItem {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface InterestGroup {
  _id: string;
  users: UserItem[];
}

export default function InterestsBoard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const [interests, setInterests] = useState<InterestGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchInterests = useCallback(async () => {
    if (!session?.user?.token) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await apiService.users.groupByInterests(session.user.token);
      setInterests(data.groupedUsers || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to retrieve interests boards');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInterests();
    }
  }, [status, fetchInterests]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <PageHeader />
      {errorMsg && (
        <div className="bg-red-950/20 border border-red-900 text-red-400 text-xs font-mono p-3 rounded mb-6">
          [ERR] {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : interests.length === 0 ? (
        <div className="border border-zinc-800 bg-zinc-900/50 rounded-md p-12 text-center text-zinc-400 font-mono text-xs">
          No active interest contexts returned from aggregation index scan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interests.map(group => (
            <div key={group._id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-md flex flex-col gap-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold font-mono tracking-tight text-zinc-100 capitalize">{group._id}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                  Users: {group.users.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {group.users.map(user => (
                  <div key={user._id} className="bg-zinc-950 border border-zinc-850 rounded p-3 flex items-center gap-3 hover:border-zinc-800 transition-colors">
                    <IoPersonOutline size={12} className="text-zinc-500 flex-shrink-0" />
                    <div className="flex flex-col min-w-0 flex-grow">
                      <span className="text-xs font-mono font-semibold text-zinc-200 truncate">{user.username}</span>
                      <span className="text-[10px] font-mono text-zinc-500 truncate">{user.email}</span>
                    </div>
                    <span className={`text-[9px] font-mono uppercase px-1 py-0.2 rounded border flex-shrink-0 ${user.role === 'admin' ? 'border-amber-900/50 bg-amber-950/20 text-amber-500' : 'border-zinc-800 bg-zinc-900 text-zinc-400'}`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
