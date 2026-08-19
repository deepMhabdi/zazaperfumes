import { useEffect, useState } from 'react';
import api from '../../lib/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We'll fetch from users — using orders aggregation as a proxy
    api.get('/orders/admin/all?limit=100')
      .then(({ data }) => {
        // Extract unique customers from orders
        const map = new Map();
        data.orders.forEach((o) => {
          const id = o.user?._id || o.guestInfo?.email || 'guest';
          if (!map.has(id)) {
            map.set(id, {
              id,
              name: o.user?.name || o.guestInfo?.name || 'Guest',
              email: o.user?.email || o.guestInfo?.email,
              orderCount: 1,
              totalSpent: o.totals?.total || 0,
              lastOrder: o.createdAt,
            });
          } else {
            const c = map.get(id);
            c.orderCount++;
            c.totalSpent += o.totals?.total || 0;
          }
        });
        setCustomers(Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label mb-1">CRM</p>
        <h1 className="font-display text-4xl text-chrome">Customers</h1>
      </div>
      {loading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-2xs tracking-widest uppercase text-chrome/40">
              <tr>{['Customer', 'Email', 'Orders', 'Total Spent'].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-white">{c.name}</td>
                  <td className="px-4 py-3 text-chrome/50">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-chrome/70">{c.orderCount}</td>
                  <td className="px-4 py-3 text-chrome font-medium">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
