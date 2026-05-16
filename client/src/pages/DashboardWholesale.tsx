import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import { inputCls } from '../components/ui/PageHeader';
import { Handshake, Eye, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { formatDate, formatPKR } from '../utils/export';
import PageTransition from '../components/PageTransition';

const STATUS_MAP: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
  reviewing: { label: 'Reviewing', cls: 'bg-blue-100 text-blue-700',   icon: <RefreshCw size={12} /> },
  quoted:    { label: 'Quoted',    cls: 'bg-purple-100 text-purple-700', icon: <CheckCircle2 size={12} /> },
  accepted:  { label: 'Accepted',  cls: 'bg-green-100 text-green-700',  icon: <CheckCircle2 size={12} /> },
  rejected:  { label: 'Rejected',  cls: 'bg-red-100 text-red-600',     icon: <XCircle size={12} /> },
};

export default function DashboardWholesale() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<any>(null);
  const [statusFilter, setSF]     = useState('all');
  const [form, setForm]           = useState({ status: '', quotedPricePerKg: '', adminNote: '' });
  const [saving, setSaving]       = useState(false);
  const [newCount, setNewCount]   = useState(0);

  const load = () => {
    setLoading(true);
    api.get('/wholesale/admin').then(r => {
      setInquiries(r.data.data?.inquiries || []);
      setNewCount(r.data.data?.newCount || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openDetail = (inq: any) => {
    setSelected(inq);
    setForm({ status: inq.status, quotedPricePerKg: inq.quotedPricePerKg ? String(inq.quotedPricePerKg) : '', adminNote: inq.adminNote || '' });
  };

  const saveUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.patch(`/wholesale/admin/${selected.id}`, { ...form, quotedPricePerKg: form.quotedPricePerKg ? parseFloat(form.quotedPricePerKg) : undefined });
      toast.success('Updated!'); load(); setSelected(null);
    } catch { toast.error('Error saving'); } finally { setSaving(false); }
  };

  const filtered = inquiries.filter(i => statusFilter === 'all' ? true : i.status === statusFilter);

  return (
    <PageTransition>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Handshake size={20} className="text-green-600" /> Wholesale Inquiries</h1>
          {newCount > 0 && <p className="text-sm text-orange-600 mt-0.5">{newCount} new inquiry{newCount > 1 ? 'ies' : ''} awaiting review</p>}
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', ...Object.keys(STATUS_MAP)].map(s => (
          <button key={s} onClick={() => setSF(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${statusFilter === s ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'}`}>
            {s === 'all' ? 'All' : STATUS_MAP[s]?.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <Handshake size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">No {statusFilter !== 'all' ? statusFilter : ''} wholesale inquiries</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Company', 'Contact', 'Rice Variety', 'Qty (kg)', 'Frequency', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(inq => {
                const st = STATUS_MAP[inq.status] || STATUS_MAP.pending;
                return (
                  <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">{inq.companyName || inq.contactName}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <p>{inq.contactName}</p>
                      <p className="text-xs text-gray-400">{inq.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{inq.riceVariety || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{inq.quantityKg?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{inq.frequency || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}>
                        {st.icon} {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(inq.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openDetail(inq)} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium">
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal title="Wholesale Inquiry Detail" onClose={() => setSelected(null)} size="lg">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Company', selected.companyName || '—'],
                ['Contact', selected.contactName],
                ['Email', selected.email],
                ['Phone', selected.phone || '—'],
                ['Rice Variety', selected.riceVariety || '—'],
                ['Quantity', `${selected.quantityKg?.toLocaleString()} kg`],
                ['Frequency', selected.frequency || '—'],
                ['Budget/kg', selected.budgetPerKg ? formatPKR(selected.budgetPerKg) : '—'],
                ['Quoted/kg', selected.quotedPricePerKg ? formatPKR(selected.quotedPricePerKg) : '—'],
                ['Date', formatDate(selected.createdAt)],
              ].map(([label, value]) => (
                <div key={label as string} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>
            {selected.message && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-1">Customer Message</p>
                <p className="text-sm text-blue-900">{selected.message}</p>
              </div>
            )}

            <form onSubmit={saveUpdate} className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-800">Update Inquiry</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
                    {Object.entries(STATUS_MAP).map(([val, { label }]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Quoted Price/kg (PKR)</label>
                  <input type="number" step="0.01" value={form.quotedPricePerKg} onChange={e => setForm(f => ({ ...f, quotedPricePerKg: e.target.value }))} className={inputCls} placeholder="e.g. 120" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Admin Note</label>
                <textarea rows={3} value={form.adminNote} onChange={e => setForm(f => ({ ...f, adminNote: e.target.value }))} className={inputCls} placeholder="Internal notes or customer response..." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSelected(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}
