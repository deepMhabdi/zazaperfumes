import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import useCartStore from '../store/useCartStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCartStore();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/payments/session/${sessionId}`);
        setOrder(data.order);
        clearCart();
      } catch {
        // Order may not exist yet if webhook is slow
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [sessionId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
      <div className="container-zaza max-w-2xl text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-20 h-20 rounded-full border border-chrome/30 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle size={36} className="text-chrome" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="section-label mb-4">Order Confirmed</p>
          <h1 className="font-display text-5xl text-chrome mb-4">Thank You</h1>
          {order ? (
            <>
              <p className="text-chrome/50 mb-2">Order <span className="text-chrome">{order.orderNumber}</span></p>
              <p className="text-chrome/40 text-sm mb-8">
                A confirmation email has been sent. Your fragrance will be on its way shortly.
              </p>
              <div className="glass-card p-6 text-left space-y-3 mb-8">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-chrome/70">{item.name} ({item.size}) × {item.quantity}</span>
                    <span className="text-chrome">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="divider-chrome pt-2" />
                <div className="flex justify-between font-medium">
                  <span className="text-chrome/70">Total</span>
                  <span className="text-chrome">₹{order.totals?.total?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-chrome/40 mb-8">Your payment was received. You'll receive a confirmation email shortly.</p>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/account?tab=orders" className="btn-primary">
              <Package size={16} /> View Orders
            </Link>
            <Link to="/shop" className="btn-ghost">
              Continue Shopping <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
