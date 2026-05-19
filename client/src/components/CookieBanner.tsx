import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, BarChart2, ChevronDown, ChevronUp, X } from 'lucide-react';

const CONSENT_KEY = 'alnoor_cookie_consent';

export interface ConsentState {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
  decidedAt: string;
}

export function getStoredConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function setStoredConsent(consent: Omit<ConsentState, 'essential' | 'decided' | 'decidedAt'>): ConsentState {
  const state: ConsentState = {
    essential: true,
    analytics: consent.analytics,
    marketing: consent.marketing,
    decided: true,
    decidedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  return state;
}

interface Props {
  onConsent: (consent: ConsentState) => void;
}

export default function CookieBanner({ onConsent }: Props) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored?.decided) {
      // Short delay so it doesn't flash on first render
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = (all: boolean) => {
    const consent = setStoredConsent({ analytics: all, marketing: all });
    setVisible(false);
    onConsent(consent);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Top bar */}
            <div className="flex items-start gap-3 p-5 pb-4">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Cookie size={18} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">We use cookies</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  We use essential cookies to make the site work and optional analytics cookies to understand how you use it. Your IP and location help us show the right currency and shipping rates.
                </p>
              </div>
              <button onClick={() => accept(false)} className="text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5" aria-label="Accept essential only">
                <X size={16} />
              </button>
            </div>

            {/* Expandable cookie categories */}
            <div className="px-5 pb-2">
              <button onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1.5 text-xs text-green-700 font-medium hover:text-green-900 transition-colors">
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {expanded ? 'Hide' : 'Show'} cookie categories
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="mt-3 space-y-2 pb-2">
                      {[
                        { icon: <Shield size={13} className="text-green-600" />, name: 'Essential', desc: 'Login, cart, checkout — required for the site to work.', always: true },
                        { icon: <BarChart2 size={13} className="text-blue-600" />, name: 'Analytics', desc: 'Page views, device type, location — helps us improve the site. No personal data sold.', always: false },
                        { icon: <Cookie size={13} className="text-amber-600" />, name: 'Marketing', desc: 'Future personalised offers. Not yet active.', always: false },
                      ].map(c => (
                        <div key={c.name} className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                          <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">{c.icon}</div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-700">{c.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{c.desc}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 mt-0.5 ${c.always ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                            {c.always ? 'Always on' : 'Optional'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 px-5 pb-5">
              <button onClick={() => accept(false)}
                className="flex-1 py-2.5 border-2 border-gray-200 hover:border-green-500 text-gray-700 hover:text-green-700 rounded-xl text-sm font-semibold transition-all">
                Accept Essential Only
              </button>
              <button onClick={() => accept(true)}
                className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-green-900/20">
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
