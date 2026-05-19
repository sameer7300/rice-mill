import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationCenter from './NotificationCenter';
import CommandPalette from './CommandPalette';
import AIAssistant from './AIAssistant';
import {
  LayoutDashboard, Package, Factory, ShoppingCart,
  Users, Truck, DollarSign, UserCog, LogOut,
  Menu, Languages, Wheat, ChevronRight, BarChart3, Moon, Sun, Search, Bot, Globe,
  BookOpen, Briefcase, Mail, Star, MessageCircle, MessageSquare, Gift, Handshake, ExternalLink, Shield
} from 'lucide-react';
import { useChat } from '../contexts/ChatContext';

const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/inventory': 'Inventory', '/dashboard/mill': 'Mill Operations',
  '/dashboard/orders': 'Orders', '/dashboard/customers': 'Customers',
  '/dashboard/suppliers': 'Suppliers', '/dashboard/finance': 'Finance',
  '/dashboard/users': 'Users', '/dashboard/analytics': 'Analytics',
  '/dashboard/agents': 'AI Agents', '/dashboard/ecommerce': 'E-Commerce',
  '/dashboard/blog': 'Blog', '/dashboard/careers': 'Careers', '/dashboard/newsletter': 'Newsletter',
  '/dashboard/reviews': 'Reviews', '/dashboard/messages': 'Messages',
  '/dashboard/wholesale': 'Wholesale Inquiries', '/dashboard/loyalty': 'Loyalty Program',
  '/dashboard/chat': 'Live Chat', '/dashboard/data-requests': 'Data Requests',
};

export default function Layout() {
  const { t } = useTranslation();
  const { user, logout, isAdmin, isStaff, isCustomer } = useAuth();
  const { adminUnreadCount } = useChat();
  const { toggleLang, lang } = useLang();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Global Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  // Supplier role has its own portal layout — never use admin sidebar
  if (user?.role === 'supplier') return null;

  type NavLinkItem = { to: string; icon: JSX.Element; label: string; show: boolean; badge?: number };
  const links: NavLinkItem[] = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: t('nav.dashboard'), show: true },
    { to: '/dashboard/inventory', icon: <Package size={18} />, label: t('nav.inventory'), show: isStaff },
    { to: '/dashboard/mill', icon: <Factory size={18} />, label: t('nav.mill'), show: isStaff },
    { to: '/dashboard/orders', icon: <ShoppingCart size={18} />, label: t('nav.orders'), show: true },
    { to: '/dashboard/customers', icon: <Users size={18} />, label: t('nav.customers'), show: isStaff },
    { to: '/dashboard/suppliers', icon: <Truck size={18} />, label: t('nav.suppliers'), show: isStaff },
    { to: '/dashboard/finance', icon: <DollarSign size={18} />, label: t('nav.finance'), show: isAdmin },
    { to: '/dashboard/analytics', icon: <BarChart3 size={18} />, label: 'Analytics', show: isAdmin },
    { to: '/dashboard/ecommerce', icon: <Globe size={18} />, label: 'E-Commerce', show: isAdmin },
    { to: '/dashboard/agents', icon: <Bot size={18} />, label: 'AI Agents', show: isAdmin },
    { to: '/dashboard/blog', icon: <BookOpen size={18} />, label: 'Blog', show: isAdmin },
    { to: '/dashboard/careers', icon: <Briefcase size={18} />, label: 'Careers', show: isAdmin },
    { to: '/dashboard/newsletter', icon: <Mail size={18} />, label: 'Newsletter', show: isAdmin },
    { to: '/dashboard/reviews', icon: <Star size={18} />, label: 'Reviews', show: isStaff },
    { to: '/dashboard/messages', icon: <MessageCircle size={18} />, label: 'Messages', show: isStaff },
    { to: '/dashboard/chat', icon: <MessageSquare size={18} />, label: 'Live Chat', show: isStaff, badge: adminUnreadCount || 0 },
    { to: '/dashboard/wholesale', icon: <Handshake size={18} />, label: 'Wholesale', show: isStaff },
    { to: '/dashboard/loyalty', icon: <Gift size={18} />, label: 'Loyalty', show: isAdmin },
    { to: '/dashboard/users', icon: <UserCog size={18} />, label: t('nav.users'), show: isAdmin },
    { to: '/dashboard/data-requests', icon: <Shield size={18} />, label: 'Data Requests', show: isAdmin },
  ].filter(l => l.show);

  const currentPage = BREADCRUMBS[location.pathname] || '';

  const SidebarContent = () => (
    <>
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-gray-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-900/50">
          <Wheat size={17} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold text-sm text-white">Al-Noor Rice Mills</div>
            <div className="text-xs text-gray-400">Pakistan 🇵🇰</div>
          </div>
        )}
      </div>
      <nav className="flex-1 py-2 overflow-y-auto px-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} title={link.label}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all mb-0.5 ${collapsed ? 'justify-center' : ''} ${
                isActive ? 'bg-green-600 text-white shadow-lg shadow-green-900/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }>
            <span className="flex-shrink-0 relative">
              {link.icon}
              {collapsed && !!link.badge && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none">
                  {link.badge > 9 ? '9+' : link.badge}
                </span>
              )}
            </span>
            {!collapsed && <span className="font-medium truncate flex-1">{link.label}</span>}
            {!collapsed && !!link.badge && (
              <span className="ml-auto flex-shrink-0 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {link.badge > 9 ? '9+' : link.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gray-800 p-2 space-y-0.5 flex-shrink-0">
        {!collapsed && (
          <div className="px-3 py-1.5 text-xs">
            <p className="font-medium text-gray-400 truncate">{user?.name}</p>
            <p className="capitalize text-gray-600">{user?.role}</p>
          </div>
        )}
        <a href="/" target="_blank" rel="noreferrer" title={collapsed ? 'Visit Store' : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <ExternalLink size={16} className="flex-shrink-0" />
          {!collapsed && <span>Visit Store</span>}
        </a>
        <button onClick={toggleLang} title={collapsed ? (lang === 'en' ? 'اردو' : 'English') : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <Languages size={16} className="flex-shrink-0" />
          {!collapsed && <span>{lang === 'en' ? 'اردو' : 'English'}</span>}
        </button>
        <button onClick={handleLogout} title={collapsed ? 'Logout' : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>{t('nav.logout')}</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'dark' : ''}`}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed left-0 top-0 h-full w-64 bg-gray-900 flex flex-col z-50 lg:hidden shadow-2xl">
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex ${collapsed ? 'w-16' : 'w-60'} bg-gray-900 flex-col transition-all duration-200 flex-shrink-0`}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-gray-50 dark:bg-slate-900">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between px-5 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile: open drawer. Desktop: collapse sidebar */}
            <button onClick={() => { if (window.innerWidth < 1024) setMobileOpen(v => !v); else setCollapsed(c => !c); }}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Menu size={19} />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400">
              <span>Home</span>
              {currentPage && <><ChevronRight size={14} /><span className="text-gray-700 dark:text-gray-200 font-medium">{currentPage}</span></>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cmd+K Search button */}
            <button onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-xl text-xs text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
              <Search size={13} />
              <span>Search</span>
              <kbd className="bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded px-1 text-[10px]">⌘K</kbd>
            </button>

            {/* Dark mode toggle */}
            <button onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification center (admin/staff only) */}
            {isStaff && <NotificationCenter />}

            {/* User avatar */}
            <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Global overlays */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <AIAssistant />
    </div>
  );
}
