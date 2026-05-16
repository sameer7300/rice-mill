import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit3, RefreshCw, Users, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from '../components/ui/Modal';
import PageHeader, { ActionButton, FormField, inputCls, selectCls } from '../components/ui/PageHeader';
import { TableSkeleton } from '../components/ui/Skeleton';
import { formatDate } from '../utils/export';
import PageTransition from '../components/PageTransition';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-600',
};

export default function DashboardCareers() {
  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<any>(null);
  const [applications, setApplications] = useState<Record<string, any[]>>({});
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', department: '', location: '', type: 'full-time', description: '', isOpen: true });
  const inp = (f: string, v: any) => setForm(p => ({ ...p, [f]: v }));

  const fetchCareers = useCallback(async () => {
    setLoading(true);
    api.get('/careers/admin/all').then(r => setCareers(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCareers(); }, [fetchCareers]);

  const loadApplications = async (careerId: string) => {
    if (applications[careerId]) {
      setExpandedJob(expandedJob === careerId ? null : careerId);
      return;
    }
    const { data } = await api.get(`/careers/${careerId}/applications`);
    setApplications(prev => ({ ...prev, [careerId]: data }));
    setExpandedJob(careerId);
  };

  const openNew = () => { setForm({ title: '', department: '', location: '', type: 'full-time', description: '', isOpen: true }); setShowModal({}); };
  const openEdit = (c: any) => { setForm({ title: c.title, department: c.department, location: c.location, type: c.type, description: c.description, isOpen: c.isOpen }); setShowModal(c); };

  const saveCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (showModal?.id) {
        await api.put(`/careers/admin/${showModal.id}`, form);
        toast.success('Job updated!');
      } else {
        await api.post('/careers/admin', form);
        toast.success('Job posted!');
      }
      setShowModal(null);
      fetchCareers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving job');
    }
  };

  const updateAppStatus = async (appId: string, status: string, careerId: string) => {
    await api.patch(`/careers/applications/${appId}/status`, { status });
    setApplications(prev => ({
      ...prev,
      [careerId]: prev[careerId].map(a => a.id === appId ? { ...a, status } : a)
    }));
    toast.success('Status updated');
  };

  return (
    <PageTransition>
    <div className="space-y-5">
      <PageHeader
        title="Careers"
        subtitle={`${careers.length} positions`}
        actions={
          <>
            <button onClick={fetchCareers} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200"><RefreshCw size={16} /></button>
            <ActionButton onClick={openNew} icon={<Plus size={15} />} label="Post Job" />
          </>
        }
      />

      {loading ? <TableSkeleton rows={4} cols={5} /> : (
        <div className="space-y-3">
          {careers.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">{c.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.isOpen ? 'Open' : 'Closed'}</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full capitalize">{c.type}</span>
                  </div>
                  <p className="text-sm text-gray-400">{c.department} · {c.location} · {c._count?.applications || 0} applications</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => loadApplications(c.id)} className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium p-2 hover:bg-purple-50 rounded-lg">
                    <Users size={14} /> Apps {expandedJob === c.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  <button onClick={() => openEdit(c)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={14} /></button>
                </div>
              </div>

              {expandedJob === c.id && (
                <div className="border-t border-gray-100 px-5 py-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Applications ({applications[c.id]?.length || 0})</p>
                  {applications[c.id]?.length === 0 ? (
                    <p className="text-sm text-gray-400 py-3">No applications yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {applications[c.id]?.map(app => (
                        <div key={app.id} className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-xl text-sm">
                          <div>
                            <p className="font-medium text-gray-900">{app.name}</p>
                            <p className="text-gray-400 text-xs">{app.email} · {app.phone}</p>
                            {app.coverLetter && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{app.coverLetter}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[app.status] || 'bg-gray-100 text-gray-600'}`}>{app.status}</span>
                            <select value={app.status} onChange={e => updateAppStatus(app.id, e.target.value, c.id)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500">
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {careers.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-gray-400">No job postings yet.</div>
          )}
        </div>
      )}

      {showModal !== null && (
        <Modal title={showModal?.id ? 'Edit Job' : 'Post New Job'} onClose={() => setShowModal(null)} size="lg">
          <form onSubmit={saveCareer} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Job Title" required><input type="text" value={form.title} onChange={e => inp('title', e.target.value)} required className={inputCls} placeholder="e.g. Mill Operator" /></FormField>
              <FormField label="Department" required><input type="text" value={form.department} onChange={e => inp('department', e.target.value)} required className={inputCls} placeholder="Operations" /></FormField>
              <FormField label="Location" required><input type="text" value={form.location} onChange={e => inp('location', e.target.value)} required className={inputCls} placeholder="Lahore" /></FormField>
              <FormField label="Type">
                <select value={form.type} onChange={e => inp('type', e.target.value)} className={selectCls}>
                  <option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option>
                </select>
              </FormField>
            </div>
            <FormField label="Description" required>
              <textarea value={form.description} onChange={e => inp('description', e.target.value)} required rows={5} className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500`} placeholder="Role responsibilities, requirements..." />
            </FormField>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isOpen" checked={form.isOpen} onChange={e => inp('isOpen', e.target.checked)} className="w-4 h-4 accent-green-600" />
              <label htmlFor="isOpen" className="text-sm font-medium text-gray-700">Position is open (accepting applications)</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}
