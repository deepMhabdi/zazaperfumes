import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api from '../lib/api';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

gsap.registerPlugin(ScrollTrigger);

// Lazy-load Three.js hero (static fallback on mobile)
const HeroBottle = lazy(() => import('../animations/HeroBottle'));

function HeroSection() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (!titleRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-line', {
        y: 80,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'expo.out',
        delay: 0.3,
      });
      gsap.from('.hero-sub', {
        y: 20,
        opacity: 0,
        duration: 1,
        delay: 0.9,
        ease: 'expo.out',
      });
      gsap.from('.hero-cta', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 1.1,
        ease: 'expo.out',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-zaza-black"
      id="hero"
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(192,192,192,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(192,192,192,0.3) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-chrome/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-zaza relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-20">
        {/* Text */}
        <div ref={titleRef}>
          <div className="hero-line">
            <p className="section-label mb-6">Est. MMXXIV</p>
          </div>
          <div className="overflow-hidden">
            <h1 className="hero-line font-display text-6xl md:text-8xl lg:text-9xl text-white leading-none tracking-tighter">
              The Art
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="hero-line font-display text-6xl md:text-8xl lg:text-9xl text-chrome leading-none tracking-tighter italic">
              of Scent
            </h1>
          </div>
          <p className="hero-sub mt-8 text-base text-chrome/50 max-w-md leading-relaxed">
            Luxury fragrances that tell the story of who you are before you say a word.
            Each bottle holds a world — which one is yours?
          </p>
          <div className="hero-cta flex flex-wrap gap-4 mt-10">
            <Link to="/shop" className="btn-primary">
              Explore Collection <ArrowRight size={14} />
            </Link>
            <Link to="/about" className="btn-ghost">
              Our Maison
            </Link>
          </div>
        </div>

        {/* 3D Bottle or static image */}
        <div className="relative h-[60vh] lg:h-[80vh] flex items-center justify-center">
          {isMobile ? (
            // Static fallback
            <div className="relative w-64 h-96">
              <img
                src="https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80"
                alt="ZAZA Perfume Bottle"
                className="w-full h-full object-cover rounded-sm shadow-product animate-float"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zaza-black/50 to-transparent" />
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="w-64 h-96 flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              }
            >
              <HeroBottle />
            </Suspense>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-2xs tracking-widest text-chrome/30 uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-chrome/40 to-transparent"
        />
      </div>
    </section>
  );
}

function BestsellersSection({ products }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 container-zaza">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <p className="section-label mb-3">The Icons</p>
          <h2 className="font-display text-5xl text-chrome">Bestsellers</h2>
        </div>
        <Link to="/shop?bestseller=true" className="btn-ghost py-2 px-5 text-xs">
          View All
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((p, i) => (
          <ProductCard key={p._id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

function BrandStorySection() {
  const storyRef = useRef(null);
  const inView = useInView(storyRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={storyRef}
      className="py-32 bg-zaza-charcoal border-y border-white/5"
      id="brand-story"
    >
      <div className="container-zaza">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          >
            <p className="section-label mb-6">The Maison</p>
            <h2 className="font-display text-5xl md:text-6xl text-chrome leading-tight mb-8">
              Fragrance as<br />
              <em>Autobiography</em>
            </h2>
            <p className="text-chrome/50 leading-relaxed mb-6">
              ZAZA was born from the conviction that luxury is not about price — it is about
              intention. Every fragrance in our collection begins with the question: what does
              this moment smell like?
            </p>
            <p className="text-chrome/40 leading-relaxed mb-10">
              We source the world's finest raw materials — Mysore sandalwood, Bulgarian rose
              absolute, Cambodian oud, Grasse jasmine — and work with master perfumers who
              understand restraint as much as opulence.
            </p>
            <Link to="/about" className="btn-ghost">
              Discover Our Story <ArrowRight size={14} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1622618991746-fe6004db3a47?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="ZAZA atelier"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="glass-card p-6">
                  <p className="font-display text-4xl text-chrome">18</p>
                  <p className="text-xs text-chrome/40 tracking-widest uppercase mt-1">Fragrances</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="glass-card p-6">
                  <p className="font-display text-4xl text-chrome">6</p>
                  <p className="text-xs text-chrome/40 tracking-widest uppercase mt-1">Editions</p>
                </div>
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&q=80"
                    alt="ZAZA ingredients"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
            {/* Chrome border accent */}
            <div className="absolute -inset-4 border border-chrome/10 pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeaturedSection({ products }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 container-zaza">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="text-center mb-16"
      >
        <p className="section-label mb-4">Curated for You</p>
        <h2 className="font-display text-5xl text-chrome">New Arrivals</h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.slice(0, 3).map((p, i) => (
          <ProductCard key={p._id} product={p} index={i} />
        ))}
      </div>
      <div className="text-center mt-12">
        <Link to="/shop" className="btn-primary">
          View All Fragrances <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  const [bestsellers, setBestsellers] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [bsRes, featRes] = await Promise.all([
          api.get('/products?bestseller=true&limit=4'),
          api.get('/products?featured=true&limit=6'),
        ]);
        setBestsellers(bsRes.data.products);
        setFeatured(featRes.data.products);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <HeroSection />
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <BestsellersSection products={bestsellers} />
          <BrandStorySection />
          <FeaturedSection products={featured} />
        </>
      )}
    </div>
  );
}
