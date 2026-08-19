import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Heart, MapPin, LogOut } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import useWishlistStore from '../store/useWishlistStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
];

const STATUS_COLORS = {
  pending: 'text-yellow-400', confirmed: 'text-blue-400', processing: 'text-blue-400',
  shipped: 'text-chrome', delivered: 'text-green-400', cancelled: 'text-red-400',
};

export default function Account() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [orders, setOrders] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const { items: wishlistIds } = useWishlistStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'orders') {
      setLoading(true);
      api.get('/orders/my')
        .then(({ data }) => setOrders(data.orders))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    if (activeTab === 'wishlist') {
      setLoading(true);
      api.get('/auth/wishlist')
        .then(({ data }) => setWishlistProducts(data.wishlist))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth();
    navigate('/');
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container-zaza max-w-5xl">
        <div className="mb-10">
          <p className="section-label mb-2">My Account</p>
          <h1 className="font-display text-5xl text-chrome">Welcome, {user?.name?.split(' ')[0]}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar tabs */}
          <aside className="lg:col-span-1">
            <div className="glass-card overflow-hidden">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  id={`tab-${id}`}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-sm transition-all border-b border-white/5 last:border-0 ${
                    activeTab === id
                      ? 'text-chrome bg-chrome/10'
                      : 'text-chrome/50 hover:text-chrome hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm text-red-400/60 hover:text-red-400 hover:bg-white/5 transition-all border-t border-white/10"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </aside>

          {/* Tab content */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
            ) : (
              <>
                {activeTab === 'profile' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 space-y-6">
                    <h2 className="font-display text-2xl text-chrome">Profile Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xs tracking-widest uppercase text-chrome/40 mb-1">Name</p>
                        <p className="text-white">{user?.name}</p>
                      </div>
                      <div>
                        <p className="text-2xs tracking-widest uppercase text-chrome/40 mb-1">Email</p>
                        <p className="text-white">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-2xs tracking-widest uppercase text-chrome/40 mb-1">Member Since</p>
                        <p className="text-white">{new Date(user?.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
                      </div>
                      <div>
                        <p className="text-2xs tracking-widest uppercase text-chrome/40 mb-1">Account Type</p>
                        <p className="text-white capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'orders' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="glass-card p-12 text-center">
                        <Package size={40} className="text-chrome/20 mx-auto mb-4" />
                        <p className="text-chrome/40">No orders yet</p>
                        <Link to="/shop" className="btn-ghost py-2 px-6 text-xs inline-block mt-4">Start Shopping</Link>
                      </div>
                    ) : orders.map((order) => (
                      <div key={order._id} className="glass-card p-5">
                        <div className="flex justify-between items-start flex-wrap gap-3">
                          <div>
                            <p className="text-xs text-chrome/40 tracking-widest">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                            <p className="text-white font-medium">{order.orderNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs uppercase tracking-widest ${STATUS_COLORS[order.status]}`}>{order.status}</p>
                            <p className="text-chrome font-medium">₹{order.totals?.total?.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {order.items?.slice(0, 3).map((item, i) => (
                            <span key={i} className="text-xs text-chrome/40 bg-zaza-graphite px-2 py-1">
                              {item.name} ({item.size})
                            </span>
                          ))}
                          {order.items?.length > 3 && <span className="text-xs text-chrome/30">+{order.items.length - 3} more</span>}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'wishlist' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {wishlistProducts.length === 0 ? (
                      <div className="glass-card p-12 text-center">
                        <Heart size={40} className="text-chrome/20 mx-auto mb-4" />
                        <p className="text-chrome/40">Your wishlist is empty</p>
                        <Link to="/shop" className="btn-ghost py-2 px-6 text-xs inline-block mt-4">Discover Fragrances</Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {wishlistProducts.map((p) => (
                          <Link key={p._id} to={`/product/${p.slug}`} className="product-card group">
                            <div className="aspect-[3/4] overflow-hidden">
                              <img src={p.images?.[0]?.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="p-3">
                              <p className="text-sm text-white">{p.name}</p>
                              <p className="text-xs text-chrome mt-1">From ₹{p.variants?.[0]?.price?.toLocaleString('en-IN')}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'addresses' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8">
                    <p className="text-chrome/40 text-sm">Addresses are saved during checkout.</p>
                  </motion.div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
