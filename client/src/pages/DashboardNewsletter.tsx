import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { RefreshCw, Download, ToggleLeft, ToggleRight } from 'lucide-react';
import PageHeader, { ActionButton } from '../components/ui/PageHeader';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import { TableSkeleton } from '../components/ui/Skeleton';
import { exportToCSV, formatDate } from '../utils/export';
import PageTransition from '../components/PageTransition';

const LIMIT = 25;

export default function DashboardNewsletter() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      const res = await api.get(`/newsletter/subscribers?${params}`);
      let subs = res.data.subscribers || [];
      if (search) subs = subs.filter((s: any) => s.email.toLowerCase().includes(search.toLowerCase()));
      setSubscribers(subs);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search]);

  const toggleSubscriber = async (id: string) => {
    const { data } = await api.patch(`/newsletter/${id}/toggle`);
    setSubscribers(s => s.map(sub => sub.id === id ? data : sub));
    toast.success(data.isActive ? 'Reactivated' : 'Deactivated');
  };

  const handleExport = async () => {
    const { data } = await api.get('/newsletter/subscribers?limit=10000');
    exportToCSV(
      (data.subscribers || []).map((s: any) => ({
        Email: s.email,
        'Subscribed At': formatDate(s.subscribedAt),
        Active: s.isActive ? 'Yes' : 'No'
      })),
      'newsletter-subscribers'
    );
  };

  const active = subscribers.filter(s => s.isActive).length;

  return (
    <PageTransition>
    <div className="space-y-5">
      <PageHeader
        title="Newsletter"
        subtitle={`${total} subscribers · ${active} active`}
        actions={
          <>
            <ActionButton onClick={handleExport} icon={<Download size={15} />} label="Export CSV" variant="secondary" />
            <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200"><RefreshCw size={16} /></button>
          </>
        }
      />

      <div className="flex items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Filter by email..." className="max-w-sm" />
      </div>

      {loading ? <TableSkeleton rows={8} cols={3} /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Email', 'Subscribed', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscribers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{s.email}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(s.subscribedAt)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {s.isActive ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleSubscriber(s.id)} className={`p-1.5 rounded-lg transition-colors ${s.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                      {s.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">No subscribers yet.</td></tr>
              )}
            </tbody>
          </table>
          <div className="px-3 border-t border-gray-100">
            <Pagination page={page} pages={pages} total={total} limit={LIMIT} onChange={setPage} />
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
