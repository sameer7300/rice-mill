import { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import PageTransition from '../../components/PageTransition';

const SUBJECTS = ['Order Inquiry', 'Product Information', 'Wholesale / Bulk Order', 'Complaint', 'Other'];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Order Inquiry', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const inp = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/contact', form);
      toast.success('Message sent! We\'ll get back to you within 24 hours.');
      setSent(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error sending message. Try calling us instead.');
    } finally {
      setSending(false);
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-800 to-green-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-2">Contact Us</h1>
        <p className="text-green-200">Al-Noor Rice Mills — We're here to help</p>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>
          <p className="text-gray-600">Reach us directly via phone, WhatsApp, or fill in the form and we'll respond within 24 hours.</p>

          <div className="space-y-4">
            {[
              { icon: <Phone size={18} className="text-green-600" />, label: 'Office Phone', value: '+92-946-123456', href: 'tel:+929461234567' },
              { icon: <MessageCircle size={18} className="text-green-500" />, label: 'WhatsApp', value: '+92-300-1234567', href: 'https://wa.me/923001234567' },
              { icon: <Mail size={18} className="text-blue-600" />, label: 'Email', value: 'info@alnoorice.pk', href: 'mailto:info@alnoorice.pk' },
              { icon: <MapPin size={18} className="text-red-500" />, label: 'Address', value: 'Main GT Road, Near Batkhela Bus Stand, Batkhela, Malakand, KPK 23200' },
            ].map(c => (
              <div key={c.label} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">{c.icon}</div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith('https') ? '_blank' : undefined} rel="noreferrer"
                      className="text-gray-800 font-medium hover:text-green-700 transition-colors">{c.value}</a>
                  ) : (
                    <p className="text-gray-700 font-medium leading-snug">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Business hours */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Clock size={16} className="text-green-600" /> Business Hours</p>
            <table className="w-full text-sm">
              <tbody className="space-y-1">
                {[
                  { day: 'Monday – Saturday', time: '8:00 AM – 6:00 PM PKT' },
                  { day: 'Sunday', time: 'Closed' },
                  { day: 'Public Holidays', time: 'Closed' },
                ].map(h => (
                  <tr key={h.day}>
                    <td className="py-1 text-gray-500">{h.day}</td>
                    <td className="py-1 font-medium text-gray-800 text-right">{h.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Map placeholder */}
          <div className="rounded-2xl overflow-hidden bg-green-50 border border-green-100 h-44 flex flex-col items-center justify-center">
            <MapPin size={28} className="text-green-600 mb-2" />
            <p className="text-sm font-semibold text-green-800">Batkhela, Malakand</p>
            <p className="text-xs text-green-500">Khyber Pakhtunkhwa, Pakistan</p>
            <a href="https://maps.google.com/?q=Batkhela,+Malakand,+KPK+Pakistan" target="_blank" rel="noreferrer"
              className="mt-2 text-xs text-green-600 hover:underline">Open in Google Maps →</a>
          </div>
        </div>

        {/* Contact form */}
        {sent ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <CheckCircle2 size={52} className="text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
            <p className="text-gray-500 text-sm mb-5">Thank you for reaching out. We'll get back to you within 24 hours.</p>
            <p className="text-sm text-gray-400">Or call us directly: <a href="tel:+929461234567" className="text-green-600 hover:underline">+92-946-123456</a></p>
            <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: 'Order Inquiry', message: '' }); }}
              className="mt-5 text-sm text-green-600 hover:underline">Send another message</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Your Name *</label>
                  <input type="text" value={form.name} onChange={e => inp('name', e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Muhammad Ali" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email *</label>
                  <input type="email" value={form.email} onChange={e => inp('email', e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Phone (optional)</label>
                  <input type="tel" value={form.phone} onChange={e => inp('phone', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="03xx-xxxxxxx" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Subject *</label>
                <select value={form.subject} onChange={e => inp('subject', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Message *</label>
                <textarea value={form.message} onChange={e => inp('message', e.target.value)} required rows={5}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tell us about your order requirements, bulk pricing inquiry, or any question..." />
              </div>
              <button type="submit" disabled={sending}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                <Send size={16} /> {sending ? 'Sending...' : 'Send Message'}
              </button>
              <p className="text-center text-xs text-gray-400">
                Or WhatsApp directly:{' '}
                <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" className="text-green-600 hover:underline font-medium">+92-300-1234567</a>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
