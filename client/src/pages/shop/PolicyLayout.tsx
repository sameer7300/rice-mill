import { Link, useLocation } from 'react-router-dom';
import { Phone, Mail, Shield, FileText, RefreshCw, Truck, ChevronRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const POLICIES = [
  { href: '/policies/privacy',  label: 'Privacy Policy',        icon: <Shield size={14} />,    color: 'text-green-600'  },
  { href: '/policies/terms',    label: 'Terms & Conditions',    icon: <FileText size={14} />,   color: 'text-blue-600'   },
  { href: '/policies/refund',   label: 'Refund & Returns',      icon: <RefreshCw size={14} />,  color: 'text-orange-600' },
  { href: '/policies/shipping', label: 'Shipping Policy',       icon: <Truck size={14} />,      color: 'text-purple-600' },
];

interface Props {
  title: string;
  updated: string;
  icon?: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
}

export default function PolicyLayout({ title, updated, icon, badge, children }: Props) {
  const { pathname } = useLocation();
  const currentPolicy = POLICIES.find(p => p.href === pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero bar */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <nav className="flex items-center gap-1.5 text-xs text-green-300 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/policies" className="hover:text-white transition-colors">Legal</Link>
            <ChevronRight size={12} />
            <span className="text-white font-medium">{title}</span>
          </nav>
          <div className="flex items-start gap-4">
            {icon && (
              <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                {icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{title}</h1>
                {badge && <span className="text-xs bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full font-semibold">{badge}</span>}
              </div>
              <p className="text-green-300 text-sm mt-1">Last updated: <strong className="text-green-100">{updated}</strong> · Al-Noor Rice Mills</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex gap-8 items-start">
          {/* Sticky sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-24 space-y-4">
            {/* Navigation card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Legal Documents</p>
              </div>
              <nav className="p-2 space-y-0.5">
                {POLICIES.map(p => (
                  <Link key={p.href} to={p.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === p.href ? 'bg-green-700 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <span className={pathname === p.href ? 'text-white' : p.color}>{p.icon}</span>
                    {p.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Help card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Need Clarification?</p>
              <div className="space-y-2 text-xs text-gray-500">
                <a href="tel:+9294612345" className="flex items-center gap-2 hover:text-green-600 transition-colors">
                  <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={12} className="text-green-600" />
                  </div>
                  +92-946-123456
                </a>
                <a href="mailto:ricemill@sameergul.com" className="flex items-center gap-2 hover:text-green-600 transition-colors">
                  <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={12} className="text-green-600" />
                  </div>
                  ricemill@sameergul.com
                </a>
              </div>
              <Link to="/contact" className="mt-4 flex items-center justify-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors">
                Contact Us <ExternalLink size={11} />
              </Link>
            </div>

            {/* Related policies */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-800 mb-2">Related</p>
              <div className="space-y-1">
                {POLICIES.filter(p => p.href !== pathname).map(p => (
                  <Link key={p.href} to={p.href} className="flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 py-1 transition-colors">
                    <span className={p.color}>{p.icon}</span> {p.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Content */}
          <motion.article
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Content area */}
              <div className="p-8">
                <div className="
                  [&_h2]:flex [&_h2]:items-center [&_h2]:gap-2.5 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:pb-2.5 [&_h2]:border-b-2 [&_h2]:border-green-100 [&_h2]:first:mt-0
                  [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-5 [&_h3]:mb-2
                  [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-3 [&_p]:text-sm
                  [&_ul]:text-gray-600 [&_ul]:text-sm [&_ul]:leading-relaxed [&_ul]:mb-4 [&_ul]:pl-5 [&_ul]:list-none [&_ul]:space-y-1.5
                  [&_ul_li]:flex [&_ul_li]:items-start [&_ul_li]:gap-2 [&_ul_li]:before:content-['·'] [&_ul_li]:before:text-green-500 [&_ul_li]:before:font-bold [&_ul_li]:before:flex-shrink-0 [&_ul_li]:before:mt-0.5
                  [&_ol]:text-gray-600 [&_ol]:text-sm [&_ol]:leading-relaxed [&_ol]:mb-4 [&_ol]:pl-5 [&_ol]:space-y-2
                  [&_strong]:font-semibold [&_strong]:text-gray-800
                  [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:mb-6 [&_table]:rounded-xl [&_table]:overflow-hidden
                  [&_th]:bg-green-50 [&_th]:border [&_th]:border-green-100 [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-green-800 [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide
                  [&_td]:border [&_td]:border-gray-100 [&_td]:px-4 [&_td]:py-2.5 [&_td]:text-gray-600
                  [&_a]:text-green-700 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-green-900
                  [&_.callout]:rounded-xl [&_.callout]:p-4 [&_.callout]:mb-5 [&_.callout]:text-sm [&_.callout]:leading-relaxed [&_.callout]:border
                  [&_.callout-blue]:bg-blue-50 [&_.callout-blue]:border-blue-200 [&_.callout-blue]:text-blue-800
                  [&_.callout-green]:bg-green-50 [&_.callout-green]:border-green-200 [&_.callout-green]:text-green-800
                  [&_.callout-amber]:bg-amber-50 [&_.callout-amber]:border-amber-200 [&_.callout-amber]:text-amber-800
                  [&_.callout-red]:bg-red-50 [&_.callout-red]:border-red-200 [&_.callout-red]:text-red-800
                ">
                  {children}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 bg-gray-50 px-8 py-4 flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs text-gray-400">© {new Date().getFullYear()} Al-Noor Rice Mills · Batkhela, Malakand, KPK, Pakistan</p>
                <div className="flex items-center gap-3">
                  {POLICIES.filter(p => p.href !== pathname).map(p => (
                    <Link key={p.href} to={p.href} className="text-xs text-gray-400 hover:text-green-700 transition-colors">{p.label}</Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile policy nav */}
            <div className="lg:hidden mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Other Legal Documents</p>
              <div className="grid grid-cols-2 gap-2">
                {POLICIES.filter(p => p.href !== pathname).map(p => (
                  <Link key={p.href} to={p.href}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <span className={p.color}>{p.icon}</span>{p.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </div>
  );
}
