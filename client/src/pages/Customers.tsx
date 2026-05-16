import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import toast from 'react-hot-toast';
import { Users, Eye, TrendingUp, RefreshCw, Download } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { OrderStatusBadge } from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import PageHeader, { ActionButton, FormField, inputCls } from '../components/ui/PageHeader';
import { TableSkeleton } from '../components/ui/Skeleton';
import { formatPKR, formatDate, exportToCSV } from '../utils/export';
import PageTransition from '../components/PageTransition';

const LIMIT = 15;

export default function Customers() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewCustomer, setViewCustomer] = useState<any>(null);
  const [editCreditLimit, setEditCreditLimit] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set('q', search);
      const res = await api.get(`/customers?${params}`);
      setCustomers(res.data.customers || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search]);

  const viewDetail = async (c: any) => {
    const { data } = await api.get(`/customers/${c.id}`);
    setViewCustomer(data);
    setEditCreditLimit(String(data.creditLimit || 0));
  };

  const saveCreditLimit = async () => {
    try {
      await api.put(`/customers/${viewCustomer.id}`, {
        businessName: viewCustomer.businessName,
        address: viewCustomer.address,
        contactPerson: viewCustomer.contactPerson,
        phone: viewCustomer.phone,
        creditLimit: editCreditLimit
      });
      toast.success('Credit limit updated');
      setViewCustomer((v: any) => ({ ...v, creditLimit: parseFloat(editCreditLimit) }));
      fetchData();
    } catch {
      toast.error('Error updating');
    }
  };

  const handleExport = () => {
    exportToCSV(customers.map(c => ({
      'Business Name': c.businessName,
      'Owner': c.user?.name,
      'Email': c.user?.email,
      'Phone': c.phone || c.user?.phone,
      'Outstanding': c.outstanding || 0,
      'Credit Limit': c.creditLimit || 0
    })), 'customers');
  };

  return (
    <PageTransition>
    <div className="space-y-5">
      <PageHeader
        title={t('customers.title')}
        subtitle={`${total} customers`}
        actions={
          <>
            <ActionButton onClick={handleExport} icon={<Download size={15} />} label="Export CSV" variant="secondary" />
            <div className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl">Add via Users → Create "Customer"</div>
          </>
        }
      />

      <div className="flex items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, business, phone..." className="flex-1 max-w-sm" />
        <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><RefreshCw size={16} /></button>
      </div>

      {loading ? <TableSkeleton rows={6} cols={6} /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Business', 'Owner', 'Phone', 'Credit Limit', 'Outstanding', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-gray-900">{c.businessName}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{c.user?.name}</td>
                  <td className="px-5 py-3.5 text-gray-500">{c.phone || c.user?.phone || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{c.creditLimit > 0 ? formatPKR(c.creditLimit) : '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-medium ${c.outstanding > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {formatPKR(c.outstanding || 0)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.user?.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => viewDetail(c)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-gray-400">
                  <Users size={36} className="mx-auto mb-2 opacity-30" />
                  <p>{t('customers.noCustomers')}</p>
                </td></tr>
              )}
            </tbody>
          </table>
          <div className="px-3 border-t border-gray-100">
            <Pagination page={page} pages={pages} total={total} limit={LIMIT} onChange={setPage} />
          </div>
        </div>
      )}

      {viewCustomer && (
        <Modal title={viewCustomer.businessName} onClose={() => setViewCustomer(null)} size="lg">
          <div className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Revenue', value: formatPKR(viewCustomer.totalRevenue || 0), color: 'text-green-600 bg-green-50' },
                { label: 'Total Paid', value: formatPKR(viewCustomer.totalPaid || 0), color: 'text-blue-600 bg-blue-50' },
                { label: 'Outstanding', value: formatPKR(viewCustomer.outstanding || 0), color: 'text-red-500 bg-red-50' },
                { label: 'Orders', value: viewCustomer.orders?.length || 0, color: 'text-purple-600 bg-purple-50' }
              ].map(m => (
                <div key={m.label} className={`p-3 rounded-xl ${m.color.split(' ')[1]}`}>
                  <p className="text-xs text-gray-500 mb-0.5">{m.label}</p>
                  <p className={`text-lg font-bold ${m.color.split(' ')[0]}`}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="text-sm space-y-2 bg-gray-50 p-4 rounded-xl">
              <p><span className="text-gray-400 w-24 inline-block">Email:</span> {viewCustomer.user?.email}</p>
              <p><span className="text-gray-400 w-24 inline-block">Phone:</span> {viewCustomer.phone || viewCustomer.user?.phone || '—'}</p>
              <p><span className="text-gray-400 w-24 inline-block">Address:</span> {viewCustomer.address || '—'}</p>
            </div>

            {/* Credit limit editor */}
            <div className="flex items-center gap-3">
              <FormField label="Credit Limit (PKR)">
                <input type="number" value={editCreditLimit} onChange={e => setEditCreditLimit(e.target.value)} className={inputCls} />
              </FormField>
              <button onClick={saveCreditLimit} className="mt-6 px-4 py-2.5 bg-green-700 text-white text-sm rounded-xl font-medium hover:bg-green-800 transition-colors">Update</button>
            </div>

            {/* Order history */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Order History ({viewCustomer.orders?.length})</p>
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {viewCustomer.orders?.map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between text-sm p-2.5 bg-gray-50 rounded-xl">
                    <span className="font-mono text-xs text-gray-600">{o.orderNumber}</span>
                    <span className="font-medium text-gray-900">{formatPKR(o.totalAmount)}</span>
                    <OrderStatusBadge status={o.status} />
                    <span className="text-gray-400 text-xs">{formatDate(o.createdAt)}</span>
                  </div>
                ))}
                {!viewCustomer.orders?.length && <p className="text-center text-gray-400 py-6 text-sm">No orders yet</p>}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}
