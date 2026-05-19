import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Wheat, Mail, Phone, ArrowLeft, CheckCircle2, Lock, KeyRound } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import PageTransition from '../../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

type Method = 'email' | 'whatsapp';
type Step = 'choose' | 'input' | 'otp' | 'done';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>('email');
  const [step, setStep] = useState<Step>('choose');
  const [loading, setLoading] = useState(false);

  // Email flow
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // WhatsApp OTP flow
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setEmailSent(true);
      setStep('done');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { toast.error('Please enter your phone number'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password-whatsapp', { phone });
      setStep('otp');
      toast.success('OTP sent to your WhatsApp!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password-whatsapp', { phone, otp, password: newPassword });
      setStep('done');
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const isDone = step === 'done';

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
        <Helmet>
          <title>Forgot Password — Al-Noor Rice Mills</title>
        </Helmet>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="bg-green-100 p-4 rounded-full">
                {isDone
                  ? <CheckCircle2 size={40} className="text-green-600" />
                  : step === 'otp'
                  ? <KeyRound size={40} className="text-green-700" />
                  : method === 'whatsapp' && step === 'input'
                  ? <Phone size={40} className="text-green-700" />
                  : <Wheat size={40} className="text-green-700" />}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isDone
                ? method === 'email' ? 'Check Your Email' : 'Password Reset!'
                : step === 'otp'
                ? 'Enter OTP'
                : 'Forgot Password?'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isDone && method === 'email'
                ? `Reset link sent to ${email}. Check your inbox and spam folder.`
                : isDone && method === 'whatsapp'
                ? 'Your password has been reset. You can now sign in.'
                : step === 'otp'
                ? `Enter the 6-digit OTP sent to your WhatsApp (+${phone.replace(/\D/g, '')})`
                : step === 'choose'
                ? 'How would you like to recover your account?'
                : method === 'email'
                ? "Enter your email and we'll send you a reset link."
                : "Enter the phone number linked to your account."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Step: choose method */}
            {step === 'choose' && (
              <motion.div key="choose" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="space-y-3">
                <button onClick={() => { setMethod('email'); setStep('input'); }}
                  className="w-full flex items-center gap-4 border-2 border-green-200 hover:border-green-500 rounded-xl p-4 text-left transition-all group">
                  <div className="bg-green-100 group-hover:bg-green-200 p-3 rounded-lg transition-colors">
                    <Mail size={22} className="text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Recover via Email</p>
                    <p className="text-xs text-gray-500">We'll send a password reset link to your email</p>
                  </div>
                </button>

                <button onClick={() => { setMethod('whatsapp'); setStep('input'); }}
                  className="w-full flex items-center gap-4 border-2 border-green-200 hover:border-green-500 rounded-xl p-4 text-left transition-all group">
                  <div className="bg-green-100 group-hover:bg-green-200 p-3 rounded-lg transition-colors">
                    <Phone size={22} className="text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Recover via WhatsApp OTP</p>
                    <p className="text-xs text-gray-500">We'll send a 6-digit code to your WhatsApp</p>
                  </div>
                </button>
              </motion.div>
            )}

            {/* Step: email input */}
            {step === 'input' && method === 'email' && !emailSent && (
              <motion.form key="email-input" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="your@email.com" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button type="button" onClick={() => setStep('choose')}
                  className="w-full text-sm text-gray-500 hover:text-green-700 transition-colors">
                  ← Choose a different method
                </button>
              </motion.form>
            )}

            {/* Step: phone input */}
            {step === 'input' && method === 'whatsapp' && (
              <motion.form key="phone-input" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="03xx-xxxxxxx or +92xxx" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Enter the phone number linked to your account</p>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60">
                  {loading ? 'Sending OTP...' : 'Send WhatsApp OTP'}
                </button>
                <button type="button" onClick={() => setStep('choose')}
                  className="w-full text-sm text-gray-500 hover:text-green-700 transition-colors">
                  ← Choose a different method
                </button>
              </motion.form>
            )}

            {/* Step: OTP + new password */}
            {step === 'otp' && (
              <motion.form key="otp-input" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit OTP</label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" inputMode="numeric" maxLength={6} value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="123456" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6}
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Min. 6 characters" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Repeat new password" />
                  </div>
                </div>
                <button type="submit" disabled={loading || otp.length < 6}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button type="button" onClick={() => { setStep('input'); setOtp(''); }}
                  className="w-full text-sm text-gray-500 hover:text-green-700 transition-colors">
                  ← Resend OTP
                </button>
              </motion.form>
            )}

            {/* Step: done */}
            {isDone && (
              <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
                  {method === 'email' ? (
                    <>
                      <p className="font-semibold mb-1">Reset link sent!</p>
                      <p>The link expires in <strong>1 hour</strong>. If you don't see it, check your spam folder.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold mb-1">Password updated!</p>
                      <p>You can now sign in with your new password.</p>
                    </>
                  )}
                </div>
                {method === 'email' && (
                  <button onClick={() => { setStep('choose'); setEmailSent(false); setEmail(''); }}
                    className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    Try a different method
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-green-700 transition-colors">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
