import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { MessageCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import PageHeader, { ActionButton } from '../components/ui/PageHeader';
import Pagination from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import { formatDate } from '../utils/export';
import PageTransition from '../components/PageTransition';

const LIMIT = 20;
const SUBJECT_COLOR: Record<string, string> = {
  'Order Inquiry': 'bg-blue-100 text-blue-700',
  'Product Information': 'bg-green-100 text-green-700',
  'Wholesale / Bulk Order': 'bg-purple-100 text-purple-700',
  'Complaint': 'bg-red-100 text-red-600',
  'Other': 'bg-gray-100 text-gray-600',
};

export default function DashboardMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMsg, setViewMsg] = useState<any>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (unreadOnly) params.set('unreadOnly', 'true');
      const { data } = await api.get(`/contact/admin?${params}`);
      setMessages(data.messages || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setUnreadCount(data.unreadCount || 0);
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);
  useEffect(() => { setPage(1); }, [unreadOnly]);

  const markRead = async (msg: any) => {
    if (!msg.isRead) {
      await api.patch(`/contact/admin/${msg.id}/read`);
      setMessages(m => m.map(x => x.id === msg.id ? { ...x, isRead: true } : x));
      setUnreadCount(c => Math.max(0, c - 1));
    }
    setViewMsg({ ...msg, isRead: true });
  };

  return (
    <PageTransition>
    <div className="space-y-5">
      <PageHeader
        title={`Messages 💬 ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        subtitle="Contact form submissions from customers"
        actions={
          <>
            <button onClick={() => setUnreadOnly(u => !u)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-sm font-medium transition-colors ${unreadOnly ? 'bg-green-700 text-white border-green-700' : 'border-gray-200 text-gray-600 hover:border-green-400'}`}>
              {unreadOnly ? <EyeOff size={14} /> : <Eye size={14} />}
              {unreadOnly ? 'Showing unread' : 'All messages'}
            </button>
            <button onClick={fetchMessages} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200"><RefreshCw size={16} /></button>
          </>
        }
      />

      {loading ? <TableSkeleton rows={8} cols={5} /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['', 'Name', 'Email / Phone', 'Subject', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {messages.map(m => (
                <tr key={m.id} className={`hover:bg-gray-50 transition-colors cursor-pointer ${!m.isRead ? 'bg-blue-50/30' : ''}`} onClick={() => markRead(m)}>
                  <td className="px-4 py-3.5 w-5">
                    {!m.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full block" />}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className={`font-medium ${!m.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{m.name}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-gray-600 text-xs">{m.email}</p>
                    {m.phone && <p className="text-gray-400 text-xs">{m.phone}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SUBJECT_COLOR[m.subject] || 'bg-gray-100 text-gray-600'}`}>{m.subject}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(m.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                  <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No messages {unreadOnly ? 'unread' : 'yet'}.</p>
                </td></tr>
              )}
            </tbody>
          </table>
          <div className="px-3 border-t border-gray-100">
            <Pagination page={page} pages={pages} total={total} limit={LIMIT} onChange={setPage} />
          </div>
        </div>
      )}

      {viewMsg && (
        <Modal title={`Message from ${viewMsg.name}`} onClose={() => setViewMsg(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">Name</p><p className="font-medium text-gray-900">{viewMsg.name}</p></div>
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">Email</p><a href={`mailto:${viewMsg.email}`} className="font-medium text-green-600 hover:underline">{viewMsg.email}</a></div>
              {viewMsg.phone && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">Phone</p><a href={`tel:${viewMsg.phone}`} className="font-medium text-green-600 hover:underline">{viewMsg.phone}</a></div>}
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">Date</p><p className="font-medium text-gray-700">{formatDate(viewMsg.createdAt)}</p></div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Subject</p>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SUBJECT_COLOR[viewMsg.subject] || 'bg-gray-100 text-gray-600'}`}>{viewMsg.subject}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">Message</p>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{viewMsg.message}</p>
            </div>
            <div className="flex gap-3">
              <a href={`mailto:${viewMsg.email}?subject=Re: ${viewMsg.subject}`}
                className="flex-1 text-center py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-semibold transition-colors">Reply via Email</a>
              {viewMsg.phone && (
                <a href={`https://wa.me/${viewMsg.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                  className="flex-1 text-center py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors">Reply on WhatsApp</a>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}
