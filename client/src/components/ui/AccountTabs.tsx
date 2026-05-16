/**
 * Account tab components extracted for use in Dashboard.tsx CustomerDashboard.
 * AddressesTab | PaymentTab | RewardsTab | TwoFASection
 */
import { useEffect, useState, useCallback } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { inputCls } from './PageHeader';
import {
  MapPin, CreditCard, Gift, Plus, Trash2, Edit3, Copy,
  Award, Trophy, Zap, Home, Building2, QrCode, Smartphone,
  CheckCircle2, Download, Eye, EyeOff, RefreshCw, Monitor, Phone as PhoneIcon
} from 'lucide-react';
import { formatDate } from '../../utils/export';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const LABEL_ICONS: Record<string, React.ReactNode> = {
  Home: <Home size={14} />, Office: <Building2 size={14} />,
  Farm: <MapPin size={14} />, Other: <MapPin size={14} />
};
const COUNTRY_FLAGS: Record<string, string> = {
  Pakistan: '🇵🇰', India: '🇮🇳', 'United Arab Emirates': '🇦🇪',
  'United Kingdom': '🇬🇧', 'United States': '🇺🇸'
};
const PM_ICONS: Record<string, React.ReactNode> = {
  cod: <span className="text-lg">💵</span>,
  bank_transfer: <span className="text-lg">🏦</span>,
  easypaisa: <span className="text-lg">📱</span>,
  jazzcash: <span className="text-lg">📱</span>,
};
const PM_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery', bank_transfer: 'Bank Transfer',
  easypaisa: 'EasyPaisa', jazzcash: 'JazzCash'
};
const BANKS = ['HBL', 'UBL', 'MCB', 'Meezan Bank', 'Allied Bank', 'Faysal Bank', 'Bank Alfalah', 'Habib Metro', 'Other'];

// ─── ADDRESSES TAB ───────────────────────────────────────────────────────────

