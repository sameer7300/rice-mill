import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Eye, EyeOff, Edit3, RefreshCw } from 'lucide-react';
import Modal from '../components/ui/Modal';
import PageHeader, { ActionButton, FormField, inputCls } from '../components/ui/PageHeader';
import { TableSkeleton } from '../components/ui/Skeleton';
import { formatDate } from '../utils/export';
import PageTransition from '../components/PageTransition';
import ImageUpload from '../components/ui/ImageUpload';

export default function DashboardBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<any>(null);
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', coverImage: '', isPublished: false });
  const inp = (f: string, v: any) => setForm(p => ({ ...p, [f]: v }));

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    api.get('/blog/admin/all').then(r => setPosts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openNew = () => { setForm({ title: '', excerpt: '', content: '', coverImage: '', isPublished: false }); setShowModal({}); };
  const openEdit = (p: any) => { setForm({ title: p.title, excerpt: p.excerpt || '', content: p.content, coverImage: p.coverImage || '', isPublished: p.isPublished }); setShowModal(p); };

  const savePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (showModal?.id) {
        await api.put(`/blog/${showModal.id}`, form);
        toast.success('Post updated!');
      } else {
        await api.post('/blog', form);
        toast.success('Post created!');
      }
      setShowModal(null);
      fetchPosts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving post');
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await api.delete(`/blog/${id}`);
    toast.success('Deleted');
    fetchPosts();
  };

  return (
    <PageTransition>
    <div className="space-y-5">
      <PageHeader
        title="Blog"
        subtitle={`${posts.length} posts`}
        actions={
          <>
            <button onClick={fetchPosts} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200"><RefreshCw size={16} /></button>
            <ActionButton onClick={openNew} icon={<Plus size={15} />} label="New Post" />
          </>
        }
      />

      {loading ? <TableSkeleton rows={5} cols={5} /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Title', 'Excerpt', 'Published', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-gray-900 max-w-xs truncate">{p.title}</td>
                  <td className="px-5 py-3.5 text-gray-500 max-w-xs truncate">{p.excerpt || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(p.publishedAt || p.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={14} /></button>
                      <button onClick={() => deletePost(p.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No posts yet. Create your first blog post.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal !== null && (
        <Modal title={showModal?.id ? 'Edit Post' : 'New Blog Post'} onClose={() => setShowModal(null)} size="xl">
          <form onSubmit={savePost} className="space-y-4">
            <FormField label="Title" required>
              <input type="text" value={form.title} onChange={e => inp('title', e.target.value)} required className={inputCls} placeholder="Rice harvest season 2025..." />
            </FormField>
            <FormField label="Excerpt">
              <input type="text" value={form.excerpt} onChange={e => inp('excerpt', e.target.value)} className={inputCls} placeholder="Short description for listing page" />
            </FormField>
            <ImageUpload
              value={form.coverImage}
              onChange={url => inp('coverImage', url)}
              label="Cover Image"
              hint="Shown at the top of the blog post and in the blog listing"
            />
            <FormField label="Content" required>
              <textarea value={form.content} onChange={e => inp('content', e.target.value)} required rows={10}
                className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500`}
                placeholder="Write your post content here..." />
            </FormField>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pub" checked={form.isPublished} onChange={e => inp('isPublished', e.target.checked)} className="w-4 h-4 accent-green-600" />
              <label htmlFor="pub" className="text-sm font-medium text-gray-700">Published (visible on public blog)</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Save Post</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}
