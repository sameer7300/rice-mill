import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ShoppingBag, User, BookOpen, Globe, Shield, LayoutDashboard,
  ZoomIn, ZoomOut, RotateCcw, Maximize2, ChevronRight, Lock,
  Home, CreditCard, Package, FileText, Bot, Wheat
} from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import { useAuth } from '../../contexts/AuthContext';

// ─── Canvas dimensions ───────────────────────────────────────────────────────
const CW = 1640;   // canvas width
const CH = 740;    // canvas height

// ─── Node sizes ──────────────────────────────────────────────────────────────
const ROOT_W = 280; const ROOT_H = 72;
const SEC_W  = 172; const SEC_H  = 56;
const PAGE_W = 152; const PAGE_H = 40;

// ─── Y positions ─────────────────────────────────────────────────────────────
const ROOT_Y   = 32;
const SEC_Y    = 180;
const PAGE_Y0  = 305;
const PAGE_GAP = 52;

// ─── Section X positions (5 sections evenly across canvas) ───────────────────
const SEC_XS = [90, 420, 756, 1090, 1428];
const ROOT_X = CW / 2;

// ─── Data ────────────────────────────────────────────────────────────────────
interface PageNode { label: string; href: string; desc?: string; }
interface Section {
  id:       string;
  label:    string;
  sublabel: string;
  icon:     React.ReactNode;
  color:    string;   // hex
  stroke:   string;   // tailwind-style hex
  href?:    string;
  pages:    PageNode[];
  adminOnly?: boolean;
}

const SECTIONS: Section[] = [
  {
    id: 'store', label: 'Store & Shop', sublabel: 'Public storefront', href: '/',
    icon: <ShoppingBag size={15} />, color: '#16a34a', stroke: '#15803d',
    pages: [
      { label: 'Home / Catalogue',  href: '/',           desc: 'Product grid, filters, FAQ, newsletter' },
      { label: 'Product Detail',    href: '/products',   desc: 'Images, specs, nutrition, reviews, stock alert' },
      { label: 'Compare Products',  href: '/compare',    desc: 'Side-by-side up to 4 varieties' },
      { label: 'Checkout',          href: '/checkout',   desc: 'Multi-currency, 5 payment methods' },
      { label: 'Track Order',       href: '/track',      desc: 'Real-time order tracking by number' },
      { label: 'Order Success',     href: '/order-success', desc: 'Confirmation, receipt, loyalty pts' },
    ],
  },
  {
    id: 'account', label: 'Account', sublabel: 'Auth & customer area', href: '/login',
    icon: <User size={15} />, color: '#7c3aed', stroke: '#6d28d9',
    pages: [
      { label: 'Sign In',          href: '/login',            desc: 'Email + password; 2FA TOTP support' },
      { label: 'Register',         href: '/register',         desc: 'Email or WhatsApp OTP verification' },
      { label: 'Forgot Password',  href: '/forgot-password',  desc: 'Email link or WhatsApp 6-digit OTP' },
      { label: 'My Orders',        href: '/dashboard',        desc: 'History, status, chat, reorder' },
      { label: 'Loyalty Rewards',  href: '/dashboard',        desc: 'Points, tiers, referral code' },
      { label: 'Security & 2FA',   href: '/dashboard',        desc: 'Password, 2FA, active sessions' },
      { label: 'My Data (GDPR)',   href: '/dashboard',        desc: 'Download data / full export request' },
    ],
  },
  {
    id: 'content', label: 'Content & Info', sublabel: 'Public information', href: '/about',
    icon: <BookOpen size={15} />, color: '#d97706', stroke: '#b45309',
    pages: [
      { label: 'About Us',    href: '/about',     desc: 'Story, mill, heritage, certifications' },
      { label: 'Contact',     href: '/contact',   desc: 'Form, phone, email, map, hours' },
      { label: 'Wholesale',   href: '/wholesale', desc: 'Bulk tiers, export inquiry, FOB/CIF' },
      { label: 'Blog',        href: '/blog',      desc: 'Rice guides, cooking tips, news' },
      { label: 'Careers',     href: '/careers',   desc: 'Job openings, apply with CV' },
    ],
  },
  {
    id: 'legal', label: 'Legal & Policies', sublabel: 'Compliance documents', href: '/policies',
    icon: <Shield size={15} />, color: '#475569', stroke: '#334155',
    pages: [
      { label: 'Policies Hub',      href: '/policies',          desc: 'Overview of all legal docs' },
      { label: 'Privacy Policy',    href: '/policies/privacy',  desc: 'GDPR · PDPA · data & cookies' },
      { label: 'Terms & Conditions',href: '/policies/terms',    desc: '16 sections · international law' },
      { label: 'Refund & Returns',  href: '/policies/refund',   desc: '10 sections · eligibility tables' },
      { label: 'Shipping Policy',   href: '/policies/shipping', desc: '13 sections · all zones & couriers' },
      { label: 'Site Map',          href: '/sitemap',           desc: 'This page' },
    ],
  },
  {
    id: 'admin', label: 'Admin Dashboard', sublabel: 'Staff & admin only', href: '/dashboard',
    icon: <LayoutDashboard size={15} />, color: '#0369a1', stroke: '#0c4a6e',
    adminOnly: true,
    pages: [
      { label: 'Inventory & Mill',   href: '/dashboard/inventory', desc: 'Paddy stock, milled rice, batches' },
      { label: 'Orders & Customers', href: '/dashboard/orders',    desc: 'Full order management, CRM' },
      { label: 'Finance & Analytics',href: '/dashboard/finance',   desc: 'P&L, KPIs, visitor analytics' },
      { label: 'E-Commerce',         href: '/dashboard/ecommerce', desc: 'Products, discounts, shipping zones' },
      { label: 'Content & People',   href: '/dashboard/blog',      desc: 'Blog, careers, newsletter, reviews' },
      { label: 'AI Agents',          href: '/dashboard/agents',    desc: 'Claude-powered autonomous agents' },
      { label: 'Data Requests',      href: '/dashboard/data-requests', desc: 'GDPR export approvals' },
    ],
  },
];

