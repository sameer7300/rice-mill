import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import PageTransition from '../../components/PageTransition';
import { FormField, inputCls, selectCls } from '../../components/ui/PageHeader';
import { scrollReveal, staggerContainer, staggerItem, viewportOnce, buttonTap } from '../../utils/animations';
import { CheckCircle2, Phone, MessageCircle } from 'lucide-react';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
function toDisplayUrl(url: string | null | undefined) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`;
  return url;
}

const EMPTY_FORM = {
  contactName: '', companyName: '', phone: '', email: '',
  riceVariety: '', quantityKg: '', frequency: '', budgetPerKg: '', message: '',
};

export default function WholesalePage() {
  const navigate = useNavigate();
  const [tiers, setTiers] = useState<any[]>([]);
  const [content, setContent] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [selectedTier, setSelectedTier] = useState('');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(-1);

  useEffect(() => {
    api.get('/ecommerce/pricing-tiers').then(r => setTiers(r.data.data || [])).catch(() => {});
    api.get('/ecommerce/wholesale-content').then(r => setContent(r.data.data)).catch(() => {});
    api.get('/faq').then(r => setFaqs(r.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.contactName || !form.phone || !form.quantityKg) {
      toast.error('Please fill Name, Phone, and Quantity');
      return;
    }
    setLoading(true);
    try {
      await api.post('/wholesale/inquiry', {
        ...form,
        quantityKg: parseFloat(form.quantityKg),
        budgetPerKg: form.budgetPerKg ? parseFloat(form.budgetPerKg) : undefined,
        tierLabel: selectedTier || undefined,
      });
      setSubmitted(true);
      toast.success('Enquiry sent! We\'ll respond within 4 hours on WhatsApp.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error sending enquiry');
    } finally { setLoading(false); }
  };

  return (
    <PageTransition>
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Wholesale & Bulk Rice — Al-Noor Rice Mills, Batkhela</title>
        <meta name="description" content="Wholesale rice pricing from Al-Noor Rice Mills. Trade pricing from 50kg, wholesale from 500kg. FOB Karachi export documentation included." />
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-green-900 text-white py-24 px-6 md:px-12">
        <div className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(60% 50% at 80% 30%, #fbbf24, transparent)' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.p variants={scrollReveal} initial="initial" animate="animate"
            className="text-green-400 text-sm font-mono tracking-widest uppercase mb-4">
            IV · Wholesale & Export
          </motion.p>
          <motion.h1 variants={scrollReveal} initial="initial" animate="animate"
            className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            {content?.heroTitle || 'Wholesale & Export'}
          </motion.h1>
          <motion.p variants={scrollReveal} initial="initial" animate="animate"
            className="text-green-200 text-lg max-w-2xl mx-auto mb-8">
            {content?.heroSubtitle || 'Built for restaurants, retailers, and exporters.'}
          </motion.p>
          <motion.div variants={scrollReveal} initial="initial" animate="animate"
            className="flex flex-wrap gap-3 justify-center">
            <a href="#inquiry-form"
              className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold rounded-xl transition-colors">
              Get a Quote →
            </a>
            <a href="tel:+9294612345"
              className="px-8 py-3.5 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors flex items-center gap-2">
              <Phone size={16} /> Call +92-946-123456
            </a>
          </motion.div>

          {/* Benefits row */}
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 text-left">
            {[
              { icon: '🏭', title: 'Direct Mill Pricing', desc: 'No distributors. Prices set at the mill gate in Batkhela.' },
              { icon: '📋', title: 'Export Documentation', desc: 'Full phytosanitary certificates and FOB Karachi documentation included.' },
              { icon: '👤', title: 'Dedicated Account Manager', desc: 'Assigned at 500kg+. One contact for orders, quotes, and logistics.' },
            ].map((b, i) => (
              <motion.div key={i} variants={staggerItem}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-bold text-white mb-1">{b.title}</h3>
                <p className="text-green-200 text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing Tiers Table ───────────────────────────────────────────────── */}
      {tiers.length > 0 && (
        <section className="py-20 px-6 md:px-12 bg-gray-950">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
              className="text-center mb-12">
              <p className="text-green-400 text-sm font-mono tracking-widest uppercase mb-3">Volume Pricing</p>
              <h2 className="text-3xl font-bold text-white">Transparent tier pricing</h2>
              <p className="text-gray-400 mt-3 max-w-xl mx-auto">
                {content?.exportNote}
              </p>
            </motion.div>

            <div className="border border-gray-800 rounded-2xl overflow-hidden">
              <div className="hidden md:grid grid-cols-12 bg-gray-900 px-6 py-3 text-gray-500 text-xs font-mono uppercase tracking-wider">
                <span className="col-span-2">Tier</span>
                <span className="col-span-3">Volume</span>
                <span className="col-span-4">Pricing</span>
                <span className="col-span-3 text-right">Action</span>
              </div>
              {tiers.map((tier, i) => (
                <motion.div key={tier.id} variants={staggerItem} initial="initial" whileInView="animate" viewport={viewportOnce}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-0 items-center px-6 py-5 border-t border-gray-800 transition-colors ${i === 2 ? 'bg-green-950/40' : 'bg-gray-950 hover:bg-gray-900'}`}>
                  <div className="md:col-span-2">
                    <span className={`text-sm font-bold font-mono ${i === 2 ? 'text-green-400' : 'text-white'}`}>{tier.label}</span>
                  </div>
                  <div className="md:col-span-3">
                    <span className="text-gray-300 text-sm">{tier.rangeLabel}</span>
                  </div>
                  <div className="md:col-span-4">
                    {tier.discount
                      ? <span className={`text-sm font-medium ${i === 2 ? 'text-green-400' : 'text-gray-300'}`}>{tier.discount}</span>
                      : <span className="text-gray-500 text-sm">{tier.description}</span>}
                  </div>
                  <div className="md:col-span-3 md:text-right">
                    <button onClick={() => { setSelectedTier(tier.id); document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' }); }}
                      className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${tier.ctaType === 'contact' ? 'bg-amber-400 text-gray-900 hover:bg-amber-300' : 'border border-gray-700 text-white hover:border-gray-500'}`}>
                      {tier.ctaText} →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Testimonial */}
            {content?.testimonialText && (
              <motion.div variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="mt-12 border-l-2 border-green-600 pl-6 max-w-2xl">
                <p className="text-gray-300 text-lg italic">"{content.testimonialText}"</p>
                <p className="text-gray-500 text-sm mt-3">
                  — {content.testimonialName}{content.testimonialRole ? `, ${content.testimonialRole}` : ''}
                </p>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* ── Inquiry Form ──────────────────────────────────────────────────────── */}
      <section id="inquiry-form" className="py-20 px-6 md:px-12 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <motion.div variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
            className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Request a Quote</h2>
            <p className="text-gray-500">We respond within 4 business hours via WhatsApp or email.</p>
          </motion.div>

          {submitted ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enquiry Received!</h3>
              <p className="text-gray-600 mb-4">We'll contact you within 4 hours on WhatsApp or email.</p>
              <p className="text-sm text-gray-400">Business hours: Mon–Sat, 8:00 AM – 6:00 PM PKT</p>
              <button onClick={() => { setSubmitted(false); setForm({ ...EMPTY_FORM }); }}
                className="mt-6 text-green-700 font-medium hover:underline text-sm">
                Submit another enquiry →
              </button>
            </motion.div>
          ) : (
            <motion.div variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
              className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">

              {/* Tier selector */}
              {tiers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Order Volume</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {tiers.map(tier => (
                      <button key={tier.id} type="button" onClick={() => setSelectedTier(tier.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-colors ${selectedTier === tier.id ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="font-bold text-sm text-gray-900">{tier.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{tier.rangeLabel}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Name *">
                  <input type="text" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} className={inputCls} placeholder="Ahmed Khan" />
                </FormField>
                <FormField label="Company / Business Name">
                  <input type="text" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} className={inputCls} placeholder="Al-Barkat Traders" />
                </FormField>
                <FormField label="Phone / WhatsApp *">
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="+92-300-0000000" />
                </FormField>
                <FormField label="Email">
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="ahmed@company.pk" />
                </FormField>
              </div>

              {/* Order details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Rice Variety Needed">
                  <select value={form.riceVariety} onChange={e => setForm(f => ({ ...f, riceVariety: e.target.value }))} className={selectCls}>
                    <option value="">Any / Multiple</option>
                    <option>Basmati</option><option>Super Kernel</option>
                    <option>IRRI-6</option><option>IRRI-9</option><option>PK-386</option>
                  </select>
                </FormField>
                <FormField label="Estimated Quantity (kg) *">
                  <input type="number" value={form.quantityKg} onChange={e => setForm(f => ({ ...f, quantityKg: e.target.value }))} className={inputCls} placeholder="500" min="50" />
                </FormField>
                <FormField label="Order Frequency">
                  <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className={selectCls}>
                    <option value="">Select</option>
                    <option value="one-time">One-time</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </FormField>
                <FormField label="Budget per kg (PKR)">
                  <input type="number" value={form.budgetPerKg} onChange={e => setForm(f => ({ ...f, budgetPerKg: e.target.value }))} className={inputCls} placeholder="Optional" />
                </FormField>
              </div>

              <FormField label="Additional Requirements">
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className={`${inputCls} resize-none`} rows={4}
                  placeholder="Export documentation needed? Special packaging? Specific certifications?" />
              </FormField>

              <motion.button onClick={handleSubmit} disabled={loading} {...buttonTap}
                className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold rounded-xl text-base transition-colors disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Enquiry →'}
              </motion.button>

              <p className="text-xs text-gray-400 text-center">
                We'll respond via WhatsApp or email within 4 hours.<br />
                Business hours: Mon–Sat, 8:00 AM – 6:00 PM PKT
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── FAQ (wholesale-relevant) ──────────────────────────────────────────── */}
      {faqs.length > 0 && (
        <section className="py-16 px-6 md:px-12 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto">
            <motion.h2 variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
              className="text-2xl font-bold text-gray-900 mb-8">Common Questions</motion.h2>
            <div className="space-y-3">
              {faqs.map((faq: any, i: number) => (
                <div key={faq.id} className={`border border-gray-200 rounded-xl overflow-hidden transition-colors ${openFaq === i ? 'border-green-200' : ''}`}>
                  <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                    <span className={`text-green-600 text-xl transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer CTA ───────────────────────────────────────────────────────── */}
      <section className="py-12 px-6 bg-green-900 text-white text-center">
        <p className="text-green-300 text-sm font-mono tracking-wider uppercase mb-3">Ready to order?</p>
        <h2 className="text-2xl font-bold mb-6">Talk to us directly on WhatsApp</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer"
            className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
            <MessageCircle size={18} /> WhatsApp +92-300-1234567
          </a>
          <Link to="/" className="px-6 py-3 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors">
            ← Browse Products
          </Link>
        </div>
      </section>
    </div>
    </PageTransition>
  );
}
