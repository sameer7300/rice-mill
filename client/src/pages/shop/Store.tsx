import { useEffect, useState, useCallback, useRef } from 'react';
import { useCart } from '../../contexts/CartContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  staggerContainer, staggerItem, staggerFast, scrollReveal,
  scrollRevealLeft, scrollRevealRight, cardHover, viewportOnce,
} from '../../utils/animations';
import {
  ShoppingCart, Package, Search, CheckCircle2, ChevronRight, X,
  ChevronDown, GitCompare, SlidersHorizontal, Heart, Wheat, Award, Truck
} from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../../components/PageTransition';

// ── Constants ─────────────────────────────────────────────────────────────────
const GRADE_LABEL: Record<string, string> = { A: 'Premium', B: 'Standard', C: 'Economy' };
const PLACEHOLDER_IMAGES: Record<string, string> = {
  Basmati: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80',
  'Super Kernel': 'https://images.unsplash.com/photo-1568347877321-f8935c7dc5f7?w=500&q=80',
  default: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500&q=80',
};
const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];
const CERTS = ['PCSIR', 'ISO 22000', 'HALAL · IFANCA', 'HACCP', 'PSQCA'];
const PROCESS_STEPS = [
  { n: '01', name: 'Procurement', desc: 'Paddy sourced directly from Malakand valley farmer families. Weighed, graded, and paid the same day.' },
  { n: '02', name: 'Sun-Drying', desc: 'Three days on woven mats in our Batkhela courtyard. Moisture brought to 12–14%, verified every two hours.' },
  { n: '03', name: 'Resting', desc: 'Stored in stacked jute sacks, rotated quarterly. Grain lengthens, starch settles, aroma deepens.' },
  { n: '04', name: 'Milling', desc: 'Husked, polished, sorted by length and broken-grain ratio. Bagged within six hours of milling.' },
];
const WHOLESALE_TIERS = [
  { tier: 'RETAIL',     range: '1 – 49 kg',       price: 'Standard pricing',              cta: 'Shop catalogue →' },
  { tier: 'TRADE',      range: '50 – 499 kg',      price: '−12% across the catalogue',     cta: 'Request quote →' },
  { tier: 'WHOLESALE',  range: '500 – 4,999 kg',   price: '−18% · dedicated account mgr', cta: 'Request quote →' },
  { tier: 'CONTAINER',  range: '5,000 kg+',         price: 'Bespoke pricing · FOB Karachi', cta: 'Speak to us →' },
];
const FAQ_ITEMS = [
  { q: 'How quickly do you ship?', a: 'Same-day dispatch within KPK for orders placed before 2 PM. Nationwide delivery via TCS takes 24–48 hours.' },
  { q: 'What is the difference between aged and fresh basmati?', a: 'Aged basmati rests in jute sacks for 6–12 months before milling. Grains lengthen, starch settles so cooked rice separates cleanly, and the natural aroma deepens.' },
  { q: 'Do you offer wholesale pricing?', a: 'Yes — three tiers. Trade pricing (−12%) at 50kg. Wholesale (−18%) at 500kg with a dedicated account manager. Container-scale pricing is bespoke, FOB Karachi.' },
  { q: 'Is the rice halal and certified?', a: 'Yes. PCSIR-tested, ISO 22000 certified, HALAL certified by IFANCA, HACCP audited annually. Certificates available on request.' },
  { q: 'Do you ship internationally?', a: 'We ship FOB Karachi to UAE, Saudi Arabia, UK, Canada, and Australia regularly. Minimums start at 5,000 kg for container orders.' },
];

// ── Animated counter (scroll-triggered) ───────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const count = useMotionValue(0);
  const display = useTransform(count, v => Math.floor(v).toLocaleString());
  const triggered = useRef(false);
  return (
    <motion.span
      onViewportEnter={() => { if (!triggered.current) { triggered.current = true; animate(count, target, { duration: 1.8, ease: 'easeOut' }); } }}
      viewport={{ once: true, margin: '-50px' }}>
      <motion.span>{display}</motion.span>{suffix}
    </motion.span>
  );
}

