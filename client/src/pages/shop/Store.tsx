import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { ShoppingCart, X, GitCompare, SlidersHorizontal, Search, Heart, Package } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import RiceBag3D from '../../components/shop/RiceBag3D';
import FallingGrains from '../../components/shop/FallingGrains';
import Reveal from '../../components/shop/Reveal';

// ── Constants ─────────────────────────────────────────────────────────────────
const GRADE_LABEL: Record<string, string> = { A: 'Premium', B: 'Standard', C: 'Economy' };
const PLACEHOLDER: Record<string, string> = {
  Basmati: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
  'Super Kernel': 'https://images.unsplash.com/photo-1568347877321-f8935c7dc5f7?w=600&q=80',
  default: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&q=80',
};
const CERTS = ['PCSIR', 'ISO 22000', 'HALAL · IFANCA', 'HACCP', 'PSQCA', 'GLOBAL G.A.P'];
const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];
const PROCESS = [
  { n: '01', name: 'Procurement', desc: 'Paddy sourced directly from 60+ farmer families across the Malakand valley. Weighed, graded, and paid for on the same day.' },
  { n: '02', name: 'Sun-Drying',  desc: 'Three days on woven mats in the open courtyard at our Batkhela facility. Moisture brought down to 12–14%, verified every two hours.' },
  { n: '03', name: 'Resting',     desc: 'Stored in stacked jute sacks and rotated quarterly. Grain lengthens, starch settles, and aroma deepens over 6–12 months.' },
  { n: '04', name: 'Milling',     desc: 'Stone-husked, polished, and sorted by grain length and broken-grain ratio. Bagged within six hours of milling.' },
];
const WHOLESALE_TIERS = [
  { tier: 'RETAIL',    range: '1 – 49 kg',     price: 'Standard catalogue pricing',           cta: 'Shop now →' },
  { tier: 'TRADE',     range: '50 – 499 kg',   price: '−12% across the catalogue',            cta: 'Request quote →' },
  { tier: 'WHOLESALE', range: '500 – 4,999 kg', price: '−18% · dedicated account manager',   cta: 'Request quote →' },
  { tier: 'CONTAINER', range: '5,000 kg +',    price: 'Bespoke pricing · FOB Karachi · export docs', cta: 'Speak to founders →' },
];
// FAQs are fetched from API (admin-configurable)

