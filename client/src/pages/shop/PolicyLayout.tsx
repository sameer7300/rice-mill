import { Link, useLocation } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';

const POLICIES = [
  { href: '/policies/privacy',  label: 'Privacy Policy' },
  { href: '/policies/terms',    label: 'Terms & Conditions' },
  { href: '/policies/refund',   label: 'Refund & Return Policy' },
  { href: '/policies/shipping', label: 'Shipping Policy' },
];

interface Props {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export default function PolicyLayout({ title, updated, children }: Props) {
  const { pathname } = useLocation();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-green-600">Home</Link>
        <span>›</span>
        <Link to="/policies" className="hover:text-green-600">Policies</Link>
        <span>›</span>
        <span className="text-gray-700 font-medium">{title}</span>
      </nav>

      <div className="flex gap-8 items-start">
        {/* Sticky sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-24">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">All Policies</p>
            <nav className="space-y-1">
              {POLICIES.map(p => (
                <Link key={p.href} to={p.href}
                  className={`block px-3 py-2 rounded-xl text-sm font-medium transition-colors ${pathname === p.href ? 'bg-green-700 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  {p.label}
                </Link>
              ))}
            </nav>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">Need help?</p>
              <a href="tel:+929461234556" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 mb-1">
                <Phone size={11} /> +92-946-123456
              </a>
              <a href="mailto:ricemill@sameergul.com" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600">
                <Mail size={11} /> ricemill@sameergul.com
              </a>
              <Link to="/contact" className="mt-3 block text-center bg-green-700 hover:bg-green-800 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                Contact Us →
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <article className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
            <p className="text-sm text-gray-400 mb-8">Last updated: {updated}</p>
            <div className="prose prose-sm prose-gray max-w-none
              [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-gray-100
              [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-3
              [&_ul]:text-gray-600 [&_ul]:leading-relaxed [&_ul]:mb-3 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1
              [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-gray-800
              [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:mb-4
              [&_th]:bg-gray-50 [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-gray-700
              [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2 [&_td]:text-gray-600
              [&_a]:text-green-700 [&_a]:underline [&_section]:mb-2">
              {children}
            </div>
          </div>

          {/* Mobile: policy links accordion */}
          <div className="lg:hidden mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Other Policies</p>
            <div className="space-y-1">
              {POLICIES.filter(p => p.href !== pathname).map(p => (
                <Link key={p.href} to={p.href} className="block px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50">{p.label} →</Link>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
