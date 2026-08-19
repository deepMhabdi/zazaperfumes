import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Invalid reset link');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zaza-black flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-10"><Link to="/"><p className="font-display text-5xl text-chrome tracking-widest">ZAZA</p></Link></div>
        <div className="glass-card p-8">
          <h1 className="font-display text-3xl text-white mb-2">New Password</h1>
          <p className="text-sm text-chrome/40 mb-8">Must be at least 8 characters with 1 uppercase and 1 number</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input id="reset-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-zaza" placeholder="New password" required />
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
