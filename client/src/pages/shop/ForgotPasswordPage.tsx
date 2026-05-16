import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Wheat, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import PageTransition from '../../components/PageTransition';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [loading, setL]     = useState(false);
  const [sent, setSent]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setL(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally { setL(false); }
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <Helmet>
        <title>Forgot Password — Al-Noor Rice Mills</title>
      </Helmet>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-green-100 p-4 rounded-full">
              {sent ? <CheckCircle2 size={40} className="text-green-600" /> : <Wheat size={40} className="text-green-700" />}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {sent ? 'Check Your Email' : 'Forgot Password?'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {sent
              ? `We've sent a reset link to ${email}. Check your inbox (and spam folder).`
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
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
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
              <p className="font-semibold mb-1">Reset link sent!</p>
              <p>The link expires in <strong>1 hour</strong>. If you don't see it, check your spam folder.</p>
            </div>
            <button onClick={() => { setSent(false); setEmail(''); }}
              className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Send to a different email
            </button>
          </div>
        )}

        <Link to="/login" className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-green-700 transition-colors">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
    </PageTransition>
  );
}
