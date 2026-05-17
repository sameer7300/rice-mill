import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

// Canvas-based rice grain particle field — lightweight, looks real
function GrainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    type Grain = {
      x: number; y: number; vx: number; vy: number;
      w: number; h: number; angle: number; va: number; opacity: number;
    };

    const grains: Grain[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3 + 0.1,
      w: 3 + Math.random() * 5,
      h: 8 + Math.random() * 12,
      angle: Math.random() * Math.PI * 2,
      va: (Math.random() - 0.5) * 0.015,
      opacity: 0.15 + Math.random() * 0.35,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());

      for (const g of grains) {
        g.x += g.vx;
        g.y += g.vy;
        g.angle += g.va;
        if (g.y > H() + 20) { g.y = -20; g.x = Math.random() * W(); }
        if (g.x < -20) g.x = W() + 20;
        if (g.x > W() + 20) g.x = -20;

        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.angle);
        ctx.globalAlpha = g.opacity;

        // Draw a rice grain: gold ellipse with subtle highlight
        const grd = ctx.createLinearGradient(-g.w / 2, -g.h / 2, g.w / 2, g.h / 2);
        grd.addColorStop(0, '#fef3c7');
        grd.addColorStop(0.4, '#fbbf24');
        grd.addColorStop(1, '#d97706');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(0, 0, g.w / 2, g.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.7 }} />;
}

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #052e16 0%, #064e3b 40%, #0a2818 100%)' }}>

      {/* Grain particle field */}
      <GrainCanvas />

      {/* Radial glow behind the 404 */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">

        {/* 404 */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="block font-black leading-none select-none"
            style={{
              fontSize: 'clamp(120px, 25vw, 240px)',
              background: 'linear-gradient(160deg, #fef9c3 10%, #fbbf24 45%, #f59e0b 65%, #fef3c7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.04em',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 48px rgba(251,191,36,0.35)) drop-shadow(0 0 96px rgba(251,191,36,0.15))',
            }}
          >
            404
          </span>
        </motion.div>

        {/* Divider line */}
        <motion.div
          className="w-20 h-px bg-amber-400/40 mb-8"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-green-300 text-base sm:text-lg max-w-sm mx-auto leading-relaxed mb-10">
            The route you followed doesn't exist. Our mill is still running — head back to the store.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-8 py-3.5 font-bold rounded-2xl text-sm transition-all"
              style={{ background: '#fbbf24', color: '#052e16' }}
              whileHover={{ scale: 1.03, background: '#fcd34d' } as any}
              whileTap={{ scale: 0.97 }}
            >
              <Home size={16} /> Go to Store
            </motion.button>
            <motion.button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-8 py-3.5 font-bold rounded-2xl text-sm border border-white/15 text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.06)' }}
              whileHover={{ background: 'rgba(255,255,255,0.12)' } as any}
              whileTap={{ scale: 0.97 }}
            >
              <ArrowLeft size={16} /> Go Back
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Bottom brand */}
      <motion.p
        className="absolute bottom-7 text-green-600 text-xs tracking-widest uppercase font-semibold z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Al-Noor Rice Mills · Batkhela
      </motion.p>
    </div>
  );
}
