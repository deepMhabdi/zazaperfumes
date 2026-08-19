import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Star, ChevronLeft, ChevronRight, ZoomIn, ArrowLeft } from 'lucide-react';
import { gsap } from 'gsap';
import api from '../lib/api';
import useCartStore from '../store/useCartStore';
import useWishlistStore from '../store/useWishlistStore';
import useAuthStore from '../store/useAuthStore';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EDITION_ACCENT = {
  noir: 'text-chrome border-chrome', white: 'text-white border-white',
  purple: 'text-edition-purple border-edition-purple', blue: 'text-edition-blue border-edition-blue',
  gold: 'text-edition-gold border-edition-gold', rose: 'text-edition-rose border-edition-rose',
};

function ImageGallery({ images }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;
    gsap.from(imgRef.current, { opacity: 0, scale: 1.05, duration: 0.6, ease: 'expo.out' });
  }, [active]);

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div
        className="relative overflow-hidden bg-zaza-graphite aspect-[3/4] cursor-zoom-in"
        onClick={() => setZoomed(true)}
      >
        <img
          ref={imgRef}
          src={images[active]?.url || 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80'}
          alt={images[active]?.alt || 'Product'}
          className="w-full h-full object-cover"
        />
        <button className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/50 text-chrome/60 hover:text-chrome transition-colors">
          <ZoomIn size={14} />
        </button>
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + images.length) % images.length); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 text-chrome/60 hover:text-chrome transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % images.length); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 text-chrome/60 hover:text-chrome transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-20 overflow-hidden border-2 transition-all ${
                active === i ? 'border-chrome' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setZoomed(false)}
          >
            <img
              src={images[active]?.url}
              alt="Zoomed"
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewForm({ productId, onReviewAdded }) {
  const { isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-chrome/50 text-sm">
          <Link to="/login" className="text-chrome hover:underline">Sign in</Link> to leave a review
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/reviews', { productId, rating, title, text });
      toast.success('Review submitted!');
      onReviewAdded(data.review);
      setText(''); setTitle(''); setRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <h3 className="font-display text-xl text-chrome">Write a Review</h3>
      <div className="flex gap-1">
        {[1,2,3,4,5].map((s) => (
          <button
            type="button"
            key={s}
            onMouseEnter={() => setHoverRating(s)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(s)}
            className="text-2xl transition-colors"
            style={{ color: s <= (hoverRating || rating) ? '#B8962E' : '#3a3a3a' }}
          >★</button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Review title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input-zaza"
      />
      <textarea
        placeholder="Share your experience..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        rows={4}
        className="input-zaza resize-none"
      />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addItem, openCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = product ? isWishlisted(product._id) : false;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, reviewRes] = await Promise.all([
          api.get(`/products/${slug}`),
          api.get(`/reviews/product/placeholder`), // will be updated after product loads
        ]);
        const p = prodRes.data.product;
        setProduct(p);
        setSelectedVariant(p.variants?.[0]);

        // Fetch related + reviews with real product ID
        const [relatedRes, realReviewRes] = await Promise.all([
          api.get(`/products?fragranceFamily=${p.fragranceFamily}&limit=4`),
          api.get(`/reviews/product/${p._id}`),
        ]);
        setRelated(relatedRes.data.products.filter((r) => r._id !== p._id).slice(0, 4));
        setReviews(realReviewRes.data.reviews || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setAddingToCart(true);
    setTimeout(() => {
      addItem(product, selectedVariant);
      openCart();
      toast.success(`${product.name} added to cart`);
      setAddingToCart(false);
    }, 500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><LoadingSpinner size="lg" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center pt-20"><p className="text-chrome/40">Product not found</p></div>;

  const edgeAccent = EDITION_ACCENT[product.edition] || EDITION_ACCENT.noir;
  const discount = selectedVariant?.compareAtPrice
    ? Math.round(((selectedVariant.compareAtPrice - selectedVariant.price) / selectedVariant.compareAtPrice) * 100)
    : 0;

  return (
    <div className="pt-20 pb-16">
      <div className="container-zaza">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-xs text-chrome/30">
          <Link to="/" className="hover:text-chrome transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-chrome transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-chrome/60">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <ImageGallery images={product.images?.length ? product.images : [{ url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800', alt: product.name }]} />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <p className={`text-xs tracking-widest uppercase mb-2 ${edgeAccent.split(' ')[0]}`}>
                {product.edition} Edition · {product.concentration}
              </p>
              <h1 className="font-display text-4xl md:text-5xl text-white">{product.name}</h1>
              <p className="text-chrome/40 mt-2 italic font-display text-lg">{product.shortDescription}</p>
            </div>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} style={{ color: s <= Math.round(product.averageRating) ? '#B8962E' : '#3a3a3a', fontSize: 14 }}>★</span>
                  ))}
                </div>
                <span className="text-sm text-chrome/40">{product.averageRating} ({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Variant selector */}
            <div>
              <p className="text-xs tracking-widest uppercase text-chrome/50 mb-3">Select Size</p>
              <div className="flex gap-3 flex-wrap">
                {product.variants.map((v) => (
                  <button
                    key={v._id || v.size}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stock === 0}
                    className={`px-5 py-3 border text-sm transition-all ${
                      selectedVariant?.size === v.size
                        ? 'border-chrome text-chrome bg-chrome/10'
                        : v.stock === 0
                        ? 'border-white/5 text-chrome/20 cursor-not-allowed'
                        : 'border-white/15 text-chrome/60 hover:border-chrome/50'
                    }`}
                  >
                    {v.size}
                    {v.stock === 0 && <span className="ml-1 text-2xs">(OOS)</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            {selectedVariant && (
              <div className="flex items-end gap-4">
                <p className="font-display text-4xl text-chrome">
                  ₹{selectedVariant.price.toLocaleString('en-IN')}
                </p>
                {discount > 0 && (
                  <>
                    <p className="text-chrome/30 line-through text-lg">₹{selectedVariant.compareAtPrice.toLocaleString('en-IN')}</p>
                    <span className="badge-gold">{discount}% off</span>
                  </>
                )}
              </div>
            )}

            {/* Stock */}
            {selectedVariant && (
              <p className={`text-xs tracking-widest uppercase ${selectedVariant.stock < 5 ? 'text-red-400' : 'text-chrome/30'}`}>
                {selectedVariant.stock === 0 ? 'Out of Stock' : selectedVariant.stock < 5 ? `Only ${selectedVariant.stock} left` : 'In Stock'}
              </p>
            )}

            {/* Add to cart + wishlist */}
            <div className="flex gap-3">
              <motion.button
                id={`pdp-add-to-cart`}
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0 || addingToCart}
                whileTap={{ scale: 0.97 }}
                className="flex-1 btn-primary justify-center"
              >
                <ShoppingBag size={16} />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </motion.button>
              <button
                onClick={() => { toggle(product._id); toast.success(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist'); }}
                className={`w-12 h-12 flex items-center justify-center border transition-all ${
                  wishlisted ? 'border-red-400/50 text-red-400' : 'border-white/15 text-chrome/50 hover:border-chrome/50 hover:text-chrome'
                }`}
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="divider-chrome" />

            {/* Description */}
            <div>
              <p className="text-sm text-chrome/50 leading-relaxed">{product.description}</p>
            </div>

            {/* Fragrance notes */}
            {(product.notes?.top?.length || product.notes?.heart?.length || product.notes?.base?.length) && (
              <div className="space-y-4">
                <p className="text-xs tracking-widest uppercase text-chrome/50">Fragrance Pyramid</p>
                {[
                  { label: 'Top Notes', notes: product.notes.top, delay: '0s' },
                  { label: 'Heart Notes', notes: product.notes.heart, delay: '0.5s' },
                  { label: 'Base Notes', notes: product.notes.base, delay: '2h' },
                ].map(({ label, notes, delay }) => notes?.length > 0 && (
                  <div key={label} className="glass-card p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-2xs tracking-widest uppercase text-chrome/40 mb-2">{label}</p>
                        <div className="flex flex-wrap gap-2">
                          {notes.map((n) => (
                            <span key={n} className="text-xs text-chrome/70 border border-chrome/10 px-2 py-0.5">{n}</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-2xs text-chrome/20 ml-4 flex-shrink-0">{delay}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Gender / family */}
            <div className="flex gap-3 flex-wrap">
              <span className="badge-chrome">{product.gender}</span>
              <span className="badge-chrome">{product.fragranceFamily}</span>
              {product.concentration && <span className="badge-chrome">{product.concentration}</span>}
            </div>
          </motion.div>
        </div>

        {/* Reviews section */}
        <div className="mt-24">
          <div className="divider-chrome mb-12" />
          <h2 className="font-display text-4xl text-chrome mb-10">Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ReviewForm productId={product._id} onReviewAdded={(r) => setReviews((prev) => [r, ...prev])} />
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-chrome/30 text-sm">No reviews yet. Be the first.</p>
              ) : (
                reviews.map((review) => (
                  <motion.div key={review._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm text-white font-medium">{review.user?.name}</p>
                        {review.verifiedPurchase && <span className="text-2xs text-edition-gold/80 tracking-widest">Verified Purchase</span>}
                      </div>
                      <div className="flex">
                        {[1,2,3,4,5].map((s) => (
                          <span key={s} style={{ color: s <= review.rating ? '#B8962E' : '#3a3a3a', fontSize: 12 }}>★</span>
                        ))}
                      </div>
                    </div>
                    {review.title && <p className="text-sm text-chrome font-medium mb-1">{review.title}</p>}
                    <p className="text-sm text-chrome/50">{review.text}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-24">
            <div className="divider-chrome mb-12" />
            <h2 className="font-display text-4xl text-chrome mb-10">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
