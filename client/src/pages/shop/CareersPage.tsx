import { useEffect, useState } from 'react';
import { MapPin, Briefcase, Clock, ChevronDown, ChevronUp, Send } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import { inputCls } from '../../components/ui/PageHeader';
import PageTransition from '../../components/PageTransition';

const TYPE_COLOR: Record<string, string> = {
  'full-time': 'bg-green-100 text-green-700',
  'part-time': 'bg-blue-100 text-blue-700',
  'contract': 'bg-orange-100 text-orange-700',
};

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [applying, setApplying] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', coverLetter: '' });
  const [submitting, setSubmitting] = useState(false);
  const inp = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  useEffect(() => {
    api.get('/careers').then(r => setJobs(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/careers/${applying.id}/apply`, form);
      toast.success('Application submitted! We will be in touch.');
      setApplying(null);
      setForm({ name: '', email: '', phone: '', coverLetter: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-800 to-green-700 text-white py-16 px-4 text-center">
        <Briefcase size={40} className="mx-auto mb-4 opacity-80" />
        <h1 className="text-4xl font-extrabold mb-2">Careers at Rice Mill</h1>
        <p className="text-green-200">Join our growing team and help shape the future of Pakistani agriculture.</p>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-14">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-600">No open positions at the moment</p>
            <p className="text-sm mt-1">Check back soon or send your CV to careers@ricemill.pk</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-6">{jobs.length} open position{jobs.length !== 1 ? 's' : ''}</p>
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
                  onClick={() => setExpanded(expanded === job.id ? null : job.id)}>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${TYPE_COLOR[job.type] || 'bg-gray-100 text-gray-600'}`}>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><Briefcase size={13} /> {job.department}</span>
                      <span className="flex items-center gap-1"><MapPin size={13} /> {job.location}</span>
                    </div>
                  </div>
                  {expanded === job.id ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0 mt-1" />}
                </button>
                {expanded === job.id && (
                  <div className="px-6 pb-6 border-t border-gray-50">
                    <p className="text-gray-600 leading-relaxed mt-4 whitespace-pre-line">{job.description}</p>
                    <button onClick={() => setApplying(job)}
                      className="mt-5 flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                      <Send size={15} /> Apply Now
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {applying && (
        <Modal title={`Apply: ${applying.title}`} onClose={() => setApplying(null)}>
          <form onSubmit={submitApplication} className="space-y-4">
            <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700 border border-green-100">
              <strong>{applying.department}</strong> · {applying.location} · {applying.type}
            </div>
            {[
              { f: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Muhammad Ali' },
              { f: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'you@example.com' },
              { f: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '03xx-xxxxxxx' },
            ].map(field => (
              <div key={field.f}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{field.label} *</label>
                <input type={field.type} value={(form as any)[field.f]} onChange={e => inp(field.f, e.target.value)}
                  required placeholder={field.placeholder} className={inputCls} />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Cover Letter (optional)</label>
              <textarea value={form.coverLetter} onChange={e => inp('coverLetter', e.target.value)} rows={4}
                placeholder="Tell us why you're a great fit..."
                className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500`} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setApplying(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={submitting}
                className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}
