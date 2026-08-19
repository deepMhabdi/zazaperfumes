import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Truck, Tag, ShoppingBag } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const discount = couponData?.discount || 0;
  const shipping = subtotal - discount >= 999 ? 0 : 99;
  const total = subtotal - discount + shipping;

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, subtotal });
      setCouponData(data);
      toast.success(`Coupon applied! ₹${data.discount.toFixed(0)} off`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setProcessing(true);

    const shippingAddress = {
      fullName: form.fullName,
      phone: form.phone,
      line1: form.line1,
      line2: form.line2,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country,
    };

    try {
      const { data } = await api.post('/payments/create-session', {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          image: i.image,
          size: i.size,
          price: i.price,
          quantity: i.quantity,
        })),
        shippingAddress,
        guestInfo: !isAuthenticated ? { name: form.fullName, email: form.email } : undefined,
        couponCode: couponCode || undefined,
      });

      // Redirect to Stripe
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed. Please try again.');
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
        <ShoppingBag size={48} className="text-chrome/20" />
        <p className="font-display text-3xl text-chrome/50">Your cart is empty</p>
        <button onClick={() => navigate('/shop')} className="btn-primary mt-4">
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container-zaza max-w-5xl">
        <p className="section-label mb-3">Secure Checkout</p>
        <h1 className="font-display text-5xl text-chrome mb-10">Complete Your Order</h1>

        <form onSubmit={handleCheckout}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left: Form */}
            <div className="lg:col-span-3 space-y-8">
              {/* Contact info */}
              {!isAuthenticated && (
                <div className="glass-card p-6 space-y-4">
                  <h2 className="font-display text-xl text-chrome flex items-center gap-3">
                    <CreditCard size={18} /> Contact
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Full Name</label>
                      <input type="text" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="input-zaza" required />
                    </div>
                    <div className="col-span-2">
                      <label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Email</label>
                      <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input-zaza" required />
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping */}
              <div className="glass-card p-6 space-y-4">
                <h2 className="font-display text-xl text-chrome flex items-center gap-3">
                  <Truck size={18} /> Shipping Address
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'fullName', col: '2' },
                    { label: 'Phone', key: 'phone', col: '1', type: 'tel' },
                    { label: 'Address Line 1', key: 'line1', col: '2' },
                    { label: 'Address Line 2 (optional)', key: 'line2', col: '2', required: false },
                    { label: 'City', key: 'city', col: '1' },
                    { label: 'State', key: 'state', col: '1' },
                    { label: 'Postal Code', key: 'postalCode', col: '1' },
                    { label: 'Country', key: 'country', col: '1' },
                  ].map(({ label, key, col, type = 'text', required = true }) => (
                    <div key={key} className={col === '2' ? 'col-span-2' : ''}>
                      <label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">{label}</label>
                      <input
                        type={type}
                        value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="input-zaza"
                        required={required}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-card p-6 space-y-4 sticky top-24">
                <h2 className="font-display text-xl text-chrome">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-none">
                  {items.map((item) => (
                    <div key={item.key} className="flex items-center gap-3">
                      <div className="w-12 h-14 flex-shrink-0 bg-zaza-graphite overflow-hidden">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{item.name}</p>
                        <p className="text-xs text-chrome/40">{item.size} × {item.quantity}</p>
                      </div>
                      <p className="text-sm text-chrome">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>

                <div className="divider-chrome" />

                {/* Coupon */}
                <div>
                  <label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">
                    <Tag size={10} className="inline mr-1" />Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="coupon-input"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="WELCOME20"
                      className="input-zaza flex-1 py-2 text-xs"
                    />
                    <button type="button" onClick={handleCoupon} disabled={couponLoading} className="btn-ghost py-2 px-4 text-xs">
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponData && <p className="text-xs text-green-400 mt-1">✓ {couponData.coupon.code} applied</p>}
                </div>

                <div className="divider-chrome" />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-chrome/60">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-chrome/60">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-white font-medium text-base pt-2 border-t border-white/5">
                    <span>Total</span>
                    <span className="text-chrome">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  id="stripe-checkout-btn"
                  type="submit"
                  disabled={processing}
                  className="btn-primary w-full justify-center"
                >
                  {processing ? (
                    <span className="flex items-center gap-2"><LoadingSpinner size="sm" /> Redirecting to Stripe...</span>
                  ) : (
                    <><CreditCard size={16} /> Pay with Stripe</>
                  )}
                </button>

                <p className="text-2xs text-chrome/25 text-center tracking-widest">
                  🔒 Secured by Stripe. Your payment info is never stored.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
