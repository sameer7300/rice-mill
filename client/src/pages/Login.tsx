import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { Languages, Shield, AlertCircle, Eye, EyeOff, ArrowRight, Wheat } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';

function Grain({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute text-xl select-none pointer-events-none"
      style={{ left: x, top: y }}
      animate={{ y: [0, -18, 0], rotate: [0, 12, -12, 0], opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    >🌾</motion.div>
  );
}

const GRAINS = [
  { x: '8%',  y: '15%', d: 0 },   { x: '20%', y: '70%', d: 0.5 },
  { x: '35%', y: '25%', d: 1 },   { x: '50%', y: '80%', d: 1.5 },
  { x: '65%', y: '40%', d: 0.8 }, { x: '78%', y: '10%', d: 0.3 },
  { x: '88%', y: '60%', d: 1.2 }, { x: '12%', y: '85%', d: 0.6 },
  { x: '45%', y: '55%', d: 0.9 }, { x: '72%', y: '88%', d: 0.2 },
];

const DEMOS = [
  { role: 'Admin', email: 'admin@ricemill.pk', pw: 'admin123', icon: '👑', color: 'text-purple-300' },
  { role: 'Staff', email: 'staff@ricemill.pk', pw: 'password123', icon: '👷', color: 'text-blue-300' },
  { role: 'Customer', email: 'buyer@example.pk', pw: 'password123', icon: '🛒', color: 'text-green-300' },
];

export default function Login() {
  const { t } = useTranslation();
  const { login, loginDirect } = useAuth();
  const { toggleLang, lang } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [demoIdx, setDemoIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setDemoIdx(d => (d + 1) % DEMOS.length), 2800);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'REQUIRES_2FA') {
        setTempToken(err.tempToken);
        setRequires2FA(true);
        toast('Enter your 2FA code', { icon: '🔐' });
      } else if (err.response?.data?.lockedUntil) {
        setLockedUntil(err.response.data.lockedUntil);
        toast.error('Account temporarily locked');
      } else {
        toast.error(err.response?.data?.message || t('auth.invalidCreds'));
      }
    } finally { setLoading(false); }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/2fa/login', { tempToken, token: twoFACode });
      loginDirect(data.token, data.user);
      toast.success('Verified!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid 2FA code');
      setTwoFACode('');
    } finally { setLoading(false); }
  };

  return (
    <PageTransition>
    <div className="min-h-screen flex">
      {/* ── LEFT: Animated branding panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col"
        style={{ background: 'radial-gradient(ellipse at 30% 40%, #14532d 0%, #166534 45%, #15803d 100%)' }}>
        {GRAINS.map((g, i) => <Grain key={i} x={g.x} y={g.y} delay={g.d} />)}

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Top logo */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Wheat size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white">Al-Noor Rice Mills</p>
              <p className="text-green-300 text-xs">Est. 2010 · Batkhela, KPK</p>
            </div>
          </motion.div>

          {/* Center hero */}
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="text-9xl mb-6 block">🌾</motion.div>

            <motion.h2 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-4xl font-extrabold text-white mb-4 leading-tight">
              Pure Rice,<br /><span className="text-amber-400">Direct from Mill</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-green-200 text-base max-w-xs mx-auto leading-relaxed">
              Pakistan's finest Basmati &amp; Super Kernel — freshly milled, fairly priced
            </motion.p>

            {/* Stats row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="flex justify-center gap-10 mt-8">
              {[['15+', 'Years'], ['6', 'Varieties'], ['500+', 'Buyers']].map(([n, l]) => (
                <div key={l}>
                  <p className="text-3xl font-extrabold text-amber-400 leading-none">{n}</p>
                  <p className="text-green-300 text-xs mt-1">{l}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Demo account switcher */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="rounded-2xl p-4 border border-white/20"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
            <p className="text-green-300 text-xs font-bold uppercase tracking-wider mb-3">Demo Accounts</p>
            <AnimatePresence mode="wait">
              <motion.div key={demoIdx}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3">
                <span className="text-3xl">{DEMOS[demoIdx].icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${DEMOS[demoIdx].color}`}>{DEMOS[demoIdx].role}</p>
                  <p className="text-white/70 text-xs font-mono truncate">{DEMOS[demoIdx].email}</p>
                </div>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => { setEmail(DEMOS[demoIdx].email); setPassword(DEMOS[demoIdx].pw); }}
                  className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl font-semibold transition-colors">
                  Use <ArrowRight size={11} />
                </motion.button>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-1.5 mt-3 justify-center">
              {DEMOS.map((_, i) => (
                <motion.button key={i} onClick={() => setDemoIdx(i)}
                  animate={{ width: i === demoIdx ? 20 : 6 }}
                  className={`h-1.5 rounded-full transition-colors ${i === demoIdx ? 'bg-amber-400' : 'bg-white/30'}`} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT: Form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white min-h-screen">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center shadow-lg">
            <Wheat size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">Al-Noor Rice Mills</p>
            <p className="text-xs text-gray-400">Batkhela, Malakand, KPK</p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {/* 2FA Screen */}
            {requires2FA ? (
              <motion.div key="2fa"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="text-center mb-8">
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                    <Shield size={36} className="text-green-700" />
                  </motion.div>
                  <h1 className="text-2xl font-bold text-gray-900">Two-Factor Auth</h1>
                  <p className="text-gray-500 text-sm mt-1">Enter the 6-digit code from your app</p>
                </div>
                <form onSubmit={handle2FA} className="space-y-5">
                  <input type="text" value={twoFACode}
                    onChange={e => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6} autoFocus required
                    className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl px-4 py-5 text-center text-3xl font-mono tracking-[0.5em] outline-none transition-colors"
                    placeholder="——————" />
                  <motion.button type="submit" disabled={loading || twoFACode.length !== 6}
                    whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}
                    className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-50 transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2">
                    {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</> : 'Verify & Sign In'}
                  </motion.button>
                  <button type="button" onClick={() => { setRequires2FA(false); setTwoFACode(''); }}
                    className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">← Back to login</button>
                </form>
              </motion.div>
            ) : (
              /* Normal Login */
              <motion.div key="login"
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                <div className="mb-8">
                  <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
                  <p className="text-gray-500 mt-1 text-sm">Sign in to your Al-Noor account</p>
                </div>

                <AnimatePresence>
                  {lockedUntil && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5">
                      <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-700">Account Locked</p>
                        <p className="text-xs text-red-500 mt-0.5">Retry after {new Date(lockedUntil).toLocaleTimeString()}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      disabled={!!lockedUntil}
                      className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl px-4 py-3.5 text-sm outline-none transition-colors bg-gray-50 focus:bg-white disabled:opacity-50"
                      placeholder="admin@ricemill.pk" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-semibold text-gray-700">Password</label>
                      <Link to="/forgot-password" className="text-xs text-green-700 hover:text-green-900 font-semibold">Forgot?</Link>
                    </div>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                        required disabled={!!lockedUntil}
                        className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl px-4 py-3.5 text-sm pr-12 outline-none transition-colors bg-gray-50 focus:bg-white disabled:opacity-50"
                        placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPw(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <motion.button type="submit" disabled={loading || !!lockedUntil}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-900/20 mt-2">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
                      : <>Sign In <ArrowRight size={17} /></>
                    }
                  </motion.button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                  New here?{' '}
                  <Link to="/register" className="text-green-700 font-bold hover:text-green-900">Create account →</Link>
                </p>

                <div className="flex items-center justify-center gap-4 mt-4">
                  <button onClick={toggleLang} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
                    <Languages size={13} /> {lang === 'en' ? 'اردو' : 'English'}
                  </button>
                  <span className="text-gray-200">|</span>
                  <Link to="/" className="text-xs text-gray-400 hover:text-green-700">← Visit Store</Link>
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
