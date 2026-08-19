import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore';

export default function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem, subtotal } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-zaza-charcoal border-l border-white/5 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div>
                <p className="section-label">Your Selection</p>
                <h2 className="font-display text-2xl text-chrome mt-1">
                  Cart ({items.length})
                </h2>
              </div>
              <button
                id="close-cart"
                onClick={closeCart}
                className="text-chrome/40 hover:text-chrome transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-64 gap-4"
                  >
                    <ShoppingBag size={40} className="text-chrome/20" />
                    <p className="text-chrome/40 text-sm">Your cart is empty</p>
                    <Link to="/shop" onClick={closeCart} className="btn-ghost py-2 px-6 text-xs">
                      Explore Fragrances
                    </Link>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.key}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="flex gap-4 py-4 border-b border-white/5 last:border-0"
                    >
                      {/* Image */}
                      <div className="w-20 h-24 flex-shrink-0 overflow-hidden bg-zaza-graphite">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={20} className="text-chrome/20" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm text-white font-medium hover:text-chrome transition-colors block truncate"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-chrome/40 mt-0.5">{item.size}</p>
                        <p className="text-sm text-chrome mt-2">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>

                        {/* Quantity */}
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center border border-chrome/20 hover:border-chrome/50 transition-colors"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center border border-chrome/20 hover:border-chrome/50 transition-colors"
                          >
                            <Plus size={10} />
                          </button>
                          <button
                            onClick={() => removeItem(item.key)}
                            className="ml-auto text-red-400/50 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-white/5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-chrome/50">Subtotal</span>
                  <span className="text-chrome font-medium">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-2xs text-chrome/30 tracking-widest">
                  Shipping & taxes calculated at checkout
                </p>
                <button
                  id="proceed-to-checkout"
                  onClick={handleCheckout}
                  className="btn-primary w-full justify-center gap-3"
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </button>
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="block text-center text-xs text-chrome/40 hover:text-chrome transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
