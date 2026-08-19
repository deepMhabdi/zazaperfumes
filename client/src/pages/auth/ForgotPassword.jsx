import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zaza-black flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-10"><Link to="/"><p className="font-display text-5xl text-chrome tracking-widest">ZAZA</p></Link></div>
        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full border border-chrome/20 flex items-center justify-center mx-auto">
                <span className="text-chrome text-xl">✓</span>
              </div>
              <h2 className="font-display text-2xl text-white">Check your inbox</h2>
              <p className="text-sm text-chrome/40">If this email is registered, a reset link has been sent.</p>
              <Link to="/login" className="btn-ghost py-2 px-6 text-xs inline-block mt-4">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl text-white mb-2">Reset Password</h1>
              <p className="text-sm text-chrome/40 mb-8">Enter your email to receive a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-zaza" placeholder="your@email.com" required />
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <div className="text-center mt-6">
                <Link to="/login" className="text-xs text-chrome/40 hover:text-chrome transition-colors">Back to Sign In</Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
