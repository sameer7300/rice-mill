import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, Package, Factory, ShoppingCart,
  Users, Truck, DollarSign, UserCog, X, ArrowRight, Hash
} from 'lucide-react';
import api from '../api';

interface CommandItem {
  id: string;
  type: 'page' | 'order' | 'customer' | 'supplier' | 'action';
  label: string;
  sub?: string;
  icon: React.ReactNode;
  action: () => void;
}

const PAGES: CommandItem[] = [
  { id: 'dash', type: 'page', label: 'Dashboard', icon: <LayoutDashboard size={16} />, action: () => {} },
  { id: 'inv', type: 'page', label: 'Inventory', icon: <Package size={16} />, action: () => {} },
  { id: 'mill', type: 'page', label: 'Mill Operations', icon: <Factory size={16} />, action: () => {} },
  { id: 'orders', type: 'page', label: 'Orders', icon: <ShoppingCart size={16} />, action: () => {} },
  { id: 'cust', type: 'page', label: 'Customers', icon: <Users size={16} />, action: () => {} },
  { id: 'supp', type: 'page', label: 'Suppliers', icon: <Truck size={16} />, action: () => {} },
  { id: 'fin', type: 'page', label: 'Finance', icon: <DollarSign size={16} />, action: () => {} },
  { id: 'ecom', type: 'page', label: 'E-Commerce', icon: <Hash size={16} />, action: () => {} },
  { id: 'analytics', type: 'page', label: 'Analytics', icon: <Hash size={16} />, action: () => {} },
  { id: 'users', type: 'page', label: 'Users', icon: <UserCog size={16} />, action: () => {} },
];

const PAGE_ROUTES: Record<string, string> = {
  dash: '/dashboard', inv: '/dashboard/inventory', mill: '/dashboard/mill',
  orders: '/dashboard/orders', cust: '/dashboard/customers', supp: '/dashboard/suppliers',
  fin: '/dashboard/finance', ecom: '/dashboard/ecommerce', analytics: '/dashboard/analytics', users: '/dashboard/users'
};

interface Props { open: boolean; onClose: () => void; }

export default function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommandItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(PAGES.map(p => ({ ...p, action: () => { navigate(PAGE_ROUTES[p.id]); onClose(); } })));
      return;
    }
    setSearching(true);
    const lower = q.toLowerCase();

    // Filter pages
    const pageResults = PAGES
      .filter(p => p.label.toLowerCase().includes(lower))
      .map(p => ({ ...p, action: () => { navigate(PAGE_ROUTES[p.id]); onClose(); } }));

    try {
      // Search orders, customers, suppliers in parallel
      const [orders, customers, suppliers] = await Promise.all([
        api.get(`/orders?q=${encodeURIComponent(q)}&limit=4`).then(r => r.data.orders || []).catch(() => []),
        api.get(`/customers?q=${encodeURIComponent(q)}&limit=4`).then(r => r.data.customers || []).catch(() => []),
        api.get(`/suppliers?q=${encodeURIComponent(q)}&limit=4`).then(r => r.data.suppliers || []).catch(() => []),
      ]);

      const orderItems: CommandItem[] = orders.map((o: any) => ({
        id: o.id, type: 'order' as const,
        label: o.orderNumber,
        sub: `${o.customer?.user?.name} — PKR ${o.totalAmount?.toLocaleString()} — ${o.status}`,
        icon: <ShoppingCart size={16} className="text-blue-500" />,
        action: () => { navigate('/orders'); onClose(); }
      }));

      const custItems: CommandItem[] = customers.map((c: any) => ({
        id: c.id, type: 'customer' as const,
        label: c.businessName,
        sub: `Customer — ${c.user?.email}`,
        icon: <Users size={16} className="text-green-500" />,
        action: () => { navigate('/customers'); onClose(); }
      }));

      const suppItems: CommandItem[] = suppliers.map((s: any) => ({
        id: s.id, type: 'supplier' as const,
        label: s.businessName,
        sub: `Supplier — ${s.user?.phone || s.user?.email}`,
        icon: <Truck size={16} className="text-orange-500" />,
        action: () => { navigate('/suppliers'); onClose(); }
      }));

      setResults([...pageResults, ...orderItems, ...custItems, ...suppItems]);
    } catch {
      setResults(pageResults);
    } finally {
      setSearching(false);
    }
  }, [navigate, onClose]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      search('');
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    setActiveIdx(0);
  }, [results]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') { onClose(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') { e.preventDefault(); results[activeIdx]?.action(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, activeIdx, onClose]);

  const typeLabel: Record<string, string> = {
    page: 'Page', order: 'Order', customer: 'Customer', supplier: 'Supplier', action: 'Action'
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-600 overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-slate-600">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search pages, orders, customers..."
                className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none"
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-md text-xs text-gray-500 dark:text-gray-400">Esc</kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {results.length === 0 && !searching && (
                <p className="text-center text-gray-400 text-sm py-8">No results for "{query}"</p>
              )}
              {results.map((item, i) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === activeIdx ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className={`flex-shrink-0 p-1.5 rounded-lg ${i === activeIdx ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-slate-600'}`}>
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${i === activeIdx ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-100'}`}>
                      {item.label}
                    </p>
                    {item.sub && <p className="text-xs text-gray-400 truncate">{item.sub}</p>}
                  </div>
                  <span className="text-xs text-gray-300 dark:text-gray-500 flex-shrink-0">{typeLabel[item.type]}</span>
                  {i === activeIdx && <ArrowRight size={14} className="text-green-500 flex-shrink-0" />}
                </button>
              ))}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-600 flex items-center gap-4 text-xs text-gray-400">
              <span><kbd className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs">↑↓</kbd> navigate</span>
              <span><kbd className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs">↵</kbd> open</span>
              <span><kbd className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs">Esc</kbd> close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
