import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.accessToken);
      toast.success(`Welcome back, ${data.user.name}`);
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zaza-black flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-radial from-chrome/5 via-transparent to-transparent opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/">
            <p className="font-display text-5xl text-chrome tracking-widest">ZAZA</p>
            <p className="text-2xs tracking-[0.5em] text-chrome/30 uppercase mt-1">Perfumes</p>
          </Link>
        </div>

        <div className="glass-card p-8">
          <h1 className="font-display text-3xl text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-chrome/40 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-zaza"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-zaza pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-chrome/30 hover:text-chrome transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-chrome/40 hover:text-chrome transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="divider-chrome my-6" />

          <p className="text-center text-sm text-chrome/40">
            Don't have an account?{' '}
            <Link to="/register" className="text-chrome hover:underline">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
