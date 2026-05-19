import { useState, useEffect, useCallback } from 'react';
import PhoneInput from '../../components/ui/PhoneInput';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTracking } from '../../contexts/TrackingContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  ShoppingCart, Tag, ChevronRight, Wheat, Truck, CheckCircle2, MapPin,
  CreditCard, UserPlus, User, Eye, EyeOff, Shield, Clock, Star, Gift,
  Phone, Mail, Package, Lock, Globe, AlertTriangle, Building2
} from 'lucide-react';
import PageTransition from '../../components/PageTransition';

const STRIPE_PK = 'pk_test_51QP3gxFWlKllCGeEWWU7bpk836N6LYS41bKWn8DGdDwWE1NKFhr4781lTu8k7KyyJWDdRQVJM7yMNolxIJqzYFi000kl55Kd95';
const stripePromise = loadStripe(STRIPE_PK);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: { fontSize: '14px', color: '#1f2937', fontFamily: 'Arial, sans-serif', '::placeholder': { color: '#9ca3af' } },
    invalid: { color: '#dc2626' },
  },
};

// Country list — ISO-2 code + label
const COUNTRIES = [
  { code: 'PK', name: 'Pakistan' }, { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'AE', name: 'United Arab Emirates' }, { code: 'SA', name: 'Saudi Arabia' }, { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' }, { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' }, { code: 'QA', name: 'Qatar' }, { code: 'KW', name: 'Kuwait' },
  { code: 'OM', name: 'Oman' }, { code: 'BH', name: 'Bahrain' }, { code: 'BD', name: 'Bangladesh' },
  { code: 'IN', name: 'India' }, { code: 'MY', name: 'Malaysia' }, { code: 'SG', name: 'Singapore' },
  { code: 'ZA', name: 'South Africa' }, { code: 'NG', name: 'Nigeria' }, { code: 'EG', name: 'Egypt' },
  { code: 'TR', name: 'Turkey' }, { code: 'JP', name: 'Japan' }, { code: 'CN', name: 'China' },
  { code: 'OTHER', name: 'Other Country' },
];

function estimatedDelivery() {
  const now = new Date();
  const d = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  return d.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner />
    </Elements>
  );
}

