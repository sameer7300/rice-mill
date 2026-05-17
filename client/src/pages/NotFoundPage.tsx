import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

// Animated truck tipped over with scattered rice sacks and crying farmer
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-green-50 flex flex-col items-center justify-center px-4 overflow-hidden">

      {/* Main Scene */}
      <div className="relative w-full max-w-sm h-72 mb-2">

        {/* Road */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gray-300 rounded-full opacity-30" />
        <div className="absolute bottom-3 left-1/4 right-1/4 h-1.5 bg-white rounded-full opacity-40" />

        {/* Tipped delivery truck */}
        <motion.g
          style={{ position: 'absolute', bottom: 8, left: '5%' }}
          initial={{ rotate: 0, x: 0 }}
          animate={{ rotate: -28, x: -10 }}
          transition={{ type: 'spring', damping: 6, stiffness: 80, delay: 0.3 }}
        >
          <svg width="160" height="90" viewBox="0 0 160 90" style={{ display: 'block' }}>
            {/* Truck body */}
            <rect x="10" y="20" width="100" height="55" rx="6" fill="#16a34a" />
            <rect x="10" y="20" width="35" height="55" rx="6" fill="#14532d" />
            {/* Cab window */}
            <rect x="14" y="26" width="27" height="20" rx="3" fill="#bfdbfe" opacity="0.8" />
            {/* Wheels */}
            <circle cx="35" cy="75" r="12" fill="#1f2937" />
            <circle cx="35" cy="75" r="6" fill="#4b5563" />
            <circle cx="100" cy="75" r="12" fill="#1f2937" />
            <circle cx="100" cy="75" r="6" fill="#4b5563" />
            {/* Al-Noor text on truck */}
            <text x="58" y="52" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">AL-NOOR</text>
            {/* Headlight */}
            <rect x="11" y="55" width="8" height="5" rx="1" fill="#fbbf24" />
          </svg>
        </motion.g>

        {/* Rice sacks scattered */}
        {[
          { x: 155, y: 200, rot: 15, delay: 0.5 },
          { x: 210, y: 215, rot: -20, delay: 0.65 },
          { x: 240, y: 195, rot: 35, delay: 0.8 },
          { x: 175, y: 230, rot: -8, delay: 0.55 },
        ].map(({ x, y, rot, delay }, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: x, top: y }}
            initial={{ y: -60, opacity: 0, rotate: 0 }}
            animate={{ y: 0, opacity: 1, rotate: rot }}
            transition={{ type: 'spring', damping: 8, stiffness: 120, delay }}
          >
            <svg width="36" height="28" viewBox="0 0 36 28">
              <ellipse cx="18" cy="14" rx="16" ry="12" fill="#d97706" />
              <ellipse cx="18" cy="14" rx="11" ry="8" fill="#b45309" />
              <line x1="6" y1="14" x2="30" y2="14" stroke="#92400e" strokeWidth="1.5" />
              <line x1="18" y1="2" x2="18" y2="26" stroke="#92400e" strokeWidth="1.5" />
              {/* Rice spilling */}
              {[...Array(6)].map((_, j) => (
                <circle key={j} cx={18 + (j - 3) * 5} cy={24 + (j % 2) * 3} r="1.5" fill="#fef3c7" />
              ))}
            </svg>
          </motion.div>
        ))}

        {/* Bouncing rice grains */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`grain-${i}`}
            className="absolute w-2 h-2.5 rounded-full bg-amber-200"
            style={{
              left: `${20 + i * 6.5}%`,
              top: `${50 + (i % 4) * 8}%`,
            }}
            animate={{
              y: [-8, 8, -8],
              opacity: [0.5, 1, 0.5],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 0.9 + i * 0.12,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Crying farmer (simple SVG character) */}
        <motion.div
          className="absolute"
          style={{ right: '5%', bottom: 12 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="70" height="100" viewBox="0 0 70 100">
              {/* Body */}
              <rect x="20" y="45" width="30" height="40" rx="6" fill="#16a34a" />
              {/* Head */}
              <circle cx="35" cy="32" r="18" fill="#fde68a" />
              {/* Hat */}
              <ellipse cx="35" cy="17" rx="22" ry="5" fill="#92400e" />
              <rect x="25" y="8" width="20" height="12" rx="3" fill="#92400e" />
              {/* Eyes — crying */}
              <circle cx="29" cy="30" r="2.5" fill="#1f2937" />
              <circle cx="41" cy="30" r="2.5" fill="#1f2937" />
              {/* Tear drops */}
              <motion.ellipse cx="27" cy="37" rx="2" ry="3" fill="#60a5fa" opacity="0.8"
                animate={{ y: [0, 5, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} />
              <motion.ellipse cx="39" cy="37" rx="2" ry="3" fill="#60a5fa" opacity="0.8"
                animate={{ y: [0, 5, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} />
              {/* Sad mouth */}
              <path d="M 27 40 Q 35 35 43 40" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* Arms */}
              <line x1="20" y1="55" x2="8" y2="70" stroke="#fde68a" strokeWidth="5" strokeLinecap="round" />
              <line x1="50" y1="55" x2="62" y2="70" stroke="#fde68a" strokeWidth="5" strokeLinecap="round" />
              {/* Hands covering face gesture */}
              <circle cx="8" cy="72" r="5" fill="#fde68a" />
              <circle cx="62" cy="72" r="5" fill="#fde68a" />
              {/* Legs */}
              <rect x="22" y="82" width="10" height="16" rx="4" fill="#1f2937" />
              <rect x="38" y="82" width="10" height="16" rx="4" fill="#1f2937" />
            </svg>
          </motion.div>
        </motion.div>

        {/* 404 steam/smoke puffs from truck */}
        {[0, 1, 2].map(i => (
          <motion.div
            key={`smoke-${i}`}
            className="absolute rounded-full bg-gray-300 opacity-50"
            style={{ left: `${18 + i * 4}%`, top: `${15 + i * 5}%`, width: 16 + i * 8, height: 16 + i * 8 }}
            animate={{ y: [-10, -30], opacity: [0.5, 0], scale: [1, 1.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Text content */}
      <motion.div
        className="text-center max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <motion.h1
          className="text-8xl font-black text-green-800 mb-2 leading-none"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          404
        </motion.h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Shipment Lost in the Fields</h2>
        <p className="text-gray-500 leading-relaxed mb-8">
          Our delivery truck took a wrong turn and spilled the rice. The page you're looking for has gone missing — but our mill is still running!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-2xl transition-colors shadow-md"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Home size={18} /> Go to Store
          </motion.button>
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-2xl border border-gray-200 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <ArrowLeft size={18} /> Go Back
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
