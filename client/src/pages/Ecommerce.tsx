import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Eye, EyeOff, Settings, Tag, BarChart3, ShoppingBag, ExternalLink, RefreshCw, Globe, Package, Edit3, Send, CheckCircle2, Mail, X } from 'lucide-react';
import Modal from '../components/ui/Modal';
import StatCard from '../components/ui/StatCard';
import { TableSkeleton } from '../components/ui/Skeleton';
import PageHeader, { ActionButton, FormField, inputCls, selectCls } from '../components/ui/PageHeader';
import { formatPKR, formatDate } from '../utils/export';
import { OrderStatusBadge } from '../components/ui/Badge';
import PageTransition from '../components/PageTransition';
import ImageUpload from '../components/ui/ImageUpload';
import MultiImageUpload from '../components/ui/MultiImageUpload';

const TABS = ['overview', 'products', 'discounts', 'email', 'settings', 'shipping', 'pricing-tiers', 'faqs'] as const;
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
  const EMPTY_PRODUCT = {
    name: '', variety: '', grade: 'A', sku: '', description: '', imageUrl: '', images: [] as string[],
    pricePerKg: '', minOrderKg: '10', isPublished: false, inStock: true,
    riceStockId: '', sortOrder: '0',
    // Specifications
    weight: '', packaging: '', origin: '', processingType: '', moistureContent: '',
    grainLength: '', cookingTime: '', aroma: '', brokenGrain: '', certifications: '',
    shelfLife: '', storageInstructions: '',
    // Nutrition stored as JSON string
    nutritionInfo: '',
  };
  const DEFAULT_NUTRITION = [
    { nutrient: 'Energy',        per100g: '130', unit: 'kcal' },
    { nutrient: 'Protein',       per100g: '2.7', unit: 'g' },
    { nutrient: 'Carbohydrates', per100g: '28',  unit: 'g' },
    { nutrient: 'Fat',           per100g: '0.3', unit: 'g' },
    { nutrient: 'Fiber',         per100g: '0.4', unit: 'g' },
    { nutrient: 'Sodium',        per100g: '1',   unit: 'mg' },
  ];
  const [productForm, setProductForm] = useState<any>({ ...EMPTY_PRODUCT });
  const [productModalTab, setPMT] = useState<'basic' | 'specs' | 'nutrition'>('basic');
  const [nutritionRows, setNutritionRows] = useState<{ nutrient: string; per100g: string; unit: string }[]>(DEFAULT_NUTRITION);
  const [discountForm, setDiscountForm] = useState({ code: '', description: '', type: 'percentage', value: '', minOrderAmt: '0', usageLimit: '0', expiresAt: '', isActive: true });
  const [savingSettings, setSavingSettings] = useState(false);

  // Pricing Tiers tab
  const [pricingTiers, setPricingTiers] = useState<any[]>([]);
  const [tierModal, setTierModal] = useState<any>(null);
  const [tierForm, setTierForm] = useState({ label: '', rangeLabel: '', discount: '', description: '', ctaText: 'Request quote', ctaType: 'quote', sortOrder: '0', isActive: true });

  // FAQs tab
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqModal, setFaqModal] = useState<any>(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', sortOrder: '0', isActive: true });

  // Shipping Zones tab
  const [shippingZones, setShippingZones] = useState<any[]>([]);
  const [zoneModal, setZoneModal] = useState<any>(null);
  const EMPTY_ZONE = { name: '', countries: '', baseFee: '', perKgRate: '', minDays: '5', maxDays: '21', freeAbove: '', isDomestic: false, isActive: true };
  const [zoneForm, setZoneForm] = useState<any>({ ...EMPTY_ZONE });
  const [savingZone, setSavingZone] = useState(false);

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

  // Load pricing tiers and FAQs when their tabs are opened
  useEffect(() => {
    if (tab === 'pricing-tiers') {
      api.get('/ecommerce/pricing-tiers/all').then(r => setPricingTiers(r.data.data || [])).catch(() => {});
    }
    if (tab === 'faqs') {
      api.get('/faq/all').then(r => setFaqs(r.data.data || [])).catch(() => {});
    }
    if (tab === 'shipping') {
      api.get('/shipping/zones/all').then(r => setShippingZones(r.data.data || [])).catch(() => {});
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'email') {
      api.get('/newsletter/subscribers?limit=1').then(r => setSC(r.data.total || 0)).catch(() => {});
    }
  }, [tab]);

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...productForm, nutritionInfo: JSON.stringify(nutritionRows) };
    try {
      if (showProduct?.id) {
        await api.put(`/ecommerce/products/${showProduct.id}`, payload);
        toast.success('Product updated');
      } else {
        const res = await api.post('/ecommerce/products', payload);
        const sku = res.data?.data?.sku;
        toast.success(sku ? `Product created. SKU: ${sku}` : 'Product created!');
      }
      setShowProduct(null);
      setPMT('basic');
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.message || err.response?.data?.error || 'Error'); }
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
    setProductForm({
      name: p.name, variety: p.variety, grade: p.grade, sku: p.sku || '',
      description: p.description || '', imageUrl: p.imageUrl || '',
      images: Array.isArray(p.images) ? p.images : (p.images ? (() => { try { return JSON.parse(p.images); } catch { return []; } })() : []),
      pricePerKg: String(p.pricePerKg), minOrderKg: String(p.minOrderKg),
      isPublished: p.isPublished, inStock: p.inStock,
      riceStockId: p.riceStockId || '', sortOrder: String(p.sortOrder || 0),
      weight: p.weight ? String(p.weight) : '', packaging: p.packaging || '',
      origin: p.origin || '', processingType: p.processingType || '',
      moistureContent: p.moistureContent || '', grainLength: p.grainLength || '',
      cookingTime: p.cookingTime || '', aroma: p.aroma || '',
      brokenGrain: p.brokenGrain || '', certifications: p.certifications || '',
      shelfLife: p.shelfLife || '', storageInstructions: p.storageInstructions || '',
      nutritionInfo: p.nutritionInfo || '',
    });
    try {
      setNutritionRows(p.nutritionInfo ? JSON.parse(p.nutritionInfo) : DEFAULT_NUTRITION);
    } catch { setNutritionRows(DEFAULT_NUTRITION); }
    setPMT('basic');
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
            <ActionButton onClick={() => { setProductForm({ ...EMPTY_PRODUCT }); setNutritionRows(DEFAULT_NUTRITION); setPMT('basic'); setShowProduct({}); }} icon={<Plus size={15} />} label="Add Product" />
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
          {/* Bank Wire Details (for international orders) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">🏦 International Bank Wire Details</h2>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={settings.bankWireEnabled || false}
                  onChange={e => setSettings((s: any) => ({ ...s, bankWireEnabled: e.target.checked }))}
                  className="w-4 h-4 accent-green-600" />
                <span className="font-medium text-gray-700">Enable bank wire option at checkout</span>
              </label>
            </div>
            {settings.bankWireEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Beneficiary Name">
                  <input value={settings.bankWireBeneficiary || ''} onChange={e => setSettings((s: any) => ({ ...s, bankWireBeneficiary: e.target.value }))} className={inputCls} placeholder="Al-Noor Rice Mills" />
                </FormField>
                <FormField label="Bank Name">
                  <input value={settings.bankWireBank || ''} onChange={e => setSettings((s: any) => ({ ...s, bankWireBank: e.target.value }))} className={inputCls} placeholder="Habib Bank Limited" />
                </FormField>
                <FormField label="IBAN / Account Number">
                  <input value={settings.bankWireIBAN || ''} onChange={e => setSettings((s: any) => ({ ...s, bankWireIBAN: e.target.value }))} className={inputCls} placeholder="PK36HABB0000123456789012" />
                </FormField>
                <FormField label="SWIFT / BIC Code">
                  <input value={settings.bankWireSWIFT || ''} onChange={e => setSettings((s: any) => ({ ...s, bankWireSWIFT: e.target.value }))} className={inputCls} placeholder="HABBPKKA" />
                </FormField>
                <div className="col-span-2">
                  <FormField label="Additional Instructions for Buyer">
                    <textarea value={settings.bankWireInstructions || ''} onChange={e => setSettings((s: any) => ({ ...s, bankWireInstructions: e.target.value }))}
                      className={inputCls + ' resize-none'} rows={2}
                      placeholder="Use your order number as payment reference. Transfers typically clear in 1–3 business days." />
                  </FormField>
                </div>
              </div>
            )}
            {!settings.bankWireEnabled && (
              <p className="text-sm text-gray-400">Enable to show SWIFT/IBAN wire transfer as a payment option for international customers.</p>
            )}
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

      {/* ── PRICING TIERS TAB ──────────────────────────────────────────────── */}
      {tab === 'pricing-tiers' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pricing Tiers</h2>
              <p className="text-sm text-gray-500 mt-0.5">Shown on homepage wholesale section and /wholesale page</p>
            </div>
            <button onClick={() => { setTierForm({ label: '', rangeLabel: '', discount: '', description: '', ctaText: 'Request quote', ctaType: 'quote', sortOrder: String(pricingTiers.length + 1), isActive: true }); setTierModal({}); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition-colors">
              <Plus size={15} /> Add Tier
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Label</th>
                  <th className="px-4 py-3 text-left">Range</th>
                  <th className="px-4 py-3 text-left">Pricing / Discount</th>
                  <th className="px-4 py-3 text-left">CTA</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pricingTiers.map(tier => (
                  <tr key={tier.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-green-700">{tier.label}</td>
                    <td className="px-4 py-3 text-gray-700">{tier.rangeLabel}</td>
                    <td className="px-4 py-3 text-gray-600">{tier.discount || tier.description || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{tier.ctaText}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tier.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {tier.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button onClick={() => { setTierForm({ label: tier.label, rangeLabel: tier.rangeLabel, discount: tier.discount || '', description: tier.description || '', ctaText: tier.ctaText, ctaType: tier.ctaType, sortOrder: String(tier.sortOrder), isActive: tier.isActive }); setTierModal(tier); }}
                        className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"><Edit3 size={14} /></button>
                      <button onClick={async () => { if (!confirm('Delete this tier?')) return; await api.delete(`/ecommerce/pricing-tiers/${tier.id}`); api.get('/ecommerce/pricing-tiers/all').then(r => setPricingTiers(r.data.data || [])); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {pricingTiers.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No tiers yet. Add one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── FAQs TAB ────────────────────────────────────────────────────────── */}
      {tab === 'faqs' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">FAQs</h2>
              <p className="text-sm text-gray-500 mt-0.5">Shown on homepage and /wholesale page</p>
            </div>
            <button onClick={() => { setFaqForm({ question: '', answer: '', sortOrder: String(faqs.length + 1), isActive: true }); setFaqModal({}); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition-colors">
              <Plus size={15} /> Add FAQ
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Question</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {faqs.map((faq, idx) => (
                  <tr key={faq.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{faq.sortOrder}</td>
                    <td className="px-4 py-3 text-gray-900 max-w-md truncate">{faq.question}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${faq.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {faq.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button onClick={() => { setFaqForm({ question: faq.question, answer: faq.answer, sortOrder: String(faq.sortOrder), isActive: faq.isActive }); setFaqModal(faq); }}
                        className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"><Edit3 size={14} /></button>
                      <button onClick={async () => { if (!confirm('Delete this FAQ?')) return; await api.delete(`/faq/${faq.id}`); api.get('/faq/all').then(r => setFaqs(r.data.data || [])); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {faqs.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No FAQs yet. Add one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── SHIPPING ZONES TAB ──────────────────────────────────────────────── */}
      {tab === 'shipping' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Shipping Zones</h2>
              <p className="text-sm text-gray-500 mt-0.5">Define delivery zones, base fees, and per-kg rates. Domestic (Pakistan) uses the store flat rate above.</p>
            </div>
            <ActionButton icon={<span>+</span>} label="New Zone" onClick={() => { setZoneForm({ ...EMPTY_ZONE }); setZoneModal('new'); }} />
          </div>

          {shippingZones.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🌍</div>
              <p className="font-semibold">No shipping zones yet</p>
              <p className="text-sm mt-1">Add zones to enable international shipping at checkout.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Zone', 'Countries', 'Base Fee (USD)', 'Per-kg Rate', 'Delivery', 'Free Above', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {shippingZones.map(z => {
                    let countriesList: string[] = [];
                    try { countriesList = JSON.parse(z.countries || '[]'); } catch {}
                    return (
                      <tr key={z.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {z.name}
                          {z.isDomestic && <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Domestic</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                          <span className="text-xs">
                            {countriesList.includes('*') ? 'All others (catch-all)' : countriesList.slice(0, 5).join(', ')}{countriesList.length > 5 ? ` +${countriesList.length - 5}` : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-800">${z.baseFee.toFixed(2)}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">${z.perKgRate.toFixed(3)}/kg</td>
                        <td className="px-4 py-3 text-gray-600">{z.minDays}–{z.maxDays} days</td>
                        <td className="px-4 py-3 text-gray-600">{z.freeAbove ? `$${z.freeAbove}` : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${z.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {z.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setZoneForm({ ...z, countries: Array.isArray(z.countries) ? z.countries.join(', ') : (() => { try { return JSON.parse(z.countries).join(', '); } catch { return z.countries; } })() }); setZoneModal(z); }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                            <button onClick={async () => { if (!confirm('Delete this zone?')) return; await api.delete(`/shipping/zones/${z.id}`); setShippingZones(prev => prev.filter(x => x.id !== z.id)); toast.success('Zone deleted'); }}
                              className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Zone modal */}
          {zoneModal !== null && (
            <Modal title={zoneModal === 'new' ? 'New Shipping Zone' : `Edit: ${zoneModal.name}`} onClose={() => setZoneModal(null)} size="lg">
              <form onSubmit={async (e) => {
                e.preventDefault();
                setSavingZone(true);
                try {
                  // Parse countries input: comma-separated codes or JSON
                  const countriesArr = zoneForm.countries.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean);
                  const payload = {
                    ...zoneForm,
                    countries: countriesArr,
                    baseFee: parseFloat(zoneForm.baseFee) || 0,
                    perKgRate: parseFloat(zoneForm.perKgRate) || 0,
                    minDays: parseInt(zoneForm.minDays) || 5,
                    maxDays: parseInt(zoneForm.maxDays) || 21,
                    freeAbove: zoneForm.freeAbove ? parseFloat(zoneForm.freeAbove) : null,
                  };
                  if (zoneModal === 'new') {
                    const { data } = await api.post('/shipping/zones', payload);
                    setShippingZones(prev => [...prev, data.data]);
                    toast.success('Zone created');
                  } else {
                    const { data } = await api.put(`/shipping/zones/${zoneModal.id}`, payload);
                    setShippingZones(prev => prev.map(z => z.id === zoneModal.id ? data.data : z));
                    toast.success('Zone updated');
                  }
                  setZoneModal(null);
                } catch (err: any) {
                  toast.error(err.response?.data?.error || 'Save failed');
                } finally { setSavingZone(false); }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Zone Name *">
                    <input value={zoneForm.name} onChange={e => setZoneForm((f: any) => ({ ...f, name: e.target.value }))} required className={inputCls} placeholder="Middle East, Europe..." />
                  </FormField>
                  <FormField label="Base Fee (USD)">
                    <input type="number" step="0.01" value={zoneForm.baseFee} onChange={e => setZoneForm((f: any) => ({ ...f, baseFee: e.target.value }))} className={inputCls} placeholder="25.00" />
                  </FormField>
                  <FormField label="Per-kg Rate (USD)">
                    <input type="number" step="0.001" value={zoneForm.perKgRate} onChange={e => setZoneForm((f: any) => ({ ...f, perKgRate: e.target.value }))} className={inputCls} placeholder="0.50" />
                  </FormField>
                  <FormField label="Free Shipping Above (USD, optional)">
                    <input type="number" step="0.01" value={zoneForm.freeAbove} onChange={e => setZoneForm((f: any) => ({ ...f, freeAbove: e.target.value }))} className={inputCls} placeholder="500.00" />
                  </FormField>
                  <FormField label="Min Days">
                    <input type="number" value={zoneForm.minDays} onChange={e => setZoneForm((f: any) => ({ ...f, minDays: e.target.value }))} className={inputCls} />
                  </FormField>
                  <FormField label="Max Days">
                    <input type="number" value={zoneForm.maxDays} onChange={e => setZoneForm((f: any) => ({ ...f, maxDays: e.target.value }))} className={inputCls} />
                  </FormField>
                </div>
                <FormField label="Countries (ISO-2 codes, comma-separated — use * for catch-all)">
                  <input value={zoneForm.countries} onChange={e => setZoneForm((f: any) => ({ ...f, countries: e.target.value }))} className={inputCls} placeholder="AE, SA, QA, KW, OM, BH  or  * for all others" />
                </FormField>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={zoneForm.isDomestic} onChange={e => setZoneForm((f: any) => ({ ...f, isDomestic: e.target.checked }))} className="w-4 h-4 accent-green-600" />
                    <span>Domestic zone (Pakistan)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={zoneForm.isActive} onChange={e => setZoneForm((f: any) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-green-600" />
                    <span>Active</span>
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t">
                  <button type="button" onClick={() => setZoneModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={savingZone} className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
                    {savingZone ? 'Saving...' : zoneModal === 'new' ? 'Create Zone' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </Modal>
          )}
        </>
      )}

      {/* Product modal */}
      {showProduct !== null && (
        <Modal title={showProduct?.id ? 'Edit Product' : 'New Product'} onClose={() => setShowProduct(null)} size="xl">
          {/* Tab bar */}
          <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1">
            {(['basic', 'specs', 'nutrition'] as const).map(t => (
              <button key={t} type="button" onClick={() => setPMT(t)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${productModalTab === t ? 'bg-white shadow text-green-700' : 'text-gray-600 hover:text-gray-900'}`}>
                {t === 'basic' ? '📦 Basic Info' : t === 'specs' ? '🔬 Specifications' : '🥗 Nutrition'}
              </button>
            ))}
          </div>

          <form onSubmit={saveProduct} className="space-y-4">
            {/* ── BASIC TAB ── */}
            {productModalTab === 'basic' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Product Name" required><input type="text" value={productForm.name} onChange={e => setProductForm((f: any) => ({ ...f, name: e.target.value }))} required className={inputCls} placeholder="Premium Basmati Rice" /></FormField>
                  <FormField label="Variety"><input type="text" value={productForm.variety} onChange={e => setProductForm((f: any) => ({ ...f, variety: e.target.value }))} className={inputCls} placeholder="Basmati" /></FormField>
                  <FormField label="Grade">
                    <select value={productForm.grade} onChange={e => setProductForm((f: any) => ({ ...f, grade: e.target.value }))} className={selectCls}>
                      <option value="A">A — Premium</option><option value="B">B — Standard</option><option value="C">C — Economy</option>
                    </select>
                  </FormField>
                  <FormField label="SKU">
                    <div className="flex gap-2">
                      <input type="text" value={productForm.sku} onChange={e => setProductForm((f: any) => ({ ...f, sku: e.target.value }))} className={`${inputCls} font-mono text-xs`} placeholder="Auto-generated on save" />
                      {productForm.sku && <span className="px-2 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-mono whitespace-nowrap">{productForm.sku}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Leave blank to auto-generate (e.g. RM-BSM-A-4821)</p>
                  </FormField>
                  <FormField label="Price per kg (PKR)" required><input type="number" min="0" value={productForm.pricePerKg} onChange={e => setProductForm((f: any) => ({ ...f, pricePerKg: e.target.value }))} required className={inputCls} /></FormField>
                  <FormField label="Min Order (kg)"><input type="number" min="1" value={productForm.minOrderKg} onChange={e => setProductForm((f: any) => ({ ...f, minOrderKg: e.target.value }))} className={inputCls} /></FormField>
                  <FormField label="Link to Rice Stock (optional)" className="col-span-2">
                    <select value={productForm.riceStockId} onChange={e => setProductForm((f: any) => ({ ...f, riceStockId: e.target.value }))} className={selectCls}>
                      <option value="">No link (manual stock)</option>
                      {riceStock.map((r: any) => <option key={r.id} value={r.id}>{r.variety} Grade {r.grade} — {r.quantityKg}kg</option>)}
                    </select>
                  </FormField>
                </div>
                <FormField label="Description"><textarea value={productForm.description} onChange={e => setProductForm((f: any) => ({ ...f, description: e.target.value }))} rows={2} className={inputCls} /></FormField>
                <MultiImageUpload
                  images={productForm.images?.length ? productForm.images : (productForm.imageUrl ? [productForm.imageUrl] : [])}
                  onChange={urls => setProductForm((f: any) => ({ ...f, images: urls, imageUrl: urls[0] || '' }))}
                />
                <div className="flex gap-5">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={productForm.isPublished} onChange={e => setProductForm((f: any) => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 accent-green-600" /><span className="font-medium text-gray-700">Published</span></label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={productForm.inStock} onChange={e => setProductForm((f: any) => ({ ...f, inStock: e.target.checked }))} className="w-4 h-4 accent-blue-600" /><span className="font-medium text-gray-700">In Stock</span></label>
                </div>
              </>
            )}

            {/* ── SPECS TAB ── */}
            {productModalTab === 'specs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'weight', label: 'Weight per bag (kg)', type: 'number', placeholder: 'e.g. 25' },
                  { key: 'packaging', label: 'Packaging Type', placeholder: 'e.g. 25kg Jute Bag' },
                  { key: 'origin', label: 'Origin', placeholder: 'e.g. Punjab, Pakistan' },
                  { key: 'processingType', label: 'Processing Type', placeholder: 'e.g. Double Polished' },
                  { key: 'moistureContent', label: 'Moisture Content', placeholder: 'e.g. 12-14%' },
                  { key: 'grainLength', label: 'Grain Length', placeholder: 'e.g. Extra Long (7mm+)' },
                  { key: 'cookingTime', label: 'Cooking Time', placeholder: 'e.g. 20-25 minutes' },
                  { key: 'aroma', label: 'Aroma', placeholder: 'e.g. Strong' },
                  { key: 'brokenGrain', label: 'Broken Grain %', placeholder: 'e.g. Max 2%' },
                  { key: 'certifications', label: 'Certifications', placeholder: 'e.g. ISO 9001, PSQCA' },
                  { key: 'shelfLife', label: 'Shelf Life', placeholder: 'e.g. 12 months' },
                  { key: 'storageInstructions', label: 'Storage Instructions', placeholder: 'e.g. Store in cool, dry place' },
                ].map(f => (
                  <FormField key={f.key} label={f.label}>
                    <input type={f.type || 'text'} value={productForm[f.key] || ''} onChange={e => setProductForm((pf: any) => ({ ...pf, [f.key]: e.target.value }))} className={inputCls} placeholder={f.placeholder} />
                  </FormField>
                ))}
              </div>
            )}

            {/* ── NUTRITION TAB ── */}
            {productModalTab === 'nutrition' && (
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
                  <span className="col-span-5">Nutrient</span>
                  <span className="col-span-4">Per 100g</span>
                  <span className="col-span-2">Unit</span>
                  <span className="col-span-1" />
                </div>
                {nutritionRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input value={row.nutrient} onChange={e => setNutritionRows(prev => prev.map((r, idx) => idx === i ? { ...r, nutrient: e.target.value } : r))} className={`col-span-5 ${inputCls}`} placeholder="e.g. Protein" />
                    <input value={row.per100g} onChange={e => setNutritionRows(prev => prev.map((r, idx) => idx === i ? { ...r, per100g: e.target.value } : r))} className={`col-span-4 ${inputCls}`} placeholder="2.7" />
                    <select value={row.unit} onChange={e => setNutritionRows(prev => prev.map((r, idx) => idx === i ? { ...r, unit: e.target.value } : r))} className={`col-span-2 ${selectCls}`}>
                      {['kcal', 'g', 'mg', 'µg', '%'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <button type="button" onClick={() => setNutritionRows(prev => prev.filter((_, idx) => idx !== i))} className="col-span-1 text-red-400 hover:text-red-600 flex items-center justify-center">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setNutritionRows(prev => [...prev, { nutrient: '', per100g: '', unit: 'g' }])} className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                  <Plus size={14} /> Add row
                </button>
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t border-gray-100">
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
      {/* Pricing Tier modal */}
      {tierModal !== null && (
        <Modal title={tierModal?.id ? 'Edit Tier' : 'New Pricing Tier'} onClose={() => setTierModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Label (e.g. TRADE)"><input value={tierForm.label} onChange={e => setTierForm(f => ({ ...f, label: e.target.value.toUpperCase() }))} className={`${inputCls} font-mono uppercase`} placeholder="TRADE" /></FormField>
              <FormField label="Range Label"><input value={tierForm.rangeLabel} onChange={e => setTierForm(f => ({ ...f, rangeLabel: e.target.value }))} className={inputCls} placeholder="50 – 499 kg" /></FormField>
            </div>
            <FormField label="Discount / Pricing Line"><input value={tierForm.discount} onChange={e => setTierForm(f => ({ ...f, discount: e.target.value }))} className={inputCls} placeholder="−12% across the catalogue" /></FormField>
            <FormField label="Description (fallback)"><input value={tierForm.description} onChange={e => setTierForm(f => ({ ...f, description: e.target.value }))} className={inputCls} placeholder="Standard catalogue pricing" /></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="CTA Text"><input value={tierForm.ctaText} onChange={e => setTierForm(f => ({ ...f, ctaText: e.target.value }))} className={inputCls} placeholder="Request quote" /></FormField>
              <FormField label="CTA Type"><select value={tierForm.ctaType} onChange={e => setTierForm(f => ({ ...f, ctaType: e.target.value }))} className={selectCls}><option value="link">Link to products</option><option value="quote">Request quote</option><option value="contact">Contact founders</option></select></FormField>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={tierForm.isActive} onChange={e => setTierForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-green-600" /><span className="font-medium text-gray-700">Active (visible on site)</span></label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setTierModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={async () => {
                try {
                  if (tierModal?.id) { await api.put(`/ecommerce/pricing-tiers/${tierModal.id}`, tierForm); }
                  else { await api.post('/ecommerce/pricing-tiers', tierForm); }
                  toast.success('Saved!'); setTierModal(null);
                  api.get('/ecommerce/pricing-tiers/all').then(r => setPricingTiers(r.data.data || []));
                } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
              }} className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Save Tier</button>
            </div>
          </div>
        </Modal>
      )}

      {/* FAQ modal */}
      {faqModal !== null && (
        <Modal title={faqModal?.id ? 'Edit FAQ' : 'New FAQ'} onClose={() => setFaqModal(null)} size="lg">
          <div className="space-y-4">
            <FormField label="Question"><textarea value={faqForm.question} onChange={e => setFaqForm(f => ({ ...f, question: e.target.value }))} rows={2} className={inputCls} placeholder="What is the minimum order?" /></FormField>
            <FormField label="Answer"><textarea value={faqForm.answer} onChange={e => setFaqForm(f => ({ ...f, answer: e.target.value }))} rows={4} className={inputCls} placeholder="Minimum order is 5kg..." /></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Sort Order"><input type="number" value={faqForm.sortOrder} onChange={e => setFaqForm(f => ({ ...f, sortOrder: e.target.value }))} className={inputCls} /></FormField>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={faqForm.isActive} onChange={e => setFaqForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-green-600" /><span className="font-medium text-gray-700">Active (visible)</span></label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setFaqModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={async () => {
                try {
                  const payload = { ...faqForm, sortOrder: parseInt(faqForm.sortOrder || '0') };
                  if (faqModal?.id) { await api.put(`/faq/${faqModal.id}`, payload); }
                  else { await api.post('/faq', payload); }
                  toast.success('Saved!'); setFaqModal(null);
                  api.get('/faq/all').then(r => setFaqs(r.data.data || []));
                } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
              }} className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Save FAQ</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}
