import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  MapPin, Briefcase, Clock, ChevronDown, Send, Upload, X,
  Users, Star, Zap, Heart, Globe, TrendingUp, CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../../api';
import toast from 'react-hot-toast';
import PageTransition from '../../components/PageTransition';

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
  isFeatured?: boolean;
  totalApplications?: number;
  createdAt: string;
}

interface AppForm {
  name: string;
  email: string;
  phone: string;
  coverLetter: string;
  linkedInUrl: string;
  portfolioUrl: string;
  expectedSalary: string;
  noticePeriod: string;
  resumeUrl: string;
  resumeName: string;
}

const EMPTY_FORM: AppForm = {
  name: '', email: '', phone: '', coverLetter: '',
  linkedInUrl: '', portfolioUrl: '', expectedSalary: '', noticePeriod: '',
  resumeUrl: '', resumeName: '',
};

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-Time', 'part-time': 'Part-Time', 'contract': 'Contract', 'internship': 'Internship',
};
const TYPE_COLORS: Record<string, string> = {
  'full-time': 'bg-emerald-100 text-emerald-700',
  'part-time': 'bg-blue-100 text-blue-700',
  'contract': 'bg-amber-100 text-amber-700',
  'internship': 'bg-purple-100 text-purple-700',
};
const LEVEL_LABELS: Record<string, string> = {
  entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior', manager: 'Manager', director: 'Director',
};
const NOTICE_OPTIONS = ['Immediately', '1 week', '2 weeks', '1 month', '2 months', '3 months'];

