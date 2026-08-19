import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [searchParams]);

  const doSearch = async (q) => {
    if (!q) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/products?search=${encodeURIComponent(q)}&limit=24`);
      setProducts(data.products);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query) setSearchParams({ q: query });
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container-zaza">
        <h1 className="font-display text-5xl text-chrome mb-8">Search</h1>
        <form onSubmit={handleSubmit} className="flex gap-3 mb-10 max-w-xl">
          <input
            id="search-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fragrances, notes..."
            className="input-zaza flex-1"
          />
          <button type="submit" className="btn-primary px-6">
            <SearchIcon size={16} />
          </button>
        </form>

        {loading ? (
          <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
        ) : products.length === 0 && searchParams.get('q') ? (
          <div className="text-center py-24">
            <p className="font-display text-3xl text-chrome/30">No results for "{searchParams.get('q')}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
