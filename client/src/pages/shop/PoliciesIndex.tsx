import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, FileText, RefreshCw, Truck, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '../../components/PageTransition';

const POLICIES = [
  {
    icon: <Shield size={28} className="text-green-600" />,
    title: 'Privacy Policy',
    desc: 'How we collect, use, and protect your personal information.',
    href: '/policies/privacy',
    bg: 'bg-green-50',
  },
  {
    icon: <FileText size={28} className="text-blue-600" />,
    title: 'Terms & Conditions',
    desc: 'Rules and guidelines for using our website and services.',
    href: '/policies/terms',
    bg: 'bg-blue-50',
  },
  {
    icon: <RefreshCw size={28} className="text-orange-600" />,
    title: 'Refund & Return Policy',
    desc: 'Our quality guarantee and how to request a refund or exchange.',
    href: '/policies/refund',
    bg: 'bg-orange-50',
  },
  {
    icon: <Truck size={28} className="text-purple-600" />,
    title: 'Shipping Policy',
    desc: 'Delivery timelines, fees, and shipping information across Pakistan.',
    href: '/policies/shipping',
    bg: 'bg-purple-50',
  },
];

export default function PoliciesIndex() {
  return (
    <PageTransition>
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Helmet>
        <title>Policies — Al-Noor Rice Mills</title>
        <meta name="description" content="Privacy policy, terms and conditions, refund policy, and shipping policy for Al-Noor Rice Mills." />
      </Helmet>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Our Policies</h1>
        <p className="text-gray-500 max-w-lg mx-auto">Everything you need to know about how we operate, handle your data, and protect your purchase.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {POLICIES.map((p, i) => (
          <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={p.href} className="block bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className={`w-12 h-12 ${p.bg} rounded-xl flex items-center justify-center mb-4`}>{p.icon}</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">{p.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{p.desc}</p>
              <span className="text-sm font-semibold text-green-600 group-hover:text-green-800">Read More →</span>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
        <MessageCircle size={24} className="mx-auto mb-3 text-green-600" />
        <h3 className="font-semibold text-gray-800 mb-1">Still have questions?</h3>
        <p className="text-sm text-gray-500 mb-4">Our team is available Mon–Sat, 8 AM – 6 PM PKT.</p>
        <Link to="/contact" className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          Contact Us →
        </Link>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">Last updated: January 2026</p>
    </div>
    </PageTransition>
  );
}
