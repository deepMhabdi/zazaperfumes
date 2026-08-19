import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div className="pt-20 pb-16">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-zaza-black">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1595425964071-2c1ecb10b52d?w=1600&q=60" alt="ZAZA Atelier" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-zaza-black via-zaza-black/50 to-zaza-black" />
        </div>
        <div className="container-zaza relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <p className="section-label mb-6">The Maison</p>
            <h1 className="font-display text-6xl md:text-8xl text-chrome mb-6 leading-none">Our Story</h1>
            <p className="text-chrome/50 max-w-xl text-lg leading-relaxed">
              A perfumery born from the belief that every person deserves a signature scent as unique as their fingerprint.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-zaza">
        <div className="divider-chrome my-16" />

        {/* Philosophy */}
        <section id="philosophy" ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }}>
            <p className="section-label mb-4">Our Philosophy</p>
            <h2 className="font-display text-5xl text-chrome mb-6">Restraint as Luxury</h2>
            <p className="text-chrome/50 leading-relaxed mb-4">
              In an era of louder-is-better, ZAZA champions restraint. We believe the most powerful fragrances are those that reveal themselves slowly — a whisper that stays with you long after the encounter.
            </p>
            <p className="text-chrome/40 leading-relaxed">
              Our perfumers work with a single guiding principle: less. Every ingredient earns its place. Nothing is accidental. The result is fragrance with intention.
            </p>
          </motion.div>
          <div className="aspect-square overflow-hidden">
            <img src="https://images.unsplash.com/photo-1616604783253-fa426f9f905f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Atelier" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        </section>

        {/* Ingredients */}
        <section id="ingredients" className="mb-24">
          <p className="section-label mb-4 text-center">Raw Materials</p>
          <h2 className="font-display text-5xl text-chrome mb-12 text-center">The Ingredients</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: 'Bulgarian Rose Absolute', origin: 'Rose Valley, Bulgaria', desc: 'The queen of flowers, harvested at dawn.' },
              { name: 'Mysore Sandalwood', origin: 'Karnataka, India', desc: 'Sustainably sourced, aged for decades.' },
              { name: 'Cambodian Oud', origin: 'Tonle Sap, Cambodia', desc: 'Liquid gold of the perfume world.' },
              { name: 'Grasse Jasmine', origin: 'Grasse, France', desc: 'The most celebrated jasmine in perfumery.' },
              { name: 'Ambergris', origin: 'North Atlantic', desc: 'The rarest fixative, found on ocean shores.' },
              { name: 'Saffron', origin: 'Kashmir, India', desc: 'More precious than gold by weight.' },
            ].map((ing) => (
              <div key={ing.name} className="glass-card p-6">
                <p className="text-chrome font-medium mb-1">{ing.name}</p>
                <p className="text-2xs tracking-widest text-chrome/30 uppercase mb-3">{ing.origin}</p>
                <p className="text-sm text-chrome/50">{ing.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center">
          <Link to="/shop" className="btn-primary">Explore the Collection <ArrowRight size={14} /></Link>
        </div>
      </div>
    </div>
  );
}
