import { useEffect, useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, MessageCircle, Package, ArrowRight, Copy, Star, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../../components/PageTransition';
import { useCurrency } from '../../contexts/CurrencyContext';

// ─── Confetti particle
function Confetti({ color, x, delay }: { color: string; x: number; delay: number }) {
  return (
    <motion.div
      className="absolute top-0 w-2 h-3 rounded-sm"
      style={{ left: `${x}%`, backgroundColor: color }}
      initial={{ y: -20, rotate: 0, opacity: 1 }}
      animate={{ y: 300, rotate: 720, opacity: 0 }}
      transition={{ duration: 2.5, delay, ease: 'easeIn' }}
    />
  );
}

const CONFETTI_COLORS = ['#16a34a', '#fbbf24', '#ef4444', '#3b82f6', '#8b5cf6', '#f97316'];
const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  x: Math.random() * 90 + 5,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: Math.random() * 0.8,
}));

// ─── Animated SVG Truck
function TruckAnimation({ show }: { show: boolean }) {
  return (
    <div className="relative h-36 overflow-hidden">
      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-800 rounded-b-2xl">
        <motion.div
          animate={{ x: show ? [0, -120] : 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute top-3 left-0 right-0 flex gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-8 h-1 bg-yellow-400 rounded-full flex-shrink-0" />
          ))}
        </motion.div>
      </div>

      {/* Truck */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ x: '-120%' }}
            animate={{ x: '110%' }}
            transition={{ duration: 3.5, ease: [0.2, 0, 0.8, 1], delay: 0.3 }}
            className="absolute bottom-8 flex items-end">
            <svg width="180" height="80" viewBox="0 0 180 80" fill="none">
              {/* Trailer */}
              <rect x="0" y="15" width="110" height="50" rx="4" fill="#166534" />
              {/* Rice bag on trailer */}
              <rect x="10" y="20" width="30" height="35" rx="3" fill="#fbbf24" />
              <text x="13" y="42" fontSize="9" fill="#92400e" fontWeight="bold">🌾</text>
              <rect x="45" y="20" width="30" height="35" rx="3" fill="#fbbf24" />
              <text x="48" y="42" fontSize="9" fill="#92400e" fontWeight="bold">🌾</text>
              <rect x="80" y="22" width="25" height="33" rx="3" fill="#fbbf24" />
              <text x="83" y="42" fontSize="9" fill="#92400e" fontWeight="bold">🌾</text>
              {/* Cab */}
              <rect x="110" y="22" width="55" height="43" rx="4" fill="#14532d" />
              {/* Window */}
              <rect x="128" y="28" width="30" height="18" rx="3" fill="#93c5fd" />
              {/* Lights */}
              <rect x="162" y="30" width="8" height="5" rx="2" fill="#fbbf24" />
              <rect x="162" y="48" width="8" height="3" rx="1" fill="#ef4444" />
              {/* Exhaust */}
              <rect x="140" y="16" width="4" height="10" rx="2" fill="#374151" />
              {/* Al-Noor text */}
              <text x="20" y="70" fontSize="7" fill="white" fontWeight="bold">AL-NOOR RICE MILLS</text>
              {/* Wheels */}
              <circle cx="30" cy="68" r="12" fill="#1f2937" />
              <circle cx="30" cy="68" r="7" fill="#374151" />
              <circle cx="30" cy="68" r="3" fill="#6b7280" />
              <circle cx="90" cy="68" r="12" fill="#1f2937" />
              <circle cx="90" cy="68" r="7" fill="#374151" />
              <circle cx="90" cy="68" r="3" fill="#6b7280" />
              <circle cx="148" cy="68" r="12" fill="#1f2937" />
              <circle cx="148" cy="68" r="7" fill="#374151" />
              <circle cx="148" cy="68" r="3" fill="#6b7280" />
            </svg>
            {/* Speed lines */}
            <div className="absolute left-[-60px] bottom-10 flex flex-col gap-2">
              {[40, 60, 50].map((w, i) => (
                <motion.div key={i}
                  animate={{ opacity: [0.6, 0, 0.6], scaleX: [1, 0.3, 1] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                  className="h-0.5 bg-gray-400 rounded-full origin-right"
                  style={{ width: w }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const { state } = useLocation() as any;
  const { format } = useCurrency();
  const formatPKR = (n: number) => format(n || 0);
  const order = state?.order;
  const whatsappUrl = state?.whatsappUrl;
  const [showTruck, setShowTruck] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Sequence: checkmark → confetti → truck
    const t1 = setTimeout(() => setShowConfetti(true), 300);
    const t2 = setTimeout(() => setShowTruck(true), 800);
    const t3 = setTimeout(() => setShowContent(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const copy = () => { navigator.clipboard.writeText(orderNumber || ''); toast.success('Copied!'); };

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md relative">
        {/* Confetti burst */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {showConfetti && CONFETTI.map((c, i) => <Confetti key={i} {...c} />)}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-green-900/10 overflow-hidden border border-gray-100">
          {/* Green success header */}
          <div className="bg-gradient-to-br from-green-700 via-green-600 to-green-500 px-6 pt-8 pb-4 text-center text-white relative overflow-hidden">
            {/* Background circles */}
            {[80, 120, 160].map((s, i) => (
              <motion.div key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.08 }}
                transition={{ delay: i * 0.15, duration: 0.6, type: 'spring' }}
                className="absolute rounded-full border-2 border-white"
                style={{ width: s, height: s, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
            ))}

            {/* Checkmark */}
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 18 }}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 relative">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring', stiffness: 400 }}>
                <CheckCircle2 size={40} className="text-white" />
              </motion.div>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-2xl font-extrabold mb-1">Order Placed! 🎉</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-green-200 text-sm">Your rice is being prepared for dispatch</motion.p>
          </div>

          {/* Truck animation */}
          <div className="bg-green-50/50 px-2 pt-2">
            <TruckAnimation show={showTruck} />
          </div>

          <AnimatePresence>
            {showContent && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="p-6 space-y-4">
                {/* Order number */}
                <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5 font-medium">Order Number</p>
                    <p className="font-mono font-bold text-gray-900 text-lg tracking-wide">{orderNumber}</p>
                  </div>
                  <motion.button onClick={copy} whileTap={{ scale: 0.9 }}
                    className="p-2.5 text-gray-400 hover:text-green-700 hover:bg-green-100 rounded-xl transition-colors">
                    <Copy size={16} />
                  </motion.button>
                </div>

                {/* Order summary */}
                {order && (
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: 'Items', value: `${order.items?.length || 0}` },
                      { label: 'Total', value: formatPKR(order.totalAmount) },
                      { label: 'Payment', value: order.paymentStatus === 'paid' ? '✅ Paid' : '💵 COD' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5">{stat.label}</p>
                        <p className="font-bold text-gray-800 text-sm">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* What's next */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <p className="font-bold text-amber-800 flex items-center gap-2">📱 What happens next?</p>
                  {[
                    'We\'ll confirm your order within 1 hour during business hours',
                    'Your order will be dispatched same day if placed before 2 PM PKT',
                    'Track your delivery at /track using your order number',
                  ].map((step, i) => (
                    <motion.div key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }}
                      className="flex items-start gap-2 text-xs text-amber-700">
                      <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      {step}
                    </motion.div>
                  ))}
                </div>

                {/* Loyalty hint */}
                <div className="flex items-center gap-2.5 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700">
                  <Star size={14} className="text-amber-500 fill-amber-500 flex-shrink-0" />
                  <span>Loyalty points will be added to your account after delivery!</span>
                </div>

                {/* CTAs */}
                {whatsappUrl && (
                  <motion.a href={whatsappUrl} target="_blank" rel="noreferrer"
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-green-900/10">
                    <MessageCircle size={18} /> Confirm on WhatsApp
                  </motion.a>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Link to={`/track?order=${orderNumber}`}
                    className="flex items-center justify-center gap-1.5 py-3 border-2 border-gray-200 hover:border-green-400 text-gray-700 rounded-2xl text-sm font-semibold transition-colors">
                    <Package size={15} /> Track Order
                  </Link>
                  <Link to="/"
                    className="flex items-center justify-center gap-1.5 py-3 bg-green-700 hover:bg-green-800 text-white rounded-2xl text-sm font-bold transition-colors">
                    Shop More <ArrowRight size={15} />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
