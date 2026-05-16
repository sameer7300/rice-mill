import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Download, AlertTriangle, RefreshCw, Package } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { GradeBadge } from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import SearchBar, { FilterSelect } from '../components/ui/SearchBar';
import PageHeader, { ActionButton, FormField, inputCls, selectCls } from '../components/ui/PageHeader';
import { TableSkeleton } from '../components/ui/Skeleton';
import { exportToCSV, formatPKR, formatDate } from '../utils/export';
import PageTransition from '../components/PageTransition';

const GRADES = ['A', 'B', 'C'];
const VARIETIES = ['Basmati', 'Super Kernel', 'IRRI-6', 'IRRI-9', 'PK-386', 'Other'];
const LIMIT = 15;

export default function Inventory() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'paddy' | 'rice'>('paddy');
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [lowAlerts, setLowAlerts] = useState<any>({ paddy: [], rice: [] });
  const [form, setForm] = useState({ variety: '', quantityKg: '', qualityGrade: 'A', grade: 'A', supplierId: '', purchasePrice: '', pricePerKg: '', notes: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set('q', search);
      if (gradeFilter) params.set('grade', gradeFilter);

      const [stockRes, suppRes, invSum] = await Promise.all([
        api.get(`/inventory/${tab}?${params}`),
        api.get('/suppliers?limit=100'),
        api.get('/inventory/summary')
      ]);
      setList(stockRes.data.stocks || []);
      setTotal(stockRes.data.total || 0);
      setPages(stockRes.data.pages || 1);
      setSuppliers(suppRes.data.suppliers || []);
      setLowAlerts(invSum.data.lowStockAlerts || { paddy: [], rice: [] });
    } finally {
      setLoading(false);
    }
  }, [tab, page, search, gradeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [tab, search, gradeFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/inventory/${tab}`, form);
      toast.success('Stock entry added!');
      setShowModal(false);
      setForm({ variety: '', quantityKg: '', qualityGrade: 'A', grade: 'A', supplierId: '', purchasePrice: '', pricePerKg: '', notes: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving');
    }
  };

  const handleExport = () => {
    const rows = list.map((item: any) => ({
      Variety: item.variety,
      'Quantity (kg)': item.quantityKg,
      Grade: item.qualityGrade || item.grade,
      'Price/kg': item.purchasePrice || item.pricePerKg || 0,
      Supplier: item.supplier?.user?.name || '',
      Date: formatDate(item.receivedAt || item.createdAt)
    }));
    exportToCSV(rows, `${tab}-stock`);
  };

  const inp = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));
  const alerts = tab === 'paddy' ? lowAlerts.paddy : lowAlerts.rice;

  return (
    <PageTransition>
    <div className="space-y-5">
      <PageHeader
        title={t('inventory.title')}
        subtitle={`${total} entries — ${tab === 'paddy' ? 'paddy' : 'rice'} stock`}
        actions={
          <>
            <ActionButton onClick={handleExport} icon={<Download size={15} />} label="Export CSV" variant="secondary" />
            <ActionButton onClick={() => setShowModal(true)} icon={<Plus size={15} />} label={tab === 'paddy' ? t('inventory.addPaddy') : t('inventory.addRice')} />
          </>
        }
      />

      {/* Low stock banner */}
      {alerts.length > 0 && (
        <div className="flex items-center gap-3 p-3.5 bg-orange-50 border border-orange-200 rounded-xl text-sm">
          <AlertTriangle size={16} className="text-orange-500 flex-shrink-0" />
          <span className="text-orange-700 font-medium">{alerts.length} {tab} entries below 500kg:</span>
          <div className="flex gap-1.5 flex-wrap">
            {alerts.map((a: any) => (
              <span key={a.id} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">{a.variety} ({a.quantityKg}kg)</span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(['paddy', 'rice'] as const).map(t2 => (
            <button key={t2} onClick={() => setTab(t2)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t2 ? 'bg-white shadow text-green-700' : 'text-gray-600 hover:text-gray-900'}`}>
              {t2 === 'paddy' ? t('inventory.paddyStock') : t('inventory.riceStock')}
            </button>
          ))}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by variety..." className="flex-1 min-w-48" />
        <FilterSelect value={gradeFilter} onChange={setGradeFilter} options={GRADES.map(g => ({ value: g, label: `Grade ${g}` }))} placeholder="All Grades" />
        <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><RefreshCw size={16} /></button>
      </div>

      {/* Table — desktop / card — mobile */}
      {loading ? <TableSkeleton rows={8} cols={6} /> : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('inventory.variety')}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('inventory.quantity')}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('inventory.grade')}</th>
                  {tab === 'paddy' && <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('inventory.supplier')}</th>}
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('inventory.price')}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map((item: any) => {
                  const isLow = item.quantityKg <= 500;
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isLow ? 'bg-orange-50/40' : ''}`}>
                      <td className="px-5 py-3.5 font-medium text-gray-900">
                        {item.variety}
                        {isLow && <span className="ml-2 text-xs text-orange-500 font-normal">⚠ Low</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-semibold ${isLow ? 'text-orange-600' : 'text-gray-700'}`}>
                          {item.quantityKg?.toLocaleString()} kg
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><GradeBadge grade={item.qualityGrade || item.grade || 'A'} /></td>
                      {tab === 'paddy' && <td className="px-5 py-3.5 text-gray-600">{item.supplier?.user?.name || '—'}</td>}
                      <td className="px-5 py-3.5 text-gray-600">{formatPKR(item.purchasePrice || item.pricePerKg || 0)}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(item.receivedAt || item.createdAt)}</td>
                    </tr>
                  );
                })}
                {list.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                    <Package size={36} className="mx-auto mb-2 opacity-30" />
                    <p>No stock entries found</p>
                  </td></tr>
                )}
              </tbody>
            </table>
            <div className="px-3 border-t border-gray-100">
              <Pagination page={page} pages={pages} total={total} limit={LIMIT} onChange={setPage} />
            </div>
          </div>

          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {list.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Package size={36} className="mx-auto mb-2 opacity-30" />
                <p>No stock entries found</p>
              </div>
            )}
            {list.map((item: any) => {
              const isLow = item.quantityKg <= 500;
              return (
                <div key={item.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${isLow ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{item.variety}</p>
                      <p className="text-xs text-gray-400">{formatDate(item.receivedAt || item.createdAt)}</p>
                    </div>
                    <GradeBadge grade={item.qualityGrade || item.grade || 'A'} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-lg font-bold ${isLow ? 'text-orange-600' : 'text-green-700'}`}>
                        {item.quantityKg?.toLocaleString()} kg
                        {isLow && <span className="text-xs font-normal ml-1 text-orange-500">⚠ Low Stock</span>}
                      </p>
                      <p className="text-sm text-gray-500">{formatPKR(item.purchasePrice || item.pricePerKg || 0)}/kg</p>
                    </div>
                    {tab === 'paddy' && item.supplier?.user?.name && (
                      <p className="text-xs text-gray-500 text-right">{item.supplier.user.name}</p>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="pt-2">
              <Pagination page={page} pages={pages} total={total} limit={LIMIT} onChange={setPage} />
            </div>
          </div>
        </>
      )}

      {showModal && (
        <Modal title={tab === 'paddy' ? t('inventory.addPaddy') : t('inventory.addRice')} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Variety" required>
              <select value={form.variety} onChange={e => inp('variety', e.target.value)} required className={selectCls}>
                <option value="">Select variety</option>
                {VARIETIES.map(v => <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Quantity (kg)" required>
                <input type="number" min="0.1" step="0.1" value={form.quantityKg} onChange={e => inp('quantityKg', e.target.value)} required className={inputCls} placeholder="0" />
              </FormField>
              <FormField label="Grade">
                <select value={tab === 'paddy' ? form.qualityGrade : form.grade} onChange={e => inp(tab === 'paddy' ? 'qualityGrade' : 'grade', e.target.value)} className={selectCls}>
                  {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label={`${tab === 'paddy' ? 'Purchase' : 'Selling'} Price / kg (PKR)`}>
              <input type="number" min="0" value={tab === 'paddy' ? form.purchasePrice : form.pricePerKg} onChange={e => inp(tab === 'paddy' ? 'purchasePrice' : 'pricePerKg', e.target.value)} className={inputCls} placeholder="0" />
            </FormField>
            {tab === 'paddy' && (
              <FormField label="Supplier">
                <select value={form.supplierId} onChange={e => inp('supplierId', e.target.value)} className={selectCls}>
                  <option value="">No supplier</option>
                  {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.businessName}</option>)}
                </select>
              </FormField>
            )}
            <FormField label="Notes">
              <textarea value={form.notes} onChange={e => inp('notes', e.target.value)} rows={2} className={inputCls} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}
