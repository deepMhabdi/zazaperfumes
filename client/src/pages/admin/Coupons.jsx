import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EMPTY = { code: '', type: 'percent', value: '', minOrderAmount: 0, maxDiscount: '', expiryDate: '', usageLimit: '', active: true };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await api.get('/coupons/admin'); setCoupons(data.coupons); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/coupons/admin', { ...form, value: Number(form.value), minOrderAmount: Number(form.minOrderAmount), maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined, usageLimit: form.usageLimit ? Number(form.usageLimit) : null });
      toast.success('Coupon created'); setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id, active) => {
    try { await api.put(`/coupons/admin/${id}`, { active: !active }); fetch(); }
    catch { toast.error('Update failed'); }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete coupon?')) return;
    try { await api.delete(`/coupons/admin/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><p className="section-label mb-1">Promotions</p><h1 className="font-display text-4xl text-chrome">Coupons</h1></div>
        <button id="create-coupon-btn" onClick={() => { setForm(EMPTY); setModalOpen(true); }} className="btn-primary py-2 px-5"><Plus size={14} /> New Coupon</button>
      </div>

      {loading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-2xs tracking-widest uppercase text-chrome/40">
              <tr>{['Code', 'Type', 'Value', 'Min Order', 'Expiry', 'Used', 'Active', ''].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-white font-mono">{c.code}</td>
                  <td className="px-4 py-3 text-chrome/50">{c.type}</td>
                  <td className="px-4 py-3 text-chrome">{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}</td>
                  <td className="px-4 py-3 text-chrome/50">₹{c.minOrderAmount}</td>
                  <td className="px-4 py-3 text-chrome/40 text-xs">{new Date(c.expiryDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-chrome/50">{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c._id, c.active)} className={`text-2xs uppercase tracking-widest ${c.active ? 'text-green-400' : 'text-red-400/60'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteCoupon(c._id)} className="text-red-400/40 hover:text-red-400"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              <div className="bg-zaza-charcoal border border-white/10 w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6"><h2 className="font-display text-2xl text-chrome">New Coupon</h2><button onClick={() => setModalOpen(false)}><X size={18} className="text-chrome/50" /></button></div>
                <form onSubmit={handleSave} className="space-y-4">
                  <div><label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Code</label><input type="text" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} className="input-zaza" required placeholder="SUMMER20" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Type</label>
                      <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="input-zaza py-2 text-sm">
                        <option value="percent">Percent (%)</option><option value="flat">Flat (₹)</option>
                      </select>
                    </div>
                    <div><label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Value</label><input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} className="input-zaza" required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Min Order (₹)</label><input type="number" value={form.minOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))} className="input-zaza" /></div>
                    <div><label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Usage Limit</label><input type="number" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} className="input-zaza" placeholder="Unlimited" /></div>
                  </div>
                  <div><label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Expiry Date</label><input type="date" value={form.expiryDate} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))} className="input-zaza" required /></div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Creating...' : 'Create Coupon'}</button>
                    <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost px-6">Cancel</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
