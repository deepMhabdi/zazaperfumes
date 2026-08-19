import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing to ZAZA.');
    setEmail('');
  };

  const links = {
    Collections: [
      { label: 'Noir Edition', to: '/shop?edition=noir' },
      { label: 'Blanc Edition', to: '/shop?edition=white' },
      { label: 'Or Edition', to: '/shop?edition=gold' },
      { label: 'Violet Edition', to: '/shop?edition=purple' },
      { label: 'Azur Edition', to: '/shop?edition=blue' },
    ],
    Maison: [
      { label: 'Our Story', to: '/about' },
      { label: 'Fragrance Philosophy', to: '/about#philosophy' },
      { label: 'Ingredients', to: '/about#ingredients' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact', to: '/contact' },
    ],
    Account: [
      { label: 'Sign In', to: '/login' },
      { label: 'Create Account', to: '/register' },
      { label: 'My Orders', to: '/account?tab=orders' },
      { label: 'Wishlist', to: '/account?tab=wishlist' },
    ],
  };

  return (
    <footer className="bg-zaza-charcoal border-t border-white/5 mt-24">
      {/* Newsletter */}
      <div className="border-b border-white/5">
        <div className="container-zaza py-16">
          <div className="max-w-2xl mx-auto text-center">
            <p className="section-label mb-4">The Inner Circle</p>
            <h2 className="font-display text-4xl text-chrome mb-3">
              Enter the World of ZAZA
            </h2>
            <p className="text-chrome/40 text-sm mb-8">
              Be first to experience new releases, exclusive offers, and fragrance stories.
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-0 max-w-md mx-auto">
              <input
                id="newsletter-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 input-zaza border-r-0"
                required
              />
              <button type="submit" className="btn-primary clip-path-none px-6 whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="container-zaza py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-6">
              <p className="font-display text-4xl text-chrome tracking-widest">ZAZA</p>
              <p className="text-2xs tracking-[0.5em] text-chrome/30 uppercase">Perfumes</p>
            </div>
            <p className="text-sm text-chrome/40 leading-relaxed">
              Luxury fragrances crafted for those who understand that scent is the most intimate expression of self.
            </p>
            <div className="flex gap-4 mt-6">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <button key={i} className="text-chrome/30 hover:text-chrome transition-colors">
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <p className="section-label mb-6">{heading}</p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-sm text-chrome/40 hover:text-chrome transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider-chrome mt-16 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-2xs text-chrome/25 tracking-widest uppercase">
          <p>© {new Date().getFullYear()} ZAZA Perfumes. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-chrome/50 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-chrome/50 transition-colors">Terms</Link>
            <Link to="/shipping" className="hover:text-chrome/50 transition-colors">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
