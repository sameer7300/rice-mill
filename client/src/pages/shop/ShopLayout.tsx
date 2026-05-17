import { useState, useEffect, useRef } from 'react';
import ChatWidget from '../../components/ChatWidget';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLang } from '../../contexts/LangContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  dropdownVariants, slideRightVariants, slideLeftVariants,
  staggerContainer, staggerFast, staggerItem,
  fastTween, springSmooth, buttonTap,
} from '../../utils/animations';
import {
  ShoppingCart, Menu, X, Wheat, Phone, Mail, MapPin, Package, ChevronRight,
  User, LogIn, UserPlus, Search, Heart, LayoutDashboard, LogOut, Gift,
  ChevronDown, Truck, Shield, Star, Facebook, Instagram, Youtube,
  ArrowRight, Minus, Plus, Trash2
} from 'lucide-react';

const formatPKR = (n: number) => `PKR ${n.toLocaleString()}`;

export default function ShopLayout() {
  const { totalItems, items, subtotal, removeItem, updateQty } = useCart();
  const { user, isCustomer, logout } = useAuth();
  const { toggleLang, lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartOpen, setCartOpen]       = useState(false);
  const [mobileMenu, setMobileMenu]   = useState(false);
  const [settings, setSettings]       = useState<any>({});
  const [scrolled, setScrolled]       = useState(false);
  const [shopMenu, setShopMenu]       = useState(false);
  const [userMenu, setUserMenu]       = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQ, setSearchQ]         = useState('');
  const [searchRes, setSearchRes]     = useState<any[]>([]);
  const [discountCode, setDC]         = useState('');
  const [favCount, setFavCount]       = useState(0);
  const shopRef   = useRef<HTMLDivElement>(null);
  const userRef   = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/shop/settings').then(r => setSettings(r.data)).catch(() => {});
    if (isCustomer) api.get('/favorites/count').then(r => setFavCount(r.data?.data?.count || 0)).catch(() => {});
  }, [isCustomer]);

  // Scroll detection for sticky shrink
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopMenu(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Live search (debounced)
  useEffect(() => {
    if (!searchQ.trim() || searchQ.length < 2) { setSearchRes([]); return; }
    const t = setTimeout(() => {
      api.get(`/shop/products?q=${encodeURIComponent(searchQ)}&limit=5`)
        .then(r => setSearchRes(r.data.products || []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [searchQ]);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenu(false); setShopMenu(false); setUserMenu(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); toast.success('Signed out'); };

  const VARIETIES = ['Basmati', 'Super Kernel', 'IRRI-6', 'IRRI-9', 'PK-386'];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── ANNOUNCEMENT TICKER ────────────────────────────────────────── */}
      <div className="bg-green-700 text-white text-xs py-2 overflow-hidden">
        <div className="ticker-track">
          {[1, 2].map(n => (
            <span key={n} className="flex items-center gap-0 shrink-0">
              🌾 Free Delivery above {formatPKR(settings.freeShippingAbove || 10000)} &nbsp;·&nbsp;
              📦 Same-day dispatch before 2 PM PKT &nbsp;·&nbsp;
              ⭐ Premium Basmati — Harvest 2025 &nbsp;·&nbsp;
              📞 Order by phone: +92-946-123456 &nbsp;·&nbsp;
              🎁 Earn loyalty points on every order &nbsp;·&nbsp;
              🚚 Delivery across all Pakistan &nbsp;·&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── TOP BAR (desktop only) ─────────────────────────────────────── */}
      <div className="hidden md:block bg-green-900 text-green-200 text-xs">
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1"><MapPin size={11} /> Batkhela, Malakand, KPK</span>
            <a href="mailto:ricemill@sameergul.com" className="flex items-center gap-1 hover:text-white transition-colors"><Mail size={11} /> ricemill@sameergul.com</a>
            <a href="tel:+9294612345" className="flex items-center gap-1 hover:text-white transition-colors"><Phone size={11} /> +92-946-123456</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleLang} className="hover:text-white transition-colors">{lang === 'en' ? 'اردو' : 'English'}</button>
            <Link to="/track" className="hover:text-white transition-colors">Track Order</Link>
            {!user && <Link to="/login" className="hover:text-white transition-colors">Seller Login</Link>}
          </div>
        </div>
      </div>

      {/* ── MAIN NAVBAR ────────────────────────────────────────────────── */}
      <motion.header
        animate={{
          boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
          paddingTop: scrolled ? '0px' : '0px',
        }}
        transition={fastTween}
        className="bg-white sticky top-0 z-40 border-b border-gray-100"
        style={{ willChange: 'box-shadow' }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className={`flex items-center gap-4 transition-all duration-200 ${scrolled ? 'py-2' : 'py-3'}`}>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
              <motion.div
                animate={{ width: scrolled ? 32 : 40, height: scrolled ? 32 : 40 }}
                transition={fastTween}
                className="bg-green-700 rounded-xl flex items-center justify-center shadow overflow-hidden"
              >
                <Wheat size={scrolled ? 16 : 20} className="text-white" />
              </motion.div>
              <motion.div
                animate={{ scale: scrolled ? 0.92 : 1 }}
                transition={fastTween}
                className="leading-tight hidden sm:block"
              >
                <p className="font-bold text-gray-900 text-base">{settings.storeName || 'Al-Noor Rice Mills'}</p>
                <p className="text-xs text-gray-400">Batkhela, KPK</p>
              </motion.div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium flex-1">
              {/* Shop mega menu */}
              <div ref={shopRef} className="relative">
                <button onClick={() => setShopMenu(v => !v)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${shopMenu ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'}`}>
                  Shop <ChevronDown size={13} className={`transition-transform duration-200 ${shopMenu ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {shopMenu && (
                    <motion.div
                      variants={dropdownVariants} initial="initial" animate="animate" exit="exit"
                      style={{ transformOrigin: 'top left' }}
                      className="absolute top-full left-0 mt-2 w-[480px] bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Varieties</p>
                          {VARIETIES.map(v => (
                            <Link key={v} to={`/?variety=${encodeURIComponent(v)}`} onClick={() => setShopMenu(false)}
                              className="block text-sm text-gray-700 hover:text-green-700 py-1 transition-colors">{v}</Link>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">By Grade</p>
                          {[['A', 'Premium'], ['B', 'Standard'], ['C', 'Economy']].map(([g, l]) => (
                            <Link key={g} to={`/?grade=${g}`} onClick={() => setShopMenu(false)}
                              className="block text-sm text-gray-700 hover:text-green-700 py-1 transition-colors">{l} (Grade {g})</Link>
                          ))}
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-3">Quick Links</p>
                          <Link to="/" onClick={() => setShopMenu(false)} className="block text-sm text-gray-700 hover:text-green-700 py-1">All Products</Link>
                          <Link to="/?sort=newest" onClick={() => setShopMenu(false)} className="block text-sm text-gray-700 hover:text-green-700 py-1">New Arrivals</Link>
                          <Link to="/track" onClick={() => setShopMenu(false)} className="block text-sm text-gray-700 hover:text-green-700 py-1">Track Order</Link>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">For Business</p>
                          <Link to="/contact" onClick={() => setShopMenu(false)} className="block text-sm text-gray-700 hover:text-green-700 py-1">Wholesale Inquiry</Link>
                          <Link to="/about" onClick={() => setShopMenu(false)} className="block text-sm text-gray-700 hover:text-green-700 py-1">Our Story</Link>
                          <div className="mt-3 p-3 bg-green-50 rounded-xl">
                            <p className="text-xs font-semibold text-green-800 mb-1">📞 Order by Phone</p>
                            <p className="text-xs text-green-700">+92-946-123456</p>
                            <p className="text-xs text-green-600">Mon–Sat 8AM–6PM</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link to="/about" className="px-3 py-2 rounded-lg text-gray-600 hover:text-green-700 hover:bg-gray-50 transition-colors">About</Link>
              <Link to="/blog" className="px-3 py-2 rounded-lg text-gray-600 hover:text-green-700 hover:bg-gray-50 transition-colors">Blog</Link>
              <Link to="/contact" className="px-3 py-2 rounded-lg text-gray-600 hover:text-green-700 hover:bg-gray-50 transition-colors">Contact</Link>
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1 ml-auto md:ml-0">
              {/* Search */}
              <div className="relative">
                <button onClick={() => { setSearchOpen(v => !v); setTimeout(() => searchRef.current?.focus(), 100); }}
                  className="p-2 text-gray-500 hover:text-green-700 hover:bg-gray-100 rounded-xl transition-colors">
                  <Search size={18} />
                </button>
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      variants={dropdownVariants} initial="initial" animate="animate" exit="exit"
                      style={{ transformOrigin: 'top right' }}
                      className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 w-64">
                      <div className="p-3 border-b border-gray-100">
                        <input ref={searchRef} type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                          placeholder="Search rice..." className="w-full text-sm outline-none" />
                      </div>
                      {searchRes.length > 0 && (
                        <div className="max-h-64 overflow-y-auto">
                          {searchRes.map((p, i) => (
                            <motion.div
                              key={p.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04, ...fastTween }}
                            >
                            <Link to={`/products/${p.id}`} onClick={() => { setSearchOpen(false); setSearchQ(''); setSearchRes([]); }}
                              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                              <div className="w-9 h-9 bg-green-50 rounded-lg overflow-hidden flex-shrink-0">
                                {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name} /> : <Wheat size={16} className="text-green-400 m-auto" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                <p className="text-xs text-green-600 font-semibold">{formatPKR(p.pricePerKg)}/kg</p>
                              </div>
                            </Link>
                            </motion.div>
                          ))}
                          <Link to={`/?q=${encodeURIComponent(searchQ)}`} onClick={() => { setSearchOpen(false); setSearchQ(''); }}
                            className="block text-center text-xs text-green-600 hover:text-green-800 py-2.5 font-semibold">
                            View all results →
                          </Link>
                        </div>
                      )}
                      {searchQ.length >= 2 && searchRes.length === 0 && (
                        <p className="px-3 py-3 text-xs text-gray-400 text-center">No products found</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Favorites (customers only) */}
              {isCustomer && (
                <Link to="/dashboard" className="relative p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-xl transition-colors hidden md:block">
                  <Heart size={18} />
                  {favCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{favCount}</span>}
                </Link>
              )}

              {/* Cart */}
              <motion.button onClick={() => setCartOpen(true)} {...buttonTap}
                className="relative p-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl transition-colors flex items-center gap-2"
                style={{ willChange: 'transform' }}>
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <>
                    <span className="hidden sm:block text-xs font-semibold">{formatPKR(subtotal)}</span>
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 1.6 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 text-green-900 text-xs font-bold rounded-full flex items-center justify-center">
                      {totalItems}
                    </motion.span>
                  </>
                )}
              </motion.button>

              {/* User menu */}
              {user ? (
                <div ref={userRef} className="relative hidden md:block">
                  <button onClick={() => setUserMenu(v => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:block truncate max-w-[100px]">{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={13} className={`text-gray-400 transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {userMenu && (
                      <motion.div
                        variants={dropdownVariants} initial="initial" animate="animate" exit="exit"
                        style={{ transformOrigin: 'top right' }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                        <div className="px-3 py-2 border-b border-gray-100 mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><LayoutDashboard size={14} /> My Account</Link>
                        <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><Package size={14} /> My Orders</Link>
                        {isCustomer && <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><Gift size={14} /> Loyalty Points</Link>}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"><LogOut size={14} /> Sign Out</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-green-700 rounded-xl transition-colors">
                    <LogIn size={15} /> Sign In
                  </Link>
                  <Link to="/register" className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-xl transition-colors text-xs font-semibold">
                    <UserPlus size={13} /> Register
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMobileMenu(v => !v)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl">
                {mobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile full-screen menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-gray-100 bg-white">
              <div className="px-4 py-4 space-y-1">
                {/* Search input */}
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search rice..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <Link to="/" className="block py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">🛒 Shop All Products</Link>
                <Link to="/track" className="block py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50">📦 Track Order</Link>
                <Link to="/about" className="block py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50">About Us</Link>
                <Link to="/blog" className="block py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50">Blog</Link>
                <Link to="/contact" className="block py-2.5 px-3 rounded-xl text-gray-700 hover:bg-gray-50">Contact</Link>
                <div className="border-t border-gray-100 pt-2 mt-2">
                  {user ? (
                    <>
                      <Link to="/dashboard" className="block py-2.5 px-3 rounded-xl text-green-700 font-semibold">My Account</Link>
                      <button onClick={handleLogout} className="block w-full text-left py-2.5 px-3 rounded-xl text-red-500">Sign Out</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block py-2.5 px-3 rounded-xl text-gray-700">Sign In</Link>
                      <Link to="/register" className="block py-2.5 px-3 rounded-xl text-green-700 font-semibold">Create Account</Link>
                    </>
                  )}
                  <button onClick={toggleLang} className="block w-full text-left py-2.5 px-3 rounded-xl text-gray-400 text-sm">
                    {lang === 'en' ? '🇵🇰 Switch to اردو' : '🇬🇧 Switch to English'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Page content */}
      <main><Outlet /></main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer>
        {/* Newsletter bar */}
        <div className="bg-amber-400">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center">
            <h3 className="text-xl font-bold text-green-900 mb-1">🌾 Get Fresh Harvest Alerts</h3>
            <p className="text-green-800 text-sm mb-4">Be the first to know when new stock arrives + exclusive deals.</p>
            <NewsletterBar />
          </div>
        </div>

        {/* Main footer */}
        <div className="bg-green-900 text-gray-300">
          <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wheat size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Al-Noor Rice Mills</p>
                  <p className="text-xs text-gray-400">Est. 2010</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">{settings.tagline || 'Premium quality rice, directly from our mill in Batkhela to your doorstep.'}</p>
              <div className="space-y-1.5 text-sm text-gray-400">
                <p className="flex items-start gap-1.5"><MapPin size={13} className="mt-0.5 flex-shrink-0" /> Main GT Road, Batkhela, Malakand, KPK 23200</p>
                <a href="tel:+9294612345" className="flex items-center gap-1.5 hover:text-green-400 transition-colors"><Phone size={13} /> +92-946-123456</a>
                <a href="tel:+923001234567" className="flex items-center gap-1.5 hover:text-green-400 transition-colors"><Phone size={13} /> +92-300-1234567</a>
                <a href="mailto:ricemill@sameergul.com" className="flex items-center gap-1.5 hover:text-green-400 transition-colors"><Mail size={13} /> ricemill@sameergul.com</a>
              </div>
              <div className="flex gap-3 mt-5">
                {[
                  { icon: <Facebook size={15} />, href: '#' },
                  { icon: <Instagram size={15} />, href: '#' },
                  { icon: <Youtube size={15} />, href: '#' },
                ].map((s, i) => (
                  <a key={i} href={s.href} className="w-8 h-8 bg-green-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors text-gray-300 hover:text-white">
                    {s.icon}
                  </a>
                ))}
                {settings.whatsappNumber && (
                  <a href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="w-8 h-8 bg-green-600 hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors text-white text-sm font-bold">
                    💬
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <p className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Shop</p>
              <ul className="space-y-2 text-sm">
                {[
                  ['Browse Products', '/'],
                  ['Basmati Rice', '/?variety=Basmati'],
                  ['Super Kernel', '/?variety=Super+Kernel'],
                  ['Premium Grade', '/?grade=A'],
                  ['New Arrivals', '/?sort=newest'],
                  ['Track Order', '/track'],
                ].map(([l, h]) => (
                  <li key={l}><Link to={h} className="text-gray-400 hover:text-green-400 transition-colors">{l}</Link></li>
                ))}
              </ul>
              <p className="font-bold text-white mb-3 mt-6 text-sm uppercase tracking-wide">For Business</p>
              <ul className="space-y-2 text-sm">
                {[['Wholesale Inquiry', '/contact'], ['Bulk Orders (500kg+)', '/contact'], ['Seller / Admin Login', '/login']].map(([l, h]) => (
                  <li key={l}><Link to={h} className="text-gray-400 hover:text-green-400 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Company</p>
              <ul className="space-y-2 text-sm">
                {[
                  ['About Us', '/about'],
                  ['Blog', '/blog'],
                  ['Careers', '/careers'],
                  ['Contact Us', '/contact'],
                ].map(([l, h]) => (
                  <li key={l}><Link to={h} className="text-gray-400 hover:text-green-400 transition-colors">{l}</Link></li>
                ))}
              </ul>
              <p className="font-bold text-white mb-3 mt-6 text-sm uppercase tracking-wide">Support</p>
              <ul className="space-y-2 text-sm">
                {[
                  ['Track Your Order', '/track'],
                  ['Shipping Policy', '/policies/shipping'],
                  ['Refund Policy', '/policies/refund'],
                  ['Privacy Policy', '/policies/privacy'],
                  ['Terms & Conditions', '/policies/terms'],
                ].map(([l, h]) => (
                  <li key={l}><Link to={h} className="text-gray-400 hover:text-green-400 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            {/* Account + Hours */}
            <div>
              <p className="font-bold text-white mb-4 text-sm uppercase tracking-wide">My Account</p>
              <ul className="space-y-2 text-sm mb-6">
                {isCustomer ? (
                  <>
                    <li><Link to="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors">My Orders</Link></li>
                    <li><Link to="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors">My Addresses</Link></li>
                    <li><Link to="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors">Loyalty Points</Link></li>
                    <li><Link to="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors">Saved Favourites</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/register" className="text-gray-400 hover:text-green-400 transition-colors">Create Account</Link></li>
                    <li><Link to="/login" className="text-gray-400 hover:text-green-400 transition-colors">Sign In</Link></li>
                  </>
                )}
              </ul>
              <div className="bg-green-800 rounded-xl p-4">
                <p className="text-xs font-bold text-white uppercase tracking-wide mb-2">Business Hours</p>
                <p className="text-sm text-gray-300">Mon – Sat</p>
                <p className="text-sm font-semibold text-white">8:00 AM – 6:00 PM PKT</p>
                <p className="text-xs text-gray-400 mt-2">Closed Sundays &amp; public holidays</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bg-green-950 py-4 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()} Al-Noor Rice Mills. All rights reserved. · Made with ❤️ in Batkhela, Pakistan
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {['COD', 'Bank Transfer', 'EasyPaisa', 'JazzCash'].map(p => (
                <span key={p} className="text-xs text-gray-400 bg-green-900 px-2.5 py-1 rounded-full">{p}</span>
              ))}
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {[['Privacy', '/policies/privacy'], ['Terms', '/policies/terms'], ['Refund', '/policies/refund'], ['Shipping', '/policies/shipping'], ['Sitemap', '/sitemap.xml']].map(([l, h]) => (
                <Link key={l} to={h} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── CART DRAWER ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
            <motion.div
              variants={slideRightVariants} initial="initial" animate="animate" exit="exit"
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
              style={{ willChange: 'transform' }}>
              {/* Cart header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart size={18} className="text-green-600" /> Your Cart
                  {totalItems > 0 && <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{totalItems} item{totalItems > 1 ? 's' : ''}</span>}
                </h2>
                <button onClick={() => setCartOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>

              {/* Cart items */}
              <motion.div
                variants={staggerFast} initial="initial" animate="animate"
                className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Package size={28} className="opacity-30" />
                    </div>
                    <p className="font-medium text-gray-600 mb-1">Your cart is empty</p>
                    <p className="text-sm text-gray-400 mb-4">Add some rice to get started</p>
                    <button onClick={() => setCartOpen(false)} className="text-sm text-green-600 hover:underline font-medium">
                      Browse Products →
                    </button>
                  </div>
                ) : (
                <AnimatePresence>
                {items.map(item => (
                  <motion.div
                    key={item.productId}
                    variants={staggerItem}
                    layout
                    exit={{ opacity: 0, x: 60, transition: fastTween }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.imageUrl
                        ? <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                        : <Wheat size={18} className="text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 mb-2">Grade {item.grade} · {formatPKR(item.pricePerKg)}/kg</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.productId, item.quantityKg - 5)}
                          className="w-6 h-6 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                          <Minus size={11} />
                        </button>
                        <span className="text-sm font-semibold w-14 text-center">{item.quantityKg}kg</span>
                        <button onClick={() => updateQty(item.productId, item.quantityKg + 5)}
                          className="w-6 h-6 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                          <Plus size={11} />
                        </button>
                        <button onClick={() => removeItem(item.productId)} className="ml-auto text-gray-300 hover:text-red-500 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="font-bold text-green-700 text-sm flex-shrink-0">{formatPKR(item.quantityKg * item.pricePerKg)}</p>
                  </motion.div>
                ))}
                </AnimatePresence>
                )}
              </motion.div>

              {/* Cart footer */}
              {items.length > 0 && (
                <div className="border-t px-4 py-4 space-y-3 bg-white">
                  {/* Promo code */}
                  <div className="flex gap-2">
                    <input type="text" value={discountCode} onChange={e => setDC(e.target.value.toUpperCase())}
                      placeholder="Promo code" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <button onClick={() => { if (discountCode) navigate(`/checkout`); }}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold rounded-xl transition-colors">
                      Apply
                    </button>
                  </div>
                  {/* Totals */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-semibold text-gray-900">{formatPKR(subtotal)}</span></div>
                    <div className="flex justify-between text-gray-400 text-xs">
                      <span className="flex items-center gap-1"><Truck size={11} /> Shipping</span>
                      <span>{subtotal >= (settings.freeShippingAbove || 10000) ? <span className="text-green-600 font-medium">FREE</span> : formatPKR(settings.shippingFee || 500)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-green-700">{formatPKR(subtotal >= (settings.freeShippingAbove || 10000) ? subtotal : subtotal + (settings.shippingFee || 500))}</span>
                  </div>
                  <button onClick={() => { setCartOpen(false); navigate('/checkout'); }}
                    className="w-full bg-amber-400 hover:bg-amber-500 text-green-900 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm shadow-lg">
                    Proceed to Checkout <ChevronRight size={16} />
                  </button>
                  <button onClick={() => setCartOpen(false)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-1">
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating chat widget */}
      <ChatWidget />
    </div>
  );
}

function NewsletterBar() {
  const [email, setEmail] = useState('');
  const [loading, setL]   = useState(false);
  const [done, setDone]   = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault(); setL(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      setDone(true); toast.success('Subscribed!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error subscribing');
    } finally { setL(false); }
  };

  if (done) return <p className="text-green-900 font-semibold">✅ You're subscribed! We'll keep you updated.</p>;

  return (
    <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com"
        className="flex-1 rounded-xl px-4 py-2.5 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-sm" />
      <button type="submit" disabled={loading}
        className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2 whitespace-nowrap">
        {loading ? 'Subscribing...' : <><ArrowRight size={14} /> Subscribe</>}
      </button>
    </form>
  );
}
