import { useState } from 'react';
import PhoneInput from '../../components/ui/PhoneInput';
import { Link, useNavigate } from 'react-router-dom';
import { Wheat, Eye, EyeOff, ArrowRight, CheckCircle2, Star, Package, Gift, Mail, Phone, KeyRound, ShieldCheck } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useTracking } from '../../contexts/TrackingContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import PageTransition from '../../components/PageTransition';

type Channel = 'email' | 'whatsapp';
type Step = 'method' | 'form' | 'otp' | 'done';

const PERKS = [
  { icon: <Package size={16} />, text: 'Track all your orders in real-time' },
  { icon: <Star size={16} />, text: 'Earn loyalty points on every purchase' },
  { icon: <Gift size={16} />, text: 'Refer friends and earn bonus points' },
  { icon: <CheckCircle2 size={16} />, text: 'Save addresses for faster checkout' },
];

function StrengthBar({ pw }: { pw: string }) {
  const score = [/.{6,}/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(pw)).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
  if (!pw) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`text-xs ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-orange-500' : score === 3 ? 'text-yellow-600' : 'text-green-600'}`}>
        {labels[score]} password
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const { loginDirect } = useAuth();
  const { geo } = useTracking();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('method');
  const [channel, setChannel] = useState<Channel>('email');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '', referralCode: ''
  });
  const inp = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const otpTarget = channel === 'email' ? form.email : form.phone;

  const validateForm = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return false; }
    if (!form.email.trim()) { toast.error('Email is required'); return false; }
    if (channel === 'whatsapp' && !form.phone.trim()) {
      toast.error('Phone number is required for WhatsApp verification'); return false;
    }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return false; }
    return true;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await api.post('/auth/send-registration-otp', {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        channel,
      });
      setStep('otp');
      toast.success(`OTP sent to your ${channel === 'email' ? 'email' : 'WhatsApp'}!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        referralCode: form.referralCode || undefined,
        otp,
        otpChannel: channel,
      });
      loginDirect(data.token, data.user);
      setStep('done');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await api.post('/auth/send-registration-otp', {
        name: form.name, email: form.email,
        phone: form.phone || undefined, channel,
      });
      toast.success('New OTP sent!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally { setLoading(false); }
  };

  return (
    <PageTransition>
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)' }}>
        {[...Array(5)].map((_, i) => (
          <motion.div key={i}
            animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
            className="absolute rounded-full border border-white"
            style={{ width: 100 + i * 80, height: 100 + i * 80, right: -50 - i * 30, top: '50%', transform: 'translateY(-50%)' }}
          />
        ))}
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Wheat size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white">Al-Noor Rice Mills</p>
              <p className="text-green-300 text-xs">Batkhela, Malakand, KPK</p>
            </div>
          </motion.div>
        </div>
        <div className="relative z-10 text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }} className="text-8xl mb-5">🌾</motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-3xl font-extrabold text-white mb-3">Join Al-Noor<br /><span className="text-amber-400">Rice Family</span></motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-green-200 text-sm max-w-xs mx-auto">Fresh, quality rice delivered to your door from our Batkhela mill</motion.p>
        </div>
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="relative z-10 space-y-2.5">
          {PERKS.map(perk => (
            <motion.div key={perk.text} variants={staggerItem}
              className="flex items-center gap-3 p-3 rounded-xl border border-white/15"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
              <div className="w-7 h-7 bg-amber-400/20 rounded-lg flex items-center justify-center text-amber-400 flex-shrink-0">
                {perk.icon}
              </div>
              <p className="text-green-100 text-sm">{perk.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center shadow-lg">
            <Wheat size={18} className="text-white" />
          </div>
          <div><p className="font-bold text-gray-900">Al-Noor Rice Mills</p><p className="text-xs text-gray-400">Batkhela, KPK</p></div>
        </div>

        {/* Step progress dots */}
        {step !== 'done' && (
          <div className="flex items-center gap-2 mb-8">
            {(['method', 'form', 'otp'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  step === s ? 'bg-green-600 scale-125' :
                  (['method', 'form', 'otp'] as Step[]).indexOf(step) > i ? 'bg-green-400' : 'bg-gray-200'
                }`} />
                {i < 2 && <div className={`w-8 h-0.5 transition-all duration-300 ${(['method', 'form', 'otp'] as Step[]).indexOf(step) > i ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">

            {/* ── Step: method ── */}
            {step === 'method' && (
              <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-7">
                  <h1 className="text-3xl font-extrabold text-gray-900">Create Account</h1>
                  <p className="text-gray-500 text-sm mt-1">How would you like to verify your identity?</p>
                </div>

                <div className="space-y-3 mb-6">
                  <button onClick={() => setChannel('email')}
                    className={`w-full flex items-center gap-4 border-2 rounded-2xl p-4 text-left transition-all ${channel === 'email' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                    <div className={`p-3 rounded-xl transition-colors ${channel === 'email' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Mail size={22} className={channel === 'email' ? 'text-green-700' : 'text-gray-500'} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">Verify via Email OTP</p>
                      <p className="text-xs text-gray-500 mt-0.5">A 6-digit code will be sent to your email</p>
                    </div>
                    {channel === 'email' && <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-white rounded-full" /></div>}
                  </button>

                  <button onClick={() => setChannel('whatsapp')}
                    className={`w-full flex items-center gap-4 border-2 rounded-2xl p-4 text-left transition-all ${channel === 'whatsapp' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                    <div className={`p-3 rounded-xl transition-colors ${channel === 'whatsapp' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Phone size={22} className={channel === 'whatsapp' ? 'text-green-700' : 'text-gray-500'} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">Verify via WhatsApp OTP</p>
                      <p className="text-xs text-gray-500 mt-0.5">A 6-digit code will be sent to your WhatsApp</p>
                    </div>
                    {channel === 'whatsapp' && <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-white rounded-full" /></div>}
                  </button>
                </div>

                <motion.button onClick={() => setStep('form')}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-900/20">
                  Continue <ArrowRight size={17} />
                </motion.button>

                <p className="text-center text-sm text-gray-500 mt-5">
                  Already have an account?{' '}
                  <Link to="/login" className="text-green-700 font-bold hover:text-green-900">Sign in →</Link>
                </p>
              </motion.div>
            )}

            {/* ── Step: form ── */}
            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h1 className="text-2xl font-extrabold text-gray-900">Your Details</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Verification via{' '}
                    <span className="font-semibold text-green-700">{channel === 'email' ? 'Email OTP' : 'WhatsApp OTP'}</span>
                    {' '}· <button onClick={() => setStep('method')} className="text-gray-400 hover:text-green-700 underline text-xs">change</button>
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name *</label>
                    <input type="text" value={form.name} onChange={e => inp('name', e.target.value)} required
                      className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl px-4 py-3 text-sm outline-none transition-colors bg-gray-50 focus:bg-white"
                      placeholder="Muhammad Ali" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email *</label>
                    <input type="email" value={form.email} onChange={e => inp('email', e.target.value)} required
                      className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl px-4 py-3 text-sm outline-none transition-colors bg-gray-50 focus:bg-white"
                      placeholder="you@example.com" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className={channel === 'whatsapp' ? 'col-span-2' : 'col-span-2 sm:col-span-1'}>
                      <PhoneInput
                        label={channel === 'whatsapp' ? 'WhatsApp Phone *' : 'Phone (optional)'}
                        value={form.phone}
                        onChange={v => inp('phone', v)}
                        placeholder="3001234567"
                        defaultIso={geo?.countryCode || undefined}
                      />
                    </div>
                    {channel !== 'whatsapp' && (
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Referral Code</label>
                        <input type="text" value={form.referralCode} onChange={e => inp('referralCode', e.target.value.toUpperCase())}
                          className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl px-4 py-3 text-sm outline-none transition-colors bg-gray-50 focus:bg-white font-mono uppercase"
                          placeholder="RM-XXXXX" />
                      </div>
                    )}
                  </div>

                  {channel === 'whatsapp' && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Referral Code</label>
                      <input type="text" value={form.referralCode} onChange={e => inp('referralCode', e.target.value.toUpperCase())}
                        className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl px-4 py-3 text-sm outline-none transition-colors bg-gray-50 focus:bg-white font-mono uppercase"
                        placeholder="RM-XXXXX (optional)" />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Password *</label>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => inp('password', e.target.value)} required minLength={6}
                        className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl px-4 py-3 text-sm pr-11 outline-none transition-colors bg-gray-50 focus:bg-white"
                        placeholder="Min. 6 characters" />
                      <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {form.password && <StrengthBar pw={form.password} />}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Confirm Password *</label>
                    <input type="password" value={form.confirm} onChange={e => inp('confirm', e.target.value)} required
                      className={`w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none transition-colors bg-gray-50 focus:bg-white ${form.confirm && form.confirm !== form.password ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-green-500'}`}
                      placeholder="Repeat password" />
                    <AnimatePresence>
                      {form.confirm && form.confirm !== form.password && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="text-xs text-red-500 mt-1">Passwords do not match</motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-900/20 mt-2">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending OTP...</>
                      : <>{channel === 'email' ? <Mail size={16} /> : <Phone size={16} />} Send Verification Code <ArrowRight size={17} /></>
                    }
                  </motion.button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-4">
                  By registering you agree to our{' '}
                  <Link to="/policies/privacy" className="underline hover:text-gray-600">Privacy Policy</Link> &amp;{' '}
                  <Link to="/policies/terms" className="underline hover:text-gray-600">Terms</Link>
                </p>
                <p className="text-center text-sm text-gray-500 mt-3">
                  Already have an account?{' '}
                  <Link to="/login" className="text-green-700 font-bold hover:text-green-900">Sign in →</Link>
                </p>
              </motion.div>
            )}

            {/* ── Step: otp ── */}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-7 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {channel === 'email' ? <Mail size={30} className="text-green-700" /> : <Phone size={30} className="text-green-700" />}
                  </div>
                  <h1 className="text-2xl font-extrabold text-gray-900">Enter OTP</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    We sent a 6-digit code to your{' '}
                    <span className="font-semibold text-gray-700">
                      {channel === 'email' ? form.email : otpTarget}
                    </span>
                  </p>
                </div>

                <form onSubmit={handleVerifyAndRegister} className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block text-center">6-Digit Code</label>
                    <input
                      type="text" inputMode="numeric" maxLength={6}
                      value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required autoFocus
                      className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl px-4 py-4 text-3xl text-center font-mono tracking-[0.5em] outline-none transition-colors bg-gray-50 focus:bg-white"
                      placeholder="••••••"
                    />
                    <p className="text-xs text-gray-400 text-center mt-2">Code expires in 10 minutes</p>
                  </div>

                  <motion.button type="submit" disabled={loading || otp.length < 6}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-900/20">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating Account...</>
                      : <><ShieldCheck size={17} /> Verify &amp; Create Account</>
                    }
                  </motion.button>

                  <div className="flex items-center justify-between text-sm">
                    <button type="button" onClick={() => { setStep('form'); setOtp(''); }}
                      className="text-gray-400 hover:text-green-700 transition-colors">
                      ← Edit details
                    </button>
                    <button type="button" onClick={handleResendOtp} disabled={loading}
                      className="text-gray-400 hover:text-green-700 transition-colors disabled:opacity-40">
                      Resend OTP
                    </button>
                  </div>
                </form>

                <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <KeyRound size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      {channel === 'email'
                        ? 'Check your inbox and spam folder. The code is valid for 10 minutes.'
                        : 'Check your WhatsApp messages. Make sure your number is registered on WhatsApp.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step: done ── */}
            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                  className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} className="text-green-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Al-Noor!</h2>
                <p className="text-gray-500 text-sm">Your account is verified and ready. Taking you to your dashboard...</p>
                <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mt-6" />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
