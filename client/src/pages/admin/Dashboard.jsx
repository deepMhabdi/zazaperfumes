import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ShoppingBag, TrendingUp, Package, Users } from 'lucide-react';
import api from '../../lib/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="glass-card p-6 flex items-center gap-4">
    <div className={`w-12 h-12 flex items-center justify-center border ${color}`}>
      <Icon size={20} className={color.replace('border-', 'text-')} />
    </div>
    <div>
      <p className="text-2xs tracking-widest uppercase text-chrome/40">{label}</p>
      <p className="font-display text-3xl text-white mt-0.5">{value}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-chrome/60 mb-1">{label}</p>
      <p className="text-chrome">₹{payload[0]?.value?.toLocaleString('en-IN')}</p>
      <p className="text-chrome/60">{payload[1]?.value} orders</p>
    </div>
  );
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    setLoading(true);
    api.get(`/orders/admin/analytics?period=${period}`)
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  const stats = data?.orderStats || {};

  return (
    <div className="space-y-8">
      <div>
        <p className="section-label mb-2">Overview</p>
        <h1 className="font-display text-4xl text-chrome">Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${((stats.total || 0) / 1000).toFixed(0)}K`} icon={TrendingUp} color="border-edition-gold/30" />
        <StatCard label="Total Orders" value={stats.count || 0} icon={ShoppingBag} color="border-chrome/30" />
        <StatCard label="Paid Orders" value={stats.paid || 0} icon={Package} color="border-green-400/30" />
        <StatCard label="Products" value="18" icon={Users} color="border-edition-purple/30" />
      </div>

      {/* Revenue chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-chrome">Revenue</h2>
          <div className="flex gap-2">
            {['7', '30', '90'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs border transition-all ${period === p ? 'border-chrome text-chrome bg-chrome/10' : 'border-white/10 text-chrome/40 hover:border-chrome/30'}`}
              >
                {p}d
              </button>
            ))}
          </div>
        </div>
        {data?.revenueData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(192,192,192,0.05)" />
              <XAxis dataKey="_id" stroke="#555" tick={{ fontSize: 11 }} />
              <YAxis stroke="#555" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#C0C0C0" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="orders" stroke="#7B2D8B" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-60 flex items-center justify-center">
            <p className="text-chrome/30 text-sm">No revenue data yet — complete some orders!</p>
          </div>
        )}
      </div>

      {/* Top products */}
      {data?.topProducts?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-display text-2xl text-chrome mb-6">Top Products</h2>
          <div className="space-y-3">
            {data.topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-chrome/20 font-display text-lg w-6">{i + 1}</span>
                  <p className="text-sm text-white">{p.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-chrome text-sm">₹{p.revenue?.toLocaleString('en-IN')}</p>
                  <p className="text-2xs text-chrome/30">{p.units} units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
