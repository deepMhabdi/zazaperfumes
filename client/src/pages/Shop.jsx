import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const FRAGRANCE_FAMILIES = ['floral', 'woody', 'oriental', 'fresh', 'citrus', 'gourmand', 'aquatic', 'fougere', 'chypre'];
const EDITIONS = ['noir', 'white', 'purple', 'blue', 'gold', 'rose'];
const GENDERS = ['masculine', 'feminine', 'unisex'];
const SORTS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: '-averageRating', label: 'Top Rated' },
  { value: '-salesCount', label: 'Bestselling' },
];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm text-chrome/70 hover:text-chrome transition-colors"
      >
        <span className="tracking-widest uppercase text-xs">{title}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs tracking-widest uppercase border transition-all duration-200 ${
        active
          ? 'border-chrome text-chrome bg-chrome/10'
          : 'border-white/10 text-chrome/40 hover:border-chrome/40 hover:text-chrome/70'
      }`}
    >
      {label}
    </button>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    gender: searchParams.get('gender') || '',
    fragranceFamily: searchParams.getAll('fragranceFamily') || [],
    edition: searchParams.get('edition') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page')) || 1,
    bestseller: searchParams.get('bestseller') || '',
    featured: searchParams.get('featured') || '',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (Array.isArray(v)) { if (v.length) params.set(k, v.join(',')); }
        else if (v) params.set(k, v);
      });
      params.set('limit', 12);
      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      if (Array.isArray(prev[key])) {
        const arr = prev[key].includes(value)
          ? prev[key].filter((v) => v !== value)
          : [...prev[key], value];
        return { ...prev, [key]: arr, page: 1 };
      }
      return { ...prev, [key]: prev[key] === value ? '' : value, page: 1 };
    });
  };

  const clearFilters = () => {
    setFilters({ gender: '', fragranceFamily: [], edition: '', minPrice: '', maxPrice: '', sort: '-createdAt', page: 1, bestseller: '', featured: '' });
  };

  const activeFilterCount = [
    filters.gender, filters.edition, filters.bestseller, filters.featured,
    ...filters.fragranceFamily,
    filters.minPrice, filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="pt-24 pb-16">
      <div className="container-zaza">
        {/* Header */}
        <div className="mb-12">
          <p className="section-label mb-3">All Fragrances</p>
          <h1 className="font-display text-5xl text-chrome">The Collection</h1>
        </div>

        <div className="flex gap-8">
          {/* Filter sidebar — desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs tracking-widest uppercase text-chrome/60">Filters</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-2xs text-chrome/40 hover:text-chrome transition-colors">
                    Clear ({activeFilterCount})
                  </button>
                )}
              </div>

              <FilterSection title="Edition">
                <div className="flex flex-wrap gap-2">
                  {EDITIONS.map((ed) => (
                    <FilterChip key={ed} label={ed} active={filters.edition === ed} onClick={() => toggleFilter('edition', ed)} />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Gender">
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((g) => (
                    <FilterChip key={g} label={g} active={filters.gender === g} onClick={() => toggleFilter('gender', g)} />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Fragrance Family">
                <div className="flex flex-wrap gap-2">
                  {FRAGRANCE_FAMILIES.map((f) => (
                    <FilterChip key={f} label={f} active={filters.fragranceFamily.includes(f)} onClick={() => toggleFilter('fragranceFamily', f)} />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Price Range">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value, page: 1 }))}
                    className="w-full input-zaza py-2 text-xs"
                  />
                  <span className="text-chrome/30">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value, page: 1 }))}
                    className="w-full input-zaza py-2 text-xs"
                  />
                </div>
              </FilterSection>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <p className="text-sm text-chrome/40">
                {pagination.total || 0} fragrances
              </p>
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  className="lg:hidden flex items-center gap-2 text-xs text-chrome/60 border border-white/10 px-3 py-2 hover:border-chrome/30 transition-colors"
                  onClick={() => setFiltersOpen(true)}
                >
                  <SlidersHorizontal size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>

                {/* Sort */}
                <select
                  id="sort-select"
                  value={filters.sort}
                  onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value, page: 1 }))}
                  className="input-zaza py-2 text-xs pr-8 cursor-pointer"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products grid */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <LoadingSpinner size="lg" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-display text-3xl text-chrome/30">No fragrances found</p>
                <button onClick={clearFilters} className="mt-4 btn-ghost py-2 px-6 text-xs">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                  {products.map((p, i) => (
                    <ProductCard key={p._id} product={p} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                    className={`w-8 h-8 text-xs border transition-all ${
                      filters.page === p
                        ? 'border-chrome text-chrome bg-chrome/10'
                        : 'border-white/10 text-chrome/40 hover:border-chrome/30'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-zaza-charcoal overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <p className="text-xs tracking-widest uppercase text-chrome/60">Filters</p>
                <button onClick={() => setFiltersOpen(false)}><X size={18} className="text-chrome/60" /></button>
              </div>
              {/* Same filters as sidebar */}
              <FilterSection title="Edition">
                <div className="flex flex-wrap gap-2">
                  {EDITIONS.map((ed) => <FilterChip key={ed} label={ed} active={filters.edition === ed} onClick={() => toggleFilter('edition', ed)} />)}
                </div>
              </FilterSection>
              <FilterSection title="Gender">
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((g) => <FilterChip key={g} label={g} active={filters.gender === g} onClick={() => toggleFilter('gender', g)} />)}
                </div>
              </FilterSection>
              <FilterSection title="Fragrance Family">
                <div className="flex flex-wrap gap-2">
                  {FRAGRANCE_FAMILIES.map((f) => <FilterChip key={f} label={f} active={filters.fragranceFamily.includes(f)} onClick={() => toggleFilter('fragranceFamily', f)} />)}
                </div>
              </FilterSection>
              <button onClick={() => { clearFilters(); setFiltersOpen(false); }} className="w-full btn-ghost mt-6 text-xs">
                Clear All Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