// ── Counter component (scroll-triggered number animation) ─────────────────────
function Counter({ to, suffix = '', duration = 2200 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(to * eased));
          if (p < 1) requestAnimationFrame(step);
          else setVal(to);
        };
        requestAnimationFrame(step);
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── FilterChip ────────────────────────────────────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase' }}
      className="inline-flex items-center gap-1.5 bg-paddy/10 text-paddy px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 transition-colors"><X size={9} /></button>
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STORE PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function Store() {
  const shouldReduce = useReducedMotion();
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [settings, setSettings] = useState<any>({});
  const [varieties, setVarieties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [prodPage, setProdPage] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [spotlight, setSpotlight] = useState<any>(null);
  const [favs, setFavs] = useState<string[]>([]);
  const [openFaq, setOpenFaq] = useState(-1);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [pricingTiers, setPricingTiers] = useState<any[]>([]);
  const [wholesaleContent, setWholesaleContent] = useState<any>(null);

  // ── URL filter params ───────────────────────────────────────────────────────
  const search    = searchParams.get('q')       || '';
  const grade     = searchParams.get('grade')   || '';
  const variety   = searchParams.get('variety') || '';
  const minPrice  = searchParams.get('minPrice')|| '';
  const maxPrice  = searchParams.get('maxPrice')|| '';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const minOrder  = searchParams.get('minOrder')|| '';
  const sortBy    = searchParams.get('sort')    || '';
  const hasActiveFilters = !!(grade || variety || minPrice || maxPrice || inStockOnly || minOrder || search);

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setSearchParams(p);
  };
  const clearAll = () => setSearchParams(new URLSearchParams());

  // ── Shuffle helper (Fisher-Yates) ─────────────────────────────────────────
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // ── Fetch products ──────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.set('q', search);
      if (grade) p.set('grade', grade);
      if (variety) p.set('variety', variety);
      if (minPrice) p.set('minPrice', minPrice);
      if (maxPrice) p.set('maxPrice', maxPrice);
      if (inStockOnly) p.set('inStock', 'true');
      if (minOrder) p.set('minOrder', minOrder);
      if (sortBy) p.set('sortBy', sortBy);
      p.set('limit', '100');
      const res = await api.get(`/shop/products?${p}`);
      const data = res.data;
      const prods = Array.isArray(data) ? data : (data.products || []);
      // Shuffle unless user has applied an explicit sort — respect their sort choice
      const ordered = sortBy ? prods : shuffle(prods);
      setProducts(ordered);
      setTotal(ordered.length);
      setProdPage(0); // reset to first page on filter change
      const qty: Record<string, number> = {};
      ordered.forEach((pr: any) => { qty[pr.id] = pr.minOrderKg || 10; });
      setQuantities(q => ({ ...q, ...qty }));
    } finally { setLoading(false); }
  }, [search, grade, variety, minPrice, maxPrice, inStockOnly, minOrder, sortBy]);

  useEffect(() => {
    fetchProducts();
    api.get('/shop/settings').then(r => setSettings(r.data)).catch(() => {});
    api.get('/shop/varieties').then(r => setVarieties(r.data || [])).catch(() => {});
    // Recently-viewed tracking: still sends view events (for backend) but we no longer display the section
    const sid = localStorage.getItem('sessionId') || (() => { const s = Math.random().toString(36).slice(2); localStorage.setItem('sessionId', s); return s; })();
    localStorage.setItem('sessionId', sid);
  }, [fetchProducts]);

  useEffect(() => {
    api.get('/reviews/featured').then(r => setTestimonials(r.data.reviews || [])).catch(() => {});
    api.get('/shop/products?limit=1&grade=A').then(r => {
      const prods = r.data.products || r.data || [];
      if (prods.length) setSpotlight(prods[0]);
    }).catch(() => {});
    api.get('/faq').then(r => setFaqs(r.data.data || [])).catch(() => {});
    api.get('/ecommerce/pricing-tiers').then(r => setPricingTiers(r.data.data || [])).catch(() => {});
    api.get('/ecommerce/wholesale-content').then(r => setWholesaleContent(r.data.data)).catch(() => {});
  }, []);

  const handleAddToCart = (product: any) => {
    const qty = quantities[product.id] || product.minOrderKg || 10;
    addItem({ productId: product.id, name: product.name, variety: product.variety, grade: product.grade, pricePerKg: product.pricePerKg, quantityKg: qty, minOrderKg: product.minOrderKg, imageUrl: product.imageUrl });
    toast.success(`${product.name} added to cart`);
  };
  const inCart = (id: string) => items.some(i => i.productId === id);
  const SERVER = import.meta.env.DEV ? 'http://localhost:5000' : '';
  const toDisplayUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return `${SERVER}${url}`;
    return url;
  };
  const imgSrc = (p: any) => toDisplayUrl(p.imageUrl) || PLACEHOLDER[p.variety] || PLACEHOLDER.default;
  const formatPKR = (n: number) => `₨${n.toLocaleString()}`;
  const toggleCompare = (id: string) => setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 4 ? (toast.error('Max 4'), prev) : [...prev, id]);
  const toggleFav = (id: string) => setFavs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const getDisplayName = (name: string) => { const parts = (name || 'Customer').trim().split(/\s+/); return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0]}.`; };

  // ── Scroll to products ──────────────────────────────────────────────────────
  const shopRef = useRef<HTMLElement>(null);
  const scrollToShop = () => shopRef.current?.scrollIntoView({ behavior: 'smooth' });

  // ── Product pagination ────────────────────────────────────────────────────
  const PROD_PAGE_SIZE = 16;
  const prodTotalPages = Math.ceil(products.length / PROD_PAGE_SIZE);
  const visibleProds = products.slice(prodPage * PROD_PAGE_SIZE, (prodPage + 1) * PROD_PAGE_SIZE);
  const slideVariants = {
    enter:  (dir: number) => ({ x: dir > 0 ? '80%' : '-80%', opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { type: 'spring' as const, damping: 28, stiffness: 220 } },
    exit:   (dir: number) => ({ x: dir > 0 ? '-80%' : '80%', opacity: 0, transition: { duration: 0.18 } }),
  };
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const resetAndScroll = () => {
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollTop = 0;
      gridScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const goNext = () => { setSlideDir(1); setProdPage(p => Math.min(p + 1, prodTotalPages - 1)); setTimeout(resetAndScroll, 50); };
  const goPrev = () => { setSlideDir(-1); setProdPage(p => Math.max(p - 1, 0)); setTimeout(resetAndScroll, 50); };

  return (
    <PageTransition>
    <div style={{ background: 'var(--cream)', color: 'var(--ink)', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      <Helmet>
        <title>Al-Noor Rice Mills — Premium Pakistani Rice, Direct from Mill</title>
        <meta name="description" content="Premium Basmati & Super Kernel rice from Al-Noor Rice Mills, Batkhela, Malakand. Sun-dried, aged twelve months in jute, milled to order." />
      </Helmet>

      {/* ═══════════════════════════════════════════════════════════════════════
          1. HERO — Editorial split (the default / recommended layout)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section
        className="max-md:!grid-cols-1"
        style={{
          minHeight: '100svh', position: 'relative',
          display: 'grid', gridTemplateColumns: '1.1fr 1fr',
          padding: 'clamp(80px, 10vh, 140px) clamp(16px, 5vw, 60px) clamp(40px, 6vh, 80px)',
          alignItems: 'center', gap: 'clamp(24px, 4vw, 40px)',
          background: 'var(--cream)',
        }}>
        {/* Background glows */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: `
            radial-gradient(60% 50% at 80% 20%, color-mix(in srgb, var(--saffron) 16%, transparent), transparent 70%),
            radial-gradient(45% 40% at 10% 80%, color-mix(in srgb, var(--paddy) 12%, transparent), transparent 70%)`,
        }} />

        <FallingGrains count={20} />

        {/* Left column */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Reveal>
            <span className="h-eyebrow" style={{ marginBottom: 28, display: 'inline-flex' }}>
              Established MMX · Batkhela, Malakand
            </span>
          </Reveal>

          <Reveal delay={100}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 7vw, 100px)',
              lineHeight: 0.95, letterSpacing: '-0.035em',
              fontWeight: 400,
              margin: '20px 0 26px',
            }}>
              Rice, milled with the<br />
              <em style={{ fontStyle: 'italic', color: 'var(--paddy)' }}>patience</em> of foothills.
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 480, marginBottom: 32 }}>
              Premium basmati and heritage grains from the Swat Valley — sun-dried in the open courtyard, aged twelve months in jute, milled to order. Sold by the kilo, the sack, and the container.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <button className="h-btn h-btn-primary w-full sm:w-auto" onClick={scrollToShop}>
                Shop the harvest
              </button>
              <Link to="/about" className="h-btn w-full sm:w-auto text-center">
                Our story
              </Link>
            </div>
          </Reveal>

          {/* KPI strip */}
          <Reveal delay={420}>
            <div
              className="max-sm:!grid-cols-2"
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16, marginTop: 40, paddingTop: 24,
                borderTop: '1px solid var(--hairline)',
                maxWidth: 520,
              }}>
              {[
                { to: 15,   suffix: '+',   label: 'Years milling' },
                { to: 3200, suffix: 't',   label: 'Annual capacity' },
                { to: 420,  suffix: '+',   label: 'Wholesale partners' },
                { to: 99,   suffix: '.4%', label: 'Lab grade A' },
              ].map(kpi => (
                <div key={kpi.label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 36px)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    <Counter to={kpi.to} suffix={kpi.suffix} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--mute)', marginTop: 8 }}>
                    {kpi.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right column — 3D rice bag (hidden on mobile) */}
        <div style={{ position: 'relative', zIndex: 2 }} className="hidden md:block">
          <Reveal delay={200}>
            <RiceBag3D name="Basmati" variety="SUPER KERNEL" weight={5} mouseFollow={true} />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. CERTIFICATION STRIP
          ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)',
        background: 'color-mix(in srgb, var(--paddy) 4%, var(--cream))',
        padding: '22px clamp(24px, 5vw, 60px)',
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', gap: 36, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--mute)', flexShrink: 0 }}>
            Certified by · 2026
          </span>
          {CERTS.map(c => (
            <span key={c} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>{c}</span>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. CATALOGUE — filter + product grid
          ═══════════════════════════════════════════════════════════════════════ */}
      <section ref={shopRef} id="products" style={{ padding: 'calc(80px * var(--density)) clamp(16px, 5vw, 60px)', maxWidth: 1440, margin: '0 auto' }}>

        {/* Section head */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px, 5vw, 80px)', alignItems: 'end', marginBottom: 56 }}
          className="max-sm:!grid-cols-1">
          <div>
            <Reveal><span className="h-eyebrow" style={{ marginBottom: 16, display: 'inline-flex' }}>II · The Catalogue</span></Reveal>
            <Reveal delay={100}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 4.5vw, 60px)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 400, marginTop: 14 }}>
                Six varieties.<br /><em style={{ fontStyle: 'italic', color: 'var(--paddy)' }}>One standard.</em>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 420 }}>
              Every grain is sun-dried in our Batkhela courtyard and aged before milling. Pricing in PKR per kilogram, 2026 harvest.
            </p>
          </Reveal>
        </div>

        {/* Filter row */}
        <div style={{ borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', padding: '16px 0', marginBottom: 48 }}
          className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
            {[
              { label: 'All varieties', q: {} as Record<string,string>, active: !variety && !grade },
              { label: 'Basmati',       q: { variety: 'Basmati' },      active: variety === 'Basmati' },
              { label: 'Super Kernel',  q: { variety: 'Super Kernel' }, active: variety === 'Super Kernel' },
              { label: 'IRRI-6',        q: { variety: 'IRRI-6' },       active: variety === 'IRRI-6' },
              { label: 'IRRI-9',        q: { variety: 'IRRI-9' },       active: variety === 'IRRI-9' },
              { label: 'PK-386',        q: { variety: 'PK-386' },       active: variety === 'PK-386' },
              { label: 'Premium',       q: { grade: 'A' },              active: grade === 'A' },
              { label: 'Standard',      q: { grade: 'B' },              active: grade === 'B' },
              { label: 'Economy',       q: { grade: 'C' },              active: grade === 'C' },
            ].map(pill => (
              <button key={pill.label}
                onClick={() => { const p = new URLSearchParams(); Object.entries(pill.q).forEach(([k, v]) => p.set(k, v)); setSearchParams(p); }}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '6px 14px', borderRadius: 999,
                  border: `1px solid ${pill.active ? 'var(--ink)' : 'var(--hairline)'}`,
                  background: pill.active ? 'var(--ink)' : 'transparent',
                  color: pill.active ? 'var(--cream)' : 'var(--ink-2)',
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 200ms',
                }}>
                {pill.label}
              </button>
            ))}
          </div>
          {/* Meta / controls */}
          <div className="flex flex-wrap items-center gap-2" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mute)', flexShrink: 0 }}>
            {!loading && <span className="hidden sm:inline">{total} {total === 1 ? 'variety' : 'varieties'}</span>}
            <div className="flex flex-wrap items-center gap-2">
              <div style={{ position: 'relative' }}>
                <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--mute)' }} />
                <input value={search} onChange={e => setParam('q', e.target.value)}
                  placeholder="Search..."
                  style={{ paddingLeft: 28, paddingRight: 10, paddingTop: 6, paddingBottom: 6, background: 'transparent', border: '1px solid var(--hairline)', fontSize: 11, letterSpacing: '0.1em', outline: 'none', fontFamily: 'var(--font-mono)', color: 'var(--ink)', width: '100%', minWidth: 110, maxWidth: 160 }} />
              </div>
              <select value={sortBy} onChange={e => setParam('sort', e.target.value)}
                style={{ background: 'transparent', border: '1px solid var(--hairline)', padding: '6px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)', outline: 'none', cursor: 'pointer' }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button onClick={() => setFiltersOpen(f => !f)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: filtersOpen ? 'var(--ink)' : 'transparent', color: filtersOpen ? 'var(--cream)' : 'var(--ink-2)', border: '1px solid var(--hairline)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}>
                <SlidersHorizontal size={12} /> Filters
              </button>
              {hasActiveFilters && (
                <button onClick={clearAll} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c0392b', cursor: 'pointer', background: 'none', border: 'none' }}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', marginBottom: 24 }}>
              <div className="max-sm:!grid-cols-2 max-xs:!grid-cols-1" style={{ background: 'var(--cream-2)', border: '1px solid var(--hairline)', padding: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[['Min Price/kg (₨)', 'minPrice', 'number'], ['Max Price/kg (₨)', 'maxPrice', 'number']].map(([label, key, type]) => (
                  <div key={key as string}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 8 }}>{label}</div>
                    <input type={type as string} value={searchParams.get(key as string) || ''} onChange={e => setParam(key as string, e.target.value)}
                      style={{ width: '100%', background: 'transparent', border: '1px solid var(--hairline)', padding: '8px 10px', fontFamily: 'var(--font-sans)', fontSize: 13, outline: 'none', color: 'var(--ink)' }} />
                  </div>
                ))}
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 8 }}>Grade</div>
                  <select value={grade} onChange={e => setParam('grade', e.target.value)}
                    style={{ width: '100%', background: 'transparent', border: '1px solid var(--hairline)', padding: '8px 10px', fontFamily: 'var(--font-sans)', fontSize: 13, outline: 'none', color: 'var(--ink)', cursor: 'pointer' }}>
                    <option value="">All grades</option>
                    <option value="A">Premium (A)</option>
                    <option value="B">Standard (B)</option>
                    <option value="C">Economy (C)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    <input type="checkbox" checked={inStockOnly} onChange={e => setParam('inStock', e.target.checked ? 'true' : '')} style={{ accentColor: 'var(--paddy)', width: 16, height: 16 }} />
                    In stock only
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {search   && <FilterChip label={`"${search}"`} onRemove={() => setParam('q', '')} />}
            {grade    && <FilterChip label={`Grade: ${GRADE_LABEL[grade] || grade}`} onRemove={() => setParam('grade', '')} />}
            {variety  && <FilterChip label={variety} onRemove={() => setParam('variety', '')} />}
            {minPrice && <FilterChip label={`Min ₨${minPrice}/kg`} onRemove={() => setParam('minPrice', '')} />}
            {maxPrice && <FilterChip label={`Max ₨${maxPrice}/kg`} onRemove={() => setParam('maxPrice', '')} />}
            {inStockOnly && <FilterChip label="In stock" onRemove={() => setParam('inStock', '')} />}
          </div>
        )}

        {/* Product grid — 4 cols desktop / 2 cols mobile, 16-per-page with slide */}
        <div className="product-grid-scroll" ref={gridScrollRef}>
        <div style={{ overflow: 'hidden', position: 'relative' }}>
        {loading ? (
          <div className="max-xl:!grid-cols-3 max-lg:!grid-cols-2 max-sm:!grid-cols-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: 'var(--paper)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius)' }}>
                <div style={{ aspectRatio: '4/5', background: 'var(--cream-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ height: 10, background: 'var(--cream-2)', borderRadius: 4, width: '40%' }} />
                  <div style={{ height: 20, background: 'var(--cream-2)', borderRadius: 4, width: '70%' }} />
                  <div style={{ height: 10, background: 'var(--cream-2)', borderRadius: 4, width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', border: '1px solid var(--hairline)' }}>
            <Package size={40} style={{ margin: '0 auto 16px', color: 'var(--hairline)' }} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontStyle: 'italic', color: 'var(--paddy)', marginBottom: 8 }}>
              No varieties found
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mute)' }}>
              {hasActiveFilters ? 'Try clearing your filters' : 'Check back soon'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearAll} style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--paddy)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait" custom={slideDir}>
            <motion.div
              key={`prod-page-${prodPage}-${search}-${grade}-${variety}`}
              custom={slideDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}
              className="max-xl:!grid-cols-3 max-lg:!grid-cols-2 max-sm:!grid-cols-2"
            >
              {visibleProds.map((product, i) => (
                <Reveal key={product.id} delay={Math.min(i, 5) * 60}>
                  <article className="hpc">
                    {/* Image area */}
                    <Link to={`/products/${product.id}`} className="hpc-img" style={{ display: 'block' }}>
                      <img src={imgSrc(product)} alt={product.name}
                        onError={e => { (e.target as any).src = PLACEHOLDER.default; }} />

                      {/* Badge */}
                      {product.grade === 'A' && <span className="hpc-badge">Signature</span>}
                      {!product.inStock && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(245,237,224,0.65)', display: 'grid', placeItems: 'center', zIndex: 2 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mute)', border: '1px solid var(--hairline)', padding: '5px 12px', background: 'var(--cream)' }}>Sold Out</span>
                        </div>
                      )}

                      {/* Fav button */}
                      <button className={`hpc-fav${favs.includes(product.id) ? ' active' : ''}`}
                        onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFav(product.id); }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill={favs.includes(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
                          <path d="M20.8 4.6c-1.5-1.5-4-1.5-5.5 0L12 7.9 8.7 4.6c-1.5-1.5-4-1.5-5.5 0s-1.5 4 0 5.5L12 19l8.8-8.9c1.5-1.5 1.5-4 0-5.5z"/>
                        </svg>
                      </button>

                      {/* Hover add-to-cart */}
                      {product.inStock && (
                        <button className="hpc-quick"
                          onClick={e => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product); }}>
                          <span>Add to basket</span>
                          <span>→</span>
                        </button>
                      )}
                    </Link>

                    {/* Card info */}
                    <div className="hpc-info">
                      <div className="hpc-meta">
                        <span>{product.variety} · Grade {product.grade}</span>
                        <span className="hpc-stock">{product.inStock ? 'In stock' : 'Sold out'}</span>
                      </div>

                      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 className="hpc-name">{product.name.split(' ').slice(0, 1).join(' ')} <em>{product.name.split(' ').slice(1).join(' ') || product.variety}</em></h3>
                      </Link>

                      {product.description && (
                        <p className="hpc-desc" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {product.description}
                        </p>
                      )}

                      <div className="hpc-foot">
                        <div className="hpc-price">{formatPKR(product.pricePerKg)}<small>/kg</small></div>
                        <Link to={`/products/${product.id}`} className="hpc-cta">View →</Link>
                      </div>

                      {/* Qty stepper + cart btn */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <button onClick={() => setQuantities(q => ({ ...q, [product.id]: Math.max(product.minOrderKg, (q[product.id] || product.minOrderKg) - 5) }))}
                          style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', border: '1px solid var(--hairline)', background: 'transparent', cursor: 'pointer', fontSize: 16, color: 'var(--ink)' }}>−</button>
                        <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em' }}>
                          {quantities[product.id] || product.minOrderKg} kg
                        </span>
                        <button onClick={() => setQuantities(q => ({ ...q, [product.id]: (q[product.id] || product.minOrderKg) + 5 }))}
                          style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', border: '1px solid var(--hairline)', background: 'transparent', cursor: 'pointer', fontSize: 16, color: 'var(--ink)' }}>+</button>
                      </div>

                      <button onClick={() => handleAddToCart(product)} disabled={!product.inStock}
                        style={{
                          width: '100%', padding: '10px 0', marginTop: 6,
                          background: !product.inStock ? 'transparent' : inCart(product.id) ? 'transparent' : 'var(--paddy)',
                          color: !product.inStock ? 'var(--hairline)' : inCart(product.id) ? 'var(--paddy)' : 'var(--cream)',
                          border: `1px solid ${!product.inStock ? 'var(--hairline)' : 'var(--paddy)'}`,
                          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                          cursor: product.inStock ? 'pointer' : 'not-allowed',
                          transition: 'all 200ms',
                        }}>
                        {!product.inStock ? 'Sold out' : inCart(product.id) ? 'Add more' : 'Add to basket'}
                      </button>

                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={compareIds.includes(product.id)} onChange={() => toggleCompare(product.id)} style={{ accentColor: 'var(--paddy)', width: 14, height: 14 }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mute)' }}>Compare</span>
                      </label>
                    </div>
                  </article>
                </Reveal>
              ))}
            </motion.div>
            </AnimatePresence>
          </>
        )}
        </div>{/* /overflow:hidden */}
        </div>{/* /product-grid-scroll */}

        {/* Page navigation — outside scroll container, always visible */}
        {prodTotalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32, borderTop: '1px solid var(--hairline)', paddingTop: 24 }}>
            <button onClick={goPrev} disabled={prodPage === 0}
              style={{ padding: '10px 20px', border: '1px solid var(--hairline)', background: 'transparent', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: prodPage === 0 ? 'not-allowed' : 'pointer', color: prodPage === 0 ? 'var(--hairline)' : 'var(--ink)', transition: 'all 200ms' }}>
              ← Prev
            </button>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {Array.from({ length: prodTotalPages }, (_, i) => (
                <button key={i} onClick={() => { setSlideDir(i > prodPage ? 1 : -1); setProdPage(i); setTimeout(resetAndScroll, 50); }}
                  style={{ width: i === prodPage ? 24 : 8, height: 8, borderRadius: 999, background: i === prodPage ? 'var(--paddy)' : 'var(--hairline)', border: 'none', cursor: 'pointer', transition: 'all 300ms', padding: 0 }} />
              ))}
            </div>
            <button onClick={goNext} disabled={prodPage >= prodTotalPages - 1}
              style={{ padding: '10px 20px', border: '1px solid var(--hairline)', background: 'transparent', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: prodPage >= prodTotalPages - 1 ? 'not-allowed' : 'pointer', color: prodPage >= prodTotalPages - 1 ? 'var(--hairline)' : 'var(--ink)', transition: 'all 200ms' }}>
              Next →
            </button>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. EDITOR'S PICK SPOTLIGHT
          ═══════════════════════════════════════════════════════════════════════ */}
      {spotlight && (
        <section style={{
          background: 'color-mix(in srgb, var(--paddy) 5%, var(--cream))',
          borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)',
          padding: 'calc(120px * var(--density)) clamp(24px, 5vw, 60px)',
        }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'center' }}
            className="max-lg:!grid-cols-1">
            {/* Visual */}
            <Reveal>
              <div style={{ aspectRatio: '4/5', maxHeight: 680, borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative', background: 'linear-gradient(155deg, var(--cream-2), var(--cream))' }}>
                <img src={imgSrc(spotlight)} alt={spotlight.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 700ms ease' }}
                  onError={e => { (e.target as any).src = PLACEHOLDER.default; }}
                  onMouseOver={e => ((e.target as any).style.transform = 'scale(1.04)')}
                  onMouseOut={e => ((e.target as any).style.transform = 'scale(1)')}
                />
              </div>
            </Reveal>

            {/* Info */}
            <div>
              <Reveal><span className="h-eyebrow" style={{ marginBottom: 16, display: 'inline-flex' }}>III · The Editor's Pick</span></Reveal>
              <Reveal delay={100}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 400, margin: '14px 0 24px' }}>
                  {spotlight.name}<br /><em style={{ fontStyle: 'italic', color: 'var(--paddy)' }}>{spotlight.variety}.</em>
                </h2>
              </Reveal>
              {spotlight.description && (
                <Reveal delay={200}>
                  <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 32, maxWidth: 480 }}>{spotlight.description}</p>
                </Reveal>
              )}
              <Reveal delay={280}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', marginBottom: 32, borderTopStyle: 'dashed', borderBottomStyle: 'dashed' }}>
                  {[
                    ['ORIGIN', 'Malakand Valley · KPK'],
                    ['GRADE',  GRADE_LABEL[spotlight.grade] || spotlight.grade],
                    ['MIN ORDER', `${spotlight.minOrderKg} kg`],
                    ['MOISTURE', '12–14%'],
                    ['BROKEN', '< 2%'],
                    ['SHELF LIFE', '12 months'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: '14px 16px 14px 0', borderRight: '1px dashed var(--hairline)' }} className="last:border-r-0">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mute)', display: 'block', marginBottom: 6 }}>{k}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontStyle: 'italic' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={350}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, letterSpacing: '-0.02em', lineHeight: 1 }}>
                      {formatPKR(spotlight.pricePerKg)}<small style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--mute)', marginLeft: 4 }}>/KILO</small>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mute)', marginTop: 8 }}>
                      From {formatPKR(Math.round(spotlight.pricePerKg * 0.88))}/kg at 50kg+ · {formatPKR(Math.round(spotlight.pricePerKg * 0.82))}/kg at 500kg+
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Link to={`/products/${spotlight.id}`} className="h-btn h-btn-primary">View product</Link>
                    <button className="h-btn" onClick={() => handleAddToCart(spotlight)}>Quick add</button>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          5. WHOLESALE & EXPORT
          ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'calc(140px * var(--density)) clamp(24px, 5vw, 60px)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'start' }}
          className="max-lg:!grid-cols-1">
          <div>
            <Reveal><span className="h-eyebrow" style={{ marginBottom: 16, display: 'inline-flex' }}>IV · Wholesale & Export</span></Reveal>
            <Reveal delay={100}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 4.5vw, 60px)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 400, marginTop: 14 }}>
                Built for<br /><em style={{ fontStyle: 'italic', color: 'var(--paddy)' }}>restaurants, retailers,</em><br />and exporters.
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', margin: '24px 0 40px', maxWidth: 480 }}>
                {wholesaleContent?.exportNote || 'Volume pricing starts at 50kg with three tier breaks. Container-scale orders ship FOB Karachi with full export documentation. Dedicated account manager assigned at the 500kg tier.'}
              </p>
            </Reveal>
            <div style={{ borderTop: '1px solid var(--ink)' }}>
              {(pricingTiers.length ? pricingTiers : WHOLESALE_TIERS).map((tier: any, i: number) => (
                <Reveal key={tier.id || tier.tier} delay={i * 60}>
                  <div className="wt-row"
                    onClick={() => (tier.ctaType === 'link' ? document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) : navigate('/wholesale'))}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--paddy)' }}>{tier.label || tier.tier}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontStyle: 'italic' }}>{tier.rangeLabel || tier.range}</span>
                    <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{tier.discount || tier.description || tier.price}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink)', textAlign: 'right' }}>{tier.ctaText || tier.cta} →</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right visual + quote */}
          <div className="max-sm:!grid-cols-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Reveal>
              <div style={{ aspectRatio: '4/5', borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative' }}>
                <img src="/WAREHOUSE · 25KG SACKS.png" alt="Warehouse 25kg rice sacks"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
                <span style={{ position: 'absolute', bottom: 14, left: 14, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', padding: '5px 12px', background: 'rgba(0,0,0,0.35)', borderRadius: 999, backdropFilter: 'blur(4px)' }}>WAREHOUSE · 25KG SACKS</span>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="max-sm:!mt-0" style={{ aspectRatio: '4/5', borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative', marginTop: 60 }}>
                <img src="/MILL · COURTYARD · DAWN.png" alt="Mill courtyard at dawn"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
                <span style={{ position: 'absolute', bottom: 14, left: 14, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', padding: '5px 12px', background: 'rgba(0,0,0,0.35)', borderRadius: 999, backdropFilter: 'blur(4px)' }}>MILL · COURTYARD · DAWN</span>
              </div>
            </Reveal>
            {testimonials.length > 0 && (
              <div style={{ gridColumn: '1 / -1' }}>
                <Reveal delay={200}>
                  <div style={{ padding: '28px 28px 24px', background: 'var(--paper)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius)' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, lineHeight: 1.3, marginBottom: 18 }}>
                      "{testimonials[0].comment?.length > 160
                        ? testimonials[0].comment.slice(0, 160) + '…'
                        : testimonials[0].comment}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <strong style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--ink)', letterSpacing: 0 }}>
                          {getDisplayName(testimonials[0].user?.name || 'Customer')}
                          {testimonials[0].user?.addresses?.[0]?.city ? `, ${testimonials[0].user.addresses[0].city}` : ''}
                        </strong>
                        {testimonials[0].product?.name && (
                          <span style={{ color: 'var(--mute)' }}>{testimonials[0].product.name}</span>
                        )}
                      </div>
                      <span style={{ color: 'var(--saffron)', fontSize: 15, letterSpacing: '0.1em' }}>
                        {'★'.repeat(testimonials[0].rating)}{'☆'.repeat(5 - testimonials[0].rating)}
                      </span>
                    </div>
                  </div>
                </Reveal>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          6. PROCESS — 4-column horizontal timeline
          ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', padding: 'calc(120px * var(--density)) clamp(24px, 5vw, 60px)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px, 5vw, 80px)', alignItems: 'end', marginBottom: 60 }}
            className="max-sm:!grid-cols-1">
            <div>
              <Reveal><span className="h-eyebrow" style={{ marginBottom: 16, display: 'inline-flex' }}>V · The Process</span></Reveal>
              <Reveal delay={100}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 4.5vw, 60px)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 400, marginTop: 14 }}>
                  Four steps.<br /><em style={{ fontStyle: 'italic', color: 'var(--paddy)' }}>Twelve months.</em>
                </h2>
              </Reveal>
            </div>
            <Reveal delay={200}>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 400 }}>
                Slow milling is not a marketing position. It is the only way to produce rice that holds its grain, separates cleanly, and smells like the kitchen you remember.
              </p>
            </Reveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--ink)' }}
            className="max-md:!grid-cols-2 max-sm:!grid-cols-1">
            {PROCESS.map((step, i) => (
              <Reveal key={step.n} delay={i * 80}>
                <div className="process-pro-step" style={{ paddingLeft: i === 0 ? 0 : 24 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontStyle: 'italic', lineHeight: 1, color: 'var(--paddy)', opacity: 0.75, marginBottom: 18 }}>{step.n}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 12 }}>{step.name}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)' }}>{step.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          7. TESTIMONIALS — 2×2 grid (or 3 if we have 3)
          ═══════════════════════════════════════════════════════════════════════ */}
      {testimonials.length >= 2 && (
        <section style={{ padding: 'calc(140px * var(--density)) clamp(24px, 5vw, 60px)' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <Reveal><span className="h-eyebrow" style={{ marginBottom: 16, display: 'inline-flex' }}>VI · What Buyers Say</span></Reveal>
              <Reveal delay={120}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 4.5vw, 60px)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 400, marginTop: 14, maxWidth: 760, margin: '14px auto 0' }}>
                  Trusted from<br /><em style={{ fontStyle: 'italic', color: 'var(--paddy)' }}>Karachi to Calgary.</em>
                </h2>
              </Reveal>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}
              className="max-sm:!grid-cols-1">
              {testimonials.slice(0, 4).map((rev: any, i: number) => {
                const city = rev.user?.addresses?.[0]?.city;
                const name = getDisplayName(rev.user?.name || 'Customer');
                const comment = rev.comment || '';
                const roles = ['RETAIL · LAHORE', 'EXPORT · DUBAI', 'TRADE · ISLAMABAD', 'WHOLESALE · KARACHI'];
                return (
                  <Reveal key={rev.id} delay={i * 80}>
                    <article className="t-card">
                      <span style={{ color: 'var(--saffron)', fontSize: 16, letterSpacing: '0.12em' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, lineHeight: 1.35, flex: 1 }}>
                        "{comment.length > 160 ? comment.slice(0, 160) + '…' : comment}"
                      </p>
                      <div style={{ paddingTop: 18, borderTop: '1px dashed var(--hairline)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <strong style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                          {name}{city ? `, ${city}` : ''}
                        </strong>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--mute)' }}>
                          {rev.verifiedPurchase ? '✓ Verified · ' : ''}{roles[i] || 'CUSTOMER'}
                        </span>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          8. HERITAGE TEASER — story preview
          ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: 'color-mix(in srgb, var(--paddy) 8%, var(--cream))', borderTop: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: 'calc(120px * var(--density)) clamp(24px, 5vw, 60px)', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'center' }}
          className="max-lg:!grid-cols-1">
          <Reveal>
            <div style={{ aspectRatio: '4/5', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
              <img
                src="/MILL · COURTYARD · DAWN, About section.png"
                alt="Al-Noor Rice Mill courtyard at dawn"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />
              <span style={{ position: 'absolute', bottom: 16, left: 16, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.32)', padding: '5px 12px', borderRadius: 999, backdropFilter: 'blur(4px)' }}>
                Mill · Courtyard · Dawn
              </span>
            </div>
          </Reveal>
          <div>
            <Reveal><span className="h-eyebrow" style={{ marginBottom: 16, display: 'inline-flex' }}>VII · Heritage · Since MMX</span></Reveal>
            <Reveal delay={100}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 72px)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 400, margin: '18px 0 28px' }}>
                A family mill on the<br /><em style={{ fontStyle: 'italic', color: 'var(--paddy)' }}>GT Road.</em>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 18 }}>
                In 2010, Haji Noor Khan parked a single husking machine on a strip of land beside the old Batkhela bus stand. Today, three generations of the family run multiple milling lines, producing rice for households from Mingora to Karachi.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 36 }}>
                We have grown — but only ever in one direction. Better rice, better priced, milled the way our grandfather taught us.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <Link to="/about" className="h-btn">Read the full story →</Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          9. FAQ ACCORDION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'calc(140px * var(--density)) clamp(24px, 5vw, 60px)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 'clamp(40px, 6vw, 80px)' }}
          className="max-lg:!grid-cols-1">
          <div>
            <Reveal><span className="h-eyebrow" style={{ marginBottom: 16, display: 'inline-flex' }}>VIII · Questions</span></Reveal>
            <Reveal delay={100}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 4.5vw, 60px)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 400, marginTop: 14 }}>
                Frequently<br /><em style={{ fontStyle: 'italic', color: 'var(--paddy)' }}>asked.</em>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)', marginTop: 24, maxWidth: 320 }}>
                Can't find your answer? Message us on WhatsApp at {settings.whatsappNumber || '+92-300-1234567'}.
              </p>
            </Reveal>
          </div>

          <div style={{ borderTop: '1px solid var(--ink)' }}>
            {(faqs.length > 0 ? faqs : [
              { id: '1', question: 'What is the minimum order quantity?', answer: 'Minimum order is 5kg for retail customers. Wholesale accounts start at 50kg with discounted pricing.' },
              { id: '2', question: 'Do you deliver all over Pakistan?', answer: 'Yes. We deliver nationwide via TCS and Leopards Courier. Batkhela and Malakand district receive same-day or next-day delivery.' },
              { id: '3', question: 'Is Cash on Delivery available?', answer: 'Yes. COD is available on all orders. We also accept bank transfer, EasyPaisa, and JazzCash.' },
            ]).map((faq: any, i: number) => (
              <div key={faq.id || i} className={`faq-item${openFaq === i ? ' open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <div className="faq-q">
                  <span>{faq.question || faq.q}</span>
                  <span className="faq-icon">+</span>
                </div>
                <div className="faq-a">{faq.answer || faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          10. NEWSLETTER
          ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 clamp(24px, 5vw, 60px) calc(140px * var(--density))' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <Reveal>
            <div
              className="max-md:!grid-cols-1"
              style={{
                background: 'var(--paddy-deep)', color: 'var(--cream)',
                borderRadius: 'var(--radius-lg)', padding: 'clamp(36px, 6vw, 80px) clamp(24px, 5vw, 60px)',
                display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 'clamp(28px, 5vw, 80px)', alignItems: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
              {/* Saffron glow */}
              <div style={{ position: 'absolute', right: '-10%', top: '-30%', width: '60%', aspectRatio: '1', background: 'radial-gradient(circle, color-mix(in srgb, var(--saffron) 28%, transparent), transparent 60%)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 2 }}>
                <span className="h-eyebrow" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 16, display: 'inline-flex' }}>
                  Subscribe · One email per month
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 400, marginTop: 14, color: 'var(--cream)' }}>
                  Field notes,<br /><em style={{ fontStyle: 'italic', color: 'var(--saffron)' }}>first Saturday</em><br />of the month.
                </h2>
              </div>

              <div style={{ position: 'relative', zIndex: 2 }}>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', marginBottom: 24 }}>
                  Harvest reports, recipes, occasional discounts on bulk orders. No spam — one email, first Saturday of every month.
                </p>
                <form className="flex flex-col sm:flex-row gap-2" onSubmit={async e => {
                  e.preventDefault();
                  const email = (e.target as any).email.value;
                  if (!email) return;
                  try {
                    await api.post('/newsletter/subscribe', { email });
                    toast.success('Subscribed! See you next Saturday.');
                    (e.target as any).reset();
                  } catch { toast.error('Could not subscribe. Try again.'); }
                }}>
                  <input name="email" type="email" required placeholder="your@email.pk"
                    style={{ flex: 1, padding: '14px 18px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--cream)', fontSize: 15, outline: 'none', fontFamily: 'var(--font-sans)' }} />
                  <button type="submit" className="h-btn"
                    style={{ background: 'var(--saffron)', color: 'var(--ink)', border: 'none', borderRadius: 999, padding: '14px 22px', whiteSpace: 'nowrap' }}>
                    Subscribe →
                  </button>
                </form>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginTop: 16 }}>
                  Unsubscribe with one click · No spam
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          Compare floating bar
          ═══════════════════════════════════════════════════════════════════════ */}
      {compareIds.length > 0 && (
        <div className="max-sm:left-3 max-sm:right-3 max-sm:!transform-none max-sm:justify-between"
          style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', alignItems: 'center', gap: 14, background: 'var(--ink)', color: 'var(--cream)', padding: '12px 18px', boxShadow: '0 12px 40px rgba(0,0,0,0.25)', borderRadius: 8 }}>
          <GitCompare size={15} style={{ color: 'var(--saffron)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{compareIds.length} selected</span>
          {compareIds.length >= 2 && (
            <button onClick={() => navigate(`/compare?ids=${compareIds.join(',')}`)}
              style={{ background: 'var(--paddy)', color: 'var(--cream)', border: 'none', padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Compare →
            </button>
          )}
          <button onClick={() => setCompareIds([])} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
