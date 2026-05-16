import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Info, CheckCircle, TrendingUp, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  time?: string;
}

const icons = {
  warning: <AlertTriangle size={15} className="text-orange-500" />,
  info: <Info size={15} className="text-blue-500" />,
  success: <CheckCircle size={15} className="text-green-500" />
};

const colors = {
  warning: 'bg-orange-50 border-orange-100',
  info: 'bg-blue-50 border-blue-100',
  success: 'bg-green-50 border-green-100'
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [insights, setInsights] = useState<any[]>([]);
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const [sysRes, agentRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/agents/alerts/all').catch(() => ({ data: [] }))
      ]);
      const sysAlerts = sysRes.data.notifications || [];
      const agentAlerts = (agentRes.data || [])
        .filter((a: any) => !a.isRead)
        .slice(0, 5)
        .map((a: any) => ({
          id: `agent-${a.id}`,
          type: a.priority === 'critical' || a.priority === 'high' ? 'warning' : 'info',
          title: a.title,
          message: `${a.agent?.name}: ${a.message}`,
          time: a.createdAt
        }));
      setNotifications([...sysAlerts, ...agentAlerts]);
    } catch {}
  };

  const fetchInsights = async () => {
    try {
      const { data } = await api.get('/ai/insights');
      setInsights(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open && insights.length === 0) fetchInsights();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const visible = notifications.filter(n => !dismissed.has(n.id));
  const count = visible.length;

  const insightIcon = (type: string) => {
    if (type === 'warning') return <AlertTriangle size={13} className="text-orange-500" />;
    if (type === 'success') return <CheckCircle size={13} className="text-green-500" />;
    if (type === 'tip') return <TrendingUp size={13} className="text-blue-500" />;
    return <Info size={13} className="text-gray-500" />;
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-[360px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-600 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-600">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Notifications & Insights</h3>
              <div className="flex items-center gap-2">
                {count > 0 && (
                  <button onClick={() => setDismissed(new Set(notifications.map(n => n.id)))}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    Clear all
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {/* Alerts */}
              {visible.length > 0 && (
                <div className="p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Alerts</p>
                  {visible.map(n => (
                    <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border ${colors[n.type]}`}>
                      <span className="mt-0.5 flex-shrink-0">{icons[n.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      </div>
                      <button onClick={() => setDismissed(d => new Set([...d, n.id]))} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {visible.length === 0 && insights.length === 0 && (
                <div className="py-10 text-center text-gray-400">
                  <CheckCircle size={28} className="mx-auto mb-2 text-green-400" />
                  <p className="text-sm font-medium">All clear!</p>
                  <p className="text-xs mt-0.5">No alerts right now.</p>
                </div>
              )}

              {/* AI Insights */}
              {insights.length > 0 && (
                <div className="p-3 space-y-2 border-t border-gray-100 dark:border-slate-600">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">AI Insights</p>
                  {insights.slice(0, 4).map((ins: any, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                      <span className="mt-0.5 flex-shrink-0">{insightIcon(ins.type)}</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{ins.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ins.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {insights.length === 0 && open && (
                <div className="px-4 pb-3 border-t border-gray-100 dark:border-slate-600 pt-3">
                  <button onClick={fetchInsights} className="w-full text-xs text-green-600 hover:text-green-800 font-medium">
                    Load AI insights...
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 dark:border-slate-600 px-4 py-2.5">
              <button onClick={() => { navigate('/dashboard/analytics'); setOpen(false); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-green-600 hover:text-green-800 font-medium">
                View Analytics Dashboard <ExternalLink size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
