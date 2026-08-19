import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, Menu, X, Heart, LogOut, LayoutDashboard } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const { itemCount, toggleCart } = useCartStore();
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Search suggestions
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products/search/suggestions?q=${searchQuery}`);
        setSuggestions(data.suggestions || []);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    clearAuth();
    setUserMenuOpen(false);
    toast.success('Logged out');
    navigate('/');
  };

  const navLinks = [
    { to: '/shop', label: 'Shop' },
    { to: '/shop?edition=noir', label: 'Noir' },
    { to: '/shop?edition=white', label: 'Blanc' },
    { to: '/shop?edition=gold', label: 'Or' },
    { to: '/about', label: 'Maison' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-zaza-black/95 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="container-zaza">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-toggle"
              className="md:hidden text-chrome/60 hover:text-chrome transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0">
              <div className="flex flex-col items-center leading-none">
                <span className="text-3xl font-display font-light text-chrome tracking-[0.3em]">
                  ZAZA
                </span>
                <span className="text-2xs tracking-[0.5em] text-chrome/40 uppercase">
                  Perfumes
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <button
                id="search-toggle"
                className="text-chrome/60 hover:text-chrome transition-colors"
                onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchRef.current?.focus(), 100); }}
              >
                <Search size={18} />
              </button>

              {/* User menu */}
              <div className="relative hidden md:block">
                <button
                  id="user-menu-toggle"
                  className="text-chrome/60 hover:text-chrome transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <User size={18} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-8 w-48 glass-card overflow-hidden z-50"
                    >
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-3 border-b border-white/5">
                            <p className="text-xs text-chrome/60 tracking-widest uppercase">Signed in as</p>
                            <p className="text-sm text-white truncate mt-0.5">{user?.name}</p>
                          </div>
                          <Link to="/account" className="flex items-center gap-3 px-4 py-3 text-sm text-chrome/70 hover:text-chrome hover:bg-white/5 transition-colors" onClick={() => setUserMenuOpen(false)}>
                            <User size={14} /> My Account
                          </Link>
                          <Link to="/account?tab=wishlist" className="flex items-center gap-3 px-4 py-3 text-sm text-chrome/70 hover:text-chrome hover:bg-white/5 transition-colors" onClick={() => setUserMenuOpen(false)}>
                            <Heart size={14} /> Wishlist
                          </Link>
                          {user?.role === 'admin' && (
                            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm text-edition-gold/70 hover:text-edition-gold hover:bg-white/5 transition-colors" onClick={() => setUserMenuOpen(false)}>
                              <LayoutDashboard size={14} /> Admin
                            </Link>
                          )}
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400/70 hover:text-red-400 hover:bg-white/5 transition-colors border-t border-white/5">
                            <LogOut size={14} /> Sign Out
                          </button>
                        </>
                      ) : (
                        <>
                          <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-sm text-chrome/70 hover:text-chrome hover:bg-white/5 transition-colors" onClick={() => setUserMenuOpen(false)}>
                            Sign In
                          </Link>
                          <Link to="/register" className="flex items-center gap-3 px-4 py-3 text-sm text-chrome/70 hover:text-chrome hover:bg-white/5 transition-colors" onClick={() => setUserMenuOpen(false)}>
                            Create Account
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <button
                id="cart-toggle"
                className="relative text-chrome/60 hover:text-chrome transition-colors"
                onClick={toggleCart}
              >
                <ShoppingBag size={18} />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center text-2xs bg-chrome text-zaza-black font-bold rounded-full"
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/5 bg-zaza-charcoal/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="container-zaza py-4">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chrome/40" />
                  <input
                    ref={searchRef}
                    id="search-input"
                    type="text"
                    placeholder="Search fragrances, notes, collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery) {
                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                        setSearchOpen(false);
                        setSearchQuery('');
                      }
                      if (e.key === 'Escape') setSearchOpen(false);
                    }}
                    className="w-full bg-transparent border-b border-chrome/20 pl-10 pr-4 py-3 text-sm text-white placeholder-chrome/30 focus:outline-none focus:border-chrome/50 transition-colors"
                  />
                </div>
                {suggestions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {suggestions.map((s) => (
                      <Link
                        key={s._id}
                        to={`/product/${s.slug}`}
                        className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 transition-colors rounded"
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      >
                        {s.images?.[0]?.url && (
                          <img src={s.images[0].url} alt={s.name} className="w-8 h-8 object-cover" />
                        )}
                        <span className="text-sm text-chrome/80">{s.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 bg-zaza-black flex flex-col pt-20 px-8"
          >
            <nav className="flex flex-col gap-6 mt-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <NavLink
                    to={link.to}
                    className="text-3xl font-display text-chrome/70 hover:text-chrome transition-colors tracking-widest"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto mb-12 space-y-4">
              {isAuthenticated ? (
                <>
                  <Link to="/account" className="nav-link" onClick={() => setMenuOpen(false)}>My Account</Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="nav-link">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
                  <Link to="/register" className="nav-link" onClick={() => setMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
