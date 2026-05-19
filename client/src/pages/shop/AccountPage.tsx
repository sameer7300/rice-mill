import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLang } from '../../contexts/LangContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Heart, Star, User, Shield, LogOut,
  Package, Wheat, Trash2, ChevronRight, CheckCircle2,
  ChevronDown, ChevronUp, ShoppingCart, Languages, Edit3
} from 'lucide-react';
import { OrderStatusBadge, PaymentBadge } from '../../components/ui/Badge';
import { inputCls, selectCls } from '../../components/ui/PageHeader';
import { useCart } from '../../contexts/CartContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { formatDate } from '../../utils/export';

const TABS = [
  { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={15} /> },
  { id: 'favorites', label: 'Favorites', icon: <Heart size={15} /> },
  { id: 'reviews', label: 'Reviews', icon: <Star size={15} /> },
  { id: 'profile', label: 'Profile', icon: <User size={15} /> },
  { id: 'security', label: 'Security', icon: <Shield size={15} /> },
] as const;
type Tab = typeof TABS[number]['id'];

const ORDER_FILTERS = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

const STATUS_REVIEW: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending Review', cls: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Published', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-600' },
};

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toggleLang, lang } = useLang();
  const { addItem } = useCart();
  const { format: formatPKR } = useCurrency();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('orders');

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderFilter, setOrderFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Favorites
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);

  // Profile
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    address: (user as any)?.address || '', businessName: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Security
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  // Load orders on mount
  useEffect(() => {
    api.get('/orders?limit=100').then(r => setOrders(r.data.orders || [])).catch(() => {}).finally(() => setLoadingOrders(false));
  }, []);

  // Load favorites when tab activated
  useEffect(() => {
    if (tab === 'favorites' && favorites.length === 0) {
      setLoadingFavs(true);
      api.get('/favorites').then(r => setFavorites(r.data)).catch(() => {}).finally(() => setLoadingFavs(false));
    }
    if (tab === 'reviews' && reviews.length === 0) {
      setLoadingReviews(true);
      api.get('/reviews/mine').then(r => setReviews(r.data || [])).catch(() => {}).finally(() => setLoadingReviews(false));
    }
    if (tab === 'profile') {
      api.get('/auth/me').then(r => {
        setProfileForm({
          name: r.data.name || '',
          phone: r.data.phone || '',
          address: r.data.address || '',
          businessName: r.data.customer?.businessName || ''
        });
      }).catch(() => {});
    }
  }, [tab]);

  // Filtered orders
  const filteredOrders = orders.filter(o =>
    orderFilter === 'All' ? true : o.status.toLowerCase() === orderFilter.toLowerCase()
  );

  const removeFavorite = async (productId: string) => {
    await api.post(`/favorites/${productId}`);
    setFavorites(f => f.filter(fav => fav.productId !== productId));
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
      if (match) {
        addItem({ productId: match.id, name: item.variety, variety: item.variety, grade: item.grade, pricePerKg: match.pricePerKg || item.pricePerKg, quantityKg: item.quantityKg, minOrderKg: 10 });
        added++;
      }
    }
    if (added > 0) toast.success(`${added} item${added > 1 ? 's' : ''} added to cart!`);
    else toast.error('Items not currently in stock');
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await api.delete(`/reviews/${id}/mine`);
    setReviews(r => r.filter(rev => rev.id !== id));
    toast.success('Review deleted');
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put(`/users/${user?.id}`, profileForm);
      toast.success('Profile updated!');
    } catch { toast.error('Error saving profile'); }
    finally { setSavingProfile(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPw.length < 6) { toast.error('Min 6 characters'); return; }
    setSavingPw(true);
    try {
      await api.post('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw });
      toast.success('Password changed!');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSavingPw(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold">{user?.name}</p>
              <p className="text-green-200 text-sm">{user?.email}</p>
              <p className="text-green-300 text-xs mt-0.5">Customer Account</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-green-200 hover:text-white text-sm transition-colors">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${tab === t.id ? 'bg-green-700 text-white shadow' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ─── ORDERS ─────────────────────────────────────────────────── */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex gap-2 flex-wrap">
              {ORDER_FILTERS.map(f => (
                <button key={f} onClick={() => setOrderFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${orderFilter === f ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'}`}>
                  {f}
                </button>
              ))}
            </div>

            {loadingOrders ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />)
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium text-gray-600">No {orderFilter !== 'All' ? orderFilter.toLowerCase() : ''} orders</p>
                <Link to="/" className="text-green-600 hover:underline text-sm mt-2 block">Start shopping →</Link>
              </div>
            ) : filteredOrders.map(o => (
              <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Order header */}
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
                    <button onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                      {expandedOrder === o.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
                {/* Expanded items */}
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
                    {o.deliveryAddress && (
                      <p className="text-xs text-gray-400 mt-2">📍 {o.deliveryAddress}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ─── FAVORITES ──────────────────────────────────────────────── */}
        {tab === 'favorites' && (
          <div>
            {loadingFavs ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-52 bg-gray-200 rounded-2xl animate-pulse" />)}
              </div>
            ) : favorites.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Heart size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium text-gray-600">No favorites yet</p>
                <Link to="/" className="text-green-600 hover:underline text-sm mt-2 block">Browse products →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {favorites.map(fav => {
                  const p = fav.product;
                  if (!p) return null;
                  return (
                    <div key={fav.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <Link to={`/products/${p.id}`} className="block h-36 bg-green-50 overflow-hidden relative">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Wheat size={24} className="text-green-300" /></div>
                        )}
                        <span className="absolute top-2 left-2 text-xs bg-white/90 text-gray-700 px-1.5 py-0.5 rounded-full font-medium">Grade {p.grade}</span>
                      </Link>
                      <div className="p-3">
                        <Link to={`/products/${p.id}`} className="font-semibold text-sm text-gray-900 hover:text-green-700 block truncate">{p.name}</Link>
                        <p className="text-green-700 font-bold text-sm">{formatPKR(p.pricePerKg)}/kg</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => addFavToCart(fav)}
                            className="flex-1 flex items-center justify-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg font-medium transition-colors">
                            <ShoppingCart size={12} /> Add to Cart
                          </button>
                          <button onClick={() => removeFavorite(fav.productId)}
                            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── REVIEWS ────────────────────────────────────────────────── */}
        {tab === 'reviews' && (
          <div className="space-y-3">
            {loadingReviews ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)
            ) : reviews.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Star size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium text-gray-600">No reviews yet</p>
                <p className="text-sm text-gray-400 mt-1">Purchase and review products to see them here.</p>
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
                        {rev.verifiedPurchase && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">✓ Verified Purchase</span>
                        )}
                      </div>
                      <StarDisplay rating={rev.rating} size={14} />
                      {rev.comment && <p className="text-gray-600 text-sm mt-1.5">{rev.comment}</p>}
                      {rev.adminNote && (
                        <p className="text-xs text-red-500 mt-1 italic">Admin note: {rev.adminNote}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1.5">{formatDate(rev.createdAt)}</p>
                    </div>
                    {rev.status === 'pending' && (
                      <button onClick={() => deleteReview(rev.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── PROFILE ────────────────────────────────────────────────── */}
        {tab === 'profile' && (
          <div className="max-w-lg space-y-5">
            <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-semibold text-gray-800 border-b pb-3">Edit Profile</h2>
              {[
                { f: 'name', label: 'Full Name', type: 'text' },
                { f: 'phone', label: 'Phone Number', type: 'tel' },
                { f: 'address', label: 'Default Address', type: 'text' },
                { f: 'businessName', label: 'Business Name (optional)', type: 'text' },
              ].map(field => (
                <div key={field.f}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{field.label}</label>
                  <input type={field.type} value={(profileForm as any)[field.f]}
                    onChange={e => setProfileForm(p => ({ ...p, [field.f]: e.target.value }))}
                    className={inputCls} />
                </div>
              ))}
              {/* Read-only fields */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email (cannot change)</label>
                <input disabled value={user?.email || ''} className={`${inputCls} opacity-50 cursor-not-allowed`} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm pt-1">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs">Member Since</p>
                  <p className="font-medium text-gray-700">{user ? formatDate((user as any).createdAt || new Date().toISOString()) : '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs">Account Type</p>
                  <p className="font-medium text-green-700 capitalize">{user?.role}</p>
                </div>
              </div>
              <button type="submit" disabled={savingProfile}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {savingProfile ? 'Saving...' : <><CheckCircle2 size={16} /> Save Profile</>}
              </button>
            </form>

            {/* Language preference */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Languages size={16} /> Language Preference</h3>
              <div className="flex gap-3">
                {[{ val: 'en', label: 'English' }, { val: 'ur', label: 'اردو' }].map(opt => (
                  <button key={opt.val} onClick={() => lang !== opt.val && toggleLang()}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${lang === opt.val ? 'bg-green-700 text-white border-green-700' : 'border-gray-200 text-gray-600 hover:border-green-400'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── SECURITY ───────────────────────────────────────────────── */}
        {tab === 'security' && (
          <div className="max-w-lg">
            <form onSubmit={changePassword} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-semibold text-gray-800 border-b pb-3">Change Password</h2>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Current Password</label>
                <input type="password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                  required className={inputCls} placeholder="••••••" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">New Password</label>
                <input type="password" value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                  required minLength={6} className={inputCls} placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Confirm New Password</label>
                <input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                  required className={`${inputCls} ${pwForm.confirm && pwForm.newPw !== pwForm.confirm ? 'border-red-300 ring-red-200' : ''}`}
                  placeholder="••••••" />
                {pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                <p className="font-semibold mb-1">Password requirements:</p>
                <p>• Minimum 6 characters</p>
                <p>• You will stay logged in after changing</p>
              </div>
              <button type="submit" disabled={savingPw}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60 transition-colors">
                {savingPw ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
