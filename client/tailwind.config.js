/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette
        chrome: {
          DEFAULT: '#C0C0C0',
          light: '#D8D8D8',
          dark: '#A0A0A0',
        },
        zaza: {
          black: '#0a0a0a',
          charcoal: '#1a1a1a',
          graphite: '#2a2a2a',
          smoke: '#3a3a3a',
          steel: '#4a4a4a',
          silver: '#C0C0C0',
          pearl: '#F5F5F0',
        },
        // Jewel accent per edition
        noir: '#1a1a1a',
        'edition-white': '#F5F5F0',
        'edition-purple': '#7B2D8B',
        'edition-blue': '#1E3A8A',
        'edition-gold': '#B8962E',
        'edition-rose': '#B5446E',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      letterSpacing: {
        widest: '0.3em',
        'ultra-wide': '0.5em',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'zaza-hero': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        'chrome-gradient': 'linear-gradient(135deg, #A0A0A0, #E8E8E8, #C0C0C0, #A0A0A0)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      },
      boxShadow: {
        'chrome': '0 0 20px rgba(192, 192, 192, 0.3), 0 0 60px rgba(192, 192, 192, 0.1)',
        'chrome-sm': '0 0 10px rgba(192, 192, 192, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'product': '0 20px 60px rgba(0, 0, 0, 0.5)',
        'glow-purple': '0 0 30px rgba(123, 45, 139, 0.4)',
        'glow-gold': '0 0 30px rgba(184, 150, 46, 0.4)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(192, 192, 192, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(192, 192, 192, 0.5)' },
        },
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
  },
  plugins: [],
};
