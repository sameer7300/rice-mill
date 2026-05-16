import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Eye, EyeOff, Settings, Tag, BarChart3, ShoppingBag, ExternalLink, RefreshCw, Globe, Package, Edit3, Send, CheckCircle2, Mail } from 'lucide-react';
import Modal from '../components/ui/Modal';
import StatCard from '../components/ui/StatCard';
import { TableSkeleton } from '../components/ui/Skeleton';
import PageHeader, { ActionButton, FormField, inputCls, selectCls } from '../components/ui/PageHeader';
import { formatPKR, formatDate } from '../utils/export';
import { OrderStatusBadge } from '../components/ui/Badge';
import PageTransition from '../components/PageTransition';

const TABS = ['overview', 'products', 'discounts', 'email', 'settings'] as const;
type Tab = typeof TABS[number];

export default function Ecommerce() {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>({});
  const [products, setProducts] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [riceStock, setRiceStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProduct, setShowProduct] = useState<any>(null); // null=closed, {}=new, {...}=edit
  const [showDiscount, setShowDiscount] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', variety: '', grade: 'A', description: '', imageUrl: '', pricePerKg: '', minOrderKg: '10', isPublished: false, inStock: true, riceStockId: '', sortOrder: '0' });
  const [discountForm, setDiscountForm] = useState({ code: '', description: '', type: 'percentage', value: '', minOrderAmt: '0', usageLimit: '0', expiresAt: '', isActive: true });
  const [savingSettings, setSavingSettings] = useState(false);
  const [testEmailSending, setTES] = useState(false);
  // Email tab state
  const [emailForm, setEF] = useState({
    to: '', name: '', template: 'welcome', subject: 'Rice Price Update from Al-Noor Rice Mills',
    htmlContent: '<p>Dear Valued Customer,</p><p>We have exciting news about our latest harvest...</p>', testMode: true
  });
  const [blastForm, setBF] = useState({
    subject: 'Rice Price Update from Al-Noor Rice Mills',
    htmlContent: '<p>Dear Valued Customer,</p><p>We have exciting news about our latest harvest and current prices...</p><p>Contact us: +92-946-123456</p>',
    testMode: true
  });
  const [emailSending, setES] = useState(false);
  const [blastSending, setBS] = useState(false);
  const [subscriberCount, setSC] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p, d, st, rs] = await Promise.all([
        api.get('/ecommerce/stats'),
        api.get('/ecommerce/products'),
        api.get('/ecommerce/discounts'),
        api.get('/ecommerce/settings'),
        api.get('/inventory/rice?limit=100')
      ]);
      setStats(s.data);
      setProducts(p.data);
      setDiscounts(d.data);
      setSettings(st.data);
      setRiceStock(rs.data.stocks || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (tab === 'email') {
      api.get('/newsletter/subscribers?limit=1').then(r => setSC(r.data.total || 0)).catch(() => {});
    }
  }, [tab]);

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (showProduct?.id) {
        await api.put(`/ecommerce/products/${showProduct.id}`, productForm);
        toast.success('Product updated');
      } else {
        await api.post('/ecommerce/products', productForm);
        toast.success('Product created!');
      }
      setShowProduct(null);
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/ecommerce/products/${id}`);
    toast.success('Deleted');
    fetchAll();
  };

  const toggleProduct = async (id: string, field: string) => {
    await api.patch(`/ecommerce/products/${id}/toggle`, { field });
    fetchAll();
  };

  const saveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/ecommerce/discounts', discountForm);
      toast.success('Discount code created!');
      setShowDiscount(false);
      setDiscountForm({ code: '', description: '', type: 'percentage', value: '', minOrderAmt: '0', usageLimit: '0', expiresAt: '', isActive: true });
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const deleteDiscount = async (id: string) => {
    await api.delete(`/ecommerce/discounts/${id}`);
    fetchAll();
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/ecommerce/settings', settings);
      toast.success('Store settings saved!');
    } catch { toast.error('Error saving settings'); }
    finally { setSavingSettings(false); }
  };

  const openEditProduct = (p: any) => {
    setProductForm({ name: p.name, variety: p.variety, grade: p.grade, description: p.description || '', imageUrl: p.imageUrl || '', pricePerKg: String(p.pricePerKg), minOrderKg: String(p.minOrderKg), isPublished: p.isPublished, inStock: p.inStock, riceStockId: p.riceStockId || '', sortOrder: String(p.sortOrder || 0) });
    setShowProduct(p);
  };

  return (
    <PageTransition>
    <div className="space-y-5">
      <PageHeader
        title="E-Commerce"
        subtitle="Manage your online store"
        actions={
          <>
            <a href="/" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              <Globe size={15} /> View Store <ExternalLink size={12} />
            </a>
            <button onClick={fetchAll} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200"><RefreshCw size={16} /></button>
          </>
        }
      />

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white shadow text-green-700' : 'text-gray-600 hover:text-gray-900'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<ShoppingBag size={20} />} label="Online Orders" value={stats.totalOrders || 0} sub={`${stats.monthOrders || 0} this month`} iconBg="bg-blue-100" iconColor="text-blue-600" valueColor="text-blue-700" />
            <StatCard icon={<BarChart3 size={20} />} label="Online Revenue" value={formatPKR(stats.totalRevenue || 0)} sub={`${formatPKR(stats.monthRevenue || 0)} this month`} iconBg="bg-green-100" iconColor="text-green-600" valueColor="text-green-700" />
            <StatCard icon={<Package size={20} />} label="Published Products" value={stats.publishedProducts || 0} iconBg="bg-yellow-100" iconColor="text-yellow-600" valueColor="text-yellow-700" />
            <StatCard icon={<Tag size={20} />} label="Active Discounts" value={stats.activeDiscounts || 0} iconBg="bg-purple-100" iconColor="text-purple-600" valueColor="text-purple-700" />
          </div>

          {/* Top products */}
          {stats.topProducts?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-4">Top Online Products</h2>
              <div className="space-y-3">
                {stats.topProducts.map((p: any, i: number) => (
                  <div key={p.variety} className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="flex-1 font-medium text-gray-800">{p.variety}</span>
                    <span className="text-gray-400">{(p._sum.quantityKg || 0).toFixed(0)}kg</span>
                    <span className="font-semibold text-green-700">{formatPKR(p._sum.totalPrice || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent online orders */}
          {stats.recentOrders?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Recent Online Orders</h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">From Website</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  {['Order', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentOrders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs">{o.orderNumber}</td>
                      <td className="px-5 py-3 font-medium">{o.customer?.user?.name}</td>
                      <td className="px-5 py-3 font-semibold text-green-700">{formatPKR(o.totalAmount)}</td>
                      <td className="px-5 py-3"><OrderStatusBadge status={o.status} /></td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS */}
      {tab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <ActionButton onClick={() => { setProductForm({ name: '', variety: '', grade: 'A', description: '', imageUrl: '', pricePerKg: '', minOrderKg: '10', isPublished: false, inStock: true, riceStockId: '', sortOrder: '0' }); setShowProduct({}); }} icon={<Plus size={15} />} label="Add Product" />
          </div>

          {loading ? <TableSkeleton rows={5} cols={6} /> : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100"><tr>
                  {['Product', 'Price/kg', 'Min Order', 'Stock Link', 'Published', 'In Stock', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.variety} · Grade {p.grade}</p>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-green-700">{formatPKR(p.pricePerKg)}</td>
                      <td className="px-5 py-3.5 text-gray-500">{p.minOrderKg}kg</td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{p.riceStock ? `${p.riceStock.quantityKg}kg avail.` : 'Manual'}</td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => toggleProduct(p.id, 'isPublished')} className={`w-8 h-4.5 rounded-full transition-colors ${p.isPublished ? 'bg-green-500' : 'bg-gray-200'}`} title={p.isPublished ? 'Unpublish' : 'Publish'}>
                          <span className={`block w-3.5 h-3.5 bg-white rounded-full shadow transition-transform m-0.5 ${p.isPublished ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => toggleProduct(p.id, 'inStock')} className={`w-8 h-4.5 rounded-full transition-colors ${p.inStock ? 'bg-blue-500' : 'bg-gray-200'}`}>
                          <span className={`block w-3.5 h-3.5 bg-white rounded-full shadow transition-transform m-0.5 ${p.inStock ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEditProduct(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={14} /></button>
                          <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">No products yet. Add your first product to start selling online.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DISCOUNTS */}
      {tab === 'discounts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <ActionButton onClick={() => setShowDiscount(true)} icon={<Plus size={15} />} label="New Discount Code" />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100"><tr>
                {['Code', 'Type', 'Value', 'Used', 'Min Order', 'Expires', 'Active', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {discounts.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-gray-900">{d.code}</td>
                    <td className="px-5 py-3.5"><span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full capitalize">{d.type}</span></td>
                    <td className="px-5 py-3.5 font-semibold text-green-700">{d.type === 'percentage' ? `${d.value}%` : formatPKR(d.value)}</td>
                    <td className="px-5 py-3.5 text-gray-500">{d.usedCount}{d.usageLimit > 0 ? `/${d.usageLimit}` : ''}</td>
                    <td className="px-5 py-3.5 text-gray-500">{d.minOrderAmt > 0 ? formatPKR(d.minOrderAmt) : 'None'}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{d.expiresAt ? formatDate(d.expiresAt) : 'Never'}</td>
                    <td className="px-5 py-3.5"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{d.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-5 py-3.5"><button onClick={() => deleteDiscount(d.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
                {discounts.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400">No discount codes yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EMAIL */}
      {tab === 'email' && (
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-sm text-green-800">
            <Mail size={18} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">Email System Active</p>
              <p className="text-xs text-green-600 mt-0.5">SMTP: smtp.hostinger.com:465 · From: ricemill@sameergul.com
                {subscriberCount !== null && <span> · <strong>{subscriberCount}</strong> newsletter subscribers</span>}
              </p>
            </div>
          </div>

          {/* Newsletter Blast */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Send size={16} className="text-green-600" />
              <h2 className="font-semibold text-gray-800">Newsletter Blast</h2>
              {subscriberCount !== null && <span className="ml-auto text-xs text-gray-400">{subscriberCount} subscribers</span>}
            </div>
            <div className="p-6 space-y-4">
              <FormField label="Subject *">
                <input type="text" value={blastForm.subject} onChange={e => setBF(f => ({ ...f, subject: e.target.value }))} className={inputCls} placeholder="Weekly rice price update..." />
              </FormField>
              <FormField label="Email Content (HTML supported)">
                <textarea rows={6} value={blastForm.htmlContent} onChange={e => setBF(f => ({ ...f, htmlContent: e.target.value }))}
                  className={inputCls + ' font-mono text-xs'} placeholder="<p>Your message here...</p>" />
              </FormField>
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <input type="checkbox" id="blastTest" checked={blastForm.testMode} onChange={e => setBF(f => ({ ...f, testMode: e.target.checked }))} className="w-4 h-4 accent-green-600" />
                <label htmlFor="blastTest" className="text-sm text-amber-800">
                  <span className="font-semibold">Test mode</span> — send only to ricemill@sameergul.com (not to all subscribers)
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={async () => {
                  if (!blastForm.subject || !blastForm.htmlContent) { toast.error('Fill subject and content'); return; }
                  if (!blastForm.testMode && !confirm(`Send to ALL ${subscriberCount} subscribers? This cannot be undone.`)) return;
                  setBS(true);
                  try {
                    const { data } = await api.post('/ecommerce/email/blast', blastForm);
                    toast.success(data.message);
                  } catch (err: any) { toast.error(err.response?.data?.message || 'Send failed'); }
                  finally { setBS(false); }
                }} disabled={blastSending}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
                  {blastSending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  {blastSending ? 'Sending...' : blastForm.testMode ? 'Send Test Blast' : `Blast to ${subscriberCount} Subscribers`}
                </button>
              </div>
            </div>
          </div>

          {/* Custom / Template Email */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Mail size={16} className="text-blue-600" />
              <h2 className="font-semibold text-gray-800">Send Single Email</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Recipient Email *">
                  <input type="email" value={emailForm.to} onChange={e => setEF(f => ({ ...f, to: e.target.value }))} className={inputCls} placeholder="customer@example.com" />
                </FormField>
                <FormField label="Recipient Name">
                  <input type="text" value={emailForm.name} onChange={e => setEF(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Customer Name" />
                </FormField>
              </div>
              <FormField label="Email Template">
                <select value={emailForm.template} onChange={e => setEF(f => ({ ...f, template: e.target.value }))} className={selectCls}>
                  <option value="welcome">🎉 Welcome Email</option>
                  <option value="newsletter">📧 Newsletter Welcome</option>
                  <option value="password_changed">🔒 Password Changed Alert</option>
                  <option value="contact">💬 Contact Confirmation</option>
                  <option value="custom">📝 Test Email</option>
                </select>
              </FormField>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600">
                <strong>Template preview:</strong> Selected template will use Al-Noor Rice Mills branded HTML email with green header, business details in footer, and inline CSS (works in all email clients).
              </div>
              <button onClick={async () => {
                if (!emailForm.to) { toast.error('Enter recipient email'); return; }
                setES(true);
                try {
                  const { data } = await api.post('/ecommerce/email/send', emailForm);
                  toast.success(data.message);
                  setEF(f => ({ ...f, to: '', name: '' }));
                } catch (err: any) { toast.error(err.response?.data?.message || 'Send failed'); }
                finally { setES(false); }
              }} disabled={emailSending || !emailForm.to}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
                {emailSending ? <><RefreshCw size={14} className="animate-spin" /> Sending...</> : <><Send size={14} /> Send Email</>}
              </button>
            </div>
          </div>

          {/* Quick Test */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800 flex items-center gap-2"><CheckCircle2 size={15} className="text-green-600" /> SMTP Health Check</p>
              <p className="text-xs text-gray-500 mt-0.5">Sends a test email to ricemill@sameergul.com to verify SMTP is working</p>
            </div>
            <button onClick={async () => {
              setTES(true);
              try { await api.post('/ecommerce/test-email'); toast.success('Test email sent! Check inbox.'); }
              catch (err: any) { toast.error(err.response?.data?.message || 'SMTP error'); }
              finally { setTES(false); }
            }} disabled={testEmailSending}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap">
              {testEmailSending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              {testEmailSending ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {tab === 'settings' && (
        <>
        <form onSubmit={saveSettings} className="max-w-2xl space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-800 border-b pb-3">Store Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Store Name"><input value={settings.storeName || ''} onChange={e => setSettings((s: any) => ({ ...s, storeName: e.target.value }))} className={inputCls} /></FormField>
              <FormField label="City"><input value={settings.city || ''} onChange={e => setSettings((s: any) => ({ ...s, city: e.target.value }))} className={inputCls} /></FormField>
              <FormField label="Phone Number"><input value={settings.phone || ''} onChange={e => setSettings((s: any) => ({ ...s, phone: e.target.value }))} className={inputCls} placeholder="+92-300-xxxxxxx" /></FormField>
              <FormField label="WhatsApp Number"><input value={settings.whatsappNumber || ''} onChange={e => setSettings((s: any) => ({ ...s, whatsappNumber: e.target.value }))} className={inputCls} placeholder="923001234567 (no +)" /></FormField>
              <FormField label="Email"><input type="email" value={settings.email || ''} onChange={e => setSettings((s: any) => ({ ...s, email: e.target.value }))} className={inputCls} /></FormField>
              <FormField label="Address"><input value={settings.address || ''} onChange={e => setSettings((s: any) => ({ ...s, address: e.target.value }))} className={inputCls} /></FormField>
            </div>
            <FormField label="Tagline"><input value={settings.tagline || ''} onChange={e => setSettings((s: any) => ({ ...s, tagline: e.target.value }))} className={inputCls} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Hero Title"><input value={settings.bannerTitle || ''} onChange={e => setSettings((s: any) => ({ ...s, bannerTitle: e.target.value }))} className={inputCls} /></FormField>
              <FormField label="Hero Subtitle"><input value={settings.bannerSubtitle || ''} onChange={e => setSettings((s: any) => ({ ...s, bannerSubtitle: e.target.value }))} className={inputCls} /></FormField>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-800 border-b pb-3">Shipping & Orders</h2>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Shipping Fee (PKR)"><input type="number" value={settings.shippingFee || 500} onChange={e => setSettings((s: any) => ({ ...s, shippingFee: parseFloat(e.target.value) }))} className={inputCls} /></FormField>
              <FormField label="Free Shipping Above (PKR)"><input type="number" value={settings.freeShippingAbove || 10000} onChange={e => setSettings((s: any) => ({ ...s, freeShippingAbove: parseFloat(e.target.value) }))} className={inputCls} /></FormField>
              <FormField label="Min Order (kg)"><input type="number" value={settings.minOrderKg || 10} onChange={e => setSettings((s: any) => ({ ...s, minOrderKg: parseFloat(e.target.value) }))} className={inputCls} /></FormField>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input type="checkbox" id="isOpen" checked={settings.isOpen !== false} onChange={e => setSettings((s: any) => ({ ...s, isOpen: e.target.checked }))} className="w-4 h-4 accent-green-600" />
              <label htmlFor="isOpen" className="text-sm font-medium text-gray-700">Store is Open (accepting orders)</label>
            </div>
          </div>
          <button type="submit" disabled={savingSettings} className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-colors disabled:opacity-60">
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

        {/* Email Test Section */}
        <div className="max-w-2xl mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-3"><Mail size={16} className="text-green-600" /> Email Configuration Test</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-600 mb-1">
              <strong>SMTP Host:</strong> {process.env.NODE_ENV === 'development' ? 'smtp.hostinger.com:465 (SSL)' : 'Configured'} &nbsp;|&nbsp;
              <strong>From:</strong> ricemill@sameergul.com
            </p>
            <p className="text-xs text-gray-400 mb-4">Sends a test email to ricemill@sameergul.com to verify SMTP is working.</p>
            <button
              onClick={async () => {
                setTES(true);
                try {
                  await api.post('/ecommerce/test-email');
                  toast.success('Test email sent! Check ricemill@sameergul.com inbox.');
                } catch (err: any) {
                  toast.error(err.response?.data?.message || 'Failed to send test email. Check SMTP config.');
                } finally { setTES(false); }
              }}
              disabled={testEmailSending}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
              {testEmailSending ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
              {testEmailSending ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>

          {/* Email trigger summary */}
          <div className="mt-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Email Triggers Active</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Welcome Email (on register)',
                'Order Confirmation (on checkout)',
                'Order Status Updates (shipped/delivered)',
                'Payment Received',
                'Password Reset',
                'Password Changed',
                'Review Approved / Rejected',
                'Newsletter Welcome',
                'Contact Form Confirmation',
                'Low Stock Alert (internal)',
                'Back-in-Stock Notification',
                'Wholesale Inquiry Alert (internal)',
                '2FA Enabled Notification',
                'Newsletter Blast (bulk)',
              ].map(trigger => (
                <div key={trigger} className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                  {trigger}
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
      )}

      {/* Product modal */}
      {showProduct !== null && (
        <Modal title={showProduct?.id ? 'Edit Product' : 'New Product'} onClose={() => setShowProduct(null)} size="lg">
          <form onSubmit={saveProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Product Name" required><input type="text" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} required className={inputCls} placeholder="Premium Basmati Rice" /></FormField>
              <FormField label="Variety"><input type="text" value={productForm.variety} onChange={e => setProductForm(f => ({ ...f, variety: e.target.value }))} className={inputCls} placeholder="Basmati" /></FormField>
              <FormField label="Grade">
                <select value={productForm.grade} onChange={e => setProductForm(f => ({ ...f, grade: e.target.value }))} className={selectCls}>
                  <option value="A">A — Premium</option><option value="B">B — Standard</option><option value="C">C — Economy</option>
                </select>
              </FormField>
              <FormField label="Price per kg (PKR)" required><input type="number" min="0" value={productForm.pricePerKg} onChange={e => setProductForm(f => ({ ...f, pricePerKg: e.target.value }))} required className={inputCls} /></FormField>
              <FormField label="Min Order (kg)"><input type="number" min="1" value={productForm.minOrderKg} onChange={e => setProductForm(f => ({ ...f, minOrderKg: e.target.value }))} className={inputCls} /></FormField>
              <FormField label="Link to Rice Stock (optional)">
                <select value={productForm.riceStockId} onChange={e => setProductForm(f => ({ ...f, riceStockId: e.target.value }))} className={selectCls}>
                  <option value="">No link (manual stock)</option>
                  {riceStock.map((r: any) => <option key={r.id} value={r.id}>{r.variety} Grade {r.grade} — {r.quantityKg}kg</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="Description"><textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} rows={2} className={inputCls} /></FormField>
            <FormField label="Image URL (optional)"><input type="url" value={productForm.imageUrl} onChange={e => setProductForm(f => ({ ...f, imageUrl: e.target.value }))} className={inputCls} placeholder="https://..." /></FormField>
            <div className="flex gap-5">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={productForm.isPublished} onChange={e => setProductForm(f => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 accent-green-600" /><span className="font-medium text-gray-700">Published (visible to customers)</span></label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={productForm.inStock} onChange={e => setProductForm(f => ({ ...f, inStock: e.target.checked }))} className="w-4 h-4 accent-blue-600" /><span className="font-medium text-gray-700">In Stock</span></label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowProduct(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Save Product</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Discount modal */}
      {showDiscount && (
        <Modal title="New Discount Code" onClose={() => setShowDiscount(false)}>
          <form onSubmit={saveDiscount} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Code" required><input type="text" value={discountForm.code} onChange={e => setDiscountForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required className={`${inputCls} font-mono uppercase`} placeholder="SUMMER20" /></FormField>
              <FormField label="Type"><select value={discountForm.type} onChange={e => setDiscountForm(f => ({ ...f, type: e.target.value }))} className={selectCls}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount (PKR)</option></select></FormField>
              <FormField label={discountForm.type === 'percentage' ? 'Discount %' : 'Discount (PKR)'} required><input type="number" min="0" value={discountForm.value} onChange={e => setDiscountForm(f => ({ ...f, value: e.target.value }))} required className={inputCls} /></FormField>
              <FormField label="Min Order Amount (PKR)"><input type="number" min="0" value={discountForm.minOrderAmt} onChange={e => setDiscountForm(f => ({ ...f, minOrderAmt: e.target.value }))} className={inputCls} /></FormField>
              <FormField label="Usage Limit (0 = unlimited)"><input type="number" min="0" value={discountForm.usageLimit} onChange={e => setDiscountForm(f => ({ ...f, usageLimit: e.target.value }))} className={inputCls} /></FormField>
              <FormField label="Expires On"><input type="date" value={discountForm.expiresAt} onChange={e => setDiscountForm(f => ({ ...f, expiresAt: e.target.value }))} className={inputCls} /></FormField>
            </div>
            <FormField label="Description"><input type="text" value={discountForm.description} onChange={e => setDiscountForm(f => ({ ...f, description: e.target.value }))} className={inputCls} placeholder="e.g. Summer Sale — 20% off" /></FormField>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowDiscount(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Create Code</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}
