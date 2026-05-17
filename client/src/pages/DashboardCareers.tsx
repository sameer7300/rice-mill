import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Briefcase, Users, XCircle, Clock,
  MapPin, Trash2, Edit2, Send, Calendar,
  UserCheck, Award, FileText, Phone, Mail, ExternalLink,
} from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import Modal from '../components/ui/Modal';
import { inputCls, selectCls } from '../components/ui/PageHeader';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  showSalary?: boolean;
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  deadline?: string;
  isOpen: boolean;
  isFeatured?: boolean;
  totalApplications: number;
  createdAt: string;
}

interface Application {
  id: string;
  careerId: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  resumeName?: string;
  coverLetter?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  expectedSalary?: number;
  noticePeriod?: string;
  source?: string;
  status: string;
  interviewDate?: string;
  interviewMode?: string;
  interviewNotes?: string;
  offerAmount?: number;
  offerExpiry?: string;
  rejectionReason?: string;
  adminNote?: string;
  createdAt: string;
  career?: { id: string; title: string; department: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  { key: 'applied', label: 'Applied', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
  { key: 'reviewing', label: 'Reviewing', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  { key: 'interview_scheduled', label: 'Interview', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  { key: 'offered', label: 'Offered', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  { key: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  { key: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
];

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-Time', 'part-time': 'Part-Time', 'contract': 'Contract', 'internship': 'Internship',
};

// ─── Job Form ────────────────────────────────────────────────────────────────
const EMPTY_JOB = {
  title: '', department: '', location: 'Batkhela, KPK', type: 'full-time',
  experienceLevel: 'mid', salaryMin: '', salaryMax: '', showSalary: true,
  description: '', responsibilities: '', requirements: '', niceToHave: '', benefits: '',
  deadline: '', isOpen: true, isFeatured: false, bannerImage: '',
};

function JobFormModal({ initial, onClose, onSaved }: { initial?: Job | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>(initial
    ? {
        ...initial,
        responsibilities: Array.isArray(initial.responsibilities) ? initial.responsibilities.join('\n') : initial.responsibilities || '',
        requirements: Array.isArray(initial.requirements) ? initial.requirements.join('\n') : initial.requirements || '',
        niceToHave: Array.isArray(initial.niceToHave) ? initial.niceToHave.join('\n') : initial.niceToHave || '',
        benefits: Array.isArray(initial.benefits) ? initial.benefits.join('\n') : initial.benefits || '',
        salaryMin: initial.salaryMin || '', salaryMax: initial.salaryMax || '',
        deadline: initial.deadline ? initial.deadline.slice(0, 10) : '',
      }
    : EMPTY_JOB);
  const [saving, setSaving] = useState(false);
  const set = (f: string, v: any) => setForm((p: any) => ({ ...p, [f]: v }));
  const toLines = (v: string) => v.split('\n').map((l: string) => l.trim()).filter(Boolean);

  const handleSave = async () => {
    if (!form.title || !form.department || !form.location || !form.type || !form.description) {
      toast.error('Title, department, location, type and description are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        responsibilities: toLines(form.responsibilities),
        requirements: toLines(form.requirements),
        niceToHave: toLines(form.niceToHave),
        benefits: toLines(form.benefits),
        salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : null,
        salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : null,
        deadline: form.deadline || null,
      };
      if (initial) {
        await api.put(`/careers/admin/${initial.id}`, payload);
        toast.success('Job updated');
      } else {
        await api.post('/careers/admin', payload);
        toast.success('Job created');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={initial ? 'Edit Job Posting' : 'Create Job Posting'} size="xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Job Title *</label>
            <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Mill Operations Manager" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Department *</label>
            <input className={inputCls} value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g. Operations" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Location *</label>
            <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Type *</label>
            <select className={selectCls} value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Experience Level</label>
            <select className={selectCls} value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior</option>
              <option value="manager">Manager</option>
              <option value="director">Director</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Min Salary (PKR/mo)</label>
            <input type="number" className={inputCls} value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)} placeholder="50000" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Max Salary (PKR/mo)</label>
            <input type="number" className={inputCls} value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)} placeholder="100000" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Application Deadline</label>
            <input type="date" className={inputCls} value={form.deadline} onChange={e => set('deadline', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Description *</label>
          <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        {(['responsibilities', 'requirements', 'niceToHave', 'benefits'] as const).map(f => (
          <div key={f}>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              {f === 'niceToHave' ? 'Nice to Have' : f.charAt(0).toUpperCase() + f.slice(1)}{' '}
              <span className="text-gray-400 font-normal normal-case">(one per line)</span>
            </label>
            <textarea className={`${inputCls} resize-none`} rows={3} value={form[f]} onChange={e => set(f, e.target.value)} placeholder="One item per line..." />
          </div>
        ))}
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isOpen} onChange={e => set('isOpen', e.target.checked)} className="rounded accent-green-600" />
            <span className="text-sm text-gray-700 font-medium">Position Open</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="rounded accent-green-600" />
            <span className="text-sm text-gray-700 font-medium">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.showSalary} onChange={e => set('showSalary', e.target.checked)} className="rounded accent-green-600" />
            <span className="text-sm text-gray-700 font-medium">Show Salary</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
          {saving ? 'Saving…' : initial ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Application Detail Modal ─────────────────────────────────────────────────
function ApplicationModal({
  app, onClose, onUpdated,
}: { app: Application; onClose: () => void; onUpdated: () => void }) {
  const [tab, setTab] = useState<'info' | 'actions'>('info');
  const [busy, setBusy] = useState(false);
  const [intDate, setIntDate] = useState(app.interviewDate ? app.interviewDate.slice(0, 16) : '');
  const [intMode, setIntMode] = useState(app.interviewMode || 'onsite');
  const [intNotes, setIntNotes] = useState(app.interviewNotes || '');
  const [offerAmt, setOfferAmt] = useState(app.offerAmount?.toString() || '');
  const [offerExp, setOfferExp] = useState(app.offerExpiry ? app.offerExpiry.slice(0, 10) : '');
  const [rejectReason, setRejectReason] = useState(app.rejectionReason || '');

  const action = async (fn: () => Promise<any>, msg: string) => {
    setBusy(true);
    try { await fn(); toast.success(msg); onUpdated(); onClose(); }
    catch (err: any) { toast.error(err.response?.data?.error || 'Action failed'); }
    finally { setBusy(false); }
  };

  const stage = PIPELINE_STAGES.find(s => s.key === app.status);
  const SERVER = import.meta.env.DEV ? 'http://localhost:5000' : '';

  return (
    <Modal isOpen onClose={onClose} title={`${app.name}`} size="lg">
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${stage?.dot || 'bg-gray-400'}`} />
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stage?.color || 'bg-gray-100 text-gray-600'}`}>
          {stage?.label || app.status}
        </span>
        {app.career && <span className="text-sm text-gray-400">· {app.career.title}</span>}
        <span className="ml-auto text-xs text-gray-400">{new Date(app.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}</span>
      </div>

      <div className="flex gap-1 mb-4">
        {(['info', 'actions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-colors ${
              tab === t ? 'bg-green-700 text-white border-green-700' : 'border-gray-200 text-gray-500 hover:border-green-300'
            }`}>
            {t === 'info' ? 'Candidate Profile' : 'Pipeline Actions'}
          </button>
        ))}
      </div>

      <div className="max-h-[60vh] overflow-y-auto space-y-3">
        {tab === 'info' ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <a href={`mailto:${app.email}`} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 text-sm text-green-700 hover:bg-green-50 transition-colors">
                <Mail size={14} className="flex-shrink-0" /><span className="truncate">{app.email}</span>
              </a>
              <a href={`tel:${app.phone}`} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 text-sm text-green-700 hover:bg-green-50 transition-colors">
                <Phone size={14} className="flex-shrink-0" /><span className="truncate">{app.phone}</span>
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {app.expectedSalary && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Expected Salary</p>
                  <p className="text-sm font-semibold">PKR {app.expectedSalary.toLocaleString('en-PK')}/mo</p>
                </div>
              )}
              {app.noticePeriod && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Notice Period</p>
                  <p className="text-sm font-semibold">{app.noticePeriod}</p>
                </div>
              )}
            </div>
            {app.linkedInUrl && (
              <a href={app.linkedInUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <ExternalLink size={13} />LinkedIn Profile
              </a>
            )}
            {app.resumeUrl && (
              <a href={`${SERVER}${app.resumeUrl}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 font-medium hover:bg-green-100 transition-colors">
                <FileText size={16} />{app.resumeName || 'View Resume'}<ExternalLink size={12} className="ml-auto" />
              </a>
            )}
            {app.coverLetter && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-2">Cover Letter</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{app.coverLetter}</p>
              </div>
            )}
            {app.interviewDate && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-1">Interview Scheduled</p>
                <p className="text-sm text-purple-800">
                  {new Date(app.interviewDate).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })} · {app.interviewMode}
                </p>
                {app.interviewNotes && <p className="text-sm text-purple-600 mt-1">{app.interviewNotes}</p>}
              </div>
            )}
          </>
        ) : (
          <>
            {app.status === 'applied' && (
              <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">Mark as Under Review</h4>
                <button onClick={() => action(() => api.patch(`/careers/applications/${app.id}/status`, { status: 'reviewing' }), 'Moved to reviewing')}
                  disabled={busy} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                  Move to Reviewing
                </button>
              </div>
            )}

            {['reviewing', 'interview_scheduled'].includes(app.status) && (
              <div className="border border-purple-200 bg-purple-50/50 rounded-xl p-4">
                <h4 className="font-semibold text-purple-900 mb-3 text-sm flex items-center gap-2"><Calendar size={14} />Schedule Interview</h4>
                <div className="space-y-2">
                  <input type="datetime-local" className={inputCls} value={intDate} onChange={e => setIntDate(e.target.value)} />
                  <select className={selectCls} value={intMode} onChange={e => setIntMode(e.target.value)}>
                    <option value="onsite">On-site (Our Office)</option>
                    <option value="online">Online (Video Call)</option>
                    <option value="phone">Phone Call</option>
                  </select>
                  <input className={inputCls} placeholder="Notes for candidate (optional)" value={intNotes} onChange={e => setIntNotes(e.target.value)} />
                  <button onClick={() => action(() => api.patch(`/careers/applications/${app.id}/interview`, { interviewDate: intDate, interviewMode: intMode, interviewNotes: intNotes }), 'Interview scheduled')}
                    disabled={!intDate || busy} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                    {busy ? 'Saving…' : 'Schedule & Send Invite'}
                  </button>
                </div>
              </div>
            )}

            {['interview_scheduled', 'reviewing'].includes(app.status) && (
              <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4">
                <h4 className="font-semibold text-amber-900 mb-3 text-sm flex items-center gap-2"><Award size={14} />Extend Offer</h4>
                <div className="space-y-2">
                  <input type="number" className={inputCls} placeholder="Monthly salary (PKR)" value={offerAmt} onChange={e => setOfferAmt(e.target.value)} />
                  <input type="date" className={inputCls} placeholder="Offer expiry date" value={offerExp} onChange={e => setOfferExp(e.target.value)} />
                  <button onClick={() => action(() => api.patch(`/careers/applications/${app.id}/offer`, { offerAmount: offerAmt, offerExpiry: offerExp }), 'Offer letter sent')}
                    disabled={busy} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                    {busy ? 'Saving…' : 'Send Offer Letter'}
                  </button>
                </div>
              </div>
            )}

            {app.status === 'offered' && (
              <div className="border border-green-200 bg-green-50/50 rounded-xl p-4">
                <h4 className="font-semibold text-green-900 mb-2 text-sm flex items-center gap-2"><UserCheck size={14} />Accept & Create Staff Account</h4>
                <p className="text-xs text-gray-500 mb-3">Creates a staff account for {app.email} with a temporary password emailed to them.</p>
                <button onClick={() => action(() => api.post(`/careers/applications/${app.id}/accept`), 'Application accepted — staff account created!')}
                  disabled={busy} className="w-full py-2.5 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                  {busy ? 'Creating Account…' : 'Accept & Onboard'}
                </button>
              </div>
            )}

            {!['accepted', 'rejected'].includes(app.status) && (
              <div className="border border-red-200 bg-red-50/50 rounded-xl p-4">
                <h4 className="font-semibold text-red-900 mb-3 text-sm flex items-center gap-2"><XCircle size={14} />Reject Application</h4>
                <textarea className={`${inputCls} resize-none mb-2`} rows={2}
                  placeholder="Reason for rejection (optional, sent to candidate)"
                  value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                <button onClick={() => action(() => api.patch(`/careers/applications/${app.id}/reject`, { rejectionReason: rejectReason }), 'Application rejected')}
                  disabled={busy} className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                  {busy ? 'Rejecting…' : 'Reject & Notify'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────
function KanbanColumn({
  stage, applications, onSelect,
}: { stage: typeof PIPELINE_STAGES[0]; applications: Application[]; onSelect: (a: Application) => void }) {
  return (
    <div className="flex-shrink-0 w-60 bg-gray-50 rounded-2xl p-3 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
          <span className="text-sm font-bold text-gray-700">{stage.label}</span>
        </div>
        <span className="text-xs font-semibold bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>
      <div className="space-y-2 min-h-24">
        {applications.map(app => (
          <motion.div
            key={app.id}
            className="bg-white rounded-xl p-3 border border-gray-200 cursor-pointer hover:border-green-300 hover:shadow-sm transition-all"
            onClick={() => onSelect(app)}
            whileHover={{ y: -1 }}
          >
            <p className="text-sm font-semibold text-gray-900 truncate">{app.name}</p>
            {app.career && <p className="text-xs text-gray-400 truncate mt-0.5">{app.career.title}</p>}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">
                {new Date(app.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
              </span>
              {app.interviewDate && (
                <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                  <Calendar size={10} />{new Date(app.interviewDate).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardCareers() {
  const [tab, setTab] = useState<'jobs' | 'pipeline'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobModal, setJobModal] = useState<Job | 'new' | null>(null);
  const [appModal, setAppModal] = useState<Application | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [filterJob, setFilterJob] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/careers/admin/all'),
        api.get('/careers/admin/applications?limit=200'),
      ]);
      setJobs(jobsRes.data.data || []);
      setApplications(appsRes.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/careers/admin/${deleteTarget.id}`);
      toast.success('Job deleted');
      setDeleteTarget(null);
      fetchAll();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filteredApps = filterJob
    ? applications.filter(a => a.careerId === filterJob)
    : applications;

  const appsByStage = PIPELINE_STAGES.reduce<Record<string, Application[]>>((acc, s) => {
    acc[s.key] = filteredApps.filter(a => a.status === s.key);
    return acc;
  }, {});

  const stats = {
    open: jobs.filter(j => j.isOpen).length,
    total: jobs.length,
    apps: applications.length,
    newApps: applications.filter(a => a.status === 'applied').length,
    hired: applications.filter(a => a.status === 'accepted').length,
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Careers & Hiring</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage job postings and track the hiring pipeline</p>
          </div>
          <button
            onClick={() => setJobModal('new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus size={16} /> Post a Job
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Open Jobs', value: stats.open, color: 'text-green-600' },
            { label: 'Total Jobs', value: stats.total, color: 'text-gray-800' },
            { label: 'Applications', value: stats.apps, color: 'text-blue-600' },
            { label: 'New', value: stats.newApps, color: 'text-amber-600' },
            { label: 'Hired', value: stats.hired, color: 'text-green-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
          {([['jobs', 'Job Postings'], ['pipeline', 'Hiring Pipeline']] as [string, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key as 'jobs' | 'pipeline')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                tab === key ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : tab === 'jobs' ? (
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No job postings yet</p>
                <button onClick={() => setJobModal('new')} className="mt-3 text-green-600 hover:underline text-sm">Create your first posting →</button>
              </div>
            ) : jobs.map(job => (
              <motion.div key={job.id} layout
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-green-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-1.5">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${job.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {job.isOpen ? 'Open' : 'Closed'}
                      </span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {TYPE_LABELS[job.type] || job.type}
                      </span>
                      {job.isFeatured && <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Featured</span>}
                    </div>
                    <h3 className="font-bold text-gray-900">{job.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Briefcase size={11} />{job.department}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Users size={11} />{job.totalApplications || 0} applicants</span>
                      {job.deadline && (
                        <span className={`text-xs flex items-center gap-1 ${new Date(job.deadline) < new Date() ? 'text-red-500' : 'text-gray-500'}`}>
                          <Clock size={11} />Deadline: {new Date(job.deadline).toLocaleDateString('en-PK')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setJobModal(job)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => setDeleteTarget(job)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <select value={filterJob} onChange={e => setFilterJob(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="">All Jobs</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
              <span className="text-sm text-gray-400">{filteredApps.length} applicants</span>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
                {PIPELINE_STAGES.map(stage => (
                  <KanbanColumn
                    key={stage.key}
                    stage={stage}
                    applications={appsByStage[stage.key] || []}
                    onSelect={setAppModal}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {jobModal !== null && (
          <JobFormModal
            key="job-form"
            initial={jobModal === 'new' ? undefined : jobModal}
            onClose={() => setJobModal(null)}
            onSaved={fetchAll}
          />
        )}
        {appModal && (
          <ApplicationModal key="app-modal" app={appModal} onClose={() => setAppModal(null)} onUpdated={() => { setAppModal(null); fetchAll(); }} />
        )}
        {deleteTarget && (
          <Modal key="delete-confirm" isOpen onClose={() => setDeleteTarget(null)} title="Delete Job Posting" size="sm">
            <p className="text-sm text-gray-600 mb-4">
              Delete <strong>{deleteTarget.title}</strong>? All applications will also be removed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors">Delete</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