function CheckoutInner() {
  const { items, subtotal, clearCart } = useCart();
  const { user, isCustomer, loginDirect } = useAuth();
  const { currency, convert, format, rates } = useCurrency();
  const { geo } = useTracking();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountResult, setDiscountResult] = useState<any>(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: '',
    countryCode: 'PK', paymentMethod: 'cod', notes: '',
  });
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [savedPayments, setSavedPayments]   = useState<any[]>([]);
  const [selectedAddr, setSelectedAddr]     = useState<string>('');
  const [accountMode, setAccountMode] = useState<'create' | 'guest'>('create');
  const [acctPw, setAcctPw]         = useState('');
  const [acctPwConf, setAcctPwConf] = useState('');
  const [showPw, setShowPw]         = useState(false);
  // Shipping zone state
  const [zoneInfo, setZoneInfo]   = useState<any>(null);
  const [intlShipping, setIntlShipping] = useState<number>(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  // Stripe
  const stripe   = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);

  const isDomestic = !form.countryCode || form.countryCode === 'PK';

  useEffect(() => {
    api.get('/shop/settings').then(r => setSettings(r.data)).catch(() => {});
    if (items.length === 0) navigate('/');
    // Auto-select country from geo detection
    if (geo?.countryCode && geo.countryCode !== 'PK') {
      const supported = ['US','GB','AE','SA','CA','AU','DE','FR','NL','QA','KW','OM','BH','BD','IN','MY','SG','ZA','NG','EG','TR','JP','CN'];
      if (supported.includes(geo.countryCode)) {
        setForm(f => ({ ...f, countryCode: geo.countryCode! }));
      }
    }
    if (isCustomer && user) {
      setForm(f => ({ ...f, name: user.name || '', email: user.email || '', phone: (user as any).phone || '' }));
      api.get('/addresses').then(r => {
        const addrs = r.data.data || [];
        setSavedAddresses(addrs);
        const def = addrs.find((a: any) => a.isDefault) || addrs[0];
        if (def) {
          setSelectedAddr(def.id);
          setForm(f => ({
            ...f,
            address: `${def.addressLine1}${def.addressLine2 ? ', ' + def.addressLine2 : ''}, ${def.city}`,
            city: def.city,
            countryCode: def.country === 'Pakistan' ? 'PK' : (def.countryCode || 'PK'),
          }));
        }
      }).catch(() => {});
      api.get('/payment-methods').then(r => {
        const methods = r.data.data || [];
        setSavedPayments(methods);
        const def = methods.find((m: any) => m.isDefault) || methods[0];
        if (def) {
          const pmMap: Record<string, string> = { cod: 'cod', bank_transfer: 'bank', easypaisa: 'easypaisa', jazzcash: 'jazzcash' };
          setForm(f => ({ ...f, paymentMethod: pmMap[def.type] || 'cod' }));
        }
      }).catch(() => {});
    }
  }, []);

  // Auto-populate country when geo loads asynchronously (arrives after initial render)
  useEffect(() => {
    if (!geo?.countryCode || geo.countryCode === 'PK') return;
    // Only auto-set if user hasn't manually changed the country yet (still on default PK)
    setForm(f => {
      if (f.countryCode !== 'PK') return f; // already changed
      const supported = ['US','GB','AE','SA','CA','AU','DE','FR','NL','QA','KW','OM','BH','BD','IN','MY','SG','ZA','NG','EG','TR','JP','CN'];
      const code = supported.includes(geo.countryCode!) ? geo.countryCode! : 'OTHER';
      return { ...f, countryCode: code };
    });
  }, [geo?.countryCode]);

  // Fetch shipping zone whenever country or cart weight changes
  const totalKg = items.reduce((s, i) => s + i.quantityKg, 0);
  const fetchShipping = useCallback(async (countryCode: string) => {
    if (countryCode === 'PK') { setZoneInfo(null); setIntlShipping(0); return; }
    setShippingLoading(true);
    try {
      const { data } = await api.get('/shipping/calculate', {
        params: { country: countryCode, weightKg: totalKg, subtotalPKR: subtotal }
      });
      setZoneInfo(data.zone || null);
      setIntlShipping(data.feePKR || 0);
      if (!data.available) toast.error('Shipping not available to this location. Contact us for a quote.');
      if (data.free) setIntlShipping(0);
    } catch {
      setZoneInfo(null);
    } finally {
      setShippingLoading(false);
    }
  }, [totalKg, subtotal]);

  useEffect(() => {
    if (!isDomestic) {
      fetchShipping(form.countryCode);
      // International: switch away from domestic-only payment methods
      if (['cod', 'easypaisa', 'jazzcash', 'bank'].includes(form.paymentMethod)) {
        setForm(f => ({ ...f, paymentMethod: 'stripe' }));
      }
    } else {
      setZoneInfo(null);
      setIntlShipping(0);
    }
  }, [form.countryCode]);

  const inp = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  // Shipping cost
  const domesticShipping = subtotal >= (settings.freeShippingAbove || 10000) ? 0 : (settings.shippingFee || 500);
  const shipping = isDomestic ? domesticShipping : intlShipping;
  const discountAmount = discountResult?.discountAmount || 0;
  const loyaltyPtsEarned = Math.floor(subtotal / 100);
  const totalPKR = subtotal + shipping - discountAmount;
  // Amount in selected currency
  const totalInCurrency = convert(totalPKR);
  // Exchange rate: PKR per 1 unit of selected currency (e.g. 1 USD = 280 PKR means rate = 280)
  const pkrPerUnit = currency === 'PKR' ? 1 : (rates[currency] ? 1 / rates[currency] : 1);

  const validateDiscount = async () => {
    if (!discountCode.trim()) return;
    setValidatingDiscount(true);
    try {
      const { data } = await api.post('/shop/discount/validate', { code: discountCode, orderTotal: subtotal });
      setDiscountResult(data);
      toast.success(`Discount applied! You save ${format(data.discountAmount)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid code');
      setDiscountResult(null);
    } finally { setValidatingDiscount(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    if (!isCustomer && accountMode === 'create' && form.email) {
      if (acctPw.length < 6) { toast.error('Password must be at least 6 characters'); return; }
      if (acctPw !== acctPwConf) { toast.error('Passwords do not match'); return; }
    }
    setLoading(true);

    const basePayload = {
      ...form,
      discountCode: discountResult ? discountCode : undefined,
      items: items.map(i => ({ productId: i.productId, quantityKg: i.quantityKg })),
      createAccount: !isCustomer && accountMode === 'create' && !!form.email,
      password: !isCustomer && accountMode === 'create' && form.email ? acctPw : undefined,
      currency,
      exchangeRate: pkrPerUnit,
      shippingFee: shipping,
      shippingZoneId: zoneInfo?.id || undefined,
    };

    try {
      if (form.paymentMethod === 'stripe') {
        if (!stripe || !elements) { toast.error('Stripe not loaded yet'); setLoading(false); return; }
        const cardEl = elements.getElement(CardElement);
        if (!cardEl) { toast.error('Card element missing'); setLoading(false); return; }

        const intentRes = await api.post('/shop/create-payment-intent', {
          amount: totalInCurrency,
          currency: currency.toLowerCase(),
        });
        const { clientSecret } = intentRes.data;

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardEl, billing_details: { name: form.name, email: form.email || undefined } },
        });
        if (error) { setCardError(error.message || 'Payment failed'); toast.error(error.message || 'Payment failed'); setLoading(false); return; }
        if (paymentIntent?.status !== 'succeeded') { toast.error('Payment incomplete'); setLoading(false); return; }
        toast.success('💳 Card payment confirmed!');

        const { data } = await api.post('/shop/checkout', { ...basePayload, stripePaymentIntentId: paymentIntent.id });
        if (data.token && data.user) { loginDirect(data.token, data.user); toast.success('Account created!'); }
        clearCart();
        navigate(`/order-success/${data.order.orderNumber}`, {
          state: { order: data.order, whatsappUrl: data.whatsappUrl, shipping: data.shipping, discountAmount: data.discountAmount }
        });
        return;
      }

      const { data } = await api.post('/shop/checkout', basePayload);
      if (data.token && data.user) { loginDirect(data.token, data.user); toast.success('Account created! Welcome to Al-Noor Rice Mills.'); }
      clearCart();
      navigate(`/order-success/${data.order.orderNumber}`, {
        state: { order: data.order, whatsappUrl: data.whatsappUrl, shipping: data.shipping, discountAmount: data.discountAmount }
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
    } finally { setLoading(false); }
  };

  // Payment options filtered by region
  const DOMESTIC_PAYMENTS = [
    { value: 'cod',       label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: '💵', badge: 'Popular' },
    { value: 'stripe',    label: 'Credit / Debit Card', sub: 'Visa, Mastercard — secured by Stripe', icon: '💳', badge: 'Instant' },
    { value: 'bank',      label: 'Bank Transfer', sub: 'Transfer to our local bank account', icon: '🏦', badge: null },
    { value: 'easypaisa', label: 'EasyPaisa', sub: 'Transfer to our EasyPaisa account', icon: '📱', badge: null },
    { value: 'jazzcash',  label: 'JazzCash', sub: 'Transfer to our JazzCash account', icon: '📱', badge: null },
  ];
  const INTL_PAYMENTS = [
    { value: 'stripe',    label: 'Credit / Debit Card', sub: 'Visa, Mastercard — secured by Stripe', icon: '💳', badge: 'Recommended' },
    { value: 'bank_wire', label: 'International Bank Wire', sub: 'SWIFT / IBAN transfer — we\'ll send details after order', icon: '🏦', badge: null },
  ];
  const PAYMENT_OPTIONS = isDomestic ? DOMESTIC_PAYMENTS : INTL_PAYMENTS;

  if (items.length === 0) return null;

  return (
    <PageTransition>
    <Helmet><title>Checkout — Al-Noor Rice Mills</title></Helmet>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-700 rounded-lg flex items-center justify-center"><Wheat size={14} className="text-white" /></div>
            <span className="font-bold text-gray-900 text-sm hidden sm:block">Al-Noor Rice Mills</span>
          </Link>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Lock size={11} /> Secure Checkout</span>
            <span className="flex items-center gap-1"><Globe size={11} /> {currency} — Worldwide Shipping</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart size={22} className="text-green-600" /> Checkout
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} item{items.length > 1 ? 's' : ''} · Prices in {currency}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ─── LEFT FORM ─── */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ① Contact */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-700 text-white rounded-full text-xs font-bold flex items-center justify-center">1</span>
                  <h2 className="font-semibold text-gray-800">Contact Information</h2>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={form.name} onChange={e => inp('name', e.target.value)} required
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Muhammad Ali" />
                    </div>
                  </div>
                  <div>
                    <PhoneInput label="Phone" required value={form.phone} onChange={v => inp('phone', v)} defaultIso={geo?.countryCode || undefined} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" value={form.email} onChange={e => inp('email', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="you@example.com" />
                    </div>
                  </div>
                </div>
              </section>

              {/* ② Delivery Address */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-700 text-white rounded-full text-xs font-bold flex items-center justify-center">2</span>
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2"><MapPin size={14} className="text-green-600" /> Delivery Address</h2>
                </div>
                <div className="p-6 space-y-4">
                  {/* Country selector */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1">
                      <Globe size={11} /> Destination Country *
                    </label>
                    <select value={form.countryCode} onChange={e => inp('countryCode', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                    {shippingLoading && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><span className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" /> Calculating shipping...</p>}
                    {!isDomestic && zoneInfo && !shippingLoading && (
                      <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                        ✓ Ships via {zoneInfo.name} zone · {zoneInfo.minDays}–{zoneInfo.maxDays} business days
                      </p>
                    )}
                  </div>

                  {/* Saved addresses */}
                  {savedAddresses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Saved Addresses</p>
                      {savedAddresses.map(addr => (
                        <label key={addr.id} className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${selectedAddr === addr.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                          <input type="radio" name="savedAddr" value={addr.id} checked={selectedAddr === addr.id}
                            onChange={() => {
                              setSelectedAddr(addr.id);
                              setForm(f => ({
                                ...f,
                                address: `${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.city}`,
                                city: addr.city,
                              }));
                            }} className="mt-0.5 accent-green-600 w-4 h-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-gray-800">{addr.label} — {addr.fullName}</p>
                              {addr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Default</span>}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{addr.addressLine1}, {addr.city}, {addr.country}</p>
                          </div>
                        </label>
                      ))}
                      <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${selectedAddr === 'new' ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300 hover:border-green-400'}`}>
                        <input type="radio" name="savedAddr" value="new" checked={selectedAddr === 'new'}
                          onChange={() => { setSelectedAddr('new'); setForm(f => ({ ...f, address: '', city: '' })); }} className="accent-green-600 w-4 h-4" />
                        <span className="text-sm text-green-700 font-medium">+ Enter a different address</span>
                      </label>
                    </div>
                  )}

                  {/* Manual address entry */}
                  {(savedAddresses.length === 0 || selectedAddr === 'new') && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Street Address *</label>
                        <input type="text" value={form.address} onChange={e => inp('address', e.target.value)} required
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="House #, Street, Area" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">City / State *</label>
                          <input type="text" value={form.city} onChange={e => inp('city', e.target.value)} required
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder={isDomestic ? 'Lahore, Karachi...' : 'City, State'} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Order Notes</label>
                          <input type="text" value={form.notes} onChange={e => inp('notes', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Gate color, landmark..." />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* International customs notice */}
                  {!isDomestic && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <p className="font-semibold mb-0.5">Customs & Import Duties</p>
                        <p>Import taxes, duties, and customs fees are the <strong>buyer's responsibility</strong>. These vary by country and are not included in our prices. Please check your local regulations before ordering.</p>
                      </div>
                    </div>
                  )}

                  {/* Delivery estimate */}
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                    <Clock size={13} className="flex-shrink-0" />
                    {isDomestic
                      ? <span>Estimated delivery: <strong>{estimatedDelivery()}</strong> (3–5 business days)</span>
                      : zoneInfo
                        ? <span>International shipping: <strong>{zoneInfo.minDays}–{zoneInfo.maxDays} business days</strong> after dispatch</span>
                        : <span>Delivery time depends on your location</span>
                    }
                  </div>
                </div>
              </section>

              {/* ③ Payment */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-700 text-white rounded-full text-xs font-bold flex items-center justify-center">3</span>
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2"><CreditCard size={14} className="text-green-600" /> Payment Method</h2>
                  {!isDomestic && <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Globe size={10} /> International</span>}
                </div>
                <div className="p-6 space-y-3">
                  {/* Domestic saved payment methods */}
                  {isDomestic && savedPayments.length > 0 && (
                    <div className="space-y-2 pb-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Saved Methods</p>
                      {savedPayments.map(m => {
                        const pmMap: Record<string, string> = { cod: 'cod', bank_transfer: 'bank', easypaisa: 'easypaisa', jazzcash: 'jazzcash' };
                        const val = pmMap[m.type] || 'cod';
                        return (
                          <label key={m.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${form.paymentMethod === val ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                            <input type="radio" value={val} checked={form.paymentMethod === val} onChange={e => inp('paymentMethod', e.target.value)} className="accent-green-600 w-4 h-4" />
                            <span className="text-base">{m.type === 'cod' ? '💵' : '🏦'}</span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                              {m.accountNumber && <p className="text-xs text-gray-400">{m.accountNumber}</p>}
                            </div>
                            {m.isDefault && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Default</span>}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {PAYMENT_OPTIONS.map(opt => (
                    <label key={opt.value} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${form.paymentMethod === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                      <input type="radio" value={opt.value} checked={form.paymentMethod === opt.value} onChange={e => inp('paymentMethod', e.target.value)} className="accent-green-600 w-4 h-4 flex-shrink-0" />
                      <span className="text-xl">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-gray-800">{opt.label}</p>
                          {opt.badge && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">{opt.badge}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{opt.sub}</p>
                      </div>
                    </label>
                  ))}

                  {/* Domestic bank transfer instructions */}
                  {form.paymentMethod === 'bank' && isDomestic && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      📞 After placing, share your transfer receipt on WhatsApp: <strong>+92-300-1234567</strong>. Order dispatched after payment confirmed.
                    </div>
                  )}

                  {/* International bank wire instructions */}
                  {form.paymentMethod === 'bank_wire' && !isDomestic && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
                        <Building2 size={14} /> International Bank Wire Transfer
                      </div>
                      <p className="text-xs text-blue-700">
                        After placing your order, we will email you our full SWIFT/IBAN bank details. Your order will be processed once the transfer is confirmed (typically 1–3 business days).
                      </p>
                      <div className="flex items-center gap-2 p-2 bg-white rounded-lg text-xs text-gray-600 border border-blue-100">
                        <Shield size={12} className="text-blue-500" /> All wire details are provided securely via email after order confirmation.
                      </div>
                    </div>
                  )}

                  {/* Stripe card details */}
                  {form.paymentMethod === 'stripe' && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-700">Card Details</span>
                        <div className="flex gap-1.5 ml-auto">
                          {['VISA', 'MC'].map(b => (
                            <span key={b} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded font-bold text-gray-600">{b}</span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white border-2 border-gray-200 focus-within:border-green-500 rounded-xl px-4 py-3 transition-colors">
                        <CardElement options={CARD_ELEMENT_OPTIONS} onChange={e => setCardError(e.error?.message || null)} />
                      </div>
                      {cardError && <p className="text-xs text-red-500">{cardError}</p>}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        🔒 Secured by Stripe — charged in <strong>{currency}</strong>
                      </div>
                      {currency !== 'PKR' && (
                        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-2">
                          Charge: <strong>{format(totalPKR)}</strong> — converted at live rate from PKR {totalPKR.toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* ④ Create Account (guests only) */}
              {!isCustomer && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-700 text-white rounded-full text-xs font-bold flex items-center justify-center">4</span>
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2"><UserPlus size={14} className="text-green-600" /> Save Your Details</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { v: 'create', icon: '⭐', label: 'Create Account', desc: 'Track orders, earn points, faster checkout' },
                        { v: 'guest',  icon: '👤', label: 'Guest Checkout',  desc: 'No account — continue as guest' },
                      ] as const).map(opt => (
                        <button key={opt.v} type="button" onClick={() => setAccountMode(opt.v)}
                          className={`flex flex-col items-start gap-1 p-4 border-2 rounded-xl transition-all text-left ${accountMode === opt.v ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-lg">{opt.icon}</span>
                            <span className="font-semibold text-sm text-gray-800">{opt.label}</span>
                            {accountMode === opt.v && <CheckCircle2 size={14} className="text-green-600 ml-auto" />}
                          </div>
                          <p className="text-xs text-gray-500">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                    {accountMode === 'create' && (
                      !form.email ? (
                        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-700">
                          <Mail size={13} /> Add your email above to create an account and earn loyalty points.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Password *</label>
                              <div className="relative">
                                <input type={showPw ? 'text' : 'password'} value={acctPw} onChange={e => setAcctPw(e.target.value)}
                                  minLength={6} required={accountMode === 'create' && !!form.email}
                                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="Min 6 characters" />
                                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Confirm *</label>
                              <input type="password" value={acctPwConf} onChange={e => setAcctPwConf(e.target.value)}
                                required={accountMode === 'create' && !!form.email}
                                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${acctPwConf && acctPw !== acctPwConf ? 'border-red-300' : 'border-gray-200'}`}
                                placeholder="Repeat" />
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </section>
              )}

              {/* Place Order */}
              <button type="submit" disabled={loading || (shippingLoading && !isDomestic)}
                className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white py-4 rounded-2xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing Order...</>
                ) : (
                  <>
                    {!isCustomer && accountMode === 'create' && form.email && acctPw.length >= 6
                      ? <><UserPlus size={18} /> Create Account & Place Order</>
                      : <><Package size={18} /> Place Order</>
                    }
                    <span className="ml-1 bg-white/20 px-2.5 py-0.5 rounded-lg text-sm font-semibold">
                      {format(totalPKR)}
                    </span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Shield size={12} /> Secure</span>
                <span className="flex items-center gap-1"><Lock size={12} /> Private</span>
                <span className="flex items-center gap-1"><Globe size={12} /> Worldwide</span>
              </div>
            </form>
          </div>

          {/* ─── RIGHT ORDER SUMMARY ─── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <ShoppingCart size={15} className="text-green-600" /> Order Summary
                    <span className="ml-auto text-xs text-gray-400">{items.length} item{items.length > 1 ? 's' : ''}</span>
                  </h2>
                </div>

                {/* Items */}
                <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
                  {items.map(item => (
                    <div key={item.productId} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          : <Wheat size={16} className="text-green-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.quantityKg}kg × {format(item.pricePerKg)}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 flex-shrink-0">{format(item.quantityKg * item.pricePerKg)}</p>
                    </div>
                  ))}
                </div>

                {/* Discount */}
                <div className="px-4 py-3 border-t border-gray-50">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={discountCode}
                        onChange={e => { setDiscountCode(e.target.value.toUpperCase()); if (discountResult) setDiscountResult(null); }}
                        placeholder="Promo code" className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <button type="button" onClick={validateDiscount} disabled={validatingDiscount || !discountCode.trim()}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap">
                      {validatingDiscount ? '...' : 'Apply'}
                    </button>
                  </div>
                  {discountResult && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-xs text-green-700">
                      <CheckCircle2 size={12} />
                      <span className="font-semibold">
                        {discountResult.discount.type === 'percentage' ? `${discountResult.discount.value}% off` : `${format(discountResult.discount.value)} off`}
                      </span>
                      <span className="ml-auto font-bold">−{format(discountAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="px-4 py-4 border-t border-gray-100 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">{format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span className="flex items-center gap-1"><Truck size={12} /> Shipping</span>
                    {shippingLoading && !isDomestic
                      ? <span className="text-gray-400 text-xs">Calculating...</span>
                      : <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'text-gray-900'}>
                          {shipping === 0 ? '✓ FREE' : format(shipping)}
                        </span>
                    }
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount</span><span>−{format(discountAmount)}</span>
                    </div>
                  )}
                  {currency !== 'PKR' && (
                    <p className="text-xs text-gray-400 text-right">≈ PKR {totalPKR.toLocaleString()}</p>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-green-700 text-lg">{format(totalPKR)}</span>
                  </div>
                </div>

                {isCustomer && loyaltyPtsEarned > 0 && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <span>You'll earn <strong>{loyaltyPtsEarned} loyalty points</strong> from this order!</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 text-xs">
                {isDomestic ? (
                  <>
                    <div className="flex items-center gap-2.5 text-gray-600"><Clock size={14} className="text-green-600" /><div><strong>Dispatch:</strong> Same day if ordered before 2 PM PKT</div></div>
                    <div className="flex items-center gap-2.5 text-gray-600"><Truck size={14} className="text-blue-600" /><div><strong>Delivery:</strong> 3–5 business days across Pakistan</div></div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 text-gray-600"><Globe size={14} className="text-green-600" /><div><strong>International Shipping</strong> — tracked courier</div></div>
                    {zoneInfo && <div className="flex items-center gap-2.5 text-gray-600"><Clock size={14} className="text-blue-600" /><div><strong>Transit:</strong> {zoneInfo.minDays}–{zoneInfo.maxDays} business days</div></div>}
                    <div className="flex items-center gap-2.5 text-amber-700 bg-amber-50 p-2 rounded-lg"><AlertTriangle size={13} className="flex-shrink-0" /><div>Import duties are the buyer's responsibility</div></div>
                  </>
                )}
                <div className="flex items-center gap-2.5 text-gray-600"><Shield size={14} className="text-purple-600" /><div><strong>Quality:</strong> 100% satisfaction guarantee</div></div>
                {settings.whatsappNumber && (
                  <a href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors mt-2">
                    💬 Questions? Chat on WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
