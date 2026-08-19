import { useEffect, useState } from 'react';
import api from '../../lib/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const STATUS_COLORS = { pending: 'text-yellow-400', confirmed: 'text-blue-400', processing: 'text-blue-400', shipped: 'text-chrome', delivered: 'text-green-400', cancelled: 'text-red-400', refunded: 'text-orange-400' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filter) params.set('status', filter);
      const { data } = await api.get(`/orders/admin/all?${params}`);
      setOrders(data.orders);
      setTotal(data.pagination.total);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filter, page]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Fulfillment</p>
          <h1 className="font-display text-4xl text-chrome">Orders ({total})</h1>
        </div>
        <select id="order-filter" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input-zaza py-2 text-xs w-40">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-2xs tracking-widest uppercase text-chrome/40">
              <tr>
                {['Order', 'Customer', 'Total', 'Payment', 'Status', 'Date', 'Update'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-chrome/60">{order.user?.name || order.guestInfo?.name || 'Guest'}</td>
                  <td className="px-4 py-3 text-chrome">₹{order.totals?.total?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-2xs uppercase tracking-widest ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-2xs uppercase tracking-widest ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-chrome/40 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className="bg-zaza-graphite border border-white/10 text-chrome/60 text-xs px-2 py-1 focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
