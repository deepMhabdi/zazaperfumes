import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import useWishlistStore from '../../store/useWishlistStore';
import toast from 'react-hot-toast';

const EDITION_COLORS = {
  noir: 'text-chrome border-chrome/20',
  white: 'text-edition-white border-white/20',
  purple: 'text-edition-purple border-edition-purple/20',
  blue: 'text-edition-blue border-edition-blue/20',
  gold: 'text-edition-gold border-edition-gold/20',
  rose: 'text-edition-rose border-edition-rose/20',
};

export default function ProductCard({ product, index = 0 }) {
  const { addItem, openCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();

  const defaultVariant = product.variants?.[0];
  const editionColor = EDITION_COLORS[product.edition] || EDITION_COLORS.noir;
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;
    addItem(product, defaultVariant);
    openCart();
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product._id);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
    >
      <Link to={`/product/${product.slug}`} className="product-card group block">
        {/* Image container */}
        <div className="relative overflow-hidden aspect-[3/4] bg-zaza-graphite">
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={40} className="text-chrome/10" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              id={`add-to-cart-${product._id}`}
              className="w-10 h-10 flex items-center justify-center bg-zaza-black/80 text-chrome hover:bg-chrome hover:text-zaza-black transition-all duration-200"
            >
              <ShoppingBag size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className={`w-10 h-10 flex items-center justify-center bg-zaza-black/80 transition-all duration-200 ${
                wishlisted ? 'text-red-400 hover:bg-red-400/20' : 'text-chrome hover:bg-chrome hover:text-zaza-black'
              }`}
            >
              <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
            </motion.button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.bestseller && (
              <span className="badge-gold px-2 py-0.5 text-2xs">Bestseller</span>
            )}
            {product.featured && !product.bestseller && (
              <span className="badge-chrome px-2 py-0.5 text-2xs">Featured</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`text-2xs tracking-widest uppercase mb-1 ${editionColor.split(' ')[0]}`}>
                {product.edition} · {product.gender}
              </p>
              <h3 className="font-display text-lg text-white group-hover:text-chrome transition-colors leading-tight">
                {product.name}
              </h3>
            </div>
            <button
              onClick={handleWishlist}
              className={`mt-1 flex-shrink-0 transition-colors ${wishlisted ? 'text-red-400' : 'text-chrome/20 hover:text-chrome/60'}`}
            >
              <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          <p className="text-xs text-chrome/40 mt-2 line-clamp-2">{product.shortDescription}</p>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={s <= Math.round(product.averageRating) ? 'star-filled' : 'star-empty'} style={{ fontSize: 10 }}>★</span>
                ))}
              </div>
              <span className="text-2xs text-chrome/30">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-chrome font-medium">
                From ₹{defaultVariant?.price.toLocaleString('en-IN')}
              </p>
              {defaultVariant?.compareAtPrice && (
                <p className="text-2xs text-chrome/30 line-through">
                  ₹{defaultVariant.compareAtPrice.toLocaleString('en-IN')}
                </p>
              )}
            </div>
            <span className="text-2xs text-chrome/30 uppercase tracking-widest">
              {product.concentration}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
