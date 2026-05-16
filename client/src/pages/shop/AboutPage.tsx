import { Link } from 'react-router-dom';
import { Wheat, Users, Factory, Award, Leaf, TrendingUp, MapPin, CheckCircle2, ChevronRight, Clock, Shield, Truck } from 'lucide-react';
import PageTransition from '../../components/PageTransition';

const STATS = [
  { label: 'Years Experience', value: '15+', icon: <Award size={20} className="text-yellow-500" /> },
  { label: 'Monthly Capacity', value: '500T', icon: <Factory size={20} className="text-green-600" /> },
  { label: 'Rice Varieties', value: '6+', icon: <Wheat size={20} className="text-amber-600" /> },
  { label: 'Happy Customers', value: '500+', icon: <Users size={20} className="text-blue-500" /> },
];

const VALUES = [
  { icon: <Shield size={22} className="text-green-600" />, title: 'Quality Control', desc: 'Every batch is cleaned, sorted, and graded before leaving our mill. We never compromise on quality.' },
  { icon: <Leaf size={22} className="text-emerald-600" />, title: 'Direct from Mill', desc: 'No middlemen. You order directly from Al-Noor Rice Mills — fresher rice, better prices.' },
  { icon: <TrendingUp size={22} className="text-blue-600" />, title: 'Competitive Pricing', desc: 'Fair prices for wholesale buyers, retailers, and individuals. Volume discounts available.' },
  { icon: <Truck size={22} className="text-purple-600" />, title: 'Fast Delivery', desc: 'Same-day delivery in Batkhela and Malakand district. 2–5 days to other cities via TCS/Leopards.' },
];

const PROCESS = [
  { step: 1, title: 'Paddy Procurement', desc: 'We source premium paddy directly from farmers in Punjab and Sindh, ensuring fair prices.', icon: '🌾' },
  { step: 2, title: 'Cleaning & Sorting', desc: 'Paddy is cleaned, dehusked, and sorted by grade using modern machinery.', icon: '⚙️' },
  { step: 3, title: 'Milling & Polishing', desc: 'Rice is milled to your specified grade — raw, single, or double polished.', icon: '🏭' },
  { step: 4, title: 'Packaging & Delivery', desc: 'Packed in jute or PP bags (25kg/50kg) and dispatched directly to your door.', icon: '📦' },
];

const VARIETIES = [
  { name: 'Basmati', desc: 'Long grain, aromatic. The premium variety for biryani and pulao.', origin: 'Punjab' },
  { name: 'Super Kernel', desc: 'Extra long grain Basmati hybrid. High yield, premium aroma.', origin: 'Punjab / Sindh' },
  { name: 'IRRI-6', desc: 'Medium grain, non-aromatic. Best for everyday cooking, affordable.', origin: 'Sindh' },
  { name: 'IRRI-9', desc: 'Short grain, high starch. Popular for sticky rice dishes.', origin: 'Sindh' },
  { name: 'PK-386', desc: 'Fine grain, excellent texture. Good balance of quality and price.', origin: 'Punjab' },
  { name: 'Other', desc: 'Various regional varieties available on request for wholesale orders.', origin: 'Various' },
];

export default function AboutPage() {
  return (
    <PageTransition>
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wheat size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Al-Noor Rice Mills</h1>
          <p className="text-green-200 text-lg max-w-2xl mx-auto mb-4">
            Established 2010 · Batkhela, Malakand, KPK, Pakistan
          </p>
          <p className="text-green-300 max-w-xl mx-auto">
            Family-owned premium rice mill serving wholesale buyers, retailers, and direct consumers across Pakistan since 2010.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-4 text-green-300 text-sm">
            <MapPin size={14} /> Main GT Road, Near Batkhela Bus Stand, Malakand District
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="flex justify-center mb-2">{s.icon}</div>
              <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-2 block">Our Story</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">From Batkhela to Your Table</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Founded in 2010 in the fertile Malakand region of Khyber Pakhtunkhwa, Al-Noor Rice Mills was established with a single goal: to bring the freshest, highest-quality Pakistani rice directly from our mill to your table — without unnecessary middlemen that inflate prices and reduce freshness.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Located on the Main GT Road in Batkhela, our mill has grown from a small family operation into one of the region's trusted rice suppliers. We source premium paddy from farmers across Punjab and Sindh, mill it at our facility, and deliver directly to wholesale buyers, retailers, restaurants, and households across Pakistan.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, we use modern technology to manage our operations — tracking every batch from paddy procurement to final delivery — while staying true to our roots as a family-run, quality-first business.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden bg-green-50 h-72">
            <img src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80" alt="Rice mill" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Al-Noor?</h2>
            <p className="text-gray-500 mt-2">What makes us different from other rice suppliers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">{v.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Our Process</h2>
          <p className="text-gray-500 mt-2">From paddy field to your door — 4 steps</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {PROCESS.map((p, i) => (
            <div key={p.step} className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">{p.icon}</div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="w-5 h-5 bg-green-700 text-white rounded-full text-xs font-bold flex items-center justify-center">{p.step}</span>
                {i < PROCESS.length - 1 && <span className="hidden sm:block text-gray-300">→</span>}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Varieties */}
      <section className="bg-green-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Varieties We Mill</h2>
            <p className="text-gray-500 mt-2">Premium varieties for every need and budget</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {VARIETIES.map(v => (
              <div key={v.name} className="bg-white rounded-2xl p-5 border border-green-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Wheat size={16} className="text-green-600" />
                  <h3 className="font-bold text-gray-900">{v.name}</h3>
                </div>
                <p className="text-gray-500 text-sm mb-2 leading-relaxed">{v.desc}</p>
                <p className="text-xs text-green-600 flex items-center gap-1"><MapPin size={11} /> {v.origin}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quality Certifications</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {['PSQCA Certified', 'ISO Quality Standards', 'Halal Certified', 'Export Quality'].map(cert => (
            <div key={cert} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3">
              <CheckCircle2 size={16} className="text-green-600" />
              <span className="text-sm font-medium text-gray-700">{cert}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-700 text-white py-14 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to Order Premium Rice?</h2>
        <p className="text-green-200 mb-6 max-w-lg mx-auto">
          Direct from Al-Noor Rice Mills in Batkhela. Best quality, competitive prices, delivered across Pakistan.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold px-6 py-3 rounded-xl transition-colors">
            Shop Now <ChevronRight size={16} />
          </Link>
          <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl border border-white/30 transition-colors">
            WhatsApp Us
          </a>
        </div>
      </section>
    </div>
    </PageTransition>
  );
}
