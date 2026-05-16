import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Eye, Printer, Download, RefreshCw } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { OrderStatusBadge, PaymentBadge } from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import SearchBar, { FilterSelect } from '../components/ui/SearchBar';
import PageHeader, { ActionButton, FormField, inputCls, selectCls } from '../components/ui/PageHeader';
import { TableSkeleton } from '../components/ui/Skeleton';
import { exportToCSV, formatPKR, formatDate } from '../utils/export';
import PageTransition from '../components/PageTransition';

const LIMIT = 15;
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' }, { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' }, { value: 'cancelled', label: 'Cancelled' }
];
const PAYMENT_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid' }, { value: 'partial', label: 'Partial' }, { value: 'paid', label: 'Paid' }
];

export default function Orders() {
  const { t } = useTranslation();
  const { isStaff } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [payFilter, setPayFilter] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [riceStock, setRiceStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [newForm, setNewForm] = useState({ customerId: '', deliveryAddress: '', notes: '', items: [{ variety: '', grade: 'A', quantityKg: '', pricePerKg: '', riceStockId: '' }] });
  const payInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set('q', search);
      if (statusFilter) params.set('status', statusFilter);
      if (payFilter) params.set('paymentStatus', payFilter);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
      if (isStaff) {
        const [c, r] = await Promise.all([api.get('/customers?limit=200'), api.get('/inventory/rice?limit=200')]);
        setCustomers(c.data.customers || []);
        setRiceStock(r.data.stocks?.filter((s: any) => s.quantityKg > 0) || []);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, payFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, statusFilter, payFilter]);

  const addItem = () => setNewForm(f => ({ ...f, items: [...f.items, { variety: '', grade: 'A', quantityKg: '', pricePerKg: '', riceStockId: '' }] }));
  const removeItem = (i: number) => setNewForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }));
  const updateItem = (idx: number, field: string, value: string) => {
    setNewForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      if (field === 'riceStockId' && value) {
        const s = riceStock.find((r: any) => r.id === value);
        if (s) { items[idx].variety = s.variety; items[idx].grade = s.grade; items[idx].pricePerKg = String(s.pricePerKg); }
      }
      return { ...f, items };
    });
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/orders', newForm);
      toast.success('Order placed!');
      setShowNew(false);
      setNewForm({ customerId: '', deliveryAddress: '', notes: '', items: [{ variety: '', grade: 'A', quantityKg: '', pricePerKg: '', riceStockId: '' }] });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error placing order');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status });
    toast.success('Status updated');
    fetchData();
    if (viewOrder?.id === id) setViewOrder((v: any) => ({ ...v, status }));
  };

  const updatePayment = async (id: string) => {
    const val = payInputRef.current?.value;
    if (!val) return;
    await api.patch(`/orders/${id}/payment`, { paidAmount: val });
    toast.success('Payment recorded');
    fetchData();
    setViewOrder(null);
  };

  const totalCalc = (items: any[]) => items.reduce((s, i) => s + (parseFloat(i.quantityKg || 0) * parseFloat(i.pricePerKg || 0)), 0);

  const handleExport = () => {
    exportToCSV(orders.map(o => ({
      'Order #': o.orderNumber,
      Customer: o.customer?.user?.name || o.customer?.businessName,
      Total: o.totalAmount,
      Paid: o.paidAmount,
      Status: o.status,
      Payment: o.paymentStatus,
      Date: formatDate(o.createdAt)
    })), 'orders');
  };

  const printInvoice = (order: any) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Invoice ${order.orderNumber}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;color:#333;max-width:700px;margin:0 auto}
    h1{color:#166534;border-bottom:2px solid #166534;padding-bottom:10px}
    table{width:100%;border-collapse:collapse;margin:20px 0}
    th{background:#f0fdf4;text-align:left;padding:10px;border:1px solid #d1fae5}
    td{padding:10px;border:1px solid #e5e7eb}
    .total{font-size:18px;font-weight:bold;text-align:right;padding:10px;background:#f0fdf4}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;padding:20px;background:#f9fafb;border-radius:8px}
    @media print{.no-print{display:none}}</style></head><body>
    <h1>🌾 RICE MILL INVOICE</h1>
    <div class="meta">
      <div><strong>Invoice #:</strong> ${order.orderNumber}<br/><strong>Date:</strong> ${formatDate(order.createdAt)}<br/><strong>Status:</strong> ${order.status.toUpperCase()}</div>
      <div><strong>Customer:</strong> ${order.customer?.user?.name || order.customer?.businessName}<br/>
      <strong>Address:</strong> ${order.deliveryAddress || order.customer?.address || 'N/A'}</div>
    </div>
    <table><thead><tr><th>Variety</th><th>Grade</th><th>Qty (kg)</th><th>Price/kg</th><th>Total</th></tr></thead><tbody>
    ${(order.items || []).map((i: any) => `<tr><td>${i.variety}</td><td>Grade ${i.grade}</td><td>${i.quantityKg?.toLocaleString()}</td><td>PKR ${i.pricePerKg?.toLocaleString()}</td><td>PKR ${i.totalPrice?.toLocaleString()}</td></tr>`).join('')}
    </tbody></table>
    <div class="total">TOTAL: PKR ${order.totalAmount?.toLocaleString()}<br/>
    <span style="font-size:14px;color:#6b7280">Paid: PKR ${order.paidAmount?.toLocaleString()} · Outstanding: PKR ${(order.totalAmount - order.paidAmount)?.toLocaleString()}</span></div>
    <p style="text-align:center;color:#9ca3af;margin-top:40px">Pakistan Rice Mill Management System</p>
    <button class="no-print" onclick="window.print()" style="position:fixed;top:20px;right:20px;padding:10px 20px;background:#166534;color:white;border:none;border-radius:6px;cursor:pointer">🖨 Print</button>
    </body></html>`);
    w.document.close();
  };

  return (
    <PageTransition>
    <div className="space-y-5">
      <PageHeader
        title={t('orders.title')}
        subtitle={`${total} orders total`}
        actions={
          <>
            {isStaff && <ActionButton onClick={handleExport} icon={<Download size={15} />} label="Export CSV" variant="secondary" />}
            <ActionButton onClick={() => setShowNew(true)} icon={<Plus size={15} />} label={t('orders.newOrder')} />
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search order# or customer..." className="flex-1 min-w-52" />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} placeholder="All Status" />
        <FilterSelect value={payFilter} onChange={setPayFilter} options={PAYMENT_OPTIONS} placeholder="All Payments" />
        <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><RefreshCw size={16} /></button>
      </div>

      {/* Table — desktop */}
      {loading ? <TableSkeleton rows={8} cols={7} /> : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order #</th>
                  {isStaff && <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>}
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Outstanding</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-700 font-medium">{o.orderNumber}</td>
                    {isStaff && <td className="px-5 py-3.5 text-gray-700 font-medium">{o.customer?.user?.name}</td>}
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{formatPKR(o.totalAmount)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-medium ${o.totalAmount - o.paidAmount > 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {formatPKR(o.totalAmount - o.paidAmount)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-5 py-3.5"><PaymentBadge status={o.paymentStatus} /></td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewOrder(o)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Eye size={15} /></button>
                        <button onClick={() => printInvoice(o)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Printer size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-16 text-center text-gray-400">No orders found</td></tr>
                )}
              </tbody>
            </table>
            <div className="px-3 border-t border-gray-100">
              <Pagination page={page} pages={pages} total={total} limit={LIMIT} onChange={setPage} />
            </div>
          </div>

          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {orders.length === 0 && <p className="text-center text-gray-400 py-10">No orders found</p>}
            {orders.map((o: any) => (
              <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-mono font-bold text-sm text-gray-900">{o.orderNumber}</p>
                  <span className="text-xs text-gray-400">{formatDate(o.createdAt)}</span>
                </div>
                {isStaff && <p className="text-sm text-gray-700 font-medium mb-2">{o.customer?.user?.name || o.customer?.businessName}</p>}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <OrderStatusBadge status={o.status} />
                  <PaymentBadge status={o.paymentStatus} />
                </div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{formatPKR(o.totalAmount)}</p>
                    {o.totalAmount - o.paidAmount > 0 && (
                      <p className="text-xs text-red-500">Outstanding: {formatPKR(o.totalAmount - o.paidAmount)}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewOrder(o)} className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium transition-colors">
                      <Eye size={13} /> View
                    </button>
                    <button onClick={() => printInvoice(o)} className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg font-medium transition-colors">
                      <Printer size={13} /> Print
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Pagination page={page} pages={pages} total={total} limit={LIMIT} onChange={setPage} />
            </div>
          </div>
        </>
      )}

      {/* New order modal */}
      {showNew && (
        <Modal title={t('orders.newOrder')} onClose={() => setShowNew(false)} size="lg">
          <form onSubmit={submitOrder} className="space-y-4">
            {isStaff && (
              <FormField label="Customer" required>
                <select value={newForm.customerId} onChange={e => setNewForm(f => ({ ...f, customerId: e.target.value }))} required className={selectCls}>
                  <option value="">Select customer</option>
                  {customers.map((c: any) => <option key={c.id} value={c.id}>{c.businessName} — {c.user?.name}</option>)}
                </select>
              </FormField>
            )}
            <FormField label="Delivery Address">
              <input type="text" value={newForm.deliveryAddress} onChange={e => setNewForm(f => ({ ...f, deliveryAddress: e.target.value }))} className={inputCls} />
            </FormField>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Order Items *</label>
                <button type="button" onClick={addItem} className="text-xs text-green-600 hover:text-green-800 font-medium">+ Add Item</button>
              </div>
              {newForm.items.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-3.5 space-y-2.5 bg-gray-50">
                  {isStaff && (
                    <select value={item.riceStockId} onChange={e => updateItem(idx, 'riceStockId', e.target.value)} className={`${selectCls} bg-white`}>
                      <option value="">Select from stock (or enter manually below)</option>
                      {riceStock.map((r: any) => (
                        <option key={r.id} value={r.id}>{r.variety} — Grade {r.grade} — {r.quantityKg.toLocaleString()}kg @ PKR {r.pricePerKg}</option>
                      ))}
                    </select>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Variety *" value={item.variety} onChange={e => updateItem(idx, 'variety', e.target.value)} required className={`${inputCls} bg-white`} />
                    <select value={item.grade} onChange={e => updateItem(idx, 'grade', e.target.value)} className={`${selectCls} bg-white`}>
                      {['A', 'B', 'C'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                    </select>
                    <input type="number" placeholder="Qty (kg) *" value={item.quantityKg} onChange={e => updateItem(idx, 'quantityKg', e.target.value)} required className={`${inputCls} bg-white`} />
                    <input type="number" placeholder="Price/kg (PKR) *" value={item.pricePerKg} onChange={e => updateItem(idx, 'pricePerKg', e.target.value)} required className={`${inputCls} bg-white`} />
                  </div>
                  {item.quantityKg && item.pricePerKg && (
                    <p className="text-xs text-green-700 font-medium">Subtotal: {formatPKR(parseFloat(item.quantityKg) * parseFloat(item.pricePerKg))}</p>
                  )}
                  {idx > 0 && <button type="button" onClick={() => removeItem(idx)} className="text-xs text-red-500 hover:text-red-700">Remove</button>}
                </div>
              ))}
              <div className="flex justify-between items-center py-2 px-1 font-semibold text-gray-800">
                <span>Order Total:</span>
                <span className="text-green-700 text-lg">{formatPKR(totalCalc(newForm.items))}</span>
              </div>
            </div>

            <FormField label="Notes">
              <textarea value={newForm.notes} onChange={e => setNewForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={inputCls} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowNew(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Place Order</button>
            </div>
          </form>
        </Modal>
      )}

      {/* View order modal */}
      {viewOrder && (
        <Modal title={`Order: ${viewOrder.orderNumber}`} onClose={() => setViewOrder(null)} size="lg">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1.5">
                <p><span className="text-gray-400">Customer:</span> <strong>{viewOrder.customer?.user?.name}</strong></p>
                <p><span className="text-gray-400">Date:</span> {formatDate(viewOrder.createdAt)}</p>
                <p><span className="text-gray-400">Delivery:</span> {viewOrder.deliveryAddress || '—'}</p>
              </div>
              <div className="space-y-1.5">
                <p><span className="text-gray-400">Total:</span> <strong className="text-green-700">{formatPKR(viewOrder.totalAmount)}</strong></p>
                <p><span className="text-gray-400">Paid:</span> <strong>{formatPKR(viewOrder.paidAmount)}</strong></p>
                <p><span className="text-gray-400">Outstanding:</span> <strong className="text-red-500">{formatPKR(viewOrder.totalAmount - viewOrder.paidAmount)}</strong></p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</p>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Variety</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Grade</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Qty</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Price</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Total</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {viewOrder.items?.map((i: any) => (
                      <tr key={i.id}>
                        <td className="px-4 py-2.5 font-medium">{i.variety}</td>
                        <td className="px-4 py-2.5 text-gray-500">Grade {i.grade}</td>
                        <td className="px-4 py-2.5 text-gray-500">{i.quantityKg?.toLocaleString()} kg</td>
                        <td className="px-4 py-2.5 text-gray-500">{formatPKR(i.pricePerKg)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-green-700">{formatPKR(i.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {isStaff && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(s => (
                      <button key={s.value} onClick={() => updateStatus(viewOrder.id, s.value)}
                        className={`px-3 py-1.5 text-xs rounded-full font-medium border transition-colors ${viewOrder.status === s.value ? 'bg-green-700 text-white border-green-700' : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Record Payment</p>
                  <div className="flex gap-2">
                    <input ref={payInputRef} type="number" placeholder="Amount received (PKR)" className={`flex-1 ${inputCls}`} />
                    <button onClick={() => updatePayment(viewOrder.id)} className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm rounded-xl font-medium transition-colors">Save</button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={() => printInvoice(viewOrder)} className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                <Printer size={15} /> Print Invoice
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}
