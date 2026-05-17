import './i18n';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LangProvider } from './contexts/LangContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import { ChatProvider } from './contexts/ChatContext';

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
import AboutPage from './pages/shop/AboutPage';
import ContactPage from './pages/shop/ContactPage';
import CareersPage from './pages/shop/CareersPage';
import BlogPage from './pages/shop/BlogPage';
import BlogPostPage from './pages/shop/BlogPostPage';

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
          <Route path="compare" element={<ComparePage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="policies" element={<PoliciesIndex />} />
          <Route path="policies/privacy" element={<PrivacyPolicyPage />} />
          <Route path="policies/terms" element={<TermsPage />} />
          <Route path="policies/refund" element={<RefundPolicyPage />} />
          <Route path="policies/shipping" element={<ShippingPolicyPage />} />
          <Route path="policy" element={<Navigate to="/policies" replace />} />
          <Route path="account" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* ─── AUTH ───────────────────────────────────────────────────── */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/account" replace /> : <RegisterPage />} />

        {/* ─── ADMIN DASHBOARD ────────────────────────────────────────── */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
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
          <Route path="chat" element={<ProtectedRoute roles={['admin', 'staff']}><DashboardChat /></ProtectedRoute>} />
        </Route>

        {/* ─── SUPPLIER PORTAL ─────────────────────────────────────── */}
        <Route path="/supplier" element={
          <ProtectedRoute roles={['supplier']}>
            <SupplierPortal />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <CartProvider>
          <AuthProvider>
            <LangProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
              </BrowserRouter>
            </LangProvider>
          </AuthProvider>
        </CartProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