// ── Filter chip ────────────────────────────────────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-paddy/10 text-paddy text-xs font-heritage px-2.5 py-1 rounded-full tracking-wider uppercase">
      {label}
      <button onClick={onRemove} className="hover:text-red-600 transition-colors"><X size={10} /></button>
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Store() {
  const shouldReduce = useReducedMotion();
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const howItWorksRef = useRef<HTMLElement>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [settings, setSettings] = useState<any>({});
  const [varieties, setVarieties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [recentlyViewed, setRV] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number>(-1);

  const search = searchParams.get('q') || '';
  const grade = searchParams.get('grade') || '';
  const variety = searchParams.get('variety') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const minOrder = searchParams.get('minOrder') || '';
  const sortBy = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };
  const clearAll = () => setSearchParams(new URLSearchParams());
  const hasActiveFilters = !!(grade || variety || minPrice || maxPrice || inStockOnly || minOrder || search);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (grade) params.set('grade', grade);
      if (variety) params.set('variety', variety);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (inStockOnly) params.set('inStock', 'true');
      if (minOrder) params.set('minOrder', minOrder);
      if (sortBy) params.set('sortBy', sortBy);
      params.set('page', String(page));
      params.set('limit', '12');
      const res = await api.get(`/shop/products?${params}`);
      const data = res.data;
      if (Array.isArray(data)) { setProducts(data); setTotal(data.length); }
      else { setProducts(data.products || []); setTotal(data.total || 0); }
      const qty: Record<string, number> = {};
      const prods = Array.isArray(data) ? data : (data.products || []);
      prods.forEach((pr: any) => { qty[pr.id] = pr.minOrderKg || 10; });
      setQuantities(q => ({ ...q, ...qty }));
    } finally { setLoading(false); }
  }, [search, grade, variety, minPrice, maxPrice, inStockOnly, minOrder, sortBy, page]);

  useEffect(() => {
    fetchProducts();
    api.get('/shop/settings').then(r => setSettings(r.data)).catch(() => {});
    api.get('/shop/varieties').then(r => setVarieties(r.data || [])).catch(() => {});
    const sessionId = localStorage.getItem('sessionId') || (() => { const s = Math.random().toString(36).slice(2); localStorage.setItem('sessionId', s); return s; })();
    api.get('/products/recently-viewed', { headers: { 'X-Session-ID': sessionId } }).then(r => setRV(r.data.data || [])).catch(() => {});
  }, [fetchProducts]);

  useEffect(() => {
    api.get('/reviews/featured').then(r => setTestimonials(r.data.reviews || [])).catch(() => {});
    api.get('/shop/products?limit=12').then(r => {
      const data = r.data;
      const prods: any[] = Array.isArray(data) ? data : (data.products || []);
      const seen = new Set<string>();
      const featured: any[] = [];
      for (const p of prods) { if (!seen.has(p.variety)) { seen.add(p.variety); featured.push(p); } if (featured.length >= 3) break; }
      setFeaturedProducts(featured.length >= 3 ? featured : prods.slice(0, 3));
    }).catch(() => {});
  }, []);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 4 ? (toast.error('Max 4 products'), prev) : [...prev, id]);
  };
  const handleAddToCart = (product: any) => {
    const qty = quantities[product.id] || product.minOrderKg;
    addItem({ productId: product.id, name: product.name, variety: product.variety, grade: product.grade, pricePerKg: product.pricePerKg, quantityKg: qty, minOrderKg: product.minOrderKg, imageUrl: product.imageUrl });
    toast.success(`${product.name} added to cart`);
  };
  const inCart = (id: string) => items.some(i => i.productId === id);
  const formatPKR = (n: number) => `₨${n.toLocaleString()}`;
  const imgSrc = (p: any) => p.imageUrl || PLACEHOLDER_IMAGES[p.variety] || PLACEHOLDER_IMAGES.default;
  const getDisplayName = (name: string) => {
    const parts = (name || 'Customer').trim().split(/\s+/);
    return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  return (
    <PageTransition>
    <div className="bg-cream text-ink min-h-screen">
      <Helmet>
        <title>Al-Noor Rice Mills — Premium Pakistani Rice, Direct from Mill</title>
        <meta name="description" content="Buy premium Basmati & Super Kernel rice directly from Al-Noor Rice Mills, Batkhela, KPK. Best quality, fair prices, fast delivery across Pakistan." />
        <meta property="og:title" content="Al-Noor Rice Mills — Premium Pakistani Rice" />
        <meta property="og:description" content="Premium Basmati & Super Kernel rice, freshly milled in Batkhela, KPK." />
        <meta name="keywords" content="Pakistani rice, Basmati rice, Super Kernel rice, Al-Noor Rice Mills, Batkhela, KPK, buy rice online Pakistan" />
      </Helmet>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] md:min-h-screen flex flex-col overflow-hidden bg-cream"
        style={{ background: 'radial-gradient(70% 50% at 50% 0%, rgba(200,145,46,0.08), transparent 60%), #f5ede0' }}>

        {/* Floating grain particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute text-2xl select-none"
              style={{ left: `${(i * 23 + 5) % 90}%`, top: `${(i * 17 + 10) % 80}%`, opacity: 0.04,
                animation: `heroFloat${i % 3} ${7 + i * 0.6}s ease-in-out infinite` }}>🌾</div>
          ))}
        </div>
        <style>{`
          @keyframes heroFloat0{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
          @keyframes heroFloat1{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
          @keyframes heroFloat2{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        `}</style>

        <div className="relative flex-1 flex flex-col justify-between max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-10 w-full">
          {/* Top eyebrow row */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-hairline">
            <span className="font-heritage text-[10px] tracking-[0.22em] text-rice-muted uppercase">
              Est. 2010 · Batkhela, Malakand · KPK, Pakistan
            </span>
            <div className="flex gap-6 font-heritage text-[10px] tracking-[0.18em] text-rice-muted uppercase">
              <span>6 Varieties</span>
              <span>·</span>
              <span>15+ Years</span>
              <span>·</span>
              <span>Direct from Mill</span>
            </div>
          </motion.div>

          {/* Headline */}
          <div className="py-10 md:py-16">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="font-heritage text-[10px] tracking-[0.22em] text-paddy uppercase block mb-6">
              I · THE CATALOGUE · 2026 Harvest
            </motion.span>
            <h1 className="font-display text-[clamp(52px,9vw,130px)] leading-[0.9] tracking-[-0.04em] text-ink font-light">
              <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="block">
                Milled fresh
              </motion.span>
              <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="block">
                in Batkhela.
              </motion.span>
              <motion.em initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="block not-italic text-paddy italic font-display">
                To your kitchen.
              </motion.em>
            </h1>
          </div>

          {/* Bottom row: description + CTAs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-hairline items-end">
            <div className="md:col-span-2">
              <p className="text-ink-2 text-lg leading-relaxed max-w-xl">
                {settings.bannerSubtitle || 'Premium Basmati · Super Kernel · IRRI varieties. Sun-dried, rested in jute, milled to order. Delivered across Pakistan.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <motion.a href="#products" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-paddy text-cream font-heritage text-[11px] tracking-[0.18em] uppercase rounded-sm transition-colors hover:bg-paddy-deep">
                Shop Rice <ChevronRight size={13} />
              </motion.a>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-6 py-3 border border-ink text-ink font-heritage text-[11px] tracking-[0.18em] uppercase rounded-sm hover:bg-ink hover:text-cream transition-all">
                How We Mill ↓
              </motion.button>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-0 mt-10 pt-8 border-t border-hairline">
            {[
              { val: '5,000+', label: 'kg sold this month' },
              { val: '200+', label: 'happy customers' },
              { val: '15+', label: 'years milling' },
            ].map((s, i) => (
              <div key={i} className={`flex flex-col gap-2 ${i > 0 ? 'border-l border-hairline pl-6 ml-6' : ''}`}>
                <span className="font-display text-3xl md:text-4xl tracking-tight text-paddy italic">{s.val}</span>
                <span className="font-heritage text-[10px] tracking-[0.18em] text-rice-muted uppercase">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CERT STRIP ────────────────────────────────────────────────────────── */}
      <section className="border-t border-b border-hairline bg-cream py-5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap gap-8 items-center">
          <span className="font-heritage text-[9px] tracking-[0.24em] text-rice-muted uppercase flex-shrink-0">Certified by · 2026</span>
          {CERTS.map(c => (
            <span key={c} className="font-heritage text-[11px] tracking-[0.16em] text-ink-2 uppercase">{c}</span>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ──────────────────────────────────────────────────────────── */}
      <section id="products" className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        {/* Section header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end mb-14">
          <div>
            <motion.span variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
              className="font-heritage text-[10px] tracking-[0.22em] text-rice-muted uppercase block mb-4">
              II · The Catalogue
            </motion.span>
            <motion.h2 variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
              className="font-display text-[clamp(36px,5vw,64px)] leading-[0.95] tracking-[-0.03em] font-light">
              Six varieties.<br /><em className="italic text-paddy">One standard.</em>
            </motion.h2>
          </div>
          <motion.p variants={scrollRevealRight} initial="initial" whileInView="animate" viewport={viewportOnce}
            className="text-ink-2 text-base leading-relaxed md:justify-self-end max-w-sm">
            Every grain is sun-dried in our Batkhela courtyard, husked on stone, and aged before milling. Pricing in PKR per kilogram.
          </motion.p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-5 pb-5 border-b border-hairline">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-rice-muted" />
            <input type="text" value={search} onChange={e => setParam('q', e.target.value)}
              placeholder="Search varieties..."
              className="w-full pl-8 pr-3 py-2 bg-transparent border border-hairline text-sm font-heritage tracking-wide focus:outline-none focus:border-paddy transition-colors" />
          </div>
          <select value={grade} onChange={e => setParam('grade', e.target.value)}
            className="px-3 py-2 bg-transparent border border-hairline text-sm font-heritage tracking-wide focus:outline-none focus:border-paddy text-ink">
            <option value="">All Grades</option>
            <option value="A">Premium (A)</option>
            <option value="B">Standard (B)</option>
            <option value="C">Economy (C)</option>
          </select>
          {varieties.length > 0 && (
            <select value={variety} onChange={e => setParam('variety', e.target.value)}
              className="px-3 py-2 bg-transparent border border-hairline text-sm font-heritage tracking-wide focus:outline-none focus:border-paddy text-ink">
              <option value="">All Varieties</option>
              {varieties.map(v => <option key={v}>{v}</option>)}
            </select>
          )}
          <select value={sortBy} onChange={e => setParam('sort', e.target.value)}
            className="px-3 py-2 bg-transparent border border-hairline text-sm font-heritage tracking-wide focus:outline-none focus:border-paddy text-ink">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setFiltersOpen(f => !f)}
            className={`flex items-center gap-1.5 px-3 py-2 border text-sm font-heritage tracking-wide transition-colors ${filtersOpen ? 'bg-ink text-cream border-ink' : 'border-hairline text-ink hover:border-ink'}`}>
            <SlidersHorizontal size={13} /> More
          </button>
          {hasActiveFilters && (
            <button onClick={clearAll} className="font-heritage text-[10px] tracking-[0.16em] text-red-600 uppercase hover:underline">
              Clear All
            </button>
          )}
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-5">
              <div className="bg-cream-2 border border-hairline p-5 grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                {[['Min Price/kg (₨)', 'minPrice', 'number', 'e.g. 100'], ['Max Price/kg (₨)', 'maxPrice', 'number', 'e.g. 500']].map(([label, key, type, ph]) => (
                  <div key={key as string}>
                    <label className="font-heritage text-[9px] tracking-[0.18em] text-rice-muted uppercase block mb-1.5">{label}</label>
                    <input type={type as string} value={searchParams.get(key as string) || ''} onChange={e => setParam(key as string, e.target.value)}
                      placeholder={ph as string} className="w-full border border-hairline bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-paddy" />
                  </div>
                ))}
                <div>
                  <label className="font-heritage text-[9px] tracking-[0.18em] text-rice-muted uppercase block mb-1.5">Min Order (kg)</label>
                  <select value={minOrder} onChange={e => setParam('minOrder', e.target.value)}
                    className="w-full border border-hairline bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-paddy">
                    <option value="">Any</option>
                    <option value="10">Up to 10kg</option>
                    <option value="25">Up to 25kg</option>
                    <option value="50">Up to 50kg</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={inStockOnly} onChange={e => setParam('inStock', e.target.checked ? 'true' : '')}
                      className="w-4 h-4 accent-paddy" />
                    <span className="font-heritage text-[11px] tracking-[0.12em] uppercase">In Stock Only</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-5">
            {search && <FilterChip label={`"${search}"`} onRemove={() => setParam('q', '')} />}
            {grade && <FilterChip label={`Grade: ${GRADE_LABEL[grade] || grade}`} onRemove={() => setParam('grade', '')} />}
            {variety && <FilterChip label={variety} onRemove={() => setParam('variety', '')} />}
            {minPrice && <FilterChip label={`Min ₨${minPrice}/kg`} onRemove={() => setParam('minPrice', '')} />}
            {maxPrice && <FilterChip label={`Max ₨${maxPrice}/kg`} onRemove={() => setParam('maxPrice', '')} />}
            {inStockOnly && <FilterChip label="In Stock" onRemove={() => setParam('inStock', '')} />}
            {minOrder && <FilterChip label={`Min ≤${minOrder}kg`} onRemove={() => setParam('minOrder', '')} />}
          </div>
        )}

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8" style={{ scrollbarWidth: 'none' }}>
          {[
            { label: 'All varieties', q: {}, active: !variety && !grade },
            { label: 'Basmati', q: { variety: 'Basmati' }, active: variety === 'Basmati' },
            { label: 'Super Kernel', q: { variety: 'Super Kernel' }, active: variety === 'Super Kernel' },
            { label: 'IRRI-6', q: { variety: 'IRRI-6' }, active: variety === 'IRRI-6' },
            { label: 'IRRI-9', q: { variety: 'IRRI-9' }, active: variety === 'IRRI-9' },
            { label: 'PK-386', q: { variety: 'PK-386' }, active: variety === 'PK-386' },
            { label: 'Premium', q: { grade: 'A' }, active: grade === 'A' },
            { label: 'Standard', q: { grade: 'B' }, active: grade === 'B' },
            { label: 'Economy', q: { grade: 'C' }, active: grade === 'C' },
          ].map(pill => (
            <button key={pill.label} onClick={() => { const p = new URLSearchParams(); Object.entries(pill.q).forEach(([k, v]) => p.set(k, v as string)); setSearchParams(p); }}
              className={`flex-shrink-0 px-4 py-1.5 font-heritage text-[10px] tracking-[0.18em] uppercase transition-all border ${pill.active ? 'bg-ink text-cream border-ink' : 'border-hairline text-ink-2 hover:border-paddy hover:text-paddy'}`}>
              {pill.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-8">
          <span className="font-heritage text-[10px] tracking-[0.18em] text-rice-muted uppercase">
            {loading ? '…' : `${total} variet${total !== 1 ? 'ies' : 'y'} available`}
          </span>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-hairline">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-cream animate-pulse">
                <div className="aspect-[4/5] bg-cream-2" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-cream-2 rounded w-1/3" />
                  <div className="h-6 bg-cream-2 rounded w-2/3" />
                  <div className="h-3 bg-cream-2 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 border border-hairline">
            <Package size={40} className="mx-auto mb-4 text-hairline" />
            <p className="font-display text-2xl italic text-paddy mb-2">No varieties found</p>
            <p className="font-heritage text-[11px] tracking-[0.14em] text-rice-muted uppercase">{hasActiveFilters ? 'Try clearing your filters' : 'Check back soon'}</p>
            {hasActiveFilters && <button onClick={clearAll} className="mt-4 font-heritage text-[10px] tracking-[0.16em] text-paddy underline uppercase">Clear All Filters</button>}
          </div>
        ) : (
          <>
            <motion.div variants={staggerFast} initial={shouldReduce ? false : 'initial'} animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-hairline">
              <AnimatePresence mode="popLayout">
                {products.map(product => (
                  <motion.article key={product.id} variants={staggerItem} layout
                    className={`bg-cream group relative flex flex-col overflow-hidden transition-all ${!product.inStock ? 'opacity-60' : ''}`}>
                    {/* Image */}
                    <Link to={`/products/${product.id}`} className="block relative overflow-hidden bg-cream-2"
                      style={{ aspectRatio: '4/5' }}>
                      <img src={imgSrc(product)} alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={e => { (e.target as any).src = PLACEHOLDER_IMAGES.default; }} />

                      {/* Grade badge */}
                      <div className="absolute top-4 left-4">
                        <span className="font-heritage text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 bg-ink text-cream">
                          {GRADE_LABEL[product.grade] || product.grade}
                        </span>
                      </div>

                      {/* Out-of-stock */}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-cream/60 flex items-center justify-center">
                          <span className="font-heritage text-[10px] tracking-[0.2em] uppercase text-rice-muted border border-hairline px-3 py-1.5 bg-cream">Sold Out</span>
                        </div>
                      )}

                      {/* Low stock */}
                      {product.availableKg > 0 && product.availableKg < 100 && product.inStock && (
                        <div className="absolute top-4 right-4">
                          <span className="font-heritage text-[9px] tracking-[0.18em] uppercase px-2 py-1 bg-saffron/90 text-cream">
                            {product.availableKg}kg left
                          </span>
                        </div>
                      )}

                      {/* Hover quick-add slide */}
                      {product.inStock && (
                        <button onClick={e => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product); }}
                          className="absolute bottom-0 left-0 right-0 bg-ink text-cream py-3.5 px-5 font-heritage text-[10px] tracking-[0.2em] uppercase flex justify-between items-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                          <span>Add to basket</span>
                          <span>→</span>
                        </button>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-heritage text-[9px] tracking-[0.2em] text-rice-muted uppercase">
                          {product.variety} · Grade {product.grade}
                        </span>
                        <span className="font-heritage text-[9px] tracking-[0.16em] text-paddy uppercase flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-paddy inline-block" />
                          {product.inStock ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>

                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-display text-2xl leading-tight tracking-[-0.02em] hover:text-paddy transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {product.description && (
                        <p className="text-ink-2 text-sm leading-relaxed line-clamp-2">{product.description}</p>
                      )}

                      {product.reviewCount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-saffron text-sm tracking-wide">{'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}</span>
                          <span className="font-heritage text-[9px] tracking-[0.12em] text-rice-muted">({product.reviewCount})</span>
                        </div>
                      )}

                      <div className="flex items-baseline justify-between mt-auto pt-3 border-t border-hairline" style={{ borderStyle: 'dashed' }}>
                        <div>
                          <span className="font-display text-2xl italic tracking-[-0.02em]">{formatPKR(product.pricePerKg)}</span>
                          <span className="font-heritage text-[10px] tracking-[0.12em] text-rice-muted ml-1">/kg</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-heritage text-[9px] tracking-[0.14em] text-rice-muted uppercase">Min. {product.minOrderKg}kg</span>
                          <Link to={`/products/${product.id}`}
                            className="font-heritage text-[10px] tracking-[0.18em] text-paddy uppercase hover:underline">
                            View →
                          </Link>
                        </div>
                      </div>

                      {/* Quantity + cart */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => setQuantities(q => ({ ...q, [product.id]: Math.max(product.minOrderKg, (q[product.id] || product.minOrderKg) - 5) }))}
                          className="w-8 h-8 border border-hairline hover:border-ink flex items-center justify-center text-ink transition-colors font-light text-lg">−</button>
                        <span className="flex-1 text-center font-heritage text-[11px] tracking-[0.12em]">{quantities[product.id] || product.minOrderKg} kg</span>
                        <button onClick={() => setQuantities(q => ({ ...q, [product.id]: (q[product.id] || product.minOrderKg) + 5 }))}
                          className="w-8 h-8 border border-hairline hover:border-ink flex items-center justify-center text-ink transition-colors font-light text-lg">+</button>
                      </div>

                      <p className="text-center font-heritage text-[10px] tracking-[0.14em] text-paddy">
                        {formatPKR((quantities[product.id] || product.minOrderKg) * product.pricePerKg)} total
                      </p>

                      <button onClick={() => handleAddToCart(product)} disabled={!product.inStock}
                        className={`w-full py-3 font-heritage text-[11px] tracking-[0.18em] uppercase transition-all ${!product.inStock ? 'border border-hairline text-hairline cursor-not-allowed' : inCart(product.id) ? 'border border-paddy text-paddy hover:bg-paddy hover:text-cream' : 'bg-paddy text-cream hover:bg-paddy-deep'}`}>
                        {!product.inStock ? 'Sold Out' : inCart(product.id) ? '+ Add More' : 'Add to Basket'}
                      </button>

                      <label className="flex items-center justify-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={compareIds.includes(product.id)} onChange={() => toggleCompare(product.id)} className="w-3.5 h-3.5 accent-paddy" />
                        <span className="font-heritage text-[9px] tracking-[0.14em] text-rice-muted uppercase">Compare</span>
                      </label>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {total > 12 && (
              <div className="flex justify-center gap-3 mt-10">
                {page > 1 && (
                  <button onClick={() => setParam('page', String(page - 1))}
                    className="px-5 py-2 border border-hairline font-heritage text-[10px] tracking-[0.18em] uppercase hover:border-ink transition-colors">← Prev</button>
                )}
                <span className="px-5 py-2 font-heritage text-[10px] tracking-[0.18em] text-rice-muted uppercase">Page {page} of {Math.ceil(total / 12)}</span>
                {page * 12 < total && (
                  <button onClick={() => setParam('page', String(page + 1))}
                    className="px-5 py-2 border border-hairline font-heritage text-[10px] tracking-[0.18em] uppercase hover:border-ink transition-colors">Next →</button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section ref={howItWorksRef} id="how-it-works" className="border-t border-hairline">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end mb-14">
            <div>
              <motion.span variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="font-heritage text-[10px] tracking-[0.22em] text-rice-muted uppercase block mb-4">
                III · The Process
              </motion.span>
              <motion.h2 variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="font-display text-[clamp(36px,5vw,64px)] leading-[0.95] tracking-[-0.03em] font-light">
                Four steps.<br /><em className="italic text-paddy">Twelve months.</em>
              </motion.h2>
            </div>
            <motion.p variants={scrollRevealRight} initial="initial" whileInView="animate" viewport={viewportOnce}
              className="text-ink-2 text-base leading-relaxed md:justify-self-end max-w-sm">
              Slow milling is not a marketing position. It is the only way to produce rice that holds its grain, separates cleanly, and smells like the kitchen you remember.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-ink">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div key={step.n}
                variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                transition={{ delay: i * 0.08 }}
                className={`py-10 pr-8 border-b border-hairline lg:border-b-0 ${i < 3 ? 'lg:border-r border-hairline' : ''} hover:bg-paddy/[0.03] transition-colors`}
                style={{ paddingLeft: i === 0 ? 0 : 32 }}>
                <div className="font-display text-7xl leading-none text-paddy italic mb-5 opacity-80">{step.n}</div>
                <div className="font-display text-2xl tracking-[-0.01em] mb-3">{step.name}</div>
                <div className="text-ink-2 text-sm leading-relaxed">{step.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPOTLIGHT (featured product) ──────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="border-t border-hairline bg-cream" style={{ background: 'color-mix(in srgb, #2a4a24 5%, #f5ede0)' }}>
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Visual */}
              <motion.div variants={scrollRevealLeft} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="aspect-[4/5] max-h-[600px] relative overflow-hidden rounded-sm bg-cream-2 group">
                <img src={imgSrc(featuredProducts[0])} alt={featuredProducts[0].name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={e => { (e.target as any).src = PLACEHOLDER_IMAGES.default; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-paddy-deep/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <span className="font-heritage text-[9px] tracking-[0.22em] text-cream/80 uppercase">Editor's Pick · 2026 Harvest</span>
                  <span className="font-display text-cream italic text-xl">{formatPKR(featuredProducts[0].pricePerKg)}<small className="font-heritage text-[10px] not-italic tracking-wide opacity-70">/kg</small></span>
                </div>
              </motion.div>

              {/* Info */}
              <motion.div variants={scrollRevealRight} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="flex flex-col gap-6">
                <span className="font-heritage text-[10px] tracking-[0.22em] text-rice-muted uppercase">IV · Editor's Pick</span>
                <h2 className="font-display text-[clamp(42px,5vw,72px)] leading-[0.95] tracking-[-0.03em] font-light">
                  {featuredProducts[0].name}
                  <em className="block italic text-paddy">{featuredProducts[0].variety}.</em>
                </h2>
                {featuredProducts[0].description && (
                  <p className="text-ink-2 text-lg leading-relaxed">{featuredProducts[0].description}</p>
                )}
                <div className="grid grid-cols-3 border-t border-b border-hairline py-5 gap-4" style={{ borderStyle: 'dashed' }}>
                  {[
                    ['Origin', 'Malakand Valley · KPK'],
                    ['Grade', GRADE_LABEL[featuredProducts[0].grade] || featuredProducts[0].grade],
                    ['Min. Order', `${featuredProducts[0].minOrderKg} kg`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span className="font-heritage text-[9px] tracking-[0.18em] text-rice-muted uppercase block mb-1">{k}</span>
                      <span className="font-display text-base italic">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Link to={`/products/${featuredProducts[0].id}`}
                    className="flex-1 py-3.5 bg-paddy text-cream text-center font-heritage text-[11px] tracking-[0.18em] uppercase hover:bg-paddy-deep transition-colors">
                    View Product
                  </Link>
                  <button onClick={() => handleAddToCart(featuredProducts[0])} disabled={!featuredProducts[0].inStock}
                    className="px-6 py-3.5 border border-ink text-ink font-heritage text-[11px] tracking-[0.18em] uppercase hover:bg-ink hover:text-cream transition-all disabled:opacity-40">
                    Quick Add
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ── WHOLESALE TIERS ───────────────────────────────────────────────────── */}
      <section className="border-t border-hairline">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <motion.span variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="font-heritage text-[10px] tracking-[0.22em] text-rice-muted uppercase block mb-4">
                V · Wholesale & Export
              </motion.span>
              <motion.h2 variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="font-display text-[clamp(36px,5vw,64px)] leading-[0.95] tracking-[-0.03em] font-light">
                Built for<br /><em className="italic text-paddy">restaurants, retailers,</em><br />and exporters.
              </motion.h2>
              <motion.p variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="text-ink-2 text-base leading-relaxed mt-6 max-w-md">
                Volume pricing starts at 50kg. Container orders ship FOB Karachi with full documentation. Dedicated account manager at the 500kg tier.
              </motion.p>
            </div>

            <div className="border-t border-ink">
              {WHOLESALE_TIERS.map((tier, i) => (
                <motion.div key={tier.tier} variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                  transition={{ delay: i * 0.06 }}
                  className="grid grid-cols-[100px_1fr_auto] gap-4 items-center py-5 border-b border-hairline hover:pl-2 transition-all cursor-pointer"
                  onClick={() => navigate('/contact?subject=Wholesale+Inquiry')}>
                  <span className="font-heritage text-[10px] tracking-[0.18em] text-paddy uppercase">{tier.tier}</span>
                  <div>
                    <div className="font-display text-xl italic">{tier.range}</div>
                    <div className="text-ink-2 text-sm mt-0.5">{tier.price}</div>
                  </div>
                  <span className="font-heritage text-[10px] tracking-[0.14em] text-ink uppercase whitespace-nowrap">{tier.cta}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────────── */}
      {testimonials.length >= 3 && (
        <section className="border-t border-hairline bg-cream py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-14">
              <motion.span variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="font-heritage text-[10px] tracking-[0.22em] text-rice-muted uppercase block mb-4">
                VI · What Buyers Say
              </motion.span>
              <motion.h2 variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="font-display text-[clamp(36px,5vw,64px)] leading-[0.95] tracking-[-0.03em] font-light">
                Trusted from<br /><em className="italic text-paddy">Karachi to Calgary.</em>
              </motion.h2>
            </div>
            <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={viewportOnce}
              className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline border border-hairline">
              {testimonials.slice(0, 3).map((rev: any) => {
                const city = rev.user?.addresses?.[0]?.city;
                const displayName = getDisplayName(rev.user?.name || 'Customer');
                const comment = rev.comment || '';
                return (
                  <motion.article key={rev.id} variants={staggerItem}
                    className="bg-cream p-8 flex flex-col gap-5 hover:bg-cream-2 transition-colors">
                    <span className="text-saffron tracking-[0.1em] text-base">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                    <p className="font-display text-xl leading-snug italic flex-1">
                      "{comment.length > 140 ? comment.slice(0, 140) + '…' : comment}"
                    </p>
                    <div className="pt-5 border-t border-hairline" style={{ borderStyle: 'dashed' }}>
                      <strong className="block font-sans text-sm font-medium text-ink">
                        {displayName}{city ? `, ${city}` : ''}
                      </strong>
                      {rev.verifiedPurchase && (
                        <span className="font-heritage text-[9px] tracking-[0.16em] text-paddy uppercase flex items-center gap-1 mt-1">
                          <CheckCircle2 size={10} /> Verified Purchase
                        </span>
                      )}
                      {rev.product?.name && (
                        <span className="font-heritage text-[9px] tracking-[0.12em] text-rice-muted uppercase block mt-0.5">{rev.product.name}</span>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── STORY SECTION ─────────────────────────────────────────────────────── */}
      <section className="border-t border-hairline bg-paddy-deep text-cream">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.span variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="font-heritage text-[10px] tracking-[0.22em] text-cream/60 uppercase block mb-4">
                VII · Heritage · Since MMX
              </motion.span>
              <motion.h2 variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="font-display text-[clamp(36px,5vw,64px)] leading-[0.95] tracking-[-0.03em] font-light text-cream">
                A family mill on the<br /><em className="italic text-saffron">GT Road.</em>
              </motion.h2>
              <motion.div variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="space-y-4 mt-6 text-cream/80 text-base leading-relaxed max-w-lg">
                <p>In 2010, Haji Noor Khan parked a single husking machine on a strip of land beside the old Batkhela bus stand. Today, the family runs multiple lines through the night, milling rice for households from Mingora to Karachi.</p>
                <p>We have grown — but only ever in one direction. Better rice, better priced, milled the way our grandfather taught us.</p>
              </motion.div>
              <motion.div variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce} className="mt-8">
                <Link to="/about"
                  className="inline-flex items-center gap-2 border border-cream/40 text-cream font-heritage text-[11px] tracking-[0.18em] uppercase px-6 py-3 hover:bg-cream hover:text-paddy-deep transition-all">
                  Read Our Story →
                </Link>
              </motion.div>
            </div>
            <motion.div variants={scrollRevealRight} initial="initial" whileInView="animate" viewport={viewportOnce}
              className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] bg-paddy rounded-sm overflow-hidden">
                <div className="w-full h-full flex items-center justify-center opacity-30">
                  <Wheat size={48} className="text-cream" />
                </div>
              </div>
              <div className="aspect-[3/4] bg-paddy rounded-sm overflow-hidden mt-8">
                <div className="w-full h-full flex items-center justify-center opacity-30">
                  <Award size={48} className="text-cream" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="border-t border-hairline">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <motion.span variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="font-heritage text-[10px] tracking-[0.22em] text-rice-muted uppercase block mb-4">
                VIII · Questions
              </motion.span>
              <motion.h2 variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="font-display text-[clamp(36px,5vw,64px)] leading-[0.95] tracking-[-0.03em] font-light">
                Frequently<br /><em className="italic text-paddy">asked.</em>
              </motion.h2>
              <motion.p variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="text-ink-2 mt-6 text-base leading-relaxed max-w-xs">
                Can't find your answer? Message us on WhatsApp at {settings.whatsappNumber || '+92-300-1234567'} — usually the fastest line.
              </motion.p>
            </div>
            <div className="border-t border-ink">
              {FAQ_ITEMS.map((faq, i) => (
                <motion.div key={i} variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
                  className={`border-b border-hairline overflow-hidden cursor-pointer hover:pl-2 transition-all ${openFaq === i ? 'pl-2' : ''}`}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  <div className="flex items-center justify-between py-6 gap-4">
                    <span className="font-display text-xl leading-snug tracking-[-0.01em]">{faq.q}</span>
                    <span className="font-display text-2xl text-paddy flex-shrink-0 transition-transform duration-200"
                      style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                  </div>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <p className="text-ink-2 text-base leading-relaxed pb-6">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────────────────── */}
      <section className="border-t border-hairline">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
          <motion.div variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
            className="relative overflow-hidden rounded-sm bg-paddy-deep text-cream p-12 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div style={{ background: 'radial-gradient(circle at 80% 50%, rgba(200,145,46,0.25), transparent 60%)' }}
              className="absolute inset-0 pointer-events-none" />
            <div className="relative">
              <span className="font-heritage text-[9px] tracking-[0.22em] text-cream/60 uppercase block mb-4">Subscribe · One email per month</span>
              <h2 className="font-display text-[clamp(32px,4vw,56px)] leading-[0.95] tracking-[-0.03em] font-light text-cream">
                Field notes,<br /><em className="italic text-saffron">first Saturday</em><br />of the month.
              </h2>
            </div>
            <div className="relative space-y-5">
              <p className="text-cream/80 text-base leading-relaxed">
                Harvest reports, recipes, occasional discounts on bulk orders. No spam — one email, first Saturday of the month.
              </p>
              <form className="flex gap-2" onSubmit={async e => {
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
                  className="flex-1 bg-white/10 border border-white/20 text-cream placeholder-cream/40 px-4 py-3 text-sm focus:outline-none focus:border-saffron transition-colors" />
                <button type="submit"
                  className="px-6 py-3 bg-saffron text-ink font-heritage text-[11px] tracking-[0.18em] uppercase hover:bg-saffron-deep transition-colors whitespace-nowrap">
                  Subscribe →
                </button>
              </form>
              <p className="font-heritage text-[9px] tracking-[0.18em] text-cream/40 uppercase">Unsubscribe with one click · No spam</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── RECENTLY VIEWED ───────────────────────────────────────────────────── */}
      {recentlyViewed.length > 0 && (
        <section className="border-t border-hairline">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
            <h2 className="font-heritage text-[10px] tracking-[0.22em] text-rice-muted uppercase mb-6">Recently Viewed</h2>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
              {recentlyViewed.map(p => (
                <Link key={p.id} to={`/products/${p.id}`}
                  className="flex-shrink-0 w-40 border border-hairline overflow-hidden group hover:border-paddy transition-colors">
                  <div className="h-28 bg-cream-2 overflow-hidden">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center"><Wheat size={20} className="text-hairline" /></div>}
                  </div>
                  <div className="p-3">
                    <p className="font-display text-sm italic truncate">{p.name}</p>
                    <p className="font-heritage text-[9px] tracking-[0.12em] text-paddy mt-1">₨{p.pricePerKg?.toLocaleString()}/kg</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── COMPARE BAR ───────────────────────────────────────────────────────── */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-ink text-cream px-5 py-3 shadow-2xl">
          <GitCompare size={15} className="text-paddy" />
          <span className="font-heritage text-[10px] tracking-[0.16em] uppercase">{compareIds.length} selected</span>
          {compareIds.length >= 2 && (
            <button onClick={() => navigate(`/compare?ids=${compareIds.join(',')}`)}
              className="bg-paddy text-cream font-heritage text-[10px] tracking-[0.16em] uppercase px-4 py-1.5 hover:bg-paddy-deep transition-colors">
              Compare →
            </button>
          )}
          <button onClick={() => setCompareIds([])} className="text-cream/50 hover:text-cream p-1"><X size={13} /></button>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
