'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageHeader from '../../components/PageHeader';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { apiService } from '../../services/api';
import { IUser } from '../../types';
import { IoAddOutline, IoCreateOutline, IoTrashOutline, IoPeopleOutline, IoReaderOutline, IoGlobeOutline } from 'react-icons/io5';

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [users, setUsers] = useState<IUser[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [interestsInput, setInterestsInput] = useState('');
  const [userModalLoading, setUserModalLoading] = useState(false);
  const [userModalError, setUserModalError] = useState('');

  const limit = 10;

  const fetchUsers = useCallback(async (pageNum: number) => {
    if (!session?.user?.token) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await apiService.users.list(pageNum, limit, session.user.token);
      setUsers(data.users || []);
      setTotalUsers(data.totalNotes || data.totalUsers || 0);
      setUserTotalPages(data.totalPages || 1);
      setUserPage(data.page || 1);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to retrieve user directory');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchUsers(userPage);
    }
  }, [status, session, userPage, fetchUsers]);

  if (status === 'loading' || status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const redirectToNotesArchive = (user: IUser) => {
    const id = user.id || user._id || '';
    router.push(`/dashboard?ownerId=${id}&username=${user.username}`);
  };

  const redirectToPostsArchive = (user: IUser) => {
    const id = user.id || user._id || '';
    router.push(`/posts?authorId=${id}&username=${user.username}`);
  };

  const openCreateUserModal = () => {
    setUserModalMode('create');
    setSelectedUser(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('user');
    setInterestsInput('');
    setUserModalError('');
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (user: IUser) => {
    setUserModalMode('edit');
    setSelectedUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setInterestsInput(user.interests ? user.interests.join(', ') : '');
    setUserModalError('');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token) return;
    setUserModalLoading(true);
    setUserModalError('');

    const interests = interestsInput
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const body: any = { username, email, role, interests };
    if (password) body.password = password;

    try {
      if (userModalMode === 'create') {
        if (!password) {
          setUserModalError('Password is required for new users');
          setUserModalLoading(false);
          return;
        }
        await apiService.users.create(body, session.user.token);
      } else if (userModalMode === 'edit' && selectedUser) {
        await apiService.users.update(selectedUser.id || selectedUser._id || '', body, session.user.token);
      }
      setIsUserModalOpen(false);
      fetchUsers(userPage);
    } catch (err: any) {
      setUserModalError(err.message || 'Failed to save user info');
    } finally {
      setUserModalLoading(false);
    }
  };

  const handleDeleteUser = async (user: IUser) => {
    if (!session?.user?.token) return;
    const targetId = user.id || user._id;
    if (targetId === session.user.id) {
      alert('Forbidden operation: self-deletion of currently authenticated account.');
      return;
    }
    if (!confirm(`Confirm account deletion for user "${user.username}"?`)) return;

    try {
      await apiService.users.delete(targetId || '', session.user.token);
      const newPage = (users.length === 1 && userPage > 1) ? userPage - 1 : userPage;
      setUserPage(newPage);
      fetchUsers(newPage);
    } catch (err: any) {
      alert(err.message || 'Account deletion rejected');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <PageHeader />
      {errorMsg && (
        <div className="bg-red-950/20 border border-red-900 text-red-400 text-xs font-mono p-3 rounded mb-6">
          [ERR] {errorMsg}
        </div>
      )}

      <main className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold font-mono text-zinc-100 flex items-center gap-2">
              <IoPeopleOutline size={16} className="text-indigo-400" />
              <span>User Lists</span>
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                Total: {totalUsers}
              </span>
            </h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-mono text-xs transition-colors font-semibold border border-indigo-700 shadow-md" onClick={openCreateUserModal}>
              <IoAddOutline size={16} />
              <span>Add User</span>
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center"><Spinner /></div>
          ) : (
            <>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="py-3 px-4 font-semibold text-zinc-400">Username</th>
                      <th className="py-3 px-4 font-semibold text-zinc-400">Email</th>
                      <th className="py-3 px-4 font-semibold text-zinc-400">Role</th>
                      <th className="py-3 px-4 font-semibold text-zinc-400">Interests</th>
                      <th className="py-3 px-4 font-semibold text-zinc-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id || user._id} className="border-b border-zinc-800/50 hover:bg-zinc-950/20 transition-colors">
                        <td className="py-3 px-4 font-semibold text-zinc-100">
                          <span className="text-zinc-100 font-semibold">{user.username}</span>
                        </td>
                        <td className="py-3 px-4 text-zinc-300">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${user.role === 'admin' ? 'border-amber-900 bg-amber-950/20 text-amber-400' : 'border-zinc-800 bg-zinc-950 text-zinc-400'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {user.interests && user.interests.map((int, idx) => (
                              <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-400">{int}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button className="p-1 rounded bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-indigo-400 transition-colors" onClick={() => openEditUserModal(user)} title="Edit User">
                              <IoCreateOutline size={14} />
                            </button>
                            <button className="p-1 rounded bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-green-400 transition-colors" onClick={() => redirectToNotesArchive(user)} title="View User Notes Page">
                              <IoReaderOutline size={14} />
                            </button>
                            <button className="p-1 rounded bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-blue-400 transition-colors" onClick={() => redirectToPostsArchive(user)} title="View User Posts Page">
                              <IoGlobeOutline size={14} />
                            </button>
                            <button className="p-1 rounded bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors" onClick={() => handleDeleteUser(user)} title="Remove User">
                              <IoTrashOutline size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Users Pagination */}
              {userTotalPages > 1 && (
                <div className="flex justify-center items-center gap-4 border-t border-zinc-800 pt-6">
                  <button
                    className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded font-mono text-xs text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    onClick={() => setUserPage(p => Math.max(p - 1, 1))}
                    disabled={userPage === 1}
                  >
                    &lt; Previous
                  </button>
                  <span className="font-mono text-xs text-zinc-500">
                    Page {userPage} of {userTotalPages}
                  </span>
                  <button
                    className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded font-mono text-xs text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    onClick={() => setUserPage(p => Math.min(p + 1, userTotalPages))}
                    disabled={userPage === userTotalPages}
                  >
                    Next &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={userModalMode === 'create' ? 'Create New User' : 'Edit User Settings'}
      >
        <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
          {userModalError && (
            <div className="bg-red-950/20 border border-red-955 text-red-400 text-xs font-mono p-2 rounded">
              [ERR] {userModalError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-zinc-400">Username</label>
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
            <label className="text-xs font-mono text-zinc-400">Email Address</label>
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
            <label className="text-xs font-mono text-zinc-400">
              {userModalMode === 'create' ? 'Password' : 'Password (leave blank to retain current)'}
            </label>
            <input
              type="password"
              className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-700 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required={userModalMode === 'create'}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-zinc-400">Role</label>
            <select
              className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-700 outline-none appearance-none cursor-pointer"
              value={role}
              onChange={e => setRole(e.target.value as 'user' | 'admin')}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-zinc-400">Interests (comma separated)</label>
            <input
              type="text"
              className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-700 outline-none"
              placeholder="coding, chess, security"
              value={interestsInput}
              onChange={e => setInterestsInput(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4 mt-2">
            <button type="button" className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded font-mono text-xs text-zinc-400 transition-colors" onClick={() => setIsUserModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-mono text-xs transition-colors flex items-center justify-center gap-1.5" disabled={userModalLoading}>
              {userModalLoading ? <Spinner size="sm" /> : 'Save User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
