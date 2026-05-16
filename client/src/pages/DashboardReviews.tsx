import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Trash2, Star, RefreshCw, Shield } from 'lucide-react';
import Modal from '../components/ui/Modal';
import PageHeader, { ActionButton, FormField, inputCls } from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Pagination from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';
import { formatDate } from '../utils/export';
import PageTransition from '../components/PageTransition';

const STATUS_TABS = [
  { id: 'pending', label: 'Pending', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { id: 'approved', label: 'Approved', color: 'text-green-600 bg-green-50 border-green-200' },
  { id: 'rejected', label: 'Rejected', color: 'text-red-600 bg-red-50 border-red-200' },
  { id: '', label: 'All', color: 'text-gray-600 bg-gray-50 border-gray-200' },
];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

const LIMIT = 20;

export default function DashboardReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (statusTab) params.set('status', statusTab);
      const { data } = await api.get(`/reviews/admin/all?${params}`);
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setStats(data.stats || {});
    } finally {
      setLoading(false);
    }
  }, [page, statusTab]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  useEffect(() => { setPage(1); setSelected(new Set()); }, [statusTab]);

  const approve = async (id: string) => {
    await api.patch(`/reviews/admin/${id}/approve`);
    toast.success('Review approved!');
    fetchReviews();
  };

  const reject = async () => {
    if (!rejectModal) return;
    await api.patch(`/reviews/admin/${rejectModal.id}/reject`, { adminNote: rejectNote });
    toast.success('Review rejected');
    setRejectModal(null);
    setRejectNote('');
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    await api.delete(`/reviews/admin/${id}`);
    toast.success('Deleted');
    fetchReviews();
  };

  const bulkApprove = async () => {
    const ids = Array.from(selected);
    await Promise.all(ids.map(id => api.patch(`/reviews/admin/${id}/approve`)));
    toast.success(`${ids.length} reviews approved!`);
    setSelected(new Set());
    fetchReviews();
  };

  const toggleSelect = (id: string) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <PageTransition>
    <div className="space-y-5">
      <PageHeader
        title="Reviews ⭐"
        subtitle="Moderate customer product reviews"
        actions={
          <>
            {selected.size > 0 && statusTab === 'pending' && (
              <ActionButton onClick={bulkApprove} icon={<CheckCircle2 size={15} />} label={`Approve ${selected.size} selected`} />
            )}
            <button onClick={fetchReviews} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200"><RefreshCw size={16} /></button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Star size={20} />} label="Pending" value={stats.pending || 0} iconBg="bg-yellow-100" iconColor="text-yellow-600" valueColor="text-yellow-700" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Approved" value={stats.approved || 0} iconBg="bg-green-100" iconColor="text-green-600" valueColor="text-green-700" />
        <StatCard icon={<XCircle size={20} />} label="Rejected" value={stats.rejected || 0} iconBg="bg-red-100" iconColor="text-red-500" valueColor="text-red-600" />
        <StatCard icon={<Shield size={20} />} label="Total" value={stats.total || 0} iconBg="bg-blue-100" iconColor="text-blue-600" valueColor="text-blue-700" />
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(t => (
          <button key={t.id} onClick={() => setStatusTab(t.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${statusTab === t.id ? t.color : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <TableSkeleton rows={8} cols={7} /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {statusTab === 'pending' && <th className="px-4 py-3 w-10"></th>}
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Comment</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  {statusTab === 'pending' && (
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} className="w-4 h-4 accent-green-600" />
                    </td>
                  )}
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900 text-sm truncate max-w-32">{r.product?.name}</div>
                    <div className="text-xs text-gray-400">{r.product?.variety}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-gray-700 text-sm">{r.user?.name}</div>
                    <div className="text-xs text-gray-400">{r.user?.email}</div>
                    {r.verifiedPurchase && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">✓ Verified</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <StarDisplay rating={r.rating} />
                    <span className="text-xs text-gray-400">{r.rating}/5</span>
                  </td>
                  <td className="px-5 py-3.5 max-w-48">
                    <p className="text-gray-600 text-xs line-clamp-2">{r.comment || <span className="text-gray-400 italic">No comment</span>}</p>
                    {r.reportCount > 0 && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">{r.reportCount} reports</span>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(r.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {r.status !== 'approved' && (
                        <button onClick={() => approve(r.id)} title="Approve"
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <CheckCircle2 size={15} />
                        </button>
                      )}
                      {r.status !== 'rejected' && (
                        <button onClick={() => { setRejectModal(r); setRejectNote(''); }} title="Reject"
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <XCircle size={15} />
                        </button>
                      )}
                      <button onClick={() => deleteReview(r.id)} title="Delete"
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan={statusTab === 'pending' ? 8 : 7} className="px-5 py-12 text-center text-gray-400">
                  No {statusTab || ''} reviews found.
                </td></tr>
              )}
            </tbody>
          </table>
          <div className="px-3 border-t border-gray-100">
            <Pagination page={page} pages={pages} total={total} limit={LIMIT} onChange={setPage} />
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <Modal title="Reject Review" onClose={() => setRejectModal(null)}>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl text-sm">
              <p className="font-medium text-gray-800">{rejectModal.product?.name}</p>
              <StarDisplay rating={rejectModal.rating} />
              {rejectModal.comment && <p className="text-gray-600 mt-1">{rejectModal.comment}</p>}
            </div>
            <FormField label="Reason for rejection (shown to customer)">
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={3}
                placeholder="e.g. Contains inappropriate language"
                className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500`} />
            </FormField>
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={reject} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold">Reject Review</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}
