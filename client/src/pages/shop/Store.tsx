import { useEffect, useState, useCallback } from 'react';
import { useCart } from '../../contexts/CartContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  staggerContainer, staggerItem, staggerFast, scrollReveal,
  scrollRevealLeft, scrollRevealRight, cardHover, buttonTap,
  viewportOnce, springBounce,
} from '../../utils/animations';
import {
  ShoppingCart, Wheat, Shield, Truck, Package,
  Search, CheckCircle2, ChevronRight, Leaf, Award,
  SlidersHorizontal, X, ChevronDown, GitCompare
} from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../../components/PageTransition';

const GRADE_LABEL: Record<string, string> = { A: 'Premium', B: 'Standard', C: 'Economy' };
const GRADE_COLOR: Record<string, string> = {
  A: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  B: 'bg-blue-100 text-blue-700 border-blue-200',
  C: 'bg-gray-100 text-gray-600 border-gray-200'
};
const PLACEHOLDER_IMAGES: Record<string, string> = {
  Basmati: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
  'Super Kernel': 'https://images.unsplash.com/photo-1568347877321-f8935c7dc5f7?w=400&q=80',
  default: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&q=80'
};
const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

export default function Store() {
  const shouldReduce = useReducedMotion();
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [settings, setSettings] = useState<any>({});
  const [varieties, setVarieties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [recentlyViewed, setRV] = useState<any[]>([]);

  // Filter state synced with URL params
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
    p.delete('page'); // reset page on filter change
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
      // Handle both old array response and new paginated response
      const data = res.data;
      if (Array.isArray(data)) {
        setProducts(data);
        setTotal(data.length);
      } else {
        setProducts(data.products || []);
        setTotal(data.total || 0);
      }
      const qty: Record<string, number> = {};
      const prods = Array.isArray(data) ? data : (data.products || []);
      prods.forEach((pr: any) => { qty[pr.id] = pr.minOrderKg || 10; });
      setQuantities(q => ({ ...q, ...qty }));
    } finally {
      setLoading(false);
    }
  }, [search, grade, variety, minPrice, maxPrice, inStockOnly, minOrder, sortBy, page]);

  useEffect(() => {
    fetchProducts();
    api.get('/shop/settings').then(r => setSettings(r.data)).catch(() => {});
    api.get('/shop/varieties').then(r => setVarieties(r.data || [])).catch(() => {});
    const sessionId = localStorage.getItem('sessionId') || (() => { const s = Math.random().toString(36).slice(2); localStorage.setItem('sessionId', s); return s; })();
    api.get('/products/recently-viewed', { headers: { 'X-Session-ID': sessionId } }).then(r => setRV(r.data.data || [])).catch(() => {});
  }, [fetchProducts]);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 4 ? (toast.error('Max 4 products to compare'), prev) : [...prev, id]);
  };

  const handleAddToCart = (product: any) => {
    const qty = quantities[product.id] || product.minOrderKg;
    addItem({ productId: product.id, name: product.name, variety: product.variety, grade: product.grade, pricePerKg: product.pricePerKg, quantityKg: qty, minOrderKg: product.minOrderKg, imageUrl: product.imageUrl });
    toast.success(`${product.name} added to cart!`);
  };

  const inCart = (id: string) => items.some(i => i.productId === id);
  const formatPKR = (n: number) => `PKR ${n.toLocaleString()}`;
  const imgSrc = (p: any) => p.imageUrl || PLACEHOLDER_IMAGES[p.variety] || PLACEHOLDER_IMAGES.default;

  return (
    <PageTransition>
    <div>
      <Helmet>
        <title>Al-Noor Rice Mills — Premium Pakistani Rice, Direct from Mill</title>
        <meta name="description" content="Buy premium Basmati & Super Kernel rice directly from Al-Noor Rice Mills, Batkhela, KPK. Best quality, fair prices, fast delivery across Pakistan." />
        <meta property="og:title" content="Al-Noor Rice Mills — Premium Pakistani Rice" />
        <meta property="og:description" content="Premium Basmati & Super Kernel rice, freshly milled in Batkhela, KPK." />
        <meta name="keywords" content="Pakistani rice, Basmati rice, Super Kernel rice, Al-Noor Rice Mills, Batkhela, KPK, buy rice online Pakistan" />
      </Helmet>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center" style={{ background: 'radial-gradient(ellipse at 30% 50%, #14532d 0%, #166534 45%, #15803d 100%)' }}>
        {/* Floating grain particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute text-4xl opacity-5 select-none"
              style={{ left: `${(i * 19 + 5) % 100}%`, top: `${(i * 23 + 10) % 100}%`, animation: `float${i % 3} ${6 + i * 0.5}s ease-in-out infinite` }}>
              🌾
            </div>
          ))}
        </div>
        <style>{`
          @keyframes float0 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        `}</style>

        <div className="relative max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-white/25 backdrop-blur-sm">
              <Leaf size={11} className="text-amber-300" /> Premium Rice Mill Since 2010 · Batkhela, KPK
            </motion.span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="block">Pure Rice,</motion.span>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="block">Direct From</motion.span>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="block text-amber-400">Our Mill</motion.span>
            </h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="text-green-200 text-lg leading-relaxed mb-8 max-w-lg">
              {settings.bannerSubtitle || 'Basmati · Super Kernel · IRRI varieties, freshly milled in Batkhela and delivered across Pakistan.'}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-3 mb-8">
              <motion.a href="#products" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-7 py-3.5 bg-amber-400 hover:bg-amber-300 text-green-900 font-bold rounded-xl transition-colors shadow-lg text-sm">
                Shop Now <ChevronRight size={16} />
              </motion.a>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/about" className="flex items-center gap-2 px-7 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl transition-colors border border-white/30 text-sm backdrop-blur-sm">
                  Our Story
                </Link>
              </motion.div>
            </motion.div>

            <div className="flex items-center gap-5 text-xs text-green-300">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-green-400" /> Fast Delivery</span>
              <span className="flex items-center gap-1.5"><Shield size={13} className="text-green-400" /> Quality Guaranteed</span>
              <span className="flex items-center gap-1.5"><Award size={13} className="text-green-400" /> Freshly Milled</span>
            </div>
          </motion.div>

          {/* Right: Floating product showcase */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex justify-center">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-72 rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="h-44 bg-green-800/50 flex items-center justify-center overflow-hidden">
                {products[0]?.imageUrl
                  ? <img src={products[0].imageUrl} alt={products[0].name} className="w-full h-full object-cover" />
                  : <div className="text-6xl opacity-60">🌾</div>}
              </div>
              <div className="p-5 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-amber-400 text-green-900 px-2 py-0.5 rounded-full font-bold">New Harvest 2025</span>
                  <span className="flex items-center gap-0.5 text-xs text-green-300">
                    <span className="text-amber-400">★★★★★</span>
                  </span>
                </div>
                <p className="font-bold text-lg">{products[0]?.name || 'Premium Basmati Rice'}</p>
                <p className="text-green-300 text-sm">{products[0]?.variety || 'Basmati'} · Grade A</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                  <span className="text-2xl font-extrabold text-amber-400">
                    {products[0] ? formatPKR(products[0].pricePerKg) : 'PKR 280'}
                  </span>
                  <span className="text-xs text-green-300">/kg · Min 5kg</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST STATS ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <motion.div
            variants={staggerContainer}
            initial={shouldReduce ? false : 'initial'}
            whileInView="animate"
            viewport={viewportOnce}
            className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Award size={20} className="text-amber-500" />, stat: '15+', label: 'Years', sub: 'Premium Quality' },
              { icon: <Truck size={20} className="text-blue-500" />, stat: '3–5', label: 'Day Delivery', sub: 'Pakistan-wide' },
              { icon: <Wheat size={20} className="text-green-600" />, stat: '6', label: 'Varieties', sub: 'Fresh Every Season' },
              { icon: <CheckCircle2 size={20} className="text-purple-500" />, stat: '500+', label: 'Happy Buyers', sub: 'Wholesale Customers' },
            ].map(b => (
              <motion.div key={b.stat} variants={staggerItem} {...cardHover}
                className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-green-200 transition-all">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">{b.icon}</div>
                <div>
                  <p className="font-extrabold text-gray-900 text-lg leading-none">{b.stat} <span className="text-sm font-semibold text-gray-600">{b.label}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">{b.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Products section */}
      <section id="products" className="max-w-6xl mx-auto px-4 py-12">
        {/* Filter toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setParam('q', e.target.value)}
              placeholder="Search rice..." className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          {/* Grade */}
          <select value={grade} onChange={e => setParam('grade', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">All Grades</option>
            <option value="A">Premium (A)</option>
            <option value="B">Standard (B)</option>
            <option value="C">Economy (C)</option>
          </select>

          {/* Variety */}
          {varieties.length > 0 && (
            <select value={variety} onChange={e => setParam('variety', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Varieties</option>
              {varieties.map(v => <option key={v}>{v}</option>)}
            </select>
          )}

          {/* Sort */}
          <select value={sortBy} onChange={e => setParam('sort', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* More filters toggle */}
          <button onClick={() => setFiltersOpen(f => !f)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-sm font-medium transition-colors ${filtersOpen ? 'bg-green-700 text-white border-green-700' : 'border-gray-200 text-gray-600 hover:border-green-400'}`}>
            <SlidersHorizontal size={14} /> More Filters {filtersOpen ? <ChevronDown size={12} className="rotate-180" /> : <ChevronDown size={12} />}
          </button>

          {hasActiveFilters && (
            <button onClick={clearAll} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium">
              <X size={14} /> Clear All
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {filtersOpen && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Min Price/kg (PKR)</label>
              <input type="number" value={minPrice} onChange={e => setParam('minPrice', e.target.value)}
                placeholder="e.g. 100" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Max Price/kg (PKR)</label>
              <input type="number" value={maxPrice} onChange={e => setParam('maxPrice', e.target.value)}
                placeholder="e.g. 500" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Min Order (kg)</label>
              <select value={minOrder} onChange={e => setParam('minOrder', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Any</option>
                <option value="10">Up to 10kg</option>
                <option value="25">Up to 25kg</option>
                <option value="50">Up to 50kg</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Availability</label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={inStockOnly} onChange={e => setParam('inStock', e.target.checked ? 'true' : '')}
                  className="w-4 h-4 accent-green-600" />
                <span className="text-sm text-gray-700">In Stock Only</span>
              </label>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {search && <FilterChip label={`Search: "${search}"`} onRemove={() => setParam('q', '')} />}
            {grade && <FilterChip label={`Grade: ${GRADE_LABEL[grade] || grade}`} onRemove={() => setParam('grade', '')} />}
            {variety && <FilterChip label={`Variety: ${variety}`} onRemove={() => setParam('variety', '')} />}
            {minPrice && <FilterChip label={`Min: PKR ${minPrice}/kg`} onRemove={() => setParam('minPrice', '')} />}
            {maxPrice && <FilterChip label={`Max: PKR ${maxPrice}/kg`} onRemove={() => setParam('maxPrice', '')} />}
            {inStockOnly && <FilterChip label="In Stock Only" onRemove={() => setParam('inStock', '')} />}
            {minOrder && <FilterChip label={`Min Order ≤ ${minOrder}kg`} onRemove={() => setParam('minOrder', '')} />}
          </div>
        )}

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {[
            { label: 'All', q: {}, active: !variety && !grade },
            { label: 'Basmati', q: { variety: 'Basmati' }, active: variety === 'Basmati' },
            { label: 'Super Kernel', q: { variety: 'Super Kernel' }, active: variety === 'Super Kernel' },
            { label: 'IRRI-6', q: { variety: 'IRRI-6' }, active: variety === 'IRRI-6' },
            { label: 'IRRI-9', q: { variety: 'IRRI-9' }, active: variety === 'IRRI-9' },
            { label: 'PK-386', q: { variety: 'PK-386' }, active: variety === 'PK-386' },
            { label: 'Premium', q: { grade: 'A' }, active: grade === 'A' },
            { label: 'Standard', q: { grade: 'B' }, active: grade === 'B' },
            { label: 'Economy', q: { grade: 'C' }, active: grade === 'C' },
          ].map(pill => (
            <button key={pill.label} onClick={() => {
              const p = new URLSearchParams();
              Object.entries(pill.q).forEach(([k, v]) => p.set(k, v as string));
              setSearchParams(p);
            }} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${pill.active ? 'bg-green-700 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'}`}>
              {pill.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Our Products</h2>
            <p className="text-gray-500 text-sm mt-0.5">{loading ? '...' : `${total} product${total !== 1 ? 's' : ''} available`}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /><div className="h-8 bg-gray-200 rounded" /></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-600">{total === 0 && !hasActiveFilters ? 'No products yet' : 'No results found'}</p>
            {hasActiveFilters && <button onClick={clearAll} className="mt-3 text-sm text-green-600 hover:underline">Clear filters</button>}
          </div>
        ) : (
          <>
            <motion.div
              variants={staggerFast}
              initial={shouldReduce ? false : 'initial'}
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <motion.div key={product.id}
                  variants={staggerItem}
                  layout
                  {...(shouldReduce ? {} : cardHover)}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all ${!product.inStock ? 'opacity-70' : 'border-gray-100'}`}>
                  {/* Image */}
                  <Link to={`/products/${product.id}`} className="block relative h-52 overflow-hidden bg-green-50">
                    <img src={imgSrc(product)} alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={e => { (e.target as any).src = PLACEHOLDER_IMAGES.default; }} />
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${GRADE_COLOR[product.grade] || GRADE_COLOR.A}`}>
                        {GRADE_LABEL[product.grade] || product.grade}
                      </span>
                      {!product.inStock && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">Out of Stock</span>}
                    </div>
                    {product.availableKg > 0 && product.availableKg < 100 && product.inStock && (
                      <span className="absolute top-3 right-3 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold border border-orange-200">
                        Only {product.availableKg}kg left
                      </span>
                    )}
                    {/* New badge */}
                    {new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" /> New
                      </div>
                    )}
                  </Link>
                  {/* Info */}
                  <div className="p-4">
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{product.variety}</span>
                    <Link to={`/products/${product.id}`} className="font-bold text-gray-900 text-base hover:text-green-700 transition-colors block mt-2 mb-1 leading-snug line-clamp-2">{product.name}</Link>
                    {product.reviewCount > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">{[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= Math.round(product.rating || 0) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>)}</div>
                        <span className="text-xs text-gray-400">({product.reviewCount})</span>
                      </div>
                    )}
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <span className="text-2xl font-extrabold text-green-700">{formatPKR(product.pricePerKg)}</span>
                        <span className="text-gray-400 text-xs ml-1">/kg</span>
                      </div>
                      <p className="text-xs text-gray-400">Min. {product.minOrderKg}kg</p>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <motion.button whileTap={{ scale: 0.9 }}
                        onClick={() => setQuantities(q => ({ ...q, [product.id]: Math.max(product.minOrderKg, (q[product.id] || product.minOrderKg) - 5) }))}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors flex items-center justify-center text-gray-600">−</motion.button>
                      <span className="flex-1 text-center text-sm font-semibold">{quantities[product.id] || product.minOrderKg} kg</span>
                      <motion.button whileTap={{ scale: 0.9 }}
                        onClick={() => setQuantities(q => ({ ...q, [product.id]: (q[product.id] || product.minOrderKg) + 5 }))}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors flex items-center justify-center text-gray-600">+</motion.button>
                    </div>
                    <p className="text-center text-xs text-green-600 font-semibold mb-3">
                      Total: {formatPKR((quantities[product.id] || product.minOrderKg) * product.pricePerKg)}
                    </p>
                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => handleAddToCart(product)} disabled={!product.inStock}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${!product.inStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : inCart(product.id) ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200' : 'bg-green-700 hover:bg-green-800 text-white shadow-sm'}`}>
                      <ShoppingCart size={15} />
                      {!product.inStock ? 'Out of Stock' : inCart(product.id) ? 'Add More' : 'Add to Cart'}
                    </motion.button>
                    <label className="flex items-center justify-center gap-1.5 mt-2 cursor-pointer text-xs text-gray-400 hover:text-gray-600">
                      <input type="checkbox" checked={compareIds.includes(product.id)} onChange={() => toggleCompare(product.id)} className="w-3.5 h-3.5 accent-green-600" />
                      Compare
                    </label>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </motion.div>
            {/* Pagination */}
            {total > 12 && (
              <div className="flex justify-center gap-2 mt-8">
                {page > 1 && (
                  <button onClick={() => setParam('page', String(page - 1))} className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">← Prev</button>
                )}
                <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {Math.ceil(total / 12)}</span>
                {page * 12 < total && (
                  <button onClick={() => setParam('page', String(page + 1))} className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">Next →</button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* ── WHY CHOOSE US ───────────────────────────────────────────── */}
      <section style={{ background: '#14532d' }} className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div variants={scrollReveal} initial="initial" whileInView="animate" viewport={viewportOnce}
            className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Why Choose Al-Noor Rice Mills?</h2>
            <p className="text-green-300 text-sm">15+ years of trust, direct from Batkhela to your doorstep.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: '🌾', title: 'Direct from Mill', desc: 'No middlemen. Rice milled and packed at our Batkhela facility and shipped straight to you.', variant: scrollRevealLeft },
              { emoji: '🔬', title: 'Quality Tested', desc: 'Every batch tested for moisture, grain length, and purity before leaving our mill.', variant: scrollReveal },
              { emoji: '🚚', title: 'Fast Shipping', desc: 'Orders placed before 2 PM are dispatched same day. Coverage across all of Pakistan.', variant: scrollRevealRight },
            ].map(f => (
              <motion.div key={f.title}
                variants={f.variant} initial="initial" whileInView="animate" viewport={viewportOnce}
                className="text-center p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-4xl mb-4">{f.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-green-300 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
          {settings.whatsappNumber && (
            <div className="text-center mt-10">
              <a href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-colors shadow-lg">
                💬 Order on WhatsApp
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recently Viewed</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {recentlyViewed.map(p => (
              <Link key={p.id} to={`/products/${p.id}`} className="flex-shrink-0 w-44 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-28 bg-green-50 overflow-hidden">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center"><Wheat size={20} className="text-green-300" /></div>
                  }
                </div>
                <div className="p-3">
                  <p className="font-semibold text-xs text-gray-900 truncate group-hover:text-green-700">{p.name}</p>
                  <p className="text-green-700 font-bold text-xs mt-0.5">PKR {p.pricePerKg?.toLocaleString()}/kg</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Compare floating bar */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl">
          <GitCompare size={16} className="text-green-400" />
          <span className="text-sm font-semibold">{compareIds.length} product{compareIds.length > 1 ? 's' : ''} selected</span>
          {compareIds.length >= 2 && (
            <button onClick={() => navigate(`/compare?ids=${compareIds.join(',')}`)}
              className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition-colors">
              Compare Now
            </button>
          )}
          <button onClick={() => setCompareIds([])} className="text-gray-400 hover:text-white p-1"><X size={14} /></button>
        </div>
      )}
    </div>
    </PageTransition>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-red-600 transition-colors"><X size={11} /></button>
    </span>
  );
}

