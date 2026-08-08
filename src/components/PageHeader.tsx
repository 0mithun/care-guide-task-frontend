'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoLogOutOutline, IoShieldCheckmarkOutline, IoFolderOpenOutline, IoGitMergeOutline, IoGlobeOutline } from 'react-icons/io5';

export default function PageHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return null;
  const user = session.user;

  return (
    <header className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 mb-8 mt-4">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="text-lg font-bold font-mono tracking-tight text-zinc-100">
        Secure Notes
        </Link>
      </div>

      <nav className="flex items-center gap-1">
        <Link href="/dashboard" className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium font-mono transition-colors ${pathname === '/dashboard' ? 'bg-zinc-950 text-zinc-100 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-100'}`}>
          <IoFolderOpenOutline size={16} />
          <span>Notes</span>
        </Link>
        <Link href="/posts" className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium font-mono transition-colors ${pathname === '/posts' ? 'bg-zinc-950 text-zinc-100 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-100'}`}>
          <IoGlobeOutline size={16} />
          <span>Posts</span>
        </Link>
        <Link href="/interests" className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium font-mono transition-colors ${pathname === '/interests' ? 'bg-zinc-950 text-zinc-100 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-100'}`}>
          <IoGitMergeOutline size={16} />
          <span>Interests</span>
        </Link>
        {user.role === 'admin' && (
          <Link href="/users" className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium font-mono transition-colors ${pathname === '/users' ? 'bg-zinc-950 text-zinc-100 border border-zinc-800' : 'text-zinc-400 hover:text-zinc-100'}`}>
            <IoShieldCheckmarkOutline size={16} />
            <span>Users</span>
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-zinc-400">{user.username}</span>
          <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${user.role === 'admin' ? 'border-amber-900 bg-amber-950/20 text-amber-400' : 'border-zinc-800 bg-zinc-950 text-zinc-400'}`}>
            {user.role}
          </span>
        </div>
        <button
          className="p-1.5 rounded bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
          onClick={() => signOut({ callbackUrl: '/' })}
          title="Log Out"
        >
          <IoLogOutOutline size={16} />
        </button>
      </div>
    </header>
  );
}
