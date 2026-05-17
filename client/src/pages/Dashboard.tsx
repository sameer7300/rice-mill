import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { useCart } from '../contexts/CartContext';
import api from '../api';
import toast from 'react-hot-toast';
import { AddressesTab, PaymentTab, RewardsTab, TwoFASection } from '../components/ui/AccountTabs';
import StatCard from '../components/ui/StatCard';
import { StatsSkeleton } from '../components/ui/Skeleton';
import { OrderStatusBadge, PaymentBadge } from '../components/ui/Badge';
import { formatPKR, formatDate } from '../utils/export';
import Modal from '../components/ui/Modal';
import { inputCls } from '../components/ui/PageHeader';
import {
  Wheat, Package, ShoppingCart, DollarSign, TrendingUp,
  Factory, Clock, AlertTriangle, CheckCircle2, ArrowRight, Users, Truck,
  Heart, Star, User, Shield, ChevronDown, ChevronUp, Languages, Trash2,
  MapPin, CreditCard, Gift, Plus, QrCode, Smartphone, Download, Copy,
  Award, Trophy, Zap, Home, Building2, Landmark, Edit3, RefreshCw, Eye, EyeOff,
  MessageCircle
} from 'lucide-react';
import ChatModal from '../components/chat/ChatModal';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, AreaChart, Area, Line
} from 'recharts';
import { useNavigate, Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, isAdmin, isStaff, isCustomer } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (isCustomer) {
          const orders = await api.get('/orders');
          setData({ orders: orders.data.orders || [] });
        } else {
          const [inv, ordStats, finance, mill, monthly] = await Promise.all([
            api.get('/inventory/summary'),
            api.get('/orders/stats/summary'),
            api.get('/finance/summary'),
            api.get('/mill/stats'),
            isAdmin ? api.get('/finance/monthly?months=6') : Promise.resolve({ data: [] })
          ]);
          // Recent orders
          const recentOrders = await api.get('/orders?limit=5');
          setData({
            inv: inv.data,
            ordStats: ordStats.data,
            finance: finance.data,
            mill: mill.data,
            monthly: monthly.data,
            recentOrders: recentOrders.data.orders || []
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="h-28 bg-gradient-to-r from-green-700 to-green-600 rounded-2xl animate-pulse" />
      <StatsSkeleton />
    </div>
  );

  if (isCustomer) {
    return <CustomerDashboard user={user} />;
  }

  const { inv, ordStats, finance, mill, monthly, recentOrders } = data;
  const alerts = [...(inv?.lowStockAlerts?.paddy || []), ...(inv?.lowStockAlerts?.rice || [])];

  return (
    <PageTransition>
    <div className="space-y-6">
      <WelcomeBanner user={user} />

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700 mb-1">Low Stock Alert â€” {alerts.length} item{alerts.length > 1 ? 's' : ''} running low</p>
            <div className="flex flex-wrap gap-2">
              {alerts.map((a: any) => (
                <span key={a.id} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {a.variety} â€” {a.quantityKg}kg left
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => navigate('/dashboard/inventory')} className="text-xs text-red-600 font-medium hover:underline flex-shrink-0">View â†’</button>
        </div>
      )}

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Wheat size={22} />} label="Paddy Stock"
          value={`${((inv?.totalPaddyKg || 0) / 1000).toFixed(1)}T`}
          sub={`${inv?.paddyEntries || 0} entries`}
          iconBg="bg-yellow-100" iconColor="text-yellow-600" valueColor="text-yellow-700"
          alert={inv?.lowStockAlerts?.paddy?.length > 0}
        />
        <StatCard
          icon={<Package size={22} />} label="Rice Stock"
          value={`${((inv?.totalRiceKg || 0) / 1000).toFixed(1)}T`}
          sub={`${inv?.riceEntries || 0} entries`}
          iconBg="bg-green-100" iconColor="text-green-600" valueColor="text-green-700"
          alert={inv?.lowStockAlerts?.rice?.length > 0}
        />
        <StatCard
          icon={<ShoppingCart size={22} />} label="Orders"
          value={ordStats?.total || 0}
          sub={`${ordStats?.pending || 0} pending Â· ${ordStats?.monthOrders || 0} this month`}
          iconBg="bg-blue-100" iconColor="text-blue-600" valueColor="text-blue-700"
        />
        <StatCard
          icon={<DollarSign size={22} />} label="Revenue"
          value={`${((finance?.totalRevenue || 0) / 1000).toFixed(0)}K`}
          sub={`${formatPKR(finance?.outstanding || 0)} outstanding`}
          iconBg="bg-purple-100" iconColor="text-purple-600" valueColor="text-purple-700"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mill status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Factory size={17} className="text-green-600" /> Mill Operations</h2>
            <button onClick={() => navigate('/dashboard/mill')} className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1">View all <ArrowRight size={12} /></button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Pending', value: mill?.pending || 0, color: 'yellow' },
              { label: 'Active', value: mill?.inProgress || 0, color: 'blue' },
              { label: 'Done', value: mill?.completed || 0, color: 'green' }
            ].map(s => (
              <div key={s.label} className={`text-center p-3 bg-${s.color}-50 rounded-xl`}>
                <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {mill?.avgYield && (
            <div className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Avg Yield</span>
              <span className="font-bold text-green-700">{mill.avgYield.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Finance summary */}
        {isAdmin && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2"><DollarSign size={17} className="text-green-600" /> Finance</h2>
              <button onClick={() => navigate('/dashboard/finance')} className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1">Details <ArrowRight size={12} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Total Revenue', value: finance?.totalRevenue || 0, color: 'text-green-600' },
                { label: 'Total Expenses', value: (finance?.totalExpenses || 0) + (finance?.purchaseCosts || 0), color: 'text-red-500' },
                { label: 'Net Profit', value: finance?.totalProfit || 0, color: 'text-blue-600' },
                { label: 'Outstanding', value: finance?.outstanding || 0, color: 'text-orange-500' }
              ].map(f => (
                <div key={f.label} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500">{f.label}</span>
                  <span className={`font-semibold ${f.color}`}>{formatPKR(f.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'New Order', icon: <ShoppingCart size={16} />, path: '/orders', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
              { label: 'Add to Inventory', icon: <Package size={16} />, path: '/inventory', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
              { label: 'Start Mill Batch', icon: <Factory size={16} />, path: '/mill', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
              { label: 'View Customers', icon: <Users size={16} />, path: '/customers', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
              { label: 'Record Purchase', icon: <Truck size={16} />, path: '/suppliers', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' }
            ].filter(a => isAdmin || !['View Customers'].includes(a.label) || isStaff).map(a => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${a.color}`}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      {isAdmin && monthly?.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={17} className="text-green-600" /> 6-Month Financial Overview</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: any) => formatPKR(Number(v))} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="url(#revGrad)" name="Revenue" strokeWidth={2} />
              <Bar dataKey="expenses" fill="#fca5a5" name="Expenses" radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="profit" stroke="#2563eb" name="Profit" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent orders */}
      {isStaff && recentOrders?.length > 0 && (
        <RecentOrdersTable orders={recentOrders} navigate={navigate} />
      )}
    </div>
    </PageTransition>
  );
}

function WelcomeBanner({ user }: { user: any }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return (
    <div className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 rounded-2xl p-6 text-white flex items-center justify-between">
      <div>
        <p className="text-green-200 text-sm">{greeting},</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.name?.split(' ')[0]} ðŸ‘‹</h1>
        <p className="text-green-300 text-sm mt-1">Pakistan Rice Mill Management System</p>
      </div>
      <div className="hidden md:block text-right">
        <p className="text-green-200 text-xs">Today</p>
        <p className="text-white font-semibold">{new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>
    </div>
  );
}

function RecentOrdersTable({ orders, navigate }: { orders: any[]; navigate: any }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2"><ShoppingCart size={16} className="text-green-600" /> Recent Orders</h2>
        <button onClick={() => navigate('/dashboard/orders')} className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1">View all <ArrowRight size={12} /></button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
            <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
            <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
            <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((o: any) => (
            <tr key={o.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/orders')}>
              <td className="px-5 py-3 font-mono text-xs text-gray-700">{o.orderNumber}</td>
              <td className="px-5 py-3 text-gray-700">{o.customer?.user?.name || o.customer?.businessName}</td>
              <td className="px-5 py-3 font-medium text-gray-900">{formatPKR(o.totalAmount)}</td>
              <td className="px-5 py-3"><OrderStatusBadge status={o.status} /></td>
              <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(o.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── CUSTOMER DASHBOARD (5 tabs, inside admin Layout) ────────────────────────

const CUST_TABS = [
  { id: 'orders',    label: 'My Orders',  icon: <ShoppingCart size={15} /> },
  { id: 'favorites', label: 'Favorites',  icon: <Heart size={15} /> },
  { id: 'reviews',   label: 'Reviews',    icon: <Star size={15} /> },
  { id: 'addresses', label: 'Addresses',  icon: <MapPin size={15} /> },
  { id: 'payment',   label: 'Payment',    icon: <CreditCard size={15} /> },
  { id: 'rewards',   label: 'Rewards',    icon: <Gift size={15} /> },
  { id: 'profile',   label: 'Profile',    icon: <User size={15} /> },
  { id: 'security',  label: 'Security',   icon: <Shield size={15} /> },
] as const;
type CTab = typeof CUST_TABS[number]['id'];
const ORDER_FILTERS = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
const STATUS_REVIEW: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'Pending Review', cls: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Published',      cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected',       cls: 'bg-red-100 text-red-600' },
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

function CustomerDashboard({ user }: { user: any }) {
  const { addItem } = useCart();
  const { toggleLang, lang } = useLang();
  const navigate = useNavigate();
  const [tab, setTab] = useState<CTab>('orders');
  const [orders, setOrders]       = useState<any[]>([]);
  const [loadingOrders, setLO]    = useState(true);
  const [orderFilter, setOF]      = useState('All');
  const [expandedOrder, setEO]    = useState<string | null>(null);
  const [chatOrder, setChatOrder] = useState<any>(null);
  const [favorites, setFavs]      = useState<any[]>([]);
  const [loadingFavs, setLF]      = useState(false);
  const [reviews, setReviews]     = useState<any[]>([]);
  const [loadingRevs, setLR]      = useState(false);
  const [profileForm, setPF]      = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', businessName: '' });
  const [savingProfile, setSP]    = useState(false);
  const [pwForm, setPW]           = useState({ current: '', newPw: '', confirm: '' });
  const [savingPw, setSPW]        = useState(false);

  useEffect(() => {
    api.get('/orders?limit=100').then(r => setOrders(r.data.orders || [])).catch(() => {}).finally(() => setLO(false));
  }, []);

  useEffect(() => {
    if (tab === 'favorites' && favorites.length === 0) {
      setLF(true);
      api.get('/favorites').then(r => setFavs(r.data)).catch(() => {}).finally(() => setLF(false));
    }
    if (tab === 'reviews' && reviews.length === 0) {
      setLR(true);
      api.get('/reviews/mine').then(r => setReviews(r.data || [])).catch(() => {}).finally(() => setLR(false));
    }
    if (tab === 'profile') {
      api.get('/auth/me').then(r => setPF({
        name: r.data.name || '', phone: r.data.phone || '',
        address: r.data.address || '', businessName: r.data.customer?.businessName || ''
      })).catch(() => {});
    }
  }, [tab]);

  const filteredOrders = orders.filter(o =>
    orderFilter === 'All' ? true : o.status.toLowerCase() === orderFilter.toLowerCase()
  );

  const removeFavorite = async (productId: string) => {
    await api.post(`/favorites/${productId}`);
    setFavs(f => f.filter(fav => fav.productId !== productId));
    toast.success('Removed from favorites');
  };

  const addFavToCart = (fav: any) => {
    const p = fav.product;
    addItem({ productId: p.id, name: p.name, variety: p.variety, grade: p.grade, pricePerKg: p.pricePerKg, quantityKg: p.minOrderKg || 10, minOrderKg: p.minOrderKg || 10, imageUrl: p.imageUrl });
    toast.success(`${p.name} added to cart!`);
  };

  const reorder = async (order: any) => {
    const stockRes = await api.get('/inventory/rice?limit=200').catch(() => ({ data: { stocks: [] } }));
    const stock = stockRes.data.stocks || [];
    let added = 0;
    for (const item of order.items || []) {
      const match = stock.find((s: any) => s.variety === item.variety && s.grade === item.grade && s.quantityKg > 0);
      if (match) { addItem({ productId: match.id, name: item.variety, variety: item.variety, grade: item.grade, pricePerKg: match.pricePerKg || item.pricePerKg, quantityKg: item.quantityKg, minOrderKg: 10 }); added++; }
    }
    added > 0 ? toast.success(`${added} item${added > 1 ? 's' : ''} added to cart!`) : toast.error('Items not currently in stock');
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await api.delete(`/reviews/${id}/mine`);
    setReviews(r => r.filter(rev => rev.id !== id));
    toast.success('Review deleted');
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSP(true);
    try { await api.put(`/users/${user?.id}`, profileForm); toast.success('Profile updated!'); }
    catch { toast.error('Error saving profile'); } finally { setSP(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPw.length < 6) { toast.error('Min 6 characters'); return; }
    setSPW(true);
    try {
      await api.post('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw });
      toast.success('Password changed!'); setPW({ current: '', newPw: '', confirm: '' });
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); } finally { setSPW(false); }
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-2xl p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-bold">{user?.name}</p>
            <p className="text-green-200 text-sm">{user?.email}</p>
            <p className="text-green-300 text-xs mt-0.5">Customer Account</p>
          </div>
        </div>
        <Link to="/" className="text-xs text-green-200 hover:text-white border border-white/30 px-3 py-1.5 rounded-lg transition-colors">
          ← Back to Shop
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 overflow-x-auto">
        {CUST_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${tab === t.id ? 'bg-green-700 text-white shadow' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ─── MY ORDERS ─────────────────────────────────────────────────── */}
      {tab === 'orders' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {ORDER_FILTERS.map(f => (
              <button key={f} onClick={() => setOF(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${orderFilter === f ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'}`}>
                {f}
              </button>
            ))}
          </div>
          {loadingOrders ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />)
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <ShoppingCart size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-600">No {orderFilter !== 'All' ? orderFilter.toLowerCase() : ''} orders</p>
              <Link to="/" className="text-green-600 hover:underline text-sm mt-2 block">Start shopping →</Link>
            </div>
          ) : filteredOrders.map(o => (
            <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <p className="font-mono font-bold text-sm text-gray-900">{o.orderNumber}</p>
                    <OrderStatusBadge status={o.status} />
                    <PaymentBadge status={o.paymentStatus} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{formatDate(o.createdAt)}</span>
                    <span>·</span>
                    <span className="font-semibold text-green-700">{formatPKR(o.totalAmount)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => reorder(o)}
                    className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                    <ShoppingCart size={12} /> Reorder
                  </button>
                  <Link to={`/track?order=${o.orderNumber}`}
                    className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                    <Package size={12} /> Track
                  </Link>
                  <button onClick={() => setChatOrder(o)}
                    title="Chat about this order"
                    className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                    <MessageCircle size={12} /> Chat
                  </button>
                  <button onClick={() => setEO(expandedOrder === o.id ? null : o.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                    {expandedOrder === o.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
              {expandedOrder === o.id && (
                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</p>
                  <div className="space-y-1.5">
                    {(o.items || []).map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.variety} · Grade {item.grade} · {item.quantityKg}kg</span>
                        <span className="font-medium text-gray-900">{formatPKR(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                  {o.deliveryAddress && <p className="text-xs text-gray-400 mt-2">📍 {o.deliveryAddress}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── FAVORITES ──────────────────────────────────────────────────── */}
      {tab === 'favorites' && (
        <div>
          {loadingFavs ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse" />)}
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <Heart size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-600">No favorites yet</p>
              <Link to="/" className="text-green-600 hover:underline text-sm mt-2 block">Browse products →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {favorites.map(fav => {
                const p = fav.product; if (!p) return null;
                return (
                  <div key={fav.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <Link to={`/products/${p.id}`} className="block h-32 bg-green-50 overflow-hidden">
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center"><Wheat size={24} className="text-green-300" /></div>}
                    </Link>
                    <div className="p-3">
                      <Link to={`/products/${p.id}`} className="font-semibold text-sm text-gray-900 hover:text-green-700 block truncate">{p.name}</Link>
                      <p className="text-green-700 font-bold text-sm">{formatPKR(p.pricePerKg)}/kg</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => addFavToCart(fav)} className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1">
                          <ShoppingCart size={12} /> Add
                        </button>
                        <button onClick={() => removeFavorite(fav.productId)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── REVIEWS ────────────────────────────────────────────────────── */}
      {tab === 'reviews' && (
        <div className="space-y-3">
          {loadingRevs ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <Star size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-600">No reviews yet</p>
            </div>
          ) : reviews.map((rev: any) => {
            const st = STATUS_REVIEW[rev.status] || STATUS_REVIEW.pending;
            return (
              <div key={rev.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{rev.product?.name || 'Product'}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                      {rev.verifiedPurchase && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">✓ Verified Purchase</span>}
                    </div>
                    <StarDisplay rating={rev.rating} />
                    {rev.comment && <p className="text-gray-600 text-sm mt-1.5">{rev.comment}</p>}
                    {rev.adminNote && <p className="text-xs text-red-500 mt-1 italic">Admin note: {rev.adminNote}</p>}
                    <p className="text-xs text-gray-400 mt-1.5">{formatDate(rev.createdAt)}</p>
                  </div>
                  {rev.status === 'pending' && (
                    <button onClick={() => deleteReview(rev.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 rounded-lg"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── PROFILE ────────────────────────────────────────────────────── */}
      {tab === 'profile' && (
        <div className="max-w-2xl space-y-5">
          {/* Profile header card */}
          <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-5 text-white flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-green-200 text-sm">{user?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
                {(user as any)?.referralCode && (
                  <span className="text-xs bg-amber-400/30 text-amber-200 px-2 py-0.5 rounded-full font-mono">{(user as any).referralCode}</span>
                )}
              </div>
            </div>
            <div className="hidden sm:block text-right text-xs text-green-300">
              <p>Member since</p>
              <p className="text-white font-medium">{user?.createdAt ? formatDate((user as any).createdAt) : '—'}</p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 border-b pb-3 flex items-center gap-2"><User size={15} /> Edit Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { f: 'name', label: 'Full Name', type: 'text', icon: '👤', placeholder: 'Muhammad Ali' },
                { f: 'phone', label: 'Phone Number', type: 'tel', icon: '📞', placeholder: '03xx-xxxxxxx' },
                { f: 'address', label: 'Default Address', type: 'text', icon: '📍', placeholder: 'House #, Street, City' },
                { f: 'businessName', label: 'Business Name', type: 'text', icon: '🏢', placeholder: 'Optional' },
              ].map(field => (
                <div key={field.f}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{field.icon} {field.label}</label>
                  <input type={field.type} value={(profileForm as any)[field.f]}
                    onChange={e => setPF(p => ({ ...p, [field.f]: e.target.value }))}
                    className={inputCls} placeholder={field.placeholder} />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">✉️ Email (cannot change)</label>
              <input disabled value={user?.email || ''} className={`${inputCls} opacity-50 cursor-not-allowed bg-gray-50`} />
            </div>
            <button type="submit" disabled={savingProfile}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
              {savingProfile ? 'Saving...' : <><CheckCircle2 size={16} /> Save Profile</>}
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Languages size={16} /> Language Preference</h3>
            <div className="flex gap-3">
              {[{ val: 'en', label: '🇬🇧 English' }, { val: 'ur', label: '🇵🇰 اردو' }].map(opt => (
                <button key={opt.val} onClick={() => lang !== opt.val && toggleLang()}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${lang === opt.val ? 'bg-green-700 text-white border-green-700' : 'border-gray-200 text-gray-600 hover:border-green-400'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── ADDRESSES ─────────────────────────────────────────────────── */}
      {tab === 'addresses' && <AddressesTab userId={user?.id} userProfile={user} />}

      {/* ─── PAYMENT ────────────────────────────────────────────────────── */}
      {tab === 'payment' && <PaymentTab userId={user?.id} />}

      {/* ─── REWARDS ────────────────────────────────────────────────────── */}
      {tab === 'rewards' && <RewardsTab userId={user?.id} userName={user?.name} />}

      {/* ─── SECURITY ───────────────────────────────────────────────────── */}
      {tab === 'security' && (
        <div className="max-w-2xl space-y-5">
          {/* Security score */}
          {(() => {
            const has2FA = (user as any)?.twoFactorEnabled;
            const score = [has2FA, true /* has password */, !!(user as any)?.email].filter(Boolean).length;
            const pct = Math.round((score / 3) * 100);
            const color = pct === 100 ? 'bg-green-500' : pct >= 67 ? 'bg-amber-400' : 'bg-red-500';
            const label = pct === 100 ? 'Excellent' : pct >= 67 ? 'Good' : 'Basic';
            return (
              <div className={`rounded-2xl p-5 text-white ${pct === 100 ? 'bg-gradient-to-r from-green-700 to-green-600' : pct >= 67 ? 'bg-gradient-to-r from-amber-600 to-amber-500' : 'bg-gradient-to-r from-red-700 to-red-600'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm opacity-80">Account Security</p>
                    <p className="text-2xl font-bold">{label} — {pct}%</p>
                  </div>
                  <Shield size={32} className="opacity-60" />
                </div>
                <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex gap-4 mt-3 text-xs">
                  {[
                    { check: true, label: 'Password set' },
                    { check: !!(user as any)?.email, label: 'Email verified' },
                    { check: has2FA, label: '2FA active' },
                  ].map(item => (
                    <span key={item.label} className={`flex items-center gap-1 ${item.check ? 'opacity-100' : 'opacity-50'}`}>
                      {item.check ? '✓' : '○'} {item.label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Change password */}
          <form onSubmit={changePassword} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 border-b pb-3 flex items-center gap-2">🔒 Change Password</h2>
            <div className="space-y-3">
              {[
                { f: 'current', label: 'Current Password',     val: pwForm.current, setter: (v: string) => setPW(p => ({ ...p, current: v })) },
                { f: 'newPw',   label: 'New Password',         val: pwForm.newPw,   setter: (v: string) => setPW(p => ({ ...p, newPw: v })) },
                { f: 'confirm', label: 'Confirm New Password', val: pwForm.confirm, setter: (v: string) => setPW(p => ({ ...p, confirm: v })) },
              ].map(field => (
                <div key={field.f}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{field.label}</label>
                  <input type="password" value={field.val} onChange={e => field.setter(e.target.value)} required
                    minLength={field.f !== 'current' ? 6 : undefined}
                    className={`${inputCls} ${field.f === 'confirm' && pwForm.confirm && pwForm.newPw !== pwForm.confirm ? 'border-red-300' : ''}`}
                    placeholder="••••••" />
                </div>
              ))}
              {pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                <p className="text-xs text-red-500 flex items-center gap-1">⚠ Passwords do not match</p>
              )}
            </div>
            <button type="submit" disabled={savingPw}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
              {savingPw ? 'Updating...' : <><CheckCircle2 size={15} /> Update Password</>}
            </button>
          </form>

          {/* 2FA section */}
          <TwoFASection isEnabled={(user as any)?.twoFactorEnabled} />

          {/* Security tips */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">💡 Security Tips</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2"><span>•</span> Use a strong password with letters, numbers, and symbols</li>
              <li className="flex items-start gap-2"><span>•</span> Enable 2FA for the highest level of account protection</li>
              <li className="flex items-start gap-2"><span>•</span> Never share your password or 2FA codes with anyone</li>
              <li className="flex items-start gap-2"><span>•</span> Contact us at ricemill@sameergul.com if you suspect unauthorized access</li>
            </ul>
          </div>
        </div>
      )}
    </div>
    {chatOrder && (
      <ChatModal
        isOpen={!!chatOrder}
        onClose={() => setChatOrder(null)}
        contextType="order"
        contextRef={chatOrder.id}
        contextLabel={chatOrder.orderNumber}
        initialMessage={`Hi, I have a question about order ${chatOrder.orderNumber}`}
      />
    )}
    </PageTransition>
  );
}
