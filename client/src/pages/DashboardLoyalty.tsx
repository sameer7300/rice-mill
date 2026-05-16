import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import { inputCls } from '../components/ui/PageHeader';
import { Gift, Award, TrendingUp, Users, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, formatPKR } from '../utils/export';
import PageTransition from '../components/PageTransition';

const TIER_CLS: Record<string, string> = {
  Bronze: 'bg-orange-100 text-orange-700',
  Silver: 'bg-gray-100 text-gray-700',
  Gold:   'bg-yellow-100 text-yellow-700',
};

export default function DashboardLoyalty() {
  const [members, setMembers] = useState<any[]>([]);
  const [summary, setSummary]  = useState<any>(null);
  const [loading, setLoading]  = useState(true);
  const [page, setPage]        = useState(1);
  const [totalPages, setTP]    = useState(1);
  const [awardModal, setAM]    = useState<any>(null);
  const [awardForm, setAF]     = useState({ points: '', description: '' });
  const [awarding, setAw]      = useState(false);
  const [tierFilter, setTF]    = useState('all');

  const load = (pg = 1) => {
    setLoading(true);
    api.get(`/loyalty/members?page=${pg}&limit=20`).then(r => {
      setMembers(r.data.data?.members || []);
      setSummary(r.data.data?.summary);
      setTP(r.data.data?.totalPages || 1);
      setPage(pg);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const awardPoints = async (e: React.FormEvent) => {
    e.preventDefault(); setAw(true);
    try {
      await api.post('/loyalty/award', { userId: awardModal.userId, points: parseInt(awardForm.points), description: awardForm.description });
      toast.success(`${awardForm.points} points awarded!`);
      load(page); setAM(null); setAF({ points: '', description: '' });
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error awarding points'); }
    finally { setAw(false); }
  };

  const displayed = members.filter(m => tierFilter === 'all' ? true : m.tier === tierFilter);

  return (
    <PageTransition>
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Gift size={20} className="text-green-600" /> Loyalty Program</h1>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Members', value: summary.totalMembers?.toLocaleString(), icon: <Users size={18} />, color: 'blue' },
            { label: 'Total Points Issued', value: summary.totalPointsIssued?.toLocaleString(), icon: <Award size={18} />, color: 'green' },
            { label: 'Points Redeemed', value: summary.totalPointsRedeemed?.toLocaleString(), icon: <TrendingUp size={18} />, color: 'purple' },
            { label: 'Active Points', value: (summary.totalPointsIssued - summary.totalPointsRedeemed)?.toLocaleString(), icon: <Gift size={18} />, color: 'orange' },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm`}>
              <div className={`w-9 h-9 bg-${s.color}-100 rounded-xl flex items-center justify-center text-${s.color}-600 mb-3`}>{s.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{s.value || 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tier breakdown */}
      {summary?.tiers && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Tier Breakdown</h2>
          <div className="flex gap-4 flex-wrap">
            {[{ tier: 'Bronze', range: '0–999 pts' }, { tier: 'Silver', range: '1,000–4,999 pts' }, { tier: 'Gold', range: '5,000+ pts' }].map(t => (
              <div key={t.tier} className="flex-1 min-w-[120px] text-center p-4 bg-gray-50 rounded-xl">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-2 ${TIER_CLS[t.tier]}`}>{t.tier}</span>
                <p className="text-2xl font-bold text-gray-900">{summary.tiers[t.tier] || 0}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.range}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
          <h2 className="font-semibold text-gray-800">Members</h2>
          <div className="flex gap-2">
            {['all', 'Gold', 'Silver', 'Bronze'].map(t => (
              <button key={t} onClick={() => setTF(t)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${tierFilter === t ? 'bg-green-700 text-white' : 'border border-gray-200 text-gray-600 hover:border-green-400'}`}>
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : displayed.length === 0 ? (
          <div className="p-16 text-center">
            <Gift size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No members found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Member', 'Email', 'Balance', 'Tier', 'Total Earned', 'Total Spent', 'Joined', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayed.map(m => (
                <tr key={m.userId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{m.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{m.email}</td>
                  <td className="px-4 py-3 font-bold text-green-700">{m.loyaltyBalance?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${TIER_CLS[m.tier] || TIER_CLS.Bronze}`}>{m.tier}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{m.totalEarned?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3 text-gray-700">{m.totalSpent?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(m.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setAM(m)}
                      className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium whitespace-nowrap">
                      <Plus size={12} /> Award
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <button disabled={page === 1} onClick={() => load(page - 1)} className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-40">
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => load(page + 1)} className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-40">
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {awardModal && (
        <Modal title={`Award Points — ${awardModal.name}`} onClose={() => setAM(null)}>
          <form onSubmit={awardPoints} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
              <p className="text-green-700 font-semibold">{awardModal.name}</p>
              <p className="text-green-600 text-xs mt-0.5">Current balance: <strong>{awardModal.loyaltyBalance?.toLocaleString() || 0} pts</strong> · Tier: {awardModal.tier}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Points to Award *</label>
              <input type="number" min="1" max="10000" value={awardForm.points} onChange={e => setAF(f => ({ ...f, points: e.target.value }))} required className={inputCls} placeholder="e.g. 100" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Reason / Description *</label>
              <input type="text" value={awardForm.description} onChange={e => setAF(f => ({ ...f, description: e.target.value }))} required className={inputCls} placeholder="e.g. Loyalty bonus, special offer..." />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setAM(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={awarding} className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                {awarding ? 'Awarding...' : 'Award Points'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}
