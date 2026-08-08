'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageHeader from '../../components/PageHeader';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { apiService } from '../../services/api';
import { IPost } from '../../types';
import { IoAddOutline, IoCreateOutline, IoTrashOutline, IoPersonOutline, IoCloseCircleOutline } from 'react-icons/io5';

export default function PostsFeed() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [filterUser, setFilterUser] = useState<{ id: string; username: string } | null>(null);

  const [posts, setPosts] = useState<IPost[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);

  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const limit = 10;
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authorId = params.get('authorId');
      const username = params.get('username');
      if (authorId && username) {
        setFilterUser({ id: authorId, username });
      } else {
        setFilterUser(null);
      }
    }
  }, [status]);

  const fetchPosts = useCallback(async (pageNum: number, filter: { id: string; username: string } | null) => {
    if (!session?.user?.token) return;
    setLoading(true);
    setErrorMsg('');
    try {
      if (filter) {
        const data = await apiService.users.getUserPosts(filter.id, session.user.token);
        setPosts(data.user?.posts || []);
        setTotalPosts(data.user?.posts?.length || 0);
        setTotalPages(1);
      } else {
        const data = await apiService.posts.list(session.user.token, pageNum, limit);
        setPosts(data.posts || []);
        setTotalPosts(data.totalPosts || 0);
        setTotalPages(data.totalPages || 1);
        setPage(data.page || 1);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to retrieve public posts');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPosts(page, filterUser);
    }
  }, [status, page, filterUser, fetchPosts]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const checkCanModify = (post: IPost) => {
    const authorVal = post.author;
    if (!authorVal) return false;

    if (typeof authorVal === 'string') {
      return authorVal === session.user.id;
    }
    return authorVal._id === session.user.id || authorVal.id === session.user.id;
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedPost(null);
    setPostTitle('');
    setPostContent('');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (post: IPost) => {
    setModalMode('edit');
    setSelectedPost(post);
    setPostTitle(post.title);
    setPostContent(post.content);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token) return;
    setModalLoading(true);
    setModalError('');

    if (!postTitle || !postContent) {
      setModalError('Title and content are required fields');
      setModalLoading(false);
      return;
    }

    try {
      if (modalMode === 'create') {
        await apiService.posts.create(postTitle, postContent, session.user.token);
      } else if (modalMode === 'edit' && selectedPost) {
        await apiService.posts.update(selectedPost._id, postTitle, postContent, session.user.token);
      }
      setIsModalOpen(false);
      fetchPosts(page, filterUser);
    } catch (err: any) {
      setModalError(err.message || 'Operation rejected by database');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeletePost = async (post: IPost) => {
    if (!session?.user?.token) return;
    if (!confirm('Are you sure you want to delete this public post?')) return;
    try {
      await apiService.posts.delete(post._id, session.user.token);
      fetchPosts(page, filterUser);
    } catch (err: any) {
      alert(err.message || 'Delete operation rejected');
    }
  };

  const handleFilterByUser = (author: any) => {
    if (!author) return;
    const id = typeof author === 'string' ? author : (author._id || author.id);
    const username = typeof author === 'object' && author ? author.username : 'unknown';

    router.push(`/posts?authorId=${id}&username=${username}`);
    setFilterUser({ id, username });
  };

  const handleClearFilter = () => {
    router.push('/posts');
    setFilterUser(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <PageHeader />

      <main className="w-full flex flex-col gap-6">

        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-bold font-mono tracking-tight text-zinc-100">&gt; Public Posts</h2>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-mono text-xs transition-colors font-semibold border border-indigo-700 shadow-md"
          >
            <IoAddOutline size={16} />
            <span>Create Post</span>
          </button>
        </div>

        {filterUser && (
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-300">
            <span className="flex items-center gap-2">
              <span className="text-indigo-400 font-semibold">&gt; filtering_by_author:</span>
              <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-200">
                {filterUser.username}
              </span>
            </span>
            <button
              onClick={handleClearFilter}
              className="flex items-center gap-1 text-indigo-400 hover:text-red-400 transition-colors font-semibold focus:outline-none"
            >
              <IoCloseCircleOutline size={16} />
              <span>Clear filter</span>
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-950/20 border border-red-900 text-red-400 text-xs font-mono p-3 rounded">
            [ERR] {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="border border-zinc-800 bg-zinc-900/50 rounded-md p-12 text-center flex flex-col items-center justify-center gap-4">
            <p className="font-mono text-xs text-zinc-400">No  posts available.</p>
            {filterUser ? (
              <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 rounded font-mono text-xs transition-colors" onClick={handleClearFilter}>
                show_all_posts
              </button>
            ) : (
              <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 rounded font-mono text-xs transition-colors" onClick={openCreateModal}>
                Create First Post
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => {
                const canModify = checkCanModify(post);
                const authorUsername = typeof post.author === 'object' && post.author ? post.author.username : 'unknown';

                return (
                  <article key={post._id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-md flex flex-col justify-between gap-4 shadow-sm hover:border-zinc-700 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <h3 className="text-sm font-semibold font-mono text-zinc-100 break-words">{post.title}</h3>
                      </div>

                      {canModify && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            className="text-zinc-500 hover:text-zinc-200 transition-colors p-1"
                            onClick={() => openEditModal(post)}
                            title="Edit Post"
                          >
                            <IoCreateOutline size={15} />
                          </button>
                          <button
                            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                            onClick={() => handleDeletePost(post)}
                            title="Delete Post"
                          >
                            <IoTrashOutline size={15} />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs font-sans text-zinc-400 break-words flex-grow line-clamp-4 leading-relaxed">{post.content}</p>

                    <div className="flex flex-col gap-1 border-t border-zinc-800/40 pt-3 mt-1">
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <IoPersonOutline size={10} className="text-indigo-500" />
                        <button
                          onClick={() => handleFilterByUser(post.author)}
                          className="text-indigo-400 hover:text-indigo-300 hover:underline text-left font-mono font-semibold"
                        >
                          by: {authorUsername}
                        </button>
                      </div>
                      <time className="text-[10px] font-mono text-zinc-500">
                        Date: {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </time>
                    </div>
                  </article>
                );
              })}
            </div>

            {!filterUser && totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 border-t border-zinc-800 pt-6">
                <button
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded font-mono text-xs text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                >
                  &lt; Previous
                </button>
                <span className="font-mono text-xs text-zinc-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded font-mono text-xs text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next &gt;
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create Public Post' : 'Edit Public Post'}
      >
        <form onSubmit={handleSavePost} className="flex flex-col gap-4">
          {modalError && (
            <div className="bg-red-950/20 border border-red-900 text-red-400 text-xs font-mono p-2 rounded">
              [ERR] {modalError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-zinc-400">Title</label>
            <input
              type="text"
              className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-700 outline-none"
              placeholder="Enter title"
              value={postTitle}
              onChange={e => setPostTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-zinc-400">Content</label>
            <textarea
              className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-sans text-xs focus:border-zinc-700 outline-none resize-vertical"
              placeholder="Write your public post content..."
              rows={6}
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4 mt-2">
            <button type="button" className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-855 border border-zinc-800 rounded font-mono text-xs text-zinc-400 transition-colors" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-mono text-xs transition-colors flex items-center justify-center gap-1.5 font-semibold" disabled={modalLoading}>
              {modalLoading ? <Spinner size="sm" /> : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
