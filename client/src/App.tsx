import './i18n';
import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LangProvider } from './contexts/LangContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import { ChatProvider } from './contexts/ChatContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { TrackingProvider } from './contexts/TrackingContext';

// Admin layout + pages
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import MillOperations from './pages/MillOperations';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Finance from './pages/Finance';
import Users from './pages/Users';
import DashboardDataRequests from './pages/DashboardDataRequests';
import Analytics from './pages/Analytics';
import Agents from './pages/Agents';
import Ecommerce from './pages/Ecommerce';
import DashboardBlog from './pages/DashboardBlog';
import DashboardCareers from './pages/DashboardCareers';
import DashboardNewsletter from './pages/DashboardNewsletter';
import DashboardReviews from './pages/DashboardReviews';
import DashboardMessages from './pages/DashboardMessages';
import DashboardWholesale from './pages/DashboardWholesale';
import DashboardLoyalty from './pages/DashboardLoyalty';
import DashboardChat from './pages/DashboardChat';
import SupplierPortal from './pages/supplier/SupplierPortal';

// Public shop pages
import ShopLayout from './pages/shop/ShopLayout';
import Store from './pages/shop/Store';
import Checkout from './pages/shop/Checkout';
import OrderSuccess from './pages/shop/OrderSuccess';
import TrackOrder from './pages/shop/TrackOrder';
import RegisterPage from './pages/shop/RegisterPage';
import ProductDetail from './pages/shop/ProductDetail';
import ComparePage from './pages/shop/ComparePage';
import ForgotPasswordPage from './pages/shop/ForgotPasswordPage';
import ResetPasswordPage from './pages/shop/ResetPasswordPage';
import PoliciesIndex from './pages/shop/PoliciesIndex';
import PrivacyPolicyPage from './pages/shop/PrivacyPolicyPage';
import TermsPage from './pages/shop/TermsPage';
import RefundPolicyPage from './pages/shop/RefundPolicyPage';
import ShippingPolicyPage from './pages/shop/ShippingPolicyPage';
import SitemapPage from './pages/shop/SitemapPage';
import AboutPage from './pages/shop/AboutPage';
import ContactPage from './pages/shop/ContactPage';
import CareersPage from './pages/shop/CareersPage';
import BlogPage from './pages/shop/BlogPage';
import BlogPostPage from './pages/shop/BlogPostPage';
import WholesalePage from './pages/shop/WholesalePage';
import NotFoundPage from './pages/NotFoundPage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Back / forward button — let the browser restore the scroll position naturally
    if (navType === 'POP') return;

    if (hash) {
      // Hash link — scroll to that section (retry until it mounts)
      const id = hash.slice(1);
      const attempt = (tries = 0) => {
        const el = document.getElementById(id);
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
        if (tries < 10) setTimeout(() => attempt(tries + 1), 80);
      };
      attempt();
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash, navType]);
  return null;
}

// Thin amber progress bar at the top — plays on every route change
function TopLoader() {
  const { pathname } = useLocation();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    setVisible(true);
    setWidth(0);

    // Quickly sprint to 70%, then slow-cruise to 90%
    timers.current.push(setTimeout(() => setWidth(70), 60));
    timers.current.push(setTimeout(() => setWidth(90), 400));
    // Complete and fade out
    timers.current.push(setTimeout(() => setWidth(100), 650));
    timers.current.push(setTimeout(() => setVisible(false), 900));

    return () => timers.current.forEach(clearTimeout);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <motion.div
        className="h-[3px] origin-left"
        style={{
          width: `${width}%`,
          background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
          boxShadow: '0 0 8px rgba(251,191,36,0.7)',
          transition: width === 0 ? 'none' : width === 100 ? 'width 180ms ease-in' : 'width 320ms ease-out',
        }}
        animate={{ opacity: width === 100 ? [1, 0] : 1 }}
        transition={{ duration: 0.25, delay: width === 100 ? 0.1 : 0 }}
      />
    </div>
  );
}

function ChatWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const token = user ? (localStorage.getItem('token') ?? undefined) : undefined;
  return <ChatProvider token={token}>{children}</ChatProvider>;
}