// ─── Path helpers ─────────────────────────────────────────────────────────────

function bezier(x1: number, y1: number, x2: number, y2: number): string {
  const mid = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`;
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function SitemapPage() {
  const { user, isAdmin, isStaff } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom]   = useState(0.78);
  const [pan, setPan]     = useState({ x: 0, y: 0 });
  const [dragging, setDragging]   = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart]   = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  const showAdmin = isAdmin || isStaff;

  // Centre and fit on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!canvasRef.current) return;
      const vw = canvasRef.current.clientWidth;
      const vh = canvasRef.current.clientHeight;
      const fz = Math.min((vw - 40) / CW, (vh - 40) / CH, 1);
      setZoom(fz);
      setPan({ x: (vw - CW * fz) / 2, y: (vh - CH * fz) / 2 });
      setReady(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // ── Pan handlers ────────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a,button')) return;
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ ...pan });
  };
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: panStart.x + e.clientX - dragStart.x, y: panStart.y + e.clientY - dragStart.y });
  }, [dragging, dragStart, panStart]);
  const onMouseUp = () => setDragging(false);

  // ── Wheel zoom ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom(z => Math.min(2, Math.max(0.2, z * delta)));
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const resetView = () => {
    if (!canvasRef.current) return;
    const vw = canvasRef.current.clientWidth;
    const vh = canvasRef.current.clientHeight;
    const fz = Math.min((vw - 40) / CW, (vh - 40) / CH, 1);
    setZoom(fz);
    setPan({ x: (vw - CW * fz) / 2, y: (vh - CH * fz) / 2 });
  };

  // Build all paths
  const paths: { d: string; color: string }[] = [];

  // Root → sections
  SECTIONS.forEach((sec, i) => {
    const secX = SEC_XS[i] + SEC_W / 2;
    const rx = ROOT_X;
    const ry = ROOT_Y + ROOT_H;
    const sy = SEC_Y;
    paths.push({ d: bezier(rx, ry, secX, sy), color: sec.color });
  });

  // Sections → pages
  SECTIONS.forEach((sec, i) => {
    const secX = SEC_XS[i] + SEC_W / 2;
    sec.pages.forEach((_, j) => {
      const px = SEC_XS[i] + PAGE_W / 2 + (SEC_W - PAGE_W) / 2;
      const py = PAGE_Y0 + j * PAGE_GAP;
      paths.push({ d: bezier(secX, SEC_Y + SEC_H, px, py), color: sec.color });
    });
  });

  return (
    <PageTransition>
      <Helmet>
        <title>Visual Site Map — Al-Noor Rice Mills</title>
        <meta name="description" content="Interactive visual site map — all pages connected in a diagram." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Top bar */}
        <div className="bg-green-900 text-white flex items-center gap-4 px-5 py-2.5 flex-shrink-0 shadow-lg">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <Wheat size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm">Al-Noor Rice Mills</span>
          </Link>
          <ChevronRight size={14} className="text-green-500" />
          <span className="text-green-300 text-sm font-medium">Site Map</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-green-400 hidden sm:block">Scroll to zoom · Drag to pan</span>
            <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
              <button onClick={() => setZoom(z => Math.min(2, z * 1.25))}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors" title="Zoom in">
                <ZoomIn size={14} />
              </button>
              <span className="text-xs text-green-300 w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.max(0.2, z * 0.8))}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors" title="Zoom out">
                <ZoomOut size={14} />
              </button>
              <button onClick={resetView}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors ml-0.5" title="Reset view">
                <Maximize2 size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-hidden select-none"
          style={{ background: '#f8fafc', cursor: dragging ? 'grabbing' : 'grab' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <div style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: CW,
            height: CH,
            position: 'relative',
          }}>
            {/* ── SVG layer (lines + background) ── */}
            <svg
              width={CW} height={CH}
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
            >
              <defs>
                {/* Dot-grid background */}
                <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="12" cy="12" r="1.2" fill="#cbd5e1" />
                </pattern>
                {/* Arrow markers per section */}
                {SECTIONS.map(s => (
                  <marker key={s.id} id={`arr-${s.id}`} markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
                    <path d="M0,0 L0,7 L8,3.5 z" fill={s.color} opacity="0.7" />
                  </marker>
                ))}
                {/* Default arrow */}
                <marker id="arr-root" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
                  <path d="M0,0 L0,7 L8,3.5 z" fill="#94a3b8" opacity="0.6" />
                </marker>
                {/* Glow filter */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Background */}
              <rect width={CW} height={CH} fill="url(#dots)" rx="16" />
              <rect width={CW} height={CH} fill="none" stroke="#e2e8f0" strokeWidth="1.5" rx="16" />

              {/* Connection paths */}
              {ready && paths.map((p, i) => {
                const isRoot = i < SECTIONS.length;
                const sec = SECTIONS[isRoot ? i : Math.floor((i - SECTIONS.length) / SECTIONS[0].pages.length)];
                const sIdx = isRoot ? i : Math.floor((i - SECTIONS.length) / (paths.length - SECTIONS.length) * SECTIONS.length);
                const actualSec = SECTIONS[Math.max(0, Math.min(SECTIONS.length - 1, isRoot ? i : (() => {
                  let count = SECTIONS.length;
                  for (let si = 0; si < SECTIONS.length; si++) {
                    if (i < count + SECTIONS[si].pages.length) return si;
                    count += SECTIONS[si].pages.length;
                  }
                  return 0;
                })()))];
                return (
                  <motion.path
                    key={i}
                    d={p.d}
                    stroke={p.color}
                    strokeWidth={isRoot ? 2 : 1.4}
                    fill="none"
                    strokeOpacity={isRoot ? 0.8 : 0.55}
                    strokeDasharray="400"
                    initial={{ strokeDashoffset: 400 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.7, delay: i * 0.012, ease: 'easeOut' }}
                    markerEnd={`url(#arr-${p.color === SECTIONS[0].color ? SECTIONS[0].id : (SECTIONS.find(s => s.color === p.color)?.id || 'root')})`}
                  />
                );
              })}
            </svg>

            {/* ── Root node ── */}
            <div style={{
              position: 'absolute',
              left: ROOT_X - ROOT_W / 2,
              top: ROOT_Y,
              width: ROOT_W,
              height: ROOT_H,
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full rounded-2xl shadow-xl flex items-center gap-3.5 px-5 cursor-pointer border-2 border-green-200"
                style={{ background: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)' }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wheat size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-extrabold text-sm leading-tight">Al-Noor Rice Mills</p>
                  <p className="text-green-300 text-xs mt-0.5">alnoorice.pk</p>
                </div>
                <div className="ml-auto flex flex-col items-end gap-0.5">
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                    {SECTIONS.reduce((s, x) => s + x.pages.length, 0) + SECTIONS.length + 1} pages
                  </span>
                  <span className="text-xs text-green-300">12 currencies</span>
                </div>
              </motion.div>
            </div>

            {/* ── Section nodes + page nodes ── */}
            {SECTIONS.map((sec, si) => {
              const sx = SEC_XS[si];
              const isLocked = sec.adminOnly && !showAdmin;

              return (
                <div key={sec.id}>
                  {/* Section node */}
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + si * 0.06 }}
                    style={{ position: 'absolute', left: sx, top: SEC_Y, width: SEC_W, height: SEC_H }}
                  >
                    <Link
                      to={sec.href || '/'}
                      onClick={e => isLocked && e.preventDefault()}
                      className="block w-full h-full rounded-xl shadow-md flex items-center gap-2.5 px-3.5 hover:shadow-lg transition-shadow border border-white/60"
                      style={{
                        background: isLocked
                          ? '#f1f5f9'
                          : `linear-gradient(135deg, ${sec.color}ee, ${sec.stroke}dd)`,
                        opacity: isLocked ? 0.6 : 1,
                      }}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLocked ? 'bg-gray-200' : 'bg-white/25'}`}>
                        {isLocked ? <Lock size={13} className="text-gray-500" /> : <span className="text-white">{sec.icon}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-xs leading-tight truncate ${isLocked ? 'text-gray-500' : 'text-white'}`}>{sec.label}</p>
                        <p className={`text-xs mt-0.5 leading-tight truncate ${isLocked ? 'text-gray-400' : 'text-white/75'}`}>
                          {isLocked ? 'Admin only' : sec.sublabel}
                        </p>
                      </div>
                    </Link>
                  </motion.div>

                  {/* Page nodes */}
                  {sec.pages.map((page, pi) => {
                    const py = PAGE_Y0 + pi * PAGE_GAP;
                    const px = sx + (SEC_W - PAGE_W) / 2;

                    return (
                      <motion.div
                        key={page.href + pi}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.25 + si * 0.07 + pi * 0.03 }}
                        style={{ position: 'absolute', left: px, top: py, width: PAGE_W, height: PAGE_H }}
                      >
                        <Link
                          to={isLocked ? '/' : page.href}
                          onClick={e => isLocked && e.preventDefault()}
                          title={page.desc}
                          className="block w-full h-full rounded-xl border shadow-sm flex items-center gap-2 px-3 group transition-all hover:shadow-md"
                          style={{
                            background: isLocked ? '#f8fafc' : '#ffffff',
                            borderColor: isLocked ? '#e2e8f0' : `${sec.color}40`,
                            opacity: isLocked ? 0.5 : 1,
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-150"
                            style={{ background: sec.color }}
                          />
                          <p
                            className="text-xs font-medium truncate transition-colors group-hover:font-semibold"
                            style={{ color: isLocked ? '#94a3b8' : '#1e293b' }}
                          >
                            {page.label}
                          </p>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              style={{ position: 'absolute', left: 12, bottom: 12 }}
              className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm"
            >
              {SECTIONS.map(s => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs text-gray-600 font-medium">{s.label.split(' ')[0]}</span>
                </div>
              ))}
            </motion.div>

            {/* Page count watermark */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{ position: 'absolute', right: 16, bottom: 12 }}
              className="text-xs text-gray-400 bg-white/70 px-3 py-1.5 rounded-lg"
            >
              alnoorice.pk · {new Date().getFullYear()}
            </motion.div>
          </div>
        </div>

        {/* Bottom hint bar */}
        <div className="bg-white border-t border-gray-100 px-5 py-2 flex items-center gap-6 text-xs text-gray-400 flex-shrink-0">
          <span>🖱 Scroll wheel to zoom</span>
          <span>✋ Drag to pan</span>
          <span>🔗 Click any node to navigate</span>
          {!showAdmin && (
            <span className="flex items-center gap-1 text-blue-400">
              <Lock size={10} /> Admin sections locked — sign in as admin to explore
            </span>
          )}
          <span className="ml-auto">
            <Link to="/sitemap.xml" className="hover:text-green-600 transition-colors">XML Sitemap ↗</Link>
          </span>
        </div>
      </div>
    </PageTransition>
  );
}
