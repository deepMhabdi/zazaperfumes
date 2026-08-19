import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', shortDescription: '', description: '', gender: 'unisex', fragranceFamily: 'oriental',
  concentration: 'EDP', edition: 'noir', featured: false, bestseller: false,
  notes: { top: '', heart: '', base: '' },
  variants: [{ size: '50ml', price: '', stock: '', sku: '' }],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/admin/all?page=${page}&limit=15`);
      setProducts(data.products);
      setTotal(data.pagination.total);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      ...p,
      notes: { top: p.notes?.top?.join(', ') || '', heart: p.notes?.heart?.join(', ') || '', base: p.notes?.base?.join(', ') || '' },
      variants: p.variants?.map((v) => ({ size: v.size, price: v.price, stock: v.stock, sku: v.sku || '' })) || [{ size: '50ml', price: '', stock: '', sku: '' }],
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        notes: {
          top: form.notes.top.split(',').map((s) => s.trim()).filter(Boolean),
          heart: form.notes.heart.split(',').map((s) => s.trim()).filter(Boolean),
          base: form.notes.base.split(',').map((s) => s.trim()).filter(Boolean),
        },
        variants: form.variants.map((v) => ({ ...v, price: Number(v.price), stock: Number(v.stock) })),
      };
      if (editing) {
        await api.put(`/products/${editing}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Delete failed'); }
  };

  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, { size: '', price: '', stock: '', sku: '' }] }));
  const updateVariant = (i, key, val) => setForm((f) => ({ ...f, variants: f.variants.map((v, idx) => idx === i ? { ...v, [key]: val } : v) }));
  const removeVariant = (i) => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Inventory</p>
          <h1 className="font-display text-4xl text-chrome">Products ({total})</h1>
        </div>
        <button id="create-product-btn" onClick={openCreate} className="btn-primary py-2 px-5">
          <Plus size={14} /> New Product
        </button>
      </div>

      {loading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-2xs tracking-widest uppercase text-chrome/40">
              <tr>
                {['Product', 'Edition', 'Stock', 'Price', 'Featured', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && <img src={p.images[0].url} alt={p.name} className="w-10 h-12 object-cover" />}
                      <div>
                        <p className="text-white">{p.name}</p>
                        <p className="text-2xs text-chrome/30">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-chrome/50 capitalize">{p.edition}</td>
                  <td className="px-4 py-3">
                    {p.variants?.map((v) => (
                      <span key={v.size} className={`text-2xs mr-2 ${v.stock < 5 ? 'text-red-400' : 'text-chrome/50'}`}>
                        {v.size}: {v.stock}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-chrome/70">₹{p.variants?.[0]?.price?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-2xs ${p.featured ? 'text-edition-gold' : 'text-chrome/20'}`}>{p.featured ? '★' : '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-chrome/40 hover:text-chrome transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-400/40 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-zaza-charcoal border border-white/10 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 sticky top-0 bg-zaza-charcoal z-10">
                  <h2 className="font-display text-2xl text-chrome">{editing ? 'Edit Product' : 'New Product'}</h2>
                  <button onClick={() => setModalOpen(false)}><X size={18} className="text-chrome/50" /></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Name *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-zaza" required />
                  </div>
                  {/* Short desc */}
                  <div>
                    <label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Short Description</label>
                    <input type="text" value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} className="input-zaza" />
                  </div>
                  {/* Description */}
                  <div>
                    <label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">Description *</label>
                    <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="input-zaza resize-none" required />
                  </div>
                  {/* Selects */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Gender', key: 'gender', opts: ['masculine', 'feminine', 'unisex'] },
                      { label: 'Family', key: 'fragranceFamily', opts: ['floral', 'woody', 'oriental', 'fresh', 'citrus', 'gourmand', 'aquatic', 'fougere', 'chypre'] },
                      { label: 'Edition', key: 'edition', opts: ['noir', 'white', 'purple', 'blue', 'gold', 'rose'] },
                    ].map(({ label, key, opts }) => (
                      <div key={key}>
                        <label className="text-2xs tracking-widest uppercase text-chrome/50 block mb-2">{label}</label>
                        <select value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="input-zaza py-2 text-sm">
                          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  {/* Notes */}
                  <div>
                    <p className="text-2xs tracking-widest uppercase text-chrome/50 mb-2">Fragrance Notes (comma-separated)</p>
                    {['top', 'heart', 'base'].map((tier) => (
                      <div key={tier} className="mb-2">
                        <label className="text-2xs text-chrome/30 capitalize block mb-1">{tier}</label>
                        <input type="text" placeholder={`${tier} notes...`} value={form.notes[tier]} onChange={(e) => setForm((f) => ({ ...f, notes: { ...f.notes, [tier]: e.target.value } }))} className="input-zaza py-2 text-xs" />
                      </div>
                    ))}
                  </div>
                  {/* Variants */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-2xs tracking-widest uppercase text-chrome/50">Variants</p>
                      <button type="button" onClick={addVariant} className="text-2xs text-chrome/50 hover:text-chrome flex items-center gap-1"><Plus size={10} /> Add Variant</button>
                    </div>
                    {form.variants.map((v, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                        <input placeholder="Size" value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} className="input-zaza py-2 text-xs" />
                        <input type="number" placeholder="Price" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} className="input-zaza py-2 text-xs" />
                        <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} className="input-zaza py-2 text-xs" />
                        <button type="button" onClick={() => removeVariant(i)} className="text-red-400/50 hover:text-red-400 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                  {/* Flags */}
                  <div className="flex gap-6">
                    {[{ label: 'Featured', key: 'featured' }, { label: 'Bestseller', key: 'bestseller' }].map(({ label, key }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))} className="accent-chrome" />
                        <span className="text-sm text-chrome/60">{label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                      {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                    </button>
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
