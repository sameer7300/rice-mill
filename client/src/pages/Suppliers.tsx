import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import toast from 'react-hot-toast';
import { Truck, Eye, Plus, RefreshCw, Download } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import PageHeader, { ActionButton, FormField, inputCls, selectCls } from '../components/ui/PageHeader';
import { TableSkeleton } from '../components/ui/Skeleton';
import { formatPKR, formatDate, exportToCSV } from '../utils/export';
import PageTransition from '../components/PageTransition';

const LIMIT = 15;
const VARIETIES = ['Basmati', 'Super Kernel', 'IRRI-6', 'IRRI-9', 'PK-386', 'Other'];

export default function Suppliers() {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewSupplier, setViewSupplier] = useState<any>(null);
  const [showPurchase, setShowPurchase] = useState<any>(null);
  const [purchaseForm, setPurchaseForm] = useState({ variety: '', quantityKg: '', pricePerKg: '', qualityGrade: 'A', paidAmount: '', notes: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set('q', search);
      const res = await api.get(`/suppliers?${params}`);
      setSuppliers(res.data.suppliers || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search]);

  const viewDetail = async (s: any) => {
    const { data } = await api.get(`/suppliers/${s.id}`);
    setViewSupplier(data);
  };

  const submitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/suppliers/${showPurchase.id}/purchases`, purchaseForm);
      toast.success('Purchase recorded & paddy stock updated!');
      setShowPurchase(null);
      setPurchaseForm({ variety: '', quantityKg: '', pricePerKg: '', qualityGrade: 'A', paidAmount: '', notes: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const total_purchase = purchaseForm.quantityKg && purchaseForm.pricePerKg
    ? parseFloat(purchaseForm.quantityKg) * parseFloat(purchaseForm.pricePerKg)
    : 0;

  const handleExport = () => {
    exportToCSV(suppliers.map(s => ({
      'Business Name': s.businessName,
      'Owner': s.user?.name,
      'Phone': s.phone || s.user?.phone,
      'Total Purchased': s.totalPurchased || 0,
      'Total Paid': s.totalPaid || 0,
      'Outstanding': (s.totalPurchased || 0) - (s.totalPaid || 0)
    })), 'suppliers');
  };

  return (
    <PageTransition>
    <div className="space-y-5">
      <PageHeader
        title={t('suppliers.title')}
        subtitle={`${total} suppliers`}
        actions={
          <>
            <ActionButton onClick={handleExport} icon={<Download size={15} />} label="Export CSV" variant="secondary" />
            <div className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl">Add via Users → Create "Supplier"</div>
          </>
        }
      />

      <div className="flex items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or business..." className="flex-1 max-w-sm" />
        <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><RefreshCw size={16} /></button>
      </div>

      {loading ? <TableSkeleton rows={6} cols={6} /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Business', 'Owner', 'Phone', 'Total Purchased', 'Outstanding', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {suppliers.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-gray-900">{s.businessName}</td>
                  <td className="px-5 py-3.5 text-gray-600">{s.user?.name}</td>
                  <td className="px-5 py-3.5 text-gray-500">{s.phone || s.user?.phone || '—'}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-700">{formatPKR(s.totalPurchased || 0)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-medium ${(s.totalPurchased - s.totalPaid) > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                      {formatPKR((s.totalPurchased || 0) - (s.totalPaid || 0))}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.user?.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5">
                      <button onClick={() => viewDetail(s)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Eye size={15} /></button>
                      <button onClick={() => setShowPurchase(s)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Plus size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-gray-400">
                  <Truck size={36} className="mx-auto mb-2 opacity-30" />
                  <p>{t('suppliers.noSuppliers')}</p>
                </td></tr>
              )}
            </tbody>
          </table>
          <div className="px-3 border-t border-gray-100">
            <Pagination page={page} pages={pages} total={total} limit={LIMIT} onChange={setPage} />
          </div>
        </div>
      )}

      {viewSupplier && (
        <Modal title={viewSupplier.businessName} onClose={() => setViewSupplier(null)} size="lg">
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Purchased', value: formatPKR(viewSupplier.totalPurchased || 0), color: 'text-blue-600 bg-blue-50' },
                { label: 'Total Paid', value: formatPKR(viewSupplier.totalPaid || 0), color: 'text-green-600 bg-green-50' },
                { label: 'Outstanding', value: formatPKR(viewSupplier.outstanding || 0), color: 'text-orange-500 bg-orange-50' }
              ].map(m => (
                <div key={m.label} className={`p-3 rounded-xl ${m.color.split(' ')[1]}`}>
                  <p className="text-xs text-gray-500 mb-0.5">{m.label}</p>
                  <p className={`text-base font-bold ${m.color.split(' ')[0]}`}>{m.value}</p>
                </div>
              ))}
            </div>

            <div className="text-sm space-y-1.5 bg-gray-50 p-4 rounded-xl">
              <p><span className="text-gray-400 w-20 inline-block">Email:</span> {viewSupplier.user?.email}</p>
              <p><span className="text-gray-400 w-20 inline-block">Phone:</span> {viewSupplier.phone || viewSupplier.user?.phone || '—'}</p>
              <p><span className="text-gray-400 w-20 inline-block">Address:</span> {viewSupplier.address || '—'}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Purchase History ({viewSupplier.purchases?.length})</p>
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {viewSupplier.purchases?.map((p: any) => (
                  <div key={p.id} className="text-sm p-2.5 bg-gray-50 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900">{p.variety}</span>
                      <span className="text-gray-400 ml-2">{p.quantityKg?.toLocaleString()}kg</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPKR(p.totalAmount)}</p>
                      <p className="text-xs text-gray-400">{formatDate(p.receivedAt || p.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {!viewSupplier.purchases?.length && <p className="text-center text-gray-400 py-6 text-sm">No purchases yet</p>}
              </div>
            </div>

            <button onClick={() => { setShowPurchase(viewSupplier); setViewSupplier(null); }}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Record New Purchase
            </button>
          </div>
        </Modal>
      )}

      {showPurchase && (
        <Modal title={`Purchase from: ${showPurchase.businessName}`} onClose={() => setShowPurchase(null)}>
          <form onSubmit={submitPurchase} className="space-y-4">
            <FormField label="Paddy Variety" required>
              <select value={purchaseForm.variety} onChange={e => setPurchaseForm(f => ({ ...f, variety: e.target.value }))} required className={selectCls}>
                <option value="">Select variety</option>
                {VARIETIES.map(v => <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Quantity (kg)" required>
                <input type="number" min="0.1" step="0.1" value={purchaseForm.quantityKg} onChange={e => setPurchaseForm(f => ({ ...f, quantityKg: e.target.value }))} required className={inputCls} placeholder="0" />
              </FormField>
              <FormField label="Price/kg (PKR)" required>
                <input type="number" min="0" value={purchaseForm.pricePerKg} onChange={e => setPurchaseForm(f => ({ ...f, pricePerKg: e.target.value }))} required className={inputCls} placeholder="0" />
              </FormField>
              <FormField label="Quality Grade">
                <select value={purchaseForm.qualityGrade} onChange={e => setPurchaseForm(f => ({ ...f, qualityGrade: e.target.value }))} className={selectCls}>
                  {['A', 'B', 'C'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </FormField>
              <FormField label="Amount Paid (PKR)">
                <input type="number" min="0" value={purchaseForm.paidAmount} onChange={e => setPurchaseForm(f => ({ ...f, paidAmount: e.target.value }))} className={inputCls} placeholder="0" />
              </FormField>
            </div>
            {total_purchase > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-gray-500">Total Amount:</span><strong className="text-green-700">{formatPKR(total_purchase)}</strong></div>
                {purchaseForm.paidAmount && <div className="flex justify-between"><span className="text-gray-500">Outstanding:</span><strong className="text-orange-500">{formatPKR(total_purchase - parseFloat(purchaseForm.paidAmount || '0'))}</strong></div>}
              </div>
            )}
            <FormField label="Notes">
              <textarea value={purchaseForm.notes} onChange={e => setPurchaseForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={inputCls} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowPurchase(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Record & Add to Paddy Stock</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}
