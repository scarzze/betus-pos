import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Filter, Package, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  buying_price: number;
  selling_price: number;
  stock: number;
  low_stock_threshold: number;
  imei_tracked: boolean;
}

interface ProductForm {
  name: string;
  sku: string;
  category: string;
  buying_price: string;
  selling_price: string;
  stock: string;
  low_stock_threshold: string;
  imei_tracked: boolean;
}

import ActionModal from '@/components/ActionModal';

const emptyForm: ProductForm = {
  name: '', sku: '', category: '', buying_price: '', selling_price: '',
  stock: '', low_stock_threshold: '10', imei_tracked: false,
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Product[]>('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to fetch products', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean) as string[])];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name, sku: p.sku, category: p.category || '',
      buying_price: String(p.buying_price), selling_price: String(p.selling_price),
      stock: String(p.stock), low_stock_threshold: String(p.low_stock_threshold),
      imei_tracked: p.imei_tracked,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.sku || !form.selling_price) {
      toast({ title: 'Validation Error', description: 'Name, SKU and selling price are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      sku: form.sku,
      category: form.category || null,
      buying_price: Number(form.buying_price) || 0,
      selling_price: Number(form.selling_price) || 0,
      stock: Number(form.stock) || 0,
      low_stock_threshold: Number(form.low_stock_threshold) || 10,
      imei_tracked: form.imei_tracked,
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast({ title: '✅ Product Updated' });
      } else {
        await api.post('/products', payload);
        toast({ title: '✅ Product Added' });
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Something went wrong';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/products/${deleteId}`);
      toast({ title: '✅ Product Deleted' });
      setDeleteId(null);
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to delete product';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="report-container animate-fade-in" style={{ padding: '32px' }}>
      <div className="page-header" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Product Catalog</h1>
            <p className="page-subtitle">Manage your inventory, pricing, and stock alerts</p>
          </div>
          <button onClick={openAdd} className="bt-submit-btn shadow-glow" style={{ padding: '12px 24px' }}>
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        </div>

        <div className="report-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '20px' }}>
          <div className="search-bar-wrapper" style={{ width: '100%', maxWidth: '600px', margin: 0 }}>
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search products by name, SKU, or serial number…"
              className="bt-input search-input" 
            />
          </div>
          
          <div className="bt-category-scroller no-scrollbar">
            <Filter size={14} style={{ color: 'var(--text-dim)', marginRight: '8px', paddingTop: '8px' }} />
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setCategoryFilter(cat)}
                className={`bt-chip ${categoryFilter === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bt-table-wrapper animate-slide-up">
        <div className="no-scrollbar" style={{ overflowX: 'auto' }}>
          <table className="bt-table">
            <thead>
              <tr>
                <th>Product Information</th>
                <th>SKU</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Buy Price</th>
                <th style={{ textAlign: 'right' }}>Sell Price</th>
                <th style={{ textAlign: 'center' }}>Stock</th>
                <th style={{ textAlign: 'center' }}>Tracking</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div className="flex flex-col items-center opacity-30">
                      <Package size={48} className="mb-3" />
                      <p className="text-sm">No products found for the current selection</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(product => {
                const margin = product.selling_price > 0 ? ((product.selling_price - product.buying_price) / product.selling_price * 100).toFixed(1) : '0';
                const isLowStock = product.stock <= product.low_stock_threshold;
                return (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="stat-icon-wrapper theme-primary" style={{ width: '36px', height: '36px' }}>
                          <Package size={16} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px' }}>{product.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>Margin: <span className="text-success">{margin}%</span></span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-dim)' }}>{product.sku}</td>
                    <td>
                      <span className="status-badge theme-info" style={{ fontSize: '10px' }}>{product.category || 'Uncategorized'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>KES {product.buying_price.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>KES {product.selling_price.toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className={`status-badge ${isLowStock ? 'theme-danger' : 'bg-primary-10 text-primary'}`} style={{ minWidth: '60px' }}>
                        {product.stock} Units
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {product.imei_tracked ? (
                        <div className="status-badge theme-success" style={{ fontSize: '9px' }}>IMEI ACTIVE</div>
                      ) : (
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Simple</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => openEdit(product)} className="bt-icon-btn" style={{ width: '32px', height: '32px' }}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="bt-icon-btn" style={{ width: '32px', height: '32px', color: '#f87171' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Product Modal */}
      {showModal && (
        <div className="bt-modal-overlay animate-fade-in">
          <div className="bt-glass-panel animate-scale-in" style={{ maxWidth: '600px', width: '100%', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="stat-icon-wrapper theme-primary" style={{ width: '40px', height: '40px' }}>
                  <Plus size={20} />
                </div>
                <h2 className="chart-title" style={{ margin: 0 }}>{editingId ? 'Modify Product' : 'Register New Item'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="bt-icon-btn"><X size={18} /></button>
            </div>
            
            <div style={{ padding: '32px' }}>
              <div className="bt-input-group">
                <div className="bt-form-group">
                  <label className="bt-label">Identification Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="bt-input" placeholder="e.g. iPhone 15 Pro Max" />
                </div>
                <div className="bt-form-group">
                  <label className="bt-label">Internal SKU / Barcode</label>
                  <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}
                    className="bt-input" placeholder="APL-IP15PM-256" />
                </div>
              </div>

              <div className="bt-form-group">
                <label className="bt-label">Classification Category</label>
                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="bt-input" placeholder="Mobile Devices, Accessories, etc." />
              </div>

              <div className="bt-input-group">
                <div className="bt-form-group">
                  <label className="bt-label">Procurement Cost (KES)</label>
                  <input type="number" value={form.buying_price} onChange={e => setForm({ ...form, buying_price: e.target.value })}
                    className="bt-input text-success" placeholder="0.00" />
                </div>
                <div className="bt-form-group">
                  <label className="bt-label">Market Retail Price (KES)</label>
                  <input type="number" value={form.selling_price} onChange={e => setForm({ ...form, selling_price: e.target.value })}
                    className="bt-input text-primary" placeholder="0.00" />
                </div>
              </div>

              <div className="bt-input-group">
                <div className="bt-form-group">
                  <label className="bt-label">Initial Stock Count</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="bt-input" placeholder="Available units" />
                </div>
                <div className="bt-form-group">
                  <label className="bt-label">Alert Threshold</label>
                  <input type="number" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })}
                    className="bt-input" placeholder="10" />
                </div>
              </div>

              <label className="bt-checkbox-label">
                <input type="checkbox" checked={form.imei_tracked} onChange={e => setForm({ ...form, imei_tracked: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Enable IMEI Tracking</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Required for unique serial number validation on devices</span>
                </div>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginTop: '32px' }}>
                <button onClick={() => setShowModal(false)} className="bt-icon-btn" style={{ width: '100%', height: '48px', fontWeight: 600 }}>Discard</button>
                <button onClick={handleSave} disabled={saving} className="bt-submit-btn shadow-glow" style={{ height: '48px' }}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  <span>{editingId ? 'Commit Changes' : 'Initialize Inventory Item'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ActionModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Inventory Purge Warning"
        description="Are you sure you want to permanently remove this product from the catalog? This will also purge its sales history reference."
        confirmText="Confirm Purge"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
};

export default Products;