// ─── Empty State — animated SVG illustration ─────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Illustration */}
      <div className="relative mb-8" style={{ width: 260, height: 220 }}>
        <svg viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Sky gradient background circle */}
          <defs>
            <radialGradient id="sky" cx="50%" cy="60%" r="55%">
              <stop offset="0%" stopColor="#ecfdf5" />
              <stop offset="100%" stopColor="#d1fae5" />
            </radialGradient>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="130" cy="130" rx="110" ry="85" fill="url(#sky)" />

          {/* Ground / soil */}
          <ellipse cx="130" cy="192" rx="85" ry="14" fill="#a16207" opacity="0.18" />
          <ellipse cx="130" cy="192" rx="70" ry="10" fill="#92400e" opacity="0.12" />

          {/* === Wheat stalks === */}
          {/* Stalk 1 — center, tallest */}
          <motion.g
            style={{ originX: '130px', originY: '190px' }}
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Stem */}
            <path d="M130 190 C130 170 128 150 130 115" stroke="#65a30d" strokeWidth="3.5" strokeLinecap="round" />
            {/* Left leaf */}
            <path d="M129 165 C118 158 108 152 106 144" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Right leaf */}
            <path d="M130 148 C141 141 150 136 153 128" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Grain head */}
            <ellipse cx="129" cy="109" rx="5" ry="9" fill="#fbbf24" opacity="0.95" />
            <ellipse cx="124" cy="112" rx="4" ry="7" fill="#f59e0b" opacity="0.9" transform="rotate(-15 124 112)" />
            <ellipse cx="135" cy="112" rx="4" ry="7" fill="#f59e0b" opacity="0.9" transform="rotate(15 135 112)" />
            <ellipse cx="127" cy="103" rx="3.5" ry="6" fill="#fcd34d" transform="rotate(-8 127 103)" />
            <ellipse cx="132" cy="103" rx="3.5" ry="6" fill="#fcd34d" transform="rotate(8 132 103)" />
          </motion.g>

          {/* Stalk 2 — left */}
          <motion.g
            style={{ originX: '100px', originY: '192px' }}
            animate={{ rotate: [-4, 2.5, -4] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          >
            <path d="M100 192 C99 174 97 158 100 128" stroke="#65a30d" strokeWidth="3" strokeLinecap="round" />
            <path d="M99 170 C90 162 82 155 80 148" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M100 152 C109 145 116 140 118 133" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" fill="none" />
            <ellipse cx="99" cy="122" rx="4" ry="8" fill="#fbbf24" opacity="0.9" />
            <ellipse cx="94" cy="125" rx="3.5" ry="6" fill="#f59e0b" transform="rotate(-15 94 125)" />
            <ellipse cx="104" cy="125" rx="3.5" ry="6" fill="#f59e0b" transform="rotate(15 104 125)" />
          </motion.g>

          {/* Stalk 3 — right */}
          <motion.g
            style={{ originX: '162px', originY: '192px' }}
            animate={{ rotate: [-2, 4, -2] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
          >
            <path d="M162 192 C162 173 163 156 161 125" stroke="#65a30d" strokeWidth="3" strokeLinecap="round" />
            <path d="M162 168 C172 161 179 153 181 146" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M161 150 C151 143 144 138 142 131" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" fill="none" />
            <ellipse cx="161" cy="119" rx="4" ry="8" fill="#fbbf24" opacity="0.9" />
            <ellipse cx="156" cy="122" rx="3.5" ry="6" fill="#f59e0b" transform="rotate(-15 156 122)" />
            <ellipse cx="166" cy="122" rx="3.5" ry="6" fill="#f59e0b" transform="rotate(15 166 122)" />
          </motion.g>

          {/* Stalk 4 — far left, shorter */}
          <motion.g
            style={{ originX: '72px', originY: '194px' }}
            animate={{ rotate: [-5, 2, -5] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          >
            <path d="M72 194 C71 179 70 166 72 142" stroke="#65a30d" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M71 175 C63 169 57 163 56 156" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <ellipse cx="71" cy="136" rx="3.5" ry="7" fill="#fbbf24" opacity="0.85" />
            <ellipse cx="67" cy="139" rx="3" ry="5" fill="#f59e0b" transform="rotate(-15 67 139)" />
            <ellipse cx="75" cy="139" rx="3" ry="5" fill="#f59e0b" transform="rotate(15 75 139)" />
          </motion.g>

          {/* Stalk 5 — far right, shorter */}
          <motion.g
            style={{ originX: '192px', originY: '194px' }}
            animate={{ rotate: [-2, 5, -2] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          >
            <path d="M192 194 C193 179 194 166 192 142" stroke="#65a30d" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M192 173 C200 167 206 160 207 153" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <ellipse cx="192" cy="136" rx="3.5" ry="7" fill="#fbbf24" opacity="0.85" />
            <ellipse cx="188" cy="139" rx="3" ry="5" fill="#f59e0b" transform="rotate(-15 188 139)" />
            <ellipse cx="196" cy="139" rx="3" ry="5" fill="#f59e0b" transform="rotate(15 196 139)" />
          </motion.g>

          {/* Floating grain particles */}
          {[
            { cx: 58, cy: 100, delay: 0 }, { cx: 200, cy: 88, delay: 0.8 },
            { cx: 45, cy: 145, delay: 1.4 }, { cx: 215, cy: 140, delay: 0.5 },
            { cx: 82, cy: 75, delay: 1.9 }, { cx: 178, cy: 70, delay: 1.1 },
          ].map(({ cx, cy, delay }, i) => (
            <motion.ellipse
              key={i}
              cx={cx} cy={cy} rx="4" ry="7"
              fill="#fcd34d"
              opacity={0.7}
              animate={{ y: [-6, 6, -6], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 2.4 + i * 0.3, repeat: Infinity, delay, ease: 'easeInOut' }}
              transform={`rotate(${-20 + i * 15} ${cx} ${cy})`}
            />
          ))}

          {/* "No roles" notice board — top */}
          <rect x="95" y="32" width="70" height="44" rx="6" fill="white" stroke="#d1d5db" strokeWidth="1.5" />
          <rect x="95" y="32" width="70" height="14" rx="6" fill="#f0fdf4" />
          <rect x="95" y="40" width="70" height="6" fill="#f0fdf4" />
          <text x="130" y="43" textAnchor="middle" fill="#16a34a" fontSize="7.5" fontWeight="700" fontFamily="system-ui">POSITIONS</text>
          <line x1="105" y1="57" x2="155" y2="57" stroke="#e5e7eb" strokeWidth="1.5" />
          <line x1="105" y1="63" x2="148" y2="63" stroke="#e5e7eb" strokeWidth="1.5" />
          <line x1="105" y1="69" x2="152" y2="69" stroke="#e5e7eb" strokeWidth="1.5" />
          {/* X marks through lines */}
          <text x="130" y="68" textAnchor="middle" fill="#ef4444" fontSize="20" fontWeight="300" opacity="0.2">✕</text>
          {/* Board post */}
          <line x1="130" y1="76" x2="130" y2="90" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Subtle glow behind illustration */}
        <div className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 60%, rgba(251,191,36,0.08) 0%, transparent 70%)' }} />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">No Open Positions</h3>
      <p className="text-gray-500 max-w-xs leading-relaxed text-sm">
        Our fields are tended and the mill is running. New roles open up with every season — check back soon.
      </p>
      <a
        href="mailto:ricemill@sameergul.com"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900 transition-colors"
      >
        Send a general application →
      </a>
    </motion.div>
  );
}

// ─── Perks section ────────────────────────────────────────────────────────────
const PERKS = [
  { icon: Heart, label: 'Health & Wellbeing', desc: 'Comprehensive health coverage for you and your family' },
  { icon: TrendingUp, label: 'Growth & Learning', desc: 'Continuous training and career development programs' },
  { icon: Globe, label: 'Community Impact', desc: 'Be part of a business that uplifts an entire region' },
  { icon: Zap, label: 'Innovation Culture', desc: 'AI-powered operations — work with cutting-edge tools' },
  { icon: Users, label: 'Collaborative Team', desc: 'A tight-knit team with decades of combined experience' },
  { icon: Star, label: 'Performance Rewards', desc: 'Competitive salaries, bonuses, and loyalty recognition' },
];

// ─── Application Modal ────────────────────────────────────────────────────────
function ApplicationModal({
  job, onClose, onSuccess,
}: { job: Job; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<AppForm>(EMPTY_FORM);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (f: keyof AppForm, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleResumeUpload = async (file: File) => {
    const allowed = /\.(pdf|doc|docx)$/i;
    if (!allowed.test(file.name)) { toast.error('Only PDF or Word documents allowed'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10 MB'); return; }
    setUploadingResume(true);
    try {
      const form = new FormData();
      form.append('document', file);
      const res = await api.post('/upload/document', form);
      set('resumeUrl', res.data.url);
      set('resumeName', res.data.originalName || file.name);
      toast.success('Resume uploaded');
    } catch {
      toast.error('Upload failed. Try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error('Name, email and phone are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/careers/${job.id}/apply`, {
        ...form,
        expectedSalary: form.expectedSalary ? parseFloat(form.expectedSalary) : undefined,
        source: 'website',
      });
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl z-10">
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">Apply for {job.title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{job.department} · {job.location}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-4 flex-shrink-0">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Step tabs */}
        <div className="px-6 pt-4 flex gap-2">
          {[1, 2].map(s => (
            <button
              key={s}
              onClick={() => setStep(s as 1 | 2)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-colors ${
                step === s ? 'bg-green-700 text-white border-green-700' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-green-300'
              }`}
            >
              {s === 1 ? 'Personal Info' : 'Resume & Details'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" className="space-y-4"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Full Name *</label>
                    <input className={inp} placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Email *</label>
                    <input type="email" className={inp} placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Phone *</label>
                    <input className={inp} placeholder="+92 300 1234567" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Expected Salary (PKR/month)</label>
                    <input type="number" className={inp} placeholder="e.g. 80000" value={form.expectedSalary} onChange={e => set('expectedSalary', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">LinkedIn Profile</label>
                    <input type="url" className={inp} placeholder="https://linkedin.com/in/..." value={form.linkedInUrl} onChange={e => set('linkedInUrl', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Portfolio / Website</label>
                    <input type="url" className={inp} placeholder="https://yoursite.com" value={form.portfolioUrl} onChange={e => set('portfolioUrl', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Notice Period</label>
                  <select className={inp} value={form.noticePeriod} onChange={e => set('noticePeriod', e.target.value)}>
                    <option value="">Select notice period</option>
                    {NOTICE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <button type="button" onClick={() => setStep(2)}
                  className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-colors">
                  Next: Resume & Details →
                </button>
              </motion.div>
            ) : (
              <motion.div key="step2" className="space-y-4"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                {/* Resume upload */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Resume / CV</label>
                  <input type="file" ref={fileRef} className="hidden" accept=".pdf,.doc,.docx"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleResumeUpload(f); e.target.value = ''; }} />
                  {form.resumeUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                      <span className="text-sm text-green-800 font-medium flex-1 truncate">{form.resumeName}</span>
                      <button type="button" onClick={() => { set('resumeUrl', ''); set('resumeName', ''); }}
                        className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingResume}
                      className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-green-400 hover:bg-green-50/40 transition-colors disabled:opacity-50">
                      {uploadingResume ? (
                        <motion.div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full"
                          animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                      ) : <Upload size={22} className="text-gray-400" />}
                      <p className="text-sm font-medium text-gray-600">{uploadingResume ? 'Uploading…' : 'Upload your resume'}</p>
                      <p className="text-xs text-gray-400">PDF or Word · max 10 MB</p>
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Cover Letter</label>
                  <textarea className={`${inp} resize-none`} rows={5}
                    placeholder={`Tell us why you'd be a great fit for ${job.title} at Al-Noor Rice Mills…`}
                    value={form.coverLetter} onChange={e => set('coverLetter', e.target.value)} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                    ← Back
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                    {submitting ? (
                      <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                    ) : <Send size={16} />}
                    {submitting ? 'Submitting…' : 'Submit Application'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onApply }: { job: Job; onApply: (j: Job) => void }) {
  const [expanded, setExpanded] = useState(false);
  const shouldReduce = useReducedMotion();

  const salary = job.showSalary && (job.salaryMin || job.salaryMax)
    ? job.salaryMin && job.salaryMax
      ? `PKR ${(job.salaryMin / 1000).toFixed(0)}K – ${(job.salaryMax / 1000).toFixed(0)}K/mo`
      : job.salaryMax ? `Up to PKR ${(job.salaryMax / 1000).toFixed(0)}K/mo` : null
    : null;

  return (
    <motion.div
      layout={!shouldReduce}
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        job.isFeatured ? 'border-amber-300 shadow-amber-100 shadow-md' : 'border-gray-200 hover:border-green-300 hover:shadow-md'
      }`}
    >
      {job.isFeatured && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2">
          <Star size={12} className="text-amber-500 fill-amber-500" />
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Featured Position</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[job.type] || 'bg-gray-100 text-gray-600'}`}>
                {TYPE_LABELS[job.type] || job.type}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                {LEVEL_LABELS[job.experienceLevel] || job.experienceLevel}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg leading-snug">{job.title}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Briefcase size={13} className="text-gray-400" />{job.department}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin size={13} className="text-gray-400" />{job.location}
              </span>
              {salary && (
                <span className="flex items-center gap-1.5 text-sm text-green-700 font-medium">
                  💰 {salary}
                </span>
              )}
              {job.deadline && (
                <span className="flex items-center gap-1.5 text-sm text-red-500">
                  <Clock size={13} />{new Date(job.deadline) < new Date() ? 'Deadline passed' : `Apply by ${new Date(job.deadline).toLocaleDateString('en-PK')}`}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onApply(job)}
            className="flex-shrink-0 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Apply Now
          </button>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mt-3 line-clamp-2">{job.description}</p>

        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-3 flex items-center gap-1.5 text-sm text-green-700 hover:text-green-900 font-medium transition-colors"
        >
          {expanded ? 'Show less' : 'View details'}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} />
          </motion.div>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
              {job.requirements?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Requirements</h4>
                  <ul className="space-y-1.5">
                    {job.requirements.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {job.responsibilities?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Responsibilities</h4>
                  <ul className="space-y-1.5">
                    {job.responsibilities.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 mt-2" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {job.niceToHave?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Nice to Have</h4>
                  <ul className="space-y-1.5">
                    {job.niceToHave.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-500">
                        <Star size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {job.benefits?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((b, i) => (
                      <span key={i} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">{b}</span>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => onApply(job)}
                className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Apply for this Position
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Success state ────────────────────────────────────────────────────────────
function SuccessState({ jobTitle, onBack }: { jobTitle: string; onBack: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onBack} />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl p-10 max-w-sm w-full text-center"
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <motion.div
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CheckCircle2 size={40} className="text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Sent!</h3>
        <p className="text-gray-500 leading-relaxed mb-6">
          Thank you for applying for <strong>{jobTitle}</strong>. We'll review your application and be in touch within 7–10 business days.
        </p>
        <button onClick={onBack} className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-colors">
          Back to Careers
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [filterType, setFilterType] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [applying, setApplying] = useState<Job | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/careers').catch(() => ({ data: { data: [] } })),
      api.get('/careers/departments').catch(() => ({ data: { data: [] } })),
    ]).then(([jobsRes, deptsRes]) => {
      setJobs(jobsRes.data.data || []);
      setDepartments(deptsRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    if (filterDept && j.department !== filterDept) return false;
    if (filterType && j.type !== filterType) return false;
    return true;
  });

  const handleSuccess = () => {
    const title = applying?.title || '';
    setApplying(null);
    setSuccess(title);
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Careers — Al-Noor Rice Mills</title>
        <meta name="description" content="Join Al-Noor Rice Mills — a growing, AI-powered rice mill in Batkhela, Malakand. Explore open positions and grow your career with us." />
      </Helmet>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #fbbf24 0%, transparent 50%), radial-gradient(circle at 80% 20%, #22c55e 0%, transparent 40%)`,
        }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              Join Our Team
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-5 leading-tight">
              Grow with<br />Al-Noor Rice Mills
            </h1>
            <p className="text-lg text-green-100 max-w-2xl mx-auto leading-relaxed">
              Be part of a family business that's shaping the future of Pakistan's rice industry with tradition, technology, and heart.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex flex-wrap justify-center gap-10 mt-12"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            {[['15+', 'Years of Excellence'], ['50+', 'Team Members'], ['2010', 'Established'], ['5★', 'Employee Rated']].map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="text-3xl font-black text-amber-400">{n}</div>
                <div className="text-sm text-green-200 mt-1">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Why Work With Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERKS.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              >
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                  <Icon size={20} className="text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Open Positions</h2>
              {!loading && <p className="text-sm text-gray-500 mt-1">{jobs.length} {jobs.length === 1 ? 'role' : 'roles'} available</p>}
            </div>
            {/* Filters */}
            <div className="flex gap-2">
              {departments.length > 0 && (
                <select
                  value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">All Types</option>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div className="space-y-4">
              {filtered.map((job, i) => (
                <motion.div key={job.id}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                  <JobCard job={job} onApply={setApplying} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-3">Don't See the Right Role?</h2>
          <p className="text-green-200 leading-relaxed mb-6">
            We're always looking for talented people. Send us your resume and we'll keep you in mind for future openings.
          </p>
          <a
            href="mailto:ricemill@sameergul.com?subject=General%20Application%20-%20Al-Noor%20Rice%20Mills"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-green-900 font-bold px-8 py-3 rounded-xl transition-colors"
          >
            <Send size={16} /> Send General Application
          </a>
        </div>
      </section>

      {/* Application modal */}
      <AnimatePresence>
        {applying && (
          <ApplicationModal
            key="apply-modal"
            job={applying}
            onClose={() => setApplying(null)}
            onSuccess={handleSuccess}
          />
        )}
        {success && (
          <SuccessState key="success" jobTitle={success} onBack={() => setSuccess(null)} />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
