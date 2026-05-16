import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Play, CheckCircle2, RefreshCw } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { MillStatusBadge } from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import SearchBar, { FilterSelect } from '../components/ui/SearchBar';
import PageHeader, { ActionButton, FormField, inputCls, selectCls } from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import { TableSkeleton } from '../components/ui/Skeleton';
import { formatDate } from '../utils/export';
import { Factory, Wheat, Package } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const LIMIT = 15;

export default function MillOperations() {
  const { t } = useTranslation();
  const [batches, setBatches] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paddyStock, setPaddyStock] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showComplete, setShowComplete] = useState<any | null>(null);
  const [form, setForm] = useState({ paddyStockId: '', inputQuantityKg: '', notes: '' });
  const [completeForm, setCompleteForm] = useState({ outputQuantityKg: '', outputGrade: 'A', pricePerKg: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set('q', search);
      if (statusFilter) params.set('status', statusFilter);
      const [b, s, p] = await Promise.all([
        api.get(`/mill?${params}`),
        api.get('/mill/stats'),
        api.get('/inventory/paddy?limit=100')
      ]);
      setBatches(b.data.batches || []);
      setTotal(b.data.total || 0);
      setPages(b.data.pages || 1);
      setStats(s.data);
      setPaddyStock(p.data.stocks?.filter((s: any) => s.quantityKg > 0) || []);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const createBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/mill', form);
      toast.success('Batch created! Paddy stock updated.');
      setShowNew(false);
      setForm({ paddyStockId: '', inputQuantityKg: '', notes: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const startBatch = async (id: string) => {
    await api.patch(`/mill/${id}/start`);
    toast.success('Milling started!');
    fetchData();
  };

  const completeBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/mill/${showComplete.id}/complete`, completeForm);
      toast.success('Batch completed! Rice stock updated.');
      setShowComplete(null);
      setCompleteForm({ outputQuantityKg: '', outputGrade: 'A', pricePerKg: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <PageTransition>
    <div className="space-y-5">
      <PageHeader
        title={t('mill.title')}
        subtitle={`${total} batches total`}
        actions={<ActionButton onClick={() => setShowNew(true)} icon={<Plus size={15} />} label={t('mill.newBatch')} />}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Wheat size={20} />} label="Pending" value={stats.pending || 0} iconBg="bg-yellow-100" iconColor="text-yellow-600" valueColor="text-yellow-700" />
        <StatCard icon={<Factory size={20} />} label="In Progress" value={stats.inProgress || 0} iconBg="bg-blue-100" iconColor="text-blue-600" valueColor="text-blue-700" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Completed" value={stats.completed || 0} iconBg="bg-green-100" iconColor="text-green-600" valueColor="text-green-700" />
        <StatCard icon={<Package size={20} />} label="Avg Yield" value={stats.avgYield ? `${stats.avgYield.toFixed(1)}%` : '—'} sub={stats.totalInput ? `${stats.totalInput.toLocaleString()}kg in → ${(stats.totalOutput || 0).toLocaleString()}kg out` : undefined} iconBg="bg-purple-100" iconColor="text-purple-600" valueColor="text-purple-700" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by batch number or variety..." className="flex-1 min-w-52" />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={[
          { value: 'pending', label: 'Pending' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' }
        ]} placeholder="All Status" />
        <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><RefreshCw size={16} /></button>
      </div>

      {/* Table */}
      {loading ? <TableSkeleton rows={8} cols={7} /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Batch Number', 'Variety', 'Paddy In', 'Rice Out', 'Yield', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {batches.map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{b.batchNumber}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{b.paddyStock?.variety || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{b.inputQuantityKg?.toLocaleString()} kg</td>
                  <td className="px-5 py-3.5 text-gray-600">{b.outputQuantityKg ? `${b.outputQuantityKg.toLocaleString()} kg` : '—'}</td>
                  <td className="px-5 py-3.5">
                    {b.yieldPercent ? (
                      <span className={`font-semibold ${b.yieldPercent >= 65 ? 'text-green-600' : b.yieldPercent >= 55 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {b.yieldPercent}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3.5"><MillStatusBadge status={b.status} /></td>
                  <td className="px-5 py-3.5">
                    {b.status === 'pending' && (
                      <button onClick={() => startBatch(b.id)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                        <Play size={12} /> Start
                      </button>
                    )}
                    {b.status === 'in_progress' && (
                      <button onClick={() => setShowComplete(b)} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium">
                        <CheckCircle2 size={12} /> Complete
                      </button>
                    )}
                    {b.status === 'completed' && (
                      <div className="text-xs text-gray-400">{formatDate(b.completedAt)}</div>
                    )}
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-gray-400">
                  <Factory size={36} className="mx-auto mb-2 opacity-30" />
                  <p>No batches found</p>
                </td></tr>
              )}
            </tbody>
          </table>
          <div className="px-3 border-t border-gray-100">
            <Pagination page={page} pages={pages} total={total} limit={LIMIT} onChange={setPage} />
          </div>
        </div>
      )}

      {/* New batch modal */}
      {showNew && (
        <Modal title={t('mill.newBatch')} onClose={() => setShowNew(false)}>
          <form onSubmit={createBatch} className="space-y-4">
            <FormField label="Select Paddy Stock" required>
              <select value={form.paddyStockId} onChange={e => setForm(f => ({ ...f, paddyStockId: e.target.value }))} required className={selectCls}>
                <option value="">Choose paddy batch...</option>
                {paddyStock.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.variety} — {p.quantityKg.toLocaleString()}kg available (Grade {p.qualityGrade})</option>
                ))}
              </select>
            </FormField>
            <FormField label="Input Quantity (kg)" required>
              <input type="number" min="1" step="0.1" value={form.inputQuantityKg} onChange={e => setForm(f => ({ ...f, inputQuantityKg: e.target.value }))} required className={inputCls} placeholder="0" />
            </FormField>
            <FormField label="Notes">
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={inputCls} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowNew(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Create Batch</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Complete batch modal */}
      {showComplete && (
        <Modal title={`Complete: ${showComplete.batchNumber}`} onClose={() => setShowComplete(null)}>
          <div className="mb-4 p-3 bg-gray-50 rounded-xl text-sm">
            <p className="text-gray-500 mb-1">Input: <strong className="text-gray-900">{showComplete.inputQuantityKg?.toLocaleString()} kg {showComplete.paddyStock?.variety}</strong></p>
            <p className="text-gray-500">Expected yield ~65%: <strong className="text-green-700">{(showComplete.inputQuantityKg * 0.65).toFixed(0)} kg</strong></p>
          </div>
          <form onSubmit={completeBatch} className="space-y-4">
            <FormField label="Rice Output (kg)" required>
              <input type="number" min="1" step="0.1" value={completeForm.outputQuantityKg} onChange={e => setCompleteForm(f => ({ ...f, outputQuantityKg: e.target.value }))} required className={inputCls} placeholder="0" />
            </FormField>
            {completeForm.outputQuantityKg && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
                <p className="text-green-700">Yield: <strong>{((parseFloat(completeForm.outputQuantityKg) / showComplete.inputQuantityKg) * 100).toFixed(1)}%</strong></p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Output Grade">
                <select value={completeForm.outputGrade} onChange={e => setCompleteForm(f => ({ ...f, outputGrade: e.target.value }))} className={selectCls}>
                  {['A', 'B', 'C'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </FormField>
              <FormField label="Selling Price/kg (PKR)">
                <input type="number" min="0" value={completeForm.pricePerKg} onChange={e => setCompleteForm(f => ({ ...f, pricePerKg: e.target.value }))} className={inputCls} placeholder="0" />
              </FormField>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowComplete(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Complete & Add to Rice Stock</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}