export function AddressesTab({ userProfile }: { userProfile?: any }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggQuery, setSuggQuery] = useState('');
  const blank = { label: 'Home', fullName: userProfile?.name || '', phone: userProfile?.phone || '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'Pakistan', latitude: '', longitude: '', isDefault: false };
  const [form, setForm] = useState<any>(blank);

  const refresh = useCallback(() => {
    api.get('/addresses').then(r => setAddresses(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (suggQuery.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try { const r = await api.get(`/location/suggest?q=${encodeURIComponent(suggQuery)}`); setSuggestions(r.data.data || []); } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [suggQuery]);

  const useMyLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    toast('Detecting your location...', { icon: '📍' });
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const { data } = await api.get(`/location/suggest?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
        const s = data.data?.[0];
        if (s) {
          // Parse displayName to extract street-level info (parts before the city)
          const parts = (s.displayName || '').split(',').map((p: string) => p.trim()).filter(Boolean);
          const cityIdx = parts.findIndex((p: string) =>
            s.city && (p.toLowerCase().includes(s.city.toLowerCase()) || s.city.toLowerCase().includes(p.toLowerCase()))
          );
          const streetParts = cityIdx > 0 ? parts.slice(0, cityIdx) : parts.slice(0, 2);
          const addressLine1 = streetParts.join(', ') || parts[0] || '';
          setForm((f: any) => ({
            ...f,
            addressLine1,
            city: s.city || '',
            state: s.state || '',
            country: s.country || 'Pakistan',
            postalCode: s.postalCode || '',
          }));
          toast.success('Location filled! Please verify street address.');
        } else {
          toast.error('Could not get address details');
        }
      } catch { toast.error('Location lookup failed'); }
    }, () => toast.error('Location access denied — please enable location permissions'));
  };

  const applySuggestion = (s: any) => {
    const parts = (s.displayName || '').split(',').map((p: string) => p.trim()).filter(Boolean);
    const cityIdx = parts.findIndex((p: string) =>
      s.city && (p.toLowerCase().includes(s.city.toLowerCase()) || s.city.toLowerCase().includes(p.toLowerCase()))
    );
    const streetParts = cityIdx > 0 ? parts.slice(0, cityIdx) : parts.slice(0, 2);
    setForm((f: any) => ({
      ...f,
      addressLine1: streetParts.join(', ') || form.addressLine1,
      city: s.city || f.city,
      state: s.state || f.state,
      country: s.country || f.country,
      postalCode: s.postalCode || f.postalCode,
    }));
    setSuggestions([]); setSuggQuery('');
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (showModal?.id) { await api.put(`/addresses/${showModal.id}`, form); toast.success('Address updated!'); }
      else { await api.post('/addresses', form); toast.success('Address saved!'); }
      refresh(); setShowModal(null);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error saving'); }
    finally { setSaving(false); }
  };

  const deleteAddr = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    await api.delete(`/addresses/${id}`); setAddresses(a => a.filter(x => x.id !== id)); toast.success('Deleted');
  };

  const setDefault = async (id: string) => {
    await api.patch(`/addresses/${id}/default`); refresh();
  };

  if (loading) return <div className="space-y-3">{[0, 1].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setForm(blank); setShowModal({}); }}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-semibold transition-colors">
          <Plus size={15} /> Add New Address
        </button>
      </div>
      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <MapPin size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-600">No saved addresses</p>
          <p className="text-sm text-gray-400 mt-1">Add an address to speed up checkout</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`bg-white rounded-2xl border p-4 shadow-sm relative ${addr.isDefault ? 'border-green-300 bg-green-50/30' : 'border-gray-100'}`}>
              {addr.isDefault && <span className="absolute top-3 right-3 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Default</span>}
              <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">{LABEL_ICONS[addr.label] || <MapPin size={14} />}</span>
                <span className="font-semibold text-gray-900 text-sm">{addr.label}</span>
                <span className="text-xs text-gray-400">{COUNTRY_FLAGS[addr.country] || '🌍'} {addr.country}</span>
              </div>
              <p className="text-sm text-gray-700">{addr.fullName} · {addr.phone}</p>
              <p className="text-sm text-gray-500">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
              <p className="text-sm text-gray-500">{addr.city}, {addr.state}{addr.postalCode ? ` ${addr.postalCode}` : ''}</p>
              <div className="flex gap-3 mt-3">
                {!addr.isDefault && <button onClick={() => setDefault(addr.id)} className="text-xs text-green-600 hover:underline">Set default</button>}
                <button onClick={() => { setForm({ ...addr }); setShowModal(addr); }} className="flex items-center gap-1 text-xs text-blue-600 hover:underline"><Edit3 size={11} /> Edit</button>
                <button onClick={() => deleteAddr(addr.id)} className="flex items-center gap-1 text-xs text-red-500 hover:underline"><Trash2 size={11} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal !== null && (
        <Modal title={showModal?.id ? 'Edit Address' : 'Add New Address'} onClose={() => setShowModal(null)} size="lg">
          <form onSubmit={saveAddress} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Label</label>
                <select value={form.label} onChange={e => setForm((f: any) => ({ ...f, label: e.target.value }))} className={inputCls}>
                  {['Home', 'Office', 'Farm', 'Other'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Country</label>
                <input type="text" value={form.country} onChange={e => setForm((f: any) => ({ ...f, country: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name *</label>
                <input type="text" value={form.fullName} onChange={e => setForm((f: any) => ({ ...f, fullName: e.target.value }))} required className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Phone *</label>
                <input type="tel" value={form.phone} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} required className={inputCls} />
              </div>
            </div>
            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Search Location (autocomplete)</label>
              <input type="text" value={suggQuery} onChange={e => setSuggQuery(e.target.value)} placeholder="Type city, area, or street..." className={inputCls} />
              {suggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" onClick={() => applySuggestion(s)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 border-b border-gray-50 last:border-0 flex items-center gap-2">
                      <span>{COUNTRY_FLAGS[s.country] || '🌍'}</span>
                      <span className="truncate">{s.displayName}</span>
                    </button>
                  ))}
                </div>
              )}
              <button type="button" onClick={useMyLocation} className="mt-1.5 flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800">
                <MapPin size={12} /> Use my current location
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Address Line 1 *</label>
              <input type="text" value={form.addressLine1} onChange={e => setForm((f: any) => ({ ...f, addressLine1: e.target.value }))} required className={inputCls} placeholder="House #, Street, Area" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Address Line 2 (optional)</label>
              <input type="text" value={form.addressLine2} onChange={e => setForm((f: any) => ({ ...f, addressLine2: e.target.value }))} className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">City *</label>
                <input type="text" value={form.city} onChange={e => setForm((f: any) => ({ ...f, city: e.target.value }))} required className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Province/State *</label>
                <input type="text" value={form.state} onChange={e => setForm((f: any) => ({ ...f, state: e.target.value }))} required className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Postal Code</label>
                <input type="text" value={form.postalCode} onChange={e => setForm((f: any) => ({ ...f, postalCode: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.isDefault} onChange={e => setForm((f: any) => ({ ...f, isDefault: e.target.checked }))} className="w-4 h-4 accent-green-600" />
              <span className="text-gray-700">Set as default address</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── PAYMENT TAB ─────────────────────────────────────────────────────────────

export function PaymentTab({ userId }: { userId?: string }) {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'cod', label: 'Cash on Delivery', accountTitle: '', accountNumber: '', bankName: '', isDefault: false });

  const refresh = useCallback(() => {
    api.get('/payment-methods').then(r => setMethods(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const saveMethod = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/payment-methods', form); toast.success('Payment method saved!'); refresh();
      setShowModal(false); setForm({ type: 'cod', label: 'Cash on Delivery', accountTitle: '', accountNumber: '', bankName: '', isDefault: false });
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const deleteMethod = async (id: string) => { await api.delete(`/payment-methods/${id}`); setMethods(m => m.filter(x => x.id !== id)); toast.success('Removed'); };
  const setDefault = async (id: string) => { await api.patch(`/payment-methods/${id}/default`); refresh(); };

  if (loading) return <div className="space-y-3">{[0, 1].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-semibold transition-colors">
          <Plus size={15} /> Add Payment Method
        </button>
      </div>
      {methods.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <CreditCard size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-600">No saved payment methods</p>
        </div>
      ) : (
        <div className="space-y-3">
          {methods.map(m => (
            <div key={m.id} className={`bg-white rounded-2xl border p-4 shadow-sm flex items-center gap-4 ${m.isDefault ? 'border-green-300' : 'border-gray-100'}`}>
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">{PM_ICONS[m.type] || <CreditCard size={18} />}</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{m.label}</p>
                <p className="text-xs text-gray-400">{m.accountTitle || PM_LABELS[m.type]}{m.accountNumber ? ` · ${m.accountNumber}` : ''}</p>
              </div>
              {m.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>}
              <div className="flex gap-2">
                {!m.isDefault && <button onClick={() => setDefault(m.id)} className="text-xs text-green-600 hover:underline">Set default</button>}
                <button onClick={() => deleteMethod(m.id)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Add Payment Method" onClose={() => setShowModal(false)}>
          <form onSubmit={saveMethod} className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Type</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PM_LABELS).map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setForm(f => ({ ...f, type: val, label }))}
                    className={`flex items-center gap-2 p-3 border rounded-xl text-sm font-medium transition-colors ${form.type === val ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'}`}>
                    {PM_ICONS[val]} {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Label</label>
              <input type="text" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required className={inputCls} />
            </div>
            {form.type === 'bank_transfer' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Bank Name</label>
                  <select value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} className={inputCls}>
                    <option value="">Select bank</option>
                    {BANKS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Account Title</label>
                  <input type="text" value={form.accountTitle} onChange={e => setForm(f => ({ ...f, accountTitle: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Account Number (masked on save)</label>
                  <input type="text" value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} className={inputCls} placeholder="Full account number" />
                </div>
              </>
            )}
            {(form.type === 'easypaisa' || form.type === 'jazzcash') && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Account Title</label>
                  <input type="text" value={form.accountTitle} onChange={e => setForm(f => ({ ...f, accountTitle: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Mobile Number</label>
                  <input type="tel" value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} className={inputCls} placeholder="03xx-xxxxxxx" />
                </div>
              </>
            )}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="w-4 h-4 accent-green-600" />
              <span className="text-gray-700">Set as default</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── REWARDS TAB ─────────────────────────────────────────────────────────────

export function RewardsTab({ userId, userName }: { userId?: string; userName?: string }) {
  const [data, setData] = useState<any>(null);
  const [referralStats, setRS] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/loyalty/balance'), api.get('/loyalty/referral')])
      .then(([b, r]) => { setData(b.data.data); setRS(r.data.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const copyRef = () => {
    if (!referralStats?.referralUrl) return;
    navigator.clipboard.writeText(referralStats.referralUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast.success('Copied!');
  };

  const TIER_COLOR: Record<string, string> = { Bronze: 'text-orange-600 bg-orange-50', Silver: 'text-gray-600 bg-gray-100', Gold: 'text-yellow-600 bg-yellow-50' };

  if (loading) return <div className="space-y-4">{[0, 1, 2].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}</div>;

  const balance = data?.balance || 0;
  const pkrValue = data?.pkrValue || 0;
  const tier = data?.tier || 'Bronze';
  const nextTier = data?.nextTierPoints;
  const history = data?.history || [];

  return (
    <div className="space-y-5 max-w-xl">
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-200 text-sm">Points Balance</p>
            <p className="text-4xl font-extrabold">{balance.toLocaleString()}</p>
            <p className="text-green-200 text-sm mt-1">= PKR {pkrValue.toLocaleString()} discount value</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${TIER_COLOR[tier] || TIER_COLOR.Bronze}`}>{tier}</span>
        </div>
        {nextTier && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-green-200 mb-1"><span>{tier}</span><span>{nextTier.toLocaleString()} pts for next tier</span></div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${Math.min((balance / nextTier) * 100, 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> How to Earn Points</h3>
        <div className="space-y-2 text-sm">
          {[{ i: '🛒', l: 'Place an order', d: '1 point per PKR 100 spent' }, { i: '⭐', l: 'Leave a verified review', d: '50 points per review' }, { i: '👥', l: 'Refer a friend', d: '100 points per referral' }].map(item => (
            <div key={item.l} className="flex items-center gap-3 py-1"><span className="text-xl">{item.i}</span><div><p className="font-medium text-gray-800">{item.l}</p><p className="text-gray-400 text-xs">{item.d}</p></div></div>
          ))}
        </div>
      </div>

      {referralStats && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Gift size={16} className="text-purple-500" /> Refer a Friend</h3>
          <p className="text-sm text-gray-500 mb-3">When a friend places their first order, you both earn 100 points!</p>
          <div className="flex gap-2 mb-3">
            <input readOnly value={referralStats.referralUrl || ''} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs bg-gray-50 font-mono" />
            <button onClick={copyRef} className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold rounded-xl">
              <Copy size={13} /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button onClick={() => window.open(`https://wa.me/?text=Buy premium rice! ${encodeURIComponent(referralStats.referralUrl)}`, '_blank')}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold">
            💬 Share via WhatsApp
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">{referralStats.totalReferrals || 0} friends referred · {referralStats.pointsEarned || 0} pts earned</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <p className="px-5 py-3.5 font-semibold text-gray-800 border-b border-gray-100 text-sm">Points History</p>
          <div className="max-h-52 overflow-y-auto">
            {history.map((h: any) => (
              <div key={h.id} className="flex items-center justify-between px-5 py-2.5 border-b border-gray-50 last:border-0 text-sm">
                <div><p className="font-medium text-gray-800">{h.description}</p><p className="text-gray-400 text-xs">{formatDate(h.createdAt)}</p></div>
                <span className={`font-bold ${h.points > 0 ? 'text-green-600' : 'text-red-500'}`}>{h.points > 0 ? '+' : ''}{h.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 2FA SECTION ─────────────────────────────────────────────────────────────

export function TwoFASection({ isEnabled }: { isEnabled?: boolean }) {
  const [enabled, setEnabled] = useState(isEnabled || false);
  const [setupModal, setSetupModal] = useState(false);
  const [disableModal, setDisableModal] = useState(false);
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [savedCodes, setSavedCodes] = useState(false);
  const [disableForm, setDisableForm] = useState({ password: '', code: '' });
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/2fa/setup');
      setQrCode(data.data.qrCode); setManualKey(data.data.manualEntryKey);
      setStep(1); setSetupModal(true);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const verifySetup = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/2fa/verify-setup', { token: verifyCode });
      setBackupCodes(data.data.backupCodes); setStep(3);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Invalid code'); }
    finally { setLoading(false); }
  };

  const finishSetup = () => { setEnabled(true); setSetupModal(false); setStep(1); setVerifyCode(''); setSavedCodes(false); toast.success('2FA enabled!'); };

  const disable2FA = async () => {
    setLoading(true);
    try {
      await api.post('/auth/2fa/disable', disableForm);
      setEnabled(false); setDisableModal(false); toast.success('2FA disabled');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const downloadCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'alnoor-backup-codes.txt'; a.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2"><Smartphone size={16} /> Two-Factor Authentication (2FA)</h3>
      <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account.</p>

      {enabled ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 size={18} className="text-green-600" />
            <span className="text-sm font-semibold text-green-700">2FA is Active</span>
          </div>
          <p className="text-xs text-gray-400">Using authenticator app. Keep your backup codes safe.</p>
          <button onClick={() => setDisableModal(true)} className="text-sm text-red-500 hover:text-red-700 font-medium">Disable 2FA →</button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <span className="text-sm text-gray-500">2FA is not enabled. Your account is less secure.</span>
          </div>
          <p className="text-xs text-gray-400">Supported: Google Authenticator, Authy, Microsoft Authenticator</p>
          <button onClick={startSetup} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
            <QrCode size={15} /> {loading ? 'Setting up...' : 'Enable 2FA'}
          </button>
        </div>
      )}

      {/* Setup modal */}
      {setupModal && (
        <Modal title="Set Up Two-Factor Authentication" onClose={() => setSetupModal(false)} size="lg">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><QrCode size={24} className="text-green-700" /></div>
                <h3 className="font-bold text-gray-900 mb-1">Step 1: Install Authenticator App</h3>
                <p className="text-sm text-gray-500">Download Google Authenticator or Authy on your phone.</p>
              </div>
              <div className="flex justify-center gap-3">
                <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline">Google Authenticator (Android)</a>
                <a href="https://apps.apple.com/app/google-authenticator/id388497605" target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline">Google Authenticator (iOS)</a>
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-semibold text-sm">I have an app →</button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4 text-center">
              <h3 className="font-bold text-gray-900">Step 2: Scan QR Code</h3>
              {qrCode && <img src={qrCode} alt="2FA QR Code" className="mx-auto w-48 h-48 rounded-xl border border-gray-200" />}
              <p className="text-xs text-gray-400">Manual entry key:</p>
              <code className="block text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono break-all">{manualKey}</code>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block text-left">Enter 6-digit code from app *</label>
                <input type="text" value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" maxLength={6} className={`${inputCls} text-center text-xl font-mono tracking-widest`} />
              </div>
              <button onClick={verifySetup} disabled={verifyCode.length !== 6 || loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60">
                {loading ? 'Verifying...' : 'Verify & Continue →'}
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle2 size={40} className="text-green-500 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900">Step 3: Save Backup Codes</h3>
                <p className="text-sm text-red-500 font-medium mt-1">⚠️ Store these safely. Each code can only be used once.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 border border-gray-200 rounded-xl p-4">
                {backupCodes.map(code => <code key={code} className="text-xs font-mono text-center py-1">{code}</code>)}
              </div>
              <div className="flex gap-2">
                <button onClick={downloadCodes} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50"><Download size={14} /> Download TXT</button>
                <button onClick={() => { navigator.clipboard.writeText(backupCodes.join('\n')); toast.success('Codes copied!'); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50"><Copy size={14} /> Copy All</button>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={savedCodes} onChange={e => setSavedCodes(e.target.checked)} className="w-4 h-4 accent-green-600" />
                <span className="text-gray-700">I have saved my backup codes</span>
              </label>
              <button onClick={finishSetup} disabled={!savedCodes} className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60">
                Done — 2FA Enabled ✓
              </button>
            </div>
          )}
        </Modal>
      )}

      {/* Disable modal */}
      {disableModal && (
        <Modal title="Disable Two-Factor Authentication" onClose={() => setDisableModal(false)}>
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              Disabling 2FA makes your account less secure. You will need your current password and authenticator code.
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Current Password</label>
              <input type="password" value={disableForm.password} onChange={e => setDisableForm(f => ({ ...f, password: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Authenticator Code</label>
              <input type="text" value={disableForm.code} onChange={e => setDisableForm(f => ({ ...f, code: e.target.value.replace(/\D/g, '').slice(0, 6) }))} placeholder="000000" maxLength={6} className={`${inputCls} font-mono tracking-widest`} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDisableModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={disable2FA} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