function ProtectedRoute({ children, roles }: { children: any; roles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center animate-pulse">
          <span className="text-white text-xl">🌾</span>
        </div>
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <TopLoader />
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* ─── PUBLIC STOREFRONT ──────────────────────────────────────── */}
        <Route path="/" element={<ShopLayout />}>
          <Route index element={<Store />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:orderNumber" element={<OrderSuccess />} />
          <Route path="track" element={<TrackOrder />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="careers" element={<CareersPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="wholesale" element={<WholesalePage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="policies" element={<PoliciesIndex />} />
          <Route path="policies/privacy" element={<PrivacyPolicyPage />} />
          <Route path="policies/terms" element={<TermsPage />} />
          <Route path="policies/refund" element={<RefundPolicyPage />} />
          <Route path="policies/shipping" element={<ShippingPolicyPage />} />
          <Route path="sitemap" element={<SitemapPage />} />
          <Route path="policy" element={<Navigate to="/policies" replace />} />
          <Route path="account" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* ─── AUTH ───────────────────────────────────────────────────── */}
        <Route path="/login" element={
          user
            ? <Navigate to={user.role === 'supplier' ? '/supplier' : '/dashboard'} replace />
            : <Login />
        } />
        <Route path="/register" element={user ? <Navigate to="/account" replace /> : <RegisterPage />} />

        {/* ─── ADMIN DASHBOARD ────────────────────────────────────────── */}
        {/* Suppliers are never allowed into /dashboard — redirect them before Layout mounts */}
        <Route path="/dashboard" element={
          user?.role === 'supplier'
            ? <Navigate to="/supplier" replace />
            : <ProtectedRoute><Layout /></ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<ProtectedRoute roles={['admin', 'staff']}><Inventory /></ProtectedRoute>} />
          <Route path="mill" element={<ProtectedRoute roles={['admin', 'staff']}><MillOperations /></ProtectedRoute>} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<ProtectedRoute roles={['admin', 'staff']}><Customers /></ProtectedRoute>} />
          <Route path="suppliers" element={<ProtectedRoute roles={['admin', 'staff']}><Suppliers /></ProtectedRoute>} />
          <Route path="finance" element={<ProtectedRoute roles={['admin']}><Finance /></ProtectedRoute>} />
          <Route path="analytics" element={<ProtectedRoute roles={['admin']}><Analytics /></ProtectedRoute>} />
          <Route path="ecommerce" element={<ProtectedRoute roles={['admin']}><Ecommerce /></ProtectedRoute>} />
          <Route path="agents" element={<ProtectedRoute roles={['admin']}><Agents /></ProtectedRoute>} />
          <Route path="blog" element={<ProtectedRoute roles={['admin']}><DashboardBlog /></ProtectedRoute>} />
          <Route path="careers" element={<ProtectedRoute roles={['admin']}><DashboardCareers /></ProtectedRoute>} />
          <Route path="newsletter" element={<ProtectedRoute roles={['admin']}><DashboardNewsletter /></ProtectedRoute>} />
          <Route path="reviews" element={<ProtectedRoute roles={['admin', 'staff']}><DashboardReviews /></ProtectedRoute>} />
          <Route path="messages" element={<ProtectedRoute roles={['admin', 'staff']}><DashboardMessages /></ProtectedRoute>} />
          <Route path="wholesale" element={<ProtectedRoute roles={['admin', 'staff']}><DashboardWholesale /></ProtectedRoute>} />
          <Route path="loyalty" element={<ProtectedRoute roles={['admin']}><DashboardLoyalty /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
          <Route path="data-requests" element={<ProtectedRoute roles={['admin']}><DashboardDataRequests /></ProtectedRoute>} />
          <Route path="chat" element={<ProtectedRoute roles={['admin', 'staff']}><DashboardChat /></ProtectedRoute>} />
        </Route>

        {/* ─── SUPPLIER PORTAL ─────────────────────────────────────── */}
        <Route path="/supplier" element={
          <ProtectedRoute roles={['supplier']}>
            <SupplierPortal />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <CurrencyProvider>
        <CartProvider>
          <AuthProvider>
            <LangProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <TrackingProvider>
                <ChatWrapper>
                  <AppRoutes />
                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      duration: 3000,
                      style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px', fontWeight: 500 },
                      success: { iconTheme: { primary: '#16a34a', secondary: '#fff' }, duration: 3000 },
                      error: { iconTheme: { primary: '#dc2626', secondary: '#fff' }, duration: 5000 },
                    }}
                  />
                </ChatWrapper>
                </TrackingProvider>
              </BrowserRouter>
            </LangProvider>
          </AuthProvider>
        </CartProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
