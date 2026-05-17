import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft, Wheat, Shield, Truck, Award, ChevronRight, Heart, ThumbsUp, Flag, Bell, MessageCircle } from 'lucide-react';
import ChatModal from '../../components/chat/ChatModal';
import { Helmet } from 'react-helmet-async';
import api from '../../api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { springSmooth, fastTween } from '../../utils/animations';
import PageTransition from '../../components/PageTransition';

const SERVER = import.meta.env.DEV ? 'http://localhost:5000' : '';
function toDisplayUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) return `${SERVER}${url}`;
  return url;
}

const GRADE_LABEL: Record<string, string> = { A: 'Premium', B: 'Standard', C: 'Economy' };
const GRADE_COLOR: Record<string, string> = {
  A: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  B: 'bg-blue-100 text-blue-700 border-blue-200',
  C: 'bg-gray-100 text-gray-600 border-gray-200',
};
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&q=80';
const PRODUCT_TABS = ['Description', 'Specifications', 'Nutrition', 'Reviews'] as const;
type PTab = typeof PRODUCT_TABS[number];

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

function ProductGallery({ product }: { product: any }) {
  // Build full image list: gallery array + primary imageUrl as fallback
  const allImages: string[] = (() => {
    const gallery: string[] = Array.isArray(product.images) ? product.images : [];
    const primary = product.imageUrl ? toDisplayUrl(product.imageUrl) : '';
    // Deduplicate: gallery already contains imageUrl if synced from admin
    if (gallery.length > 0) return gallery.map(toDisplayUrl);
    return primary ? [primary] : [DEFAULT_IMG];
  })();

  const [active, setActive] = useState(0);

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative rounded-2xl overflow-hidden bg-green-50" style={{ aspectRatio: '4/3' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={allImages[active]}
            src={allImages[active]}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={e => { (e.target as any).src = DEFAULT_IMG; }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${GRADE_COLOR[product.grade] || GRADE_COLOR.A}`}>
            {GRADE_LABEL[product.grade] || product.grade}
          </span>
          {!product.inStock && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">Out of Stock</span>
          )}
        </div>

        {/* Image counter */}
        {allImages.length > 1 && (
          <span className="absolute bottom-3 left-3 text-xs bg-black/50 text-white px-2.5 py-1 rounded-full font-medium">
            {active + 1} / {allImages.length}
          </span>
        )}
        {product.sku && (
          <span className="absolute bottom-3 right-3 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full font-mono">{product.sku}</span>
        )}

        {/* Arrow navigation */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={() => setActive(i => (i - 1 + allImages.length) % allImages.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors"
              aria-label="Previous image"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button
              onClick={() => setActive(i => (i + 1) % allImages.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors"
              aria-label="Next image"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === active ? 'border-green-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={url} alt={`View ${i + 1}`} className="w-full h-full object-cover"
                onError={e => { (e.target as any).src = DEFAULT_IMG; }} />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem, items } = useCart();
  const { user, isCustomer } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(10);
  const [activeTab, setActiveTab] = useState<PTab>('Description');
  const [favorited, setFavorited] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [alertEmail, setAlertEmail]   = useState('');
  const [alertSent, setAlertSent]     = useState(false);
  const [recentlyViewed, setRV]       = useState<any[]>([]);
  const [chatOpen, setChatOpen]       = useState(false);

  const loadReviews = async () => {
    const r = await api.get(`/reviews/${id}`).catch(() => ({ data: { reviews: [], avgRating: 0, totalCount: 0, breakdown: [] } }));
    setReviews(r.data.reviews || []);
    setAvgRating(r.data.avgRating || 0);
    setTotalReviews(r.data.totalCount || 0);
    setBreakdown(r.data.breakdown || []);
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/shop/products/${id}`),
      loadReviews(),
      isCustomer ? api.get('/favorites').catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
    ]).then(([p, , favs]) => {
      setProduct(p.data);
      setQty(p.data.minOrderKg || 10);
      const favArr: any[] = Array.isArray(favs.data) ? favs.data : [];
      setFavorited(favArr.some((f: any) => f.productId === id));
    }).catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
    // Track recently viewed (fire and forget)
    const sessionId = localStorage.getItem('sessionId') || (() => { const s = Math.random().toString(36).slice(2); localStorage.setItem('sessionId', s); return s; })();
    api.post(`/products/${id}/view`, {}, { headers: { 'X-Session-ID': sessionId } }).catch(() => {});
    // Load recently viewed for suggestions
    api.get('/products/recently-viewed', { headers: { 'X-Session-ID': sessionId } }).then(r => setRV((r.data.data || []).filter((p: any) => p.id !== id).slice(0, 4))).catch(() => {});
  }, [id, isCustomer]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ productId: product.id, name: product.name, variety: product.variety, grade: product.grade, pricePerKg: product.pricePerKg, quantityKg: qty, minOrderKg: product.minOrderKg, imageUrl: product.imageUrl });
    toast.success(`${product.name} added to cart!`);
  };

  const toggleFavorite = async () => {
    if (!isCustomer) { toast.error('Sign in to save favorites'); return; }
    const { data } = await api.post(`/favorites/${id}`);
    setFavorited(data.favorited);
    toast.success(data.favorited ? 'Added to favorites!' : 'Removed from favorites');
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCustomer) { toast.error('Please sign in as a customer'); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/${id}`, reviewForm);
      toast.success('Review submitted! Pending approval.');
      setReviewForm({ rating: 5, comment: '' });
      await loadReviews();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const inCart = items.some(i => i.productId === id);
  const formatPKR = (n: number) => `PKR ${n.toLocaleString()}`;

  // Spec table rows
  const specs = product ? [
    { label: 'Variety', value: product.variety },
    { label: 'Grade', value: product.grade ? `${product.grade} — ${GRADE_LABEL[product.grade] || product.grade}` : null },
    { label: 'SKU', value: product.sku },
    { label: 'Origin', value: product.origin },
    { label: 'Processing', value: product.processingType },
    { label: 'Grain Length', value: product.grainLength },
    { label: 'Moisture Content', value: product.moistureContent },
    { label: 'Cooking Time', value: product.cookingTime },
    { label: 'Aroma', value: product.aroma },
    { label: 'Broken Grain', value: product.brokenGrain },
    { label: 'Packaging', value: product.packaging },
    { label: 'Weight', value: product.weight ? `${product.weight}kg` : null },
    { label: 'Shelf Life', value: product.shelfLife },
    { label: 'Storage', value: product.storageInstructions },
    { label: 'Certifications', value: product.certifications },
  ].filter(s => s.value) : [];

  let nutrition: any[] = [];
  if (product?.nutritionInfo) {
    try { nutrition = JSON.parse(product.nutritionInfo); } catch {}
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
        <div className="h-96 bg-gray-200 rounded-2xl" />
        <div className="space-y-4"><div className="h-8 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-24 text-gray-400">
      <Wheat size={48} className="mx-auto mb-3 opacity-30" />
      <p className="text-lg font-medium text-gray-600">Product not found</p>
      <Link to="/" className="text-green-600 hover:underline text-sm mt-2 block">← Back to shop</Link>
    </div>
  );

  return (
    <PageTransition>
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Helmet>
        <title>{product.name} — Al-Noor Rice Mills</title>
        <meta name="description" content={product.shortDescription || `Buy ${product.name} (${product.variety}, Grade ${product.grade}) from Al-Noor Rice Mills. ${formatPKR(product.pricePerKg)}/kg.`} />
        <meta property="og:title" content={`${product.name} — Al-Noor Rice Mills`} />
        <meta property="og:description" content={product.shortDescription || `Premium ${product.variety} rice, Grade ${product.grade}.`} />
        {product.imageUrl && <meta property="og:image" content={product.imageUrl} />}
      </Helmet>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-green-600">Shop</Link>
        <ChevronRight size={14} />
        <span className="text-gray-700 font-medium">{product.name}</span>
      </nav>

      {/* Product main */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        {/* Image gallery */}
        <ProductGallery product={product} />

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-0.5">{product.variety}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            {totalReviews > 0 && (
              <button onClick={() => setActiveTab('Reviews')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <StarRating rating={avgRating} />
                <span className="text-sm text-gray-500">{avgRating.toFixed(1)} ({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
              </button>
            )}
          </div>

          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-green-700">{formatPKR(product.pricePerKg)}</span>
            <span className="text-gray-400 mb-1">/kg</span>
          </div>

          {product.shortDescription && (
            <p className="text-gray-600 leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={product.inStock ? 'text-green-700' : 'text-red-600'}>
              {product.inStock ? (product.availableKg > 0 ? `In Stock — ${product.availableKg.toLocaleString()}kg available` : 'In Stock') : 'Out of Stock'}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Min order: <strong>{product.minOrderKg}kg</strong></span>
              {product.maxOrderKg && <span>Max order: <strong>{product.maxOrderKg}kg</strong></span>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty(q => Math.max(product.minOrderKg, q - 5))} className="w-10 h-10 bg-white border border-gray-200 rounded-xl text-lg font-bold hover:bg-gray-100 transition-colors">−</button>
              <span className="text-lg font-bold text-gray-900 w-20 text-center">{qty} kg</span>
              <button onClick={() => setQty(q => product.maxOrderKg ? Math.min(product.maxOrderKg, q + 5) : q + 5)} className="w-10 h-10 bg-white border border-gray-200 rounded-xl text-lg font-bold hover:bg-gray-100 transition-colors">+</button>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total:</span>
              <span className="font-bold text-green-700 text-base">{formatPKR(qty * product.pricePerKg)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleAddToCart} disabled={!product.inStock}
              className={`flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${!product.inStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : inCart ? 'bg-green-100 text-green-700 border-2 border-green-200 hover:bg-green-200' : 'bg-green-700 hover:bg-green-800 text-white shadow-sm'}`}>
              <ShoppingCart size={18} />
              {!product.inStock ? 'Out of Stock' : inCart ? 'Add More' : 'Add to Cart'}
            </button>
            <button onClick={toggleFavorite}
              className={`p-3.5 rounded-xl border-2 transition-colors ${favorited ? 'border-red-300 text-red-500 bg-red-50' : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'}`}>
              <Heart size={18} className={favorited ? 'fill-red-500' : ''} />
            </button>
          </div>

          {/* Ask about product */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={fastTween}
            className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle size={20} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">Have a question about this product?</p>
              <p className="text-xs text-gray-500">Usually replies within 1 hour</p>
            </div>
            <button onClick={() => setChatOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white rounded-xl text-sm font-semibold transition-colors flex-shrink-0">
              Ask Us →
            </button>
          </motion.div>

          {/* Stock Alert — show when out of stock */}
          {!product.inStock && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              {alertSent ? (
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  <Bell size={16} className="text-orange-500" />
                  <span className="font-semibold">You'll be notified when this is back in stock!</span>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-orange-700 flex items-center gap-1.5 mb-2"><Bell size={14} /> Notify Me When Available</p>
                  <div className="flex gap-2">
                    <input type="email" value={alertEmail} onChange={e => setAlertEmail(e.target.value)}
                      placeholder={user?.email || 'your@email.com'}
                      className="flex-1 border border-orange-200 bg-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    <button onClick={async () => {
                      const email = alertEmail || user?.email;
                      if (!email) { toast.error('Enter your email'); return; }
                      try { await api.post('/stock-alerts', { productId: id, email }); setAlertSent(true); toast.success('Alert set!'); }
                      catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
                    }} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl transition-colors">
                      Notify Me
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Bulk quote CTA */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">Ordering 500kg or more?</p>
                <p className="text-xs text-gray-500">Get wholesale pricing & custom delivery for bulk orders.</p>
              </div>
              <a href="/contact" className="flex-shrink-0 flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
                Get Quote
              </a>
            </div>
          </div>

          {/* Share row */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Share:</span>
            {product && (
              <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} at Al-Noor Rice Mills — ${window.location.href}`)}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-xl font-semibold transition-colors">
                💬 WhatsApp
              </a>
            )}
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
              className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-xl font-semibold transition-colors">
              🔗 Copy Link
            </button>
          </div>

          {/* Trust mini-badges */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { icon: <Shield size={14} className="text-green-600" />, label: 'Quality Guarantee' },
              { icon: <Truck size={14} className="text-blue-600" />, label: 'Fast Delivery' },
              { icon: <Award size={14} className="text-yellow-600" />, label: 'Freshly Milled' },
            ].map(b => (
              <div key={b.label} className="text-center p-2.5 bg-gray-50 rounded-xl">
                <div className="flex justify-center mb-1">{b.icon}</div>
                <p className="text-xs text-gray-500">{b.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tab bar — layoutId animated underline */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex gap-1">
          {PRODUCT_TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`relative px-5 py-3 text-sm font-medium transition-colors ${activeTab === t ? 'text-green-700' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}{t === 'Reviews' && totalReviews > 0 ? ` (${totalReviews})` : ''}
              {activeTab === t && (
                <motion.div
                  layoutId="tabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                  transition={springSmooth}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content — AnimatePresence for exit animations */}
      <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={fastTween}
      >

      {activeTab === 'Description' && (
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description || product.shortDescription || `Premium ${product.variety} rice from Al-Noor Rice Mills. Grade ${product.grade} quality, freshly milled at our Batkhela facility.`}
          </p>
          {product.storageInstructions && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
              <strong>Storage:</strong> {product.storageInstructions}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Specifications' && (
        <div>
          {specs.length === 0 ? (
            <p className="text-gray-400 text-sm">No specifications available.</p>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {specs.map(s => (
                    <tr key={s.label} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-500 w-40">{s.label}</td>
                      <td className="px-5 py-3 text-gray-900">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Nutrition' && (
        <div>
          {nutrition.length === 0 ? (
            <p className="text-gray-400 text-sm">No nutrition information available.</p>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm max-w-sm">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <p className="font-bold text-gray-900">Nutrition Facts</p>
                <p className="text-xs text-gray-400">Per 100g serving</p>
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {nutrition.map((n: any, i: number) => (
                    <tr key={i}>
                      <td className="px-5 py-2.5 text-gray-700">{n.nutrient}</td>
                      <td className="px-5 py-2.5 font-medium text-gray-900 text-right">{n.per100g} {n.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Reviews' && (
        <div className="space-y-8">
          {/* Rating summary */}
          {totalReviews > 0 && (
            <div className="flex gap-8 items-center bg-gray-50 rounded-2xl p-6">
              <div className="text-center">
                <p className="text-5xl font-extrabold text-gray-900">{avgRating.toFixed(1)}</p>
                <StarRating rating={avgRating} size={20} />
                <p className="text-sm text-gray-400 mt-1">{totalReviews} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {breakdown.map((b: any) => (
                  <div key={b.star} className="flex items-center gap-2 text-xs">
                    <span className="w-6 text-gray-500">{b.star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-yellow-400 h-full rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: totalReviews > 0 ? `${(b.count / totalReviews) * 100}%` : '0%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                      />
                    </div>
                    <span className="w-6 text-gray-400">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews list */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No reviews yet. Be the first!</p>
            ) : reviews.map((r: any) => (
              <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {r.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm">{r.user?.name}</p>
                        {r.verifiedPurchase && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">✓ Verified</span>}
                      </div>
                      <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <StarRating rating={r.rating} size={14} />
                </div>
                {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => api.post(`/reviews/${r.id}/helpful`)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors">
                    <ThumbsUp size={12} /> Helpful {r.helpfulCount > 0 ? `(${r.helpfulCount})` : ''}
                  </button>
                  <button onClick={() => api.post(`/reviews/${r.id}/report`)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
                    <Flag size={12} /> Report
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Leave a review */}
          {isCustomer ? (
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <h3 className="font-semibold text-gray-800 mb-4">Leave a Review</h3>
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Rating *</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setReviewForm(f => ({ ...f, rating: star }))}>
                        <Star size={28} className={star <= (hoveredStar || reviewForm.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Comment (optional)</p>
                  <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    rows={3} placeholder="Share your experience..."
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <button type="submit" disabled={submittingReview}
                  className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold text-sm disabled:opacity-60 transition-colors">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-5 text-center border border-gray-100">
              <p className="text-gray-500 text-sm">
                <Link to="/login" className="text-green-700 font-semibold hover:underline">Sign in</Link>{' '}or{' '}
                <Link to="/register" className="text-green-700 font-semibold hover:underline">register</Link>{' '}to leave a review.
              </p>
            </div>
          )}
        </div>
      )}

      </motion.div>
      </AnimatePresence>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recently Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyViewed.map(p => (
              <Link key={p.id} to={`/products/${p.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-32 bg-green-50 overflow-hidden">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center"><Wheat size={24} className="text-green-300" /></div>
                  }
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-green-700 transition-colors">{p.name}</p>
                  <p className="text-green-700 font-bold text-sm mt-0.5">{formatPKR(p.pricePerKg)}/kg</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
    <ChatModal
      isOpen={chatOpen}
      onClose={() => setChatOpen(false)}
      contextType="product"
      contextRef={product?.id}
      contextLabel={product?.name}
    />
    </PageTransition>
  );
}
