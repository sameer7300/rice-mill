import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ExternalLink, Package, FileText, Briefcase, BookOpen } from 'lucide-react';
import api from '../../api';
import PageTransition from '../../components/PageTransition';

interface Product { id: string; name: string; variety: string; grade: string; }
interface Post { slug: string; title: string; publishedAt?: string; }
interface Job { id: string; title: string; department: string; }

const STATIC_SECTIONS = [
  {
    heading: 'Store',
    links: [
      { label: 'Home / Shop All Products', href: '/' },
      { label: 'Compare Products', href: '/compare' },
      { label: 'Track Your Order', href: '/track' },
      { label: 'Checkout', href: '/checkout' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Al-Noor Rice Mills', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Wholesale & Export', href: '/wholesale' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Create Account', href: '/register' },
      { label: 'Forgot Password', href: '/forgot-password' },
      { label: 'My Dashboard', href: '/dashboard' },
    ],
  },
  {
    heading: 'Policies',
    links: [
      { label: 'Policies Hub', href: '/policies' },
      { label: 'Privacy Policy', href: '/policies/privacy' },
      { label: 'Terms & Conditions', href: '/policies/terms' },
      { label: 'Refund Policy', href: '/policies/refund' },
      { label: 'Shipping Policy', href: '/policies/shipping' },
    ],
  },
];

export default function SitemapPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    api.get('/shop/products?limit=50').then(r => setProducts(r.data.products || [])).catch(() => {});
    api.get('/blog?limit=50').then(r => setPosts(r.data.posts || r.data || [])).catch(() => {});
    api.get('/careers').then(r => setJobs(r.data.data || [])).catch(() => {});
  }, []);

  return (
    <PageTransition>
      <Helmet>
        <title>Sitemap — Al-Noor Rice Mills</title>
        <meta name="description" content="Complete sitemap of Al-Noor Rice Mills website." />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Al-Noor Rice Mills</p>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Sitemap</h1>
          <p className="text-gray-500 mb-10">
            Every page on this website.{' '}
            <a href="/sitemap.xml" className="text-green-600 hover:underline inline-flex items-center gap-1">
              View XML sitemap <ExternalLink size={12} />
            </a>
          </p>

          {/* Static pages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
            {STATIC_SECTIONS.map(section => (
              <div key={section.heading}>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
                  {section.heading}
                </h2>
                <ul className="space-y-2">
                  {section.links.map(link => (
                    <li key={link.href}>
                      <Link to={link.href} className="text-sm text-gray-700 hover:text-green-700 hover:underline transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Products */}
          {products.length > 0 && (
            <div className="mb-14">
              <h2 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                <Package size={13} /> Products ({products.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                {products.map(p => (
                  <Link key={p.id} to={`/products/${p.id}`}
                    className="text-sm text-gray-700 hover:text-green-700 hover:underline py-0.5 transition-colors truncate">
                    {p.name} — {p.variety} Grade {p.grade}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Blog posts */}
          {posts.length > 0 && (
            <div className="mb-14">
              <h2 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                <BookOpen size={13} /> Blog Posts ({posts.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {posts.map(p => (
                  <Link key={p.slug} to={`/blog/${p.slug}`}
                    className="text-sm text-gray-700 hover:text-green-700 hover:underline py-0.5 transition-colors truncate">
                    {p.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Open positions */}
          {jobs.length > 0 && (
            <div className="mb-14">
              <h2 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                <Briefcase size={13} /> Open Positions ({jobs.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {jobs.map(j => (
                  <Link key={j.id} to={`/careers#job-${j.id}`}
                    className="text-sm text-gray-700 hover:text-green-700 hover:underline py-0.5 transition-colors">
                    {j.title} — {j.department}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
