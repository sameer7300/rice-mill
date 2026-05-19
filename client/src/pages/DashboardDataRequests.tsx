import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../api';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import PageHeader, { ActionButton } from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import {
  Download, Eye, Shield, Clock, CheckCircle2, XCircle, RefreshCw,
  User, Globe, Monitor, AlertTriangle, FileJson
} from 'lucide-react';

type Request = {
  id: string;
  userId: string;
  type: 'basic' | 'full';
  status: 'pending' | 'processing' | 'fulfilled' | 'rejected';
  requestNote?: string;
  adminNote?: string;
  downloadUrl?: string;
  requestedAt: string;
  fulfilledAt?: string;
  user: { id: string; name: string; email: string };
};

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  fulfilled:  'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-700',
};

export default function DashboardDataRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Request | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [note, setNote] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const { data } = await api.get('/data-requests/admin', { params });
      setRequests(data.data || []);
      setPendingCount(data.pendingCount || 0);
    } catch { toast.error('Failed to load requests'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const openRequest = async (r: Request) => {
    setSelected(r);
    setNote(r.adminNote || '');
    setDownloadUrl(r.downloadUrl || '');
    setPreview(null);
  };

  const loadPreview = async (scope: 'basic' | 'full') => {
    if (!selected) return;
    setPreviewLoading(true);
    try {
      const { data } = await api.get(`/data-requests/admin/${selected.id}/preview`);
      setPreview(data.data);
    } catch { toast.error('Failed to load preview'); }
    finally { setPreviewLoading(false); }
  };

  const downloadAsAdmin = async (scope: 'basic' | 'full') => {
    if (!selected) return;
    try {
      const response = await api.get(`/data-requests/admin/${selected.id}/download`, {
        params: { scope },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${selected.userId}-${scope}-${Date.now()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  const updateStatus = async (status: string) => {
    if (!selected) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/data-requests/admin/${selected.id}`, { status, adminNote: note, downloadUrl });
      setRequests(prev => prev.map(r => r.id === selected.id ? { ...r, ...data.data } : r));
      setSelected(prev => prev ? { ...prev, ...data.data } : null);
      toast.success(`Request marked as ${status}`);
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const FILTERS = ['', 'pending', 'processing', 'fulfilled', 'rejected'];

  return (
    <PageTransition>
      <Helmet><title>Data Requests — Al-Noor Rice Mills Admin</title></Helmet>

      <PageHeader
        title="Data Requests"
        subtitle={`${pendingCount} pending · User data export requests (GDPR)`}
        actions={<ActionButton icon={<RefreshCw size={14} />} label="Refresh" onClick={load} />}
      />

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f || 'all'} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all capitalize ${filter === f ? 'bg-green-700 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f || 'All'}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <span className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2" /> Loading...
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Shield size={36} className="mx-auto mb-3 opacity-30" />
            <p>No data requests{filter ? ` with status "${filter}"` : ''}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User', 'Type', 'Note', 'Requested', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{r.user.name}</p>
                    <p className="text-xs text-gray-400">{r.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.type === 'full' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">{r.requestNote || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(r.requestedAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openRequest(r)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review modal */}
      {selected && (
        <Modal title={`Data Request — ${selected.user.name}`} onClose={() => { setSelected(null); setPreview(null); }} size="xl">
          <div className="space-y-5">
            {/* Request info */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">User</p>
                <p className="font-semibold text-gray-800">{selected.user.name}</p>
                <p className="text-xs text-gray-500">{selected.user.email}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Request type</p>
                <p className="font-semibold text-gray-800 capitalize">{selected.type}</p>
                <p className="text-xs text-gray-500">{new Date(selected.requestedAt).toLocaleString('en-PK')}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Status</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
              </div>
            </div>

            {selected.requestNote && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <strong>User note:</strong> {selected.requestNote}
              </div>
            )}

            {/* Admin can choose what scope to download/share */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-800">Download data to review before sharing:</p>
              <div className="flex gap-3">
                <button onClick={() => downloadAsAdmin('basic')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 text-gray-700 transition-colors">
                  <Download size={13} /> Basic data (orders, profile)
                </button>
                <button onClick={() => downloadAsAdmin('full')}
                  className="flex items-center gap-2 px-4 py-2 border border-purple-200 rounded-xl text-sm hover:bg-purple-50 text-purple-700 transition-colors">
                  <FileJson size={13} /> Full data (incl. IP logs)
                </button>
              </div>
              <p className="text-xs text-gray-400">Download the file, review it, then send to the user via email or upload a link below.</p>
            </div>

            {/* Admin note + download URL */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Admin Note (visible to user)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="e.g. We have processed your request and attached the data..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Download Link (optional — provide if you upload the file somewhere)</label>
                <input value={downloadUrl} onChange={e => setDownloadUrl(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://..." />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <button onClick={() => updateStatus('processing')} disabled={saving || selected.status === 'processing'}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
                <Clock size={13} /> Mark Processing
              </button>
              <button onClick={() => updateStatus('fulfilled')} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
                <CheckCircle2 size={13} /> Mark Fulfilled
              </button>
              <button onClick={() => updateStatus('rejected')} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
                <XCircle size={13} /> Reject Request
              </button>
              {saving && <span className="text-xs text-gray-400 self-center flex items-center gap-1"><span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" /> Saving...</span>}
            </div>
          </div>
        </Modal>
      )}
    </PageTransition>
  );
}
