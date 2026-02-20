import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Filter, Package, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const emptyForm = {
    name: '', sku: '', category: '', buying_price: '', selling_price: '',
    stock: '', low_stock_threshold: '10', imei_tracked: false,
};
const Products = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/products');
            const data = await res.json();
            setProducts(data);
        }
        catch (err) {
            console.error(err);
            toast({ title: 'Error', description: 'Failed to fetch products', variant: 'destructive' });
        }
        finally {
            setLoading(false);
        }
    }, [toast]);
    useEffect(() => { fetchProducts(); }, [fetchProducts]);
    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
        return matchSearch && matchCategory;
    });
    const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
    const openEdit = (p) => {
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
                const res = await fetch(`http://localhost:8000/products/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const err = await res.json();
                    toast({ title: 'Error', description: err.error || 'Failed to update product', variant: 'destructive' });
                }
                else {
                    toast({ title: '✅ Product Updated' });
                }
            }
            else {
                const res = await fetch('http://localhost:8000/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const err = await res.json();
                    toast({ title: 'Error', description: err.error || 'Failed to add product', variant: 'destructive' });
                }
                else {
                    toast({ title: '✅ Product Added' });
                }
            }
        }
        catch (err) {
            console.error(err);
            toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
        }
        setSaving(false);
        setShowModal(false);
        fetchProducts();
    };
    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:8000/products/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const err = await res.json();
                toast({ title: 'Error', description: err.error || 'Failed to delete product', variant: 'destructive' });
            }
            else {
                toast({ title: '✅ Product Deleted' });
                fetchProducts();
            }
        }
        catch (err) {
            console.error(err);
            toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
        }
    };
    if (loading) {
        return _jsx("div", { className: "flex h-full items-center justify-center", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) });
    }
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "Products" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [products.length, " products in inventory"] })] }), _jsxs("button", { onClick: openAdd, className: "flex items-center gap-2 rounded-lg gradient-orange px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90", children: [_jsx(Plus, { className: "h-4 w-4" }), "Add Product"] })] }), _jsxs("div", { className: "mb-6 flex flex-col gap-3 sm:flex-row", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), _jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search products or SKU\u2026", className: "w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" })] }), _jsxs("div", { className: "flex items-center gap-2 overflow-x-auto", children: [_jsx(Filter, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), categories.map(cat => (_jsx("button", { onClick: () => setCategoryFilter(cat), className: `shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${categoryFilter === cat ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'}`, children: cat }, cat)))] })] }), _jsx("div", { className: "glass-card overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border", children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Product" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "SKU" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Category" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Buy Price" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Sell Price" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Margin" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Stock" }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Actions" })] }) }), _jsx("tbody", { children: filtered.map(product => {
                                    const margin = product.selling_price > 0 ? ((product.selling_price - product.buying_price) / product.selling_price * 100).toFixed(1) : '0';
                                    const isLowStock = product.stock <= product.low_stock_threshold;
                                    return (_jsxs("tr", { className: "border-b border-border/50 transition-colors hover:bg-secondary/50", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10", children: _jsx(Package, { className: "h-4 w-4 text-primary" }) }), _jsx("p", { className: "text-sm font-medium text-foreground", children: product.name })] }) }), _jsx("td", { className: "px-4 py-3 text-sm font-mono text-muted-foreground", children: product.sku }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground", children: product.category || '—' }) }), _jsxs("td", { className: "px-4 py-3 text-right text-sm text-muted-foreground", children: ["KES ", product.buying_price.toLocaleString()] }), _jsxs("td", { className: "px-4 py-3 text-right text-sm font-semibold text-foreground", children: ["KES ", product.selling_price.toLocaleString()] }), _jsx("td", { className: "px-4 py-3 text-right", children: _jsxs("span", { className: "text-sm font-medium text-success", children: [margin, "%"] }) }), _jsx("td", { className: "px-4 py-3 text-right", children: _jsx("span", { className: `text-sm font-semibold ${isLowStock ? 'text-destructive' : 'text-foreground'}`, children: product.stock }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center justify-center gap-1", children: [_jsx("button", { onClick: () => openEdit(product), className: "rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground", children: _jsx(Pencil, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => handleDelete(product.id), className: "rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, product.id));
                                }) })] }) }) }), showModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm", children: _jsxs("div", { className: "glass-card w-full max-w-lg mx-4 p-6 animate-scale-in", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "font-display text-lg font-semibold text-foreground", children: editingId ? 'Edit Product' : 'Add Product' }), _jsx("button", { onClick: () => setShowModal(false), className: "text-muted-foreground hover:text-foreground", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-muted-foreground", children: "Product Name *" }), _jsx("input", { value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), className: "w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-muted-foreground", children: "SKU *" }), _jsx("input", { value: form.sku, onChange: e => setForm({ ...form, sku: e.target.value }), className: "w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-muted-foreground", children: "Category" }), _jsx("input", { value: form.category, onChange: e => setForm({ ...form, category: e.target.value }), className: "w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-muted-foreground", children: "Buying Price (KES)" }), _jsx("input", { type: "number", value: form.buying_price, onChange: e => setForm({ ...form, buying_price: e.target.value }), className: "w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-muted-foreground", children: "Selling Price (KES) *" }), _jsx("input", { type: "number", value: form.selling_price, onChange: e => setForm({ ...form, selling_price: e.target.value }), className: "w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-muted-foreground", children: "Stock Quantity" }), _jsx("input", { type: "number", value: form.stock, onChange: e => setForm({ ...form, stock: e.target.value }), className: "w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-muted-foreground", children: "Low Stock Threshold" }), _jsx("input", { type: "number", value: form.low_stock_threshold, onChange: e => setForm({ ...form, low_stock_threshold: e.target.value }), className: "w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" })] })] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: form.imei_tracked, onChange: e => setForm({ ...form, imei_tracked: e.target.checked }), className: "h-4 w-4 rounded border-border bg-secondary text-primary" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "Track IMEI for this product" })] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx("button", { onClick: () => setShowModal(false), className: "flex-1 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80", children: "Cancel" }), _jsxs("button", { onClick: handleSave, disabled: saving, className: "flex flex-1 items-center justify-center gap-2 rounded-lg gradient-orange px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50", children: [saving ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : null, editingId ? 'Update' : 'Add', " Product"] })] })] })] }) }))] }));
};
export default Products;
