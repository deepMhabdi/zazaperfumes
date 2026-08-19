import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.user, data.accessToken);
      toast.success('Welcome to ZAZA!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zaza-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-radial from-chrome/5 via-transparent to-transparent opacity-50" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-10">
          <Link to="/"><p className="font-display text-5xl text-chrome tracking-widest">ZAZA</p></Link>
        </div>
        <div className="glass-card p-8">
          <h1 className="font-display text-3xl text-white mb-2">Create Account</h1>
          <p className="text-sm text-chrome/40 mb-8">Join the world of ZAZA Perfumes</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', id: 'register-name', type: 'text', key: 'name', placeholder: 'Your name' },
              { label: 'Email', id: 'register-email', type: 'email', key: 'email', placeholder: 'your@email.com' },
            ].map(({ label, id, type, key, placeholder }) => (
              <div key={key}>
                <label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">{label}</label>
                <input
                  id={id}
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="input-zaza"
                  placeholder={placeholder}
                  required
                />
              </div>
            ))}
            <div>
              <label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Password</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input-zaza pr-10"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-chrome/30 hover:text-chrome">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <div className="divider-chrome my-6" />
          <p className="text-center text-sm text-chrome/40">
            Already have an account?{' '}
            <Link to="/login" className="text-chrome hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
