import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Wheat, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import PageTransition from '../../components/PageTransition';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setL]           = useState(false);
  const [done, setDone]           = useState(false);

  if (!token) return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <p className="text-red-600 font-semibold mb-4">Invalid or missing reset link.</p>
        <Link to="/forgot-password" className="text-green-700 hover:underline text-sm">Request a new one →</Link>
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Minimum 6 characters'); return; }
    setL(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Link expired. Please request a new one.');
    } finally { setL(false); }
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <Helmet><title>Reset Password — Al-Noor Rice Mills</title></Helmet>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-green-100 p-4 rounded-full">
              {done ? <CheckCircle2 size={40} className="text-green-600" /> : <Wheat size={40} className="text-green-700" />}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{done ? 'Password Reset!' : 'Set New Password'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {done ? 'Redirecting you to sign in...' : 'Choose a strong password for your account.'}
          </p>
        </div>

        {!done ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={6} placeholder="Minimum 6 characters"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                required placeholder="Repeat your password"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${confirm && password !== confirm ? 'border-red-300' : 'border-gray-300'}`} />
              {confirm && password !== confirm && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
            </div>
            <button type="submit" disabled={loading || (!!confirm && password !== confirm)}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-sm text-green-700">
            <CheckCircle2 size={24} className="mx-auto mb-2 text-green-500" />
            <p className="font-semibold">Done! You'll be redirected to sign in shortly.</p>
          </div>
        )}

        <Link to="/login" className="mt-5 flex items-center justify-center text-sm text-gray-500 hover:text-green-700 transition-colors">
          ← Back to Sign In
        </Link>
      </div>
    </div>
    </PageTransition>
  );
}
