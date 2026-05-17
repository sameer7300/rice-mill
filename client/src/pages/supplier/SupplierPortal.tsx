import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import toast from 'react-hot-toast';
import {
  Wheat, LogOut, Package, DollarSign, User, MessageCircle,
  TrendingUp, Clock, CheckCircle2, AlertTriangle, ChevronRight,
  Download, Eye, X, Send, RefreshCw, Building2, Phone, MapPin,
  CreditCard, Calendar, Filter, Search, Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  staggerContainer, staggerItem, scrollReveal, cardHover, viewportOnce,
} from '../../utils/animations';
import { useChat } from '../../contexts/ChatContext';

const formatPKR = (n: number) => `PKR ${(n || 0).toLocaleString()}`;
const formatDate = (d: string | null | undefined) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
};
const daysAgo = (d: string | null | undefined) => {
  if (!d) return null;
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (diff === 0) return 'today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
};

const STATUS_COLORS: Record<string, string> = {
  paid:    'bg-green-100 text-green-700 border border-green-200',
  partial: 'bg-amber-100 text-amber-700 border border-amber-200',
  unpaid:  'bg-red-100 text-red-700 border border-red-200',
  pending:     'bg-gray-100 text-gray-600 border border-gray-200',
  confirmed:   'bg-green-100 text-green-700 border border-green-200',
  cancelled:   'bg-red-100 text-red-700 border border-red-200',
  completed:   'bg-blue-100 text-blue-700 border border-blue-200',
};

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp size={16} /> },
  { id: 'deliveries', label: 'My Deliveries', icon: <Package size={16} /> },
  { id: 'payments', label: 'Payments', icon: <DollarSign size={16} /> },
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  { id: 'messages', label: 'Messages', icon: <MessageCircle size={16} /> },
];

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, highlight = false }: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <motion.div variants={staggerItem}
      className={`rounded-2xl p-5 border ${highlight ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'} shadow-sm`}>
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function SupplierPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { conversation, startConversation, messages, sendMessage, loadMessages,
          joinConversation, widgetOpen, setWidgetOpen } = useChat();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [purchasesTotal, setPurchasesTotal] = useState(0);
  const [purchasesSummary, setPurchasesSummary] = useState<any>({});
  const [purchasePage, setPurchasePage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notices, setNotices] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  // Profile edit state
  const [editProfile, setEditProfile] = useState<any>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Delivery notice modal
  const [noticeModal, setNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ variety: '', estimatedKg: '', estimatedDate: '', qualityGrade: 'A', notes: '' });
  const [submittingNotice, setSubmittingNotice] = useState(false);

  // Purchase detail modal
  const [detailPurchase, setDetailPurchase] = useState<any>(null);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatConvId, setChatConvId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const VARIETIES = ['Basmati', 'Super Kernel', 'IRRI-6', 'IRRI-9', 'PK-386', 'Other'];

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [statsRes, profileRes, noticesRes] = await Promise.all([
        api.get('/supplier-portal/stats'),
        api.get('/supplier-portal/profile'),
        api.get('/supplier-portal/delivery-notices'),
      ]);
      setStats(statsRes.data.data);
      setProfile(profileRes.data.data);
      setEditProfile(profileRes.data.data);
      setNotices(noticesRes.data.data || []);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoadingStats(false); }
  }, []);

  const fetchPurchases = useCallback(async () => {
    setLoadingPurchases(true);
    try {
      const res = await api.get(`/supplier-portal/purchases?page=${purchasePage}&limit=15&status=${statusFilter}`);
      setPurchases(res.data.data?.purchases || []);
      setPurchasesTotal(res.data.data?.total || 0);
      setPurchasesSummary(res.data.data?.summary || {});
    } catch { toast.error('Failed to load deliveries'); }
    finally { setLoadingPurchases(false); }
  }, [purchasePage, statusFilter]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => { if (activeTab === 'deliveries') fetchPurchases(); }, [activeTab, fetchPurchases]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ── Chat helpers ─────────────────────────────────────────────────────────────
  const loadChat = useCallback(async () => {
    setChatLoading(true);
    try {
      const res = await api.get('/chat/my');
      if (res.data.data) {
        const conv = res.data.data;
        setChatConvId(conv.id);
        const msgs = await api.get(`/chat/${conv.id}/messages`);
        setChatMessages(msgs.data.data || []);
      }
    } catch { } finally { setChatLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === 'messages') loadChat(); }, [activeTab, loadChat]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    try {
      if (!chatConvId) {
        const res = await api.post('/chat/start', {
          guestName: profile?.businessName || user?.name,
          subject: 'Supplier Inquiry',
        });
        const conv = res.data.data;
        setChatConvId(conv.id);
        const msgs = await api.get(`/chat/${conv.id}/messages`);
        setChatMessages(msgs.data.data || []);
      }
      if (chatConvId) {
        // Use socket via ChatContext
        sendMessage(text);
        // Optimistic update
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(), message: text, senderRole: 'supplier',
          senderName: profile?.businessName || user?.name || 'Supplier',
          createdAt: new Date().toISOString(),
        }]);
      }
    } catch { toast.error('Failed to send message'); }
  };

  // ── Profile save ─────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.put('/supplier-portal/profile', {
        phone: editProfile.phone,
        address: editProfile.address,
        contactPerson: editProfile.contactPerson,
        bankName: editProfile.bankName,
        bankAccount: editProfile.bankAccount,
        bankTitle: editProfile.bankTitle,
      });
      setProfile({ ...profile, ...editProfile });
      toast.success('Profile updated successfully');
    } catch { toast.error('Failed to save profile'); }
    finally { setSavingProfile(false); }
  };

  // ── Delivery notice ──────────────────────────────────────────────────────────
  const handleSubmitNotice = async () => {
    if (!noticeForm.variety || !noticeForm.estimatedKg || !noticeForm.estimatedDate) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmittingNotice(true);
    try {
      await api.post('/supplier-portal/delivery-notice', noticeForm);
      toast.success('Delivery notice submitted. Admin will confirm.');
      setNoticeModal(false);
      setNoticeForm({ variety: '', estimatedKg: '', estimatedDate: '', qualityGrade: 'A', notes: '' });
      fetchDashboard();
    } catch { toast.error('Failed to submit notice'); }
    finally { setSubmittingNotice(false); }
  };

  // ── CSV export ───────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [['Variety','Qty (kg)','Grade','Price/kg','Total','Paid','Owed','Status','Date']];
    purchases.forEach(p => rows.push([
      p.variety, p.quantityKg, p.qualityGrade || p.quality, p.pricePerKg,
      p.totalAmount, p.paidAmount || 0, (p.totalAmount || 0) - (p.paidAmount || 0),
      p.paymentStatus, formatDate(p.createdAt),
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'my-deliveries.csv'; a.click();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Top navbar ───────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center">
              <Wheat size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none">Al-Noor Rice Mills</p>
              <p className="text-xs text-gray-400">Supplier Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile && (
              <span className="hidden sm:block text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl">
                {profile.businessName}
              </span>
            )}
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-50">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto pb-0" style={{ scrollbarWidth: 'none' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Tab content ──────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">

        {/* ── DASHBOARD TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <AnimatePresence mode="wait">
            <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {loadingStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Welcome */}
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Welcome back, {profile?.businessName} 👋
                    </h1>
                    {stats?.lastDelivery && (
                      <p className="text-sm text-gray-500 mt-1">
                        Last delivery: <span className="font-medium text-gray-700">{daysAgo(stats.lastDelivery)}</span>
                      </p>
                    )}
                  </div>

                  {/* Stat cards */}
                  <motion.div variants={staggerContainer} initial="initial" animate="animate"
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard label="Total kg Supplied" value={`${(stats?.totalKgSupplied || 0).toLocaleString()} kg`} sub="all time" />
                    <StatCard label="Total Earned" value={formatPKR(stats?.totalEarned || 0)} sub="all time" />
                    <StatCard label="Total Paid" value={formatPKR(stats?.totalPaid || 0)} sub="received" />
                    <StatCard label="Outstanding" value={formatPKR(stats?.outstanding || 0)} sub="pending" highlight={(stats?.outstanding || 0) > 0} />
                  </motion.div>

                  {/* This month */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package size={22} className="text-green-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">This Month</p>
                        <p className="text-2xl font-extrabold text-gray-900">{(stats?.thisMonthKg || 0).toLocaleString()} kg</p>
                        <p className="text-xs text-gray-400">delivered</p>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <DollarSign size={22} className="text-amber-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">This Month</p>
                        <p className="text-2xl font-extrabold text-gray-900">{formatPKR(stats?.thisMonthAmount || 0)}</p>
                        <p className="text-xs text-gray-400">earned</p>
                      </div>
                    </div>
                  </div>

                  {/* Outstanding alert */}
                  {(stats?.outstanding || 0) > 0 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-amber-800 text-sm">
                            Outstanding Balance: {formatPKR(stats.outstanding)}
                          </p>
                          <p className="text-xs text-amber-700 mt-0.5">
                            Across {stats.totalDeliveries} deliveries. Contact us to arrange payment.
                          </p>
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => setActiveTab('messages')}
                              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                              <MessageCircle size={13} /> Message Admin
                            </button>
                            <a href="tel:+9294612345" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors">
                              <Phone size={13} /> Call Us
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Recent deliveries */}
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                      <h2 className="font-bold text-gray-900 text-sm">Recent Deliveries</h2>
                      <button onClick={() => setActiveTab('deliveries')}
                        className="text-xs text-green-600 hover:text-green-800 font-semibold flex items-center gap-1">
                        View All <ChevronRight size={13} />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 font-semibold">
                          <tr>
                            <th className="px-4 py-3 text-left">Variety</th>
                            <th className="px-4 py-3 text-left">Qty</th>
                            <th className="px-4 py-3 text-left">Amount</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(purchases.length > 0 ? purchases : []).slice(0, 5).map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{p.variety}</td>
                              <td className="px-4 py-3 text-gray-600">{(p.quantityKg || 0).toLocaleString()} kg</td>
                              <td className="px-4 py-3 font-semibold">{formatPKR(p.totalAmount)}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[p.paymentStatus] || STATUS_COLORS.pending}`}>
                                  {p.paymentStatus}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(p.createdAt)}</td>
                            </tr>
                          ))}
                          {purchases.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No deliveries yet</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pending delivery notices */}
                  {notices.filter(n => n.status === 'pending' || n.status === 'confirmed').length > 0 && (
                    <div className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 text-sm">Pending Delivery Notices</h2>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {notices.filter(n => n.status === 'pending' || n.status === 'confirmed').map(n => (
                          <div key={n.id} className="flex items-center gap-3 px-5 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[n.status]}`}>{n.status}</span>
                            <span className="text-sm font-medium">{n.variety}</span>
                            <span className="text-sm text-gray-500">{(n.estimatedKg || 0).toLocaleString()} kg</span>
                            <span className="text-xs text-gray-400">→ {formatDate(n.estimatedDate)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── DELIVERIES TAB ────────────────────────────────────────────────── */}
        {activeTab === 'deliveries' && (
          <motion.div key="deliveries" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Deliveries</h2>
                <p className="text-sm text-gray-500">{purchasesTotal} total deliveries</p>
              </div>
              <div className="flex gap-2">
                <button onClick={exportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Download size={14} /> Export CSV
                </button>
                <button onClick={() => setNoticeModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-semibold transition-colors">
                  <Plus size={14} /> Notify New Delivery
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {['all', 'paid', 'partial', 'unpaid'].map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setPurchasePage(1); }}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
                    statusFilter === s ? 'bg-green-700 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'
                  }`}>
                  {s === 'all' ? 'All' : s === 'unpaid' ? 'Pending Payment' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Summary bar */}
            {purchasesSummary.totalAmount > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Total kg</p>
                  <p className="font-bold text-gray-900">{(purchasesSummary.totalKg || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Total Amount</p>
                  <p className="font-bold text-gray-900">{formatPKR(purchasesSummary.totalAmount || 0)}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Total Paid</p>
                  <p className="font-bold text-green-700">{formatPKR(purchasesSummary.totalPaid || 0)}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Outstanding</p>
                  <p className={`font-bold ${(purchasesSummary.outstanding || 0) > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                    {formatPKR(purchasesSummary.outstanding || 0)}
                  </p>
                </div>
              </div>
            )}

            {/* Desktop table */}
            {loadingPurchases ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <>
                <div className="hidden md:block bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 font-semibold">
                      <tr>
                        <th className="px-4 py-3 text-left">Variety</th>
                        <th className="px-4 py-3 text-left">Qty (kg)</th>
                        <th className="px-4 py-3 text-left">Grade</th>
                        <th className="px-4 py-3 text-left">Price/kg</th>
                        <th className="px-4 py-3 text-left">Total</th>
                        <th className="px-4 py-3 text-left">Paid</th>
                        <th className="px-4 py-3 text-left">Owed</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {purchases.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{p.variety}</td>
                          <td className="px-4 py-3">{(p.quantityKg || 0).toLocaleString()}</td>
                          <td className="px-4 py-3">{p.qualityGrade || '—'}</td>
                          <td className="px-4 py-3">{formatPKR(p.pricePerKg || 0)}</td>
                          <td className="px-4 py-3 font-semibold">{formatPKR(p.totalAmount || 0)}</td>
                          <td className="px-4 py-3 text-green-700">{formatPKR(p.paidAmount || 0)}</td>
                          <td className={`px-4 py-3 font-semibold ${(p.outstanding || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {formatPKR(p.outstanding || 0)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[p.paymentStatus] || ''}`}>
                              {p.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(p.createdAt)}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => setDetailPurchase(p)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-600 transition-colors">
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {purchases.length === 0 && (
                        <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">No deliveries found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {purchases.map(p => (
                    <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{p.variety} — Grade {p.qualityGrade || '—'}</p>
                          <p className="text-sm text-gray-600">{(p.quantityKg || 0).toLocaleString()} kg @ {formatPKR(p.pricePerKg || 0)}/kg</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[p.paymentStatus] || ''}`}>
                          {p.paymentStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                        <div><p className="text-gray-400">Total</p><p className="font-bold">{formatPKR(p.totalAmount || 0)}</p></div>
                        <div><p className="text-gray-400">Paid</p><p className="font-bold text-green-700">{formatPKR(p.paidAmount || 0)}</p></div>
                        <div><p className="text-gray-400">Owed</p><p className={`font-bold ${(p.outstanding || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}>{formatPKR(p.outstanding || 0)}</p></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                        <button onClick={() => setDetailPurchase(p)}
                          className="text-xs font-semibold text-green-700 hover:text-green-900">
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))}
                  {purchases.length === 0 && (
                    <div className="text-center py-12 text-gray-400">No deliveries found</div>
                  )}
                </div>

                {/* Pagination */}
                {purchasesTotal > 15 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {purchasePage > 1 && (
                      <button onClick={() => setPurchasePage(p => p - 1)}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">← Prev</button>
                    )}
                    <span className="px-4 py-2 text-sm text-gray-500">
                      Page {purchasePage} of {Math.ceil(purchasesTotal / 15)}
                    </span>
                    {purchasePage * 15 < purchasesTotal && (
                      <button onClick={() => setPurchasePage(p => p + 1)}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">Next →</button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Delivery notices list */}
            {notices.length > 0 && (
              <div className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm">Submitted Delivery Notices</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {notices.map(n => (
                    <div key={n.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[n.status]}`}>{n.status}</span>
                      <span className="text-sm font-medium">{n.variety}</span>
                      <span className="text-sm text-gray-600">{(n.estimatedKg || 0).toLocaleString()} kg • Grade {n.qualityGrade}</span>
                      <span className="text-xs text-gray-400">Expected: {formatDate(n.estimatedDate)}</span>
                      {n.adminNote && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{n.adminNote}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── PAYMENTS TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'payments' && (
          <motion.div key="payments" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Payment History</h2>

            {/* Summary */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Total Earned</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">{formatPKR(stats.totalEarned)}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Total Paid</p>
                  <p className="text-2xl font-extrabold text-green-700 mt-1">{formatPKR(stats.totalPaid)}</p>
                </div>
                <div className={`rounded-2xl p-5 shadow-sm text-center border ${stats.outstanding > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Outstanding</p>
                  <p className={`text-2xl font-extrabold mt-1 ${stats.outstanding > 0 ? 'text-red-600' : 'text-gray-400'}`}>{formatPKR(stats.outstanding)}</p>
                </div>
              </div>
            )}

            {/* Outstanding alert */}
            {(stats?.outstanding || 0) > 0 && (
              <div className="mb-6 border border-amber-200 bg-amber-50 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-800 text-sm">
                      ⚠️ You have {formatPKR(stats.outstanding)} in pending payments
                    </p>
                    <div className="mt-2 text-sm text-amber-700 space-y-0.5">
                      <p>Contact: <span className="font-semibold">+92-946-123456</span></p>
                      <p>Email: <span className="font-semibold">ricemill@sameergul.com</span></p>
                    </div>
                    <button onClick={() => setActiveTab('messages')}
                      className="mt-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                      <MessageCircle size={13} /> Message Admin
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payments from purchases */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Payment Records</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Variety</th>
                      <th className="px-4 py-3 text-left">Total</th>
                      <th className="px-4 py-3 text-left">Paid</th>
                      <th className="px-4 py-3 text-left">Owed</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {purchases.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(p.createdAt)}</td>
                        <td className="px-4 py-3 font-medium">{p.variety}</td>
                        <td className="px-4 py-3 font-semibold">{formatPKR(p.totalAmount || 0)}</td>
                        <td className="px-4 py-3 text-green-700">{formatPKR(p.paidAmount || 0)}</td>
                        <td className={`px-4 py-3 font-semibold ${(p.outstanding || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {formatPKR(p.outstanding || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[p.paymentStatus] || ''}`}>
                            {p.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {purchases.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No payment records yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PROFILE TAB ───────────────────────────────────────────────────── */}
        {activeTab === 'profile' && editProfile && (
          <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-xl space-y-6">
            <h2 className="text-xl font-bold text-gray-900">My Profile</h2>

            {/* Business info (read-only) */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                <Building2 size={15} className="text-gray-400" /> Business Information
                <span className="text-xs text-gray-400 font-normal">(admin-managed)</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Business Name</span>
                  <span className="font-semibold text-gray-900">{profile?.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Supplier Since</span>
                  <span className="font-semibold text-gray-900">{formatDate(profile?.joinedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Deliveries</span>
                  <span className="font-semibold text-gray-900">{profile?.totalDeliveries || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Email</span>
                  <span className="font-semibold text-gray-900">{profile?.userEmail}</span>
                </div>
              </div>
            </div>

            {/* Contact details (editable) */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                <Phone size={15} className="text-gray-400" /> Contact Details
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Contact Person', key: 'contactPerson', type: 'text', placeholder: 'Full name' },
                  { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+92-XXX-XXXXXXX' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                    <input type={f.type} value={editProfile[f.key] || ''} placeholder={f.placeholder}
                      onChange={e => setEditProfile({ ...editProfile, [f.key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                  <textarea rows={2} value={editProfile.address || ''} placeholder="Business address"
                    onChange={e => setEditProfile({ ...editProfile, address: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                </div>
              </div>
            </div>

            {/* Payment details (editable) */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                <CreditCard size={15} className="text-gray-400" /> Payment Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Bank Name</label>
                  <select value={editProfile.bankName || ''}
                    onChange={e => setEditProfile({ ...editProfile, bankName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select bank</option>
                    {['HBL', 'UBL', 'MCB', 'Meezan Bank', 'Allied Bank', 'Bank Alfalah', 'NBP', 'Other'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Account Title</label>
                  <input type="text" value={editProfile.bankTitle || ''} placeholder="Account holder name"
                    onChange={e => setEditProfile({ ...editProfile, bankTitle: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Account Number</label>
                  <input type="text" value={editProfile.bankAccount || ''} placeholder="Enter account number"
                    onChange={e => setEditProfile({ ...editProfile, bankAccount: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <p className="text-xs text-gray-400 mt-1">Stored securely — only last 4 digits shown</p>
                </div>
              </div>
            </div>

            <button onClick={handleSaveProfile} disabled={savingProfile}
              className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              {savingProfile ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </motion.div>
        )}

        {/* ── MESSAGES TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'messages' && (
          <motion.div key="messages" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>

            <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 bg-green-700">
                <p className="font-bold text-white text-sm">Al-Noor Rice Mills Support</p>
                <p className="text-green-200 text-xs">Usually replies within 1 hour</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {chatLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 text-sm font-medium">No messages yet</p>
                    <p className="text-gray-400 text-xs mt-1">Send a message to start the conversation</p>
                  </div>
                ) : chatMessages.map((msg: any) => {
                  const isOwn = msg.senderRole === 'supplier' || msg.senderRole === 'customer' || msg.senderRole === 'guest';
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        isOwn ? 'bg-green-700 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        {msg.message || msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button onClick={handleSendChat} disabled={!chatInput.trim()}
                  className="w-10 h-10 bg-green-700 hover:bg-green-800 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors">
                  <Send size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* ── Delivery notice modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {noticeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 text-base">📦 Notify Upcoming Delivery</h3>
                <button onClick={() => setNoticeModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Variety *</label>
                  <select value={noticeForm.variety} onChange={e => setNoticeForm({ ...noticeForm, variety: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select variety</option>
                    {VARIETIES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Estimated Quantity (kg) *</label>
                  <input type="number" min="1" value={noticeForm.estimatedKg}
                    onChange={e => setNoticeForm({ ...noticeForm, estimatedKg: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Quality Grade</label>
                  <select value={noticeForm.qualityGrade} onChange={e => setNoticeForm({ ...noticeForm, qualityGrade: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="A">Grade A (Premium)</option>
                    <option value="B">Grade B (Standard)</option>
                    <option value="C">Grade C (Economy)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Expected Date *</label>
                  <input type="date" value={noticeForm.estimatedDate}
                    onChange={e => setNoticeForm({ ...noticeForm, estimatedDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Notes (optional)</label>
                  <textarea rows={2} value={noticeForm.notes}
                    onChange={e => setNoticeForm({ ...noticeForm, notes: e.target.value })}
                    placeholder="Any special instructions or quality notes..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                </div>
                <button onClick={handleSubmitNotice} disabled={submittingNotice}
                  className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {submittingNotice ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</> : 'Submit Notice'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Purchase detail modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {detailPurchase && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 text-base">Delivery Details</h3>
                <button onClick={() => setDetailPurchase(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ['Variety', detailPurchase.variety],
                  ['Quality Grade', detailPurchase.qualityGrade || '—'],
                  ['Quantity', `${(detailPurchase.quantityKg || 0).toLocaleString()} kg`],
                  ['Price per kg', formatPKR(detailPurchase.pricePerKg || 0)],
                  ['Total Amount', formatPKR(detailPurchase.totalAmount || 0)],
                  ['Amount Paid', formatPKR(detailPurchase.paidAmount || 0)],
                  ['Outstanding', formatPKR(detailPurchase.outstanding || 0)],
                  ['Date', formatDate(detailPurchase.createdAt)],
                  ['Notes', detailPurchase.notes || '—'],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-900">{val as string}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-gray-500">Status</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[detailPurchase.paymentStatus] || ''}`}>
                    {detailPurchase.paymentStatus}
                  </span>
                </div>
              </div>
              <button onClick={() => { setDetailPurchase(null); setActiveTab('messages'); }}
                className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-green-700 border border-green-200 rounded-xl py-2.5 hover:bg-green-50 transition-colors">
                <MessageCircle size={15} /> Chat about this delivery
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
