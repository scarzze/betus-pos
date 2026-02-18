import { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  imei?: string;
}

const mockProducts: Product[] = [
  { id: '1', name: 'iPhone 15 Pro Max Case', sku: 'VLX-CSE-001', category: 'Cases', buyingPrice: 250, sellingPrice: 500, stock: 3 },
  { id: '2', name: 'Samsung S24 Screen Protector', sku: 'VLX-SPR-012', category: 'Screen Protectors', buyingPrice: 100, sellingPrice: 300, stock: 5 },
  { id: '3', name: 'USB-C Fast Charger 65W', sku: 'VLX-CHR-008', category: 'Chargers', buyingPrice: 800, sellingPrice: 1500, stock: 2 },
  { id: '4', name: 'Wireless Earbuds Pro', sku: 'VLX-AUD-003', category: 'Audio', buyingPrice: 1200, sellingPrice: 3800, stock: 15 },
  { id: '5', name: 'Lightning Cable 2m', sku: 'VLX-CBL-019', category: 'Cables', buyingPrice: 150, sellingPrice: 400, stock: 45 },
  { id: '6', name: 'Samsung Galaxy A15', sku: 'VLX-PHN-007', category: 'Phones', buyingPrice: 15000, sellingPrice: 19500, stock: 4, imei: '354678091234567' },
  { id: '7', name: 'Phone Ring Holder', sku: 'VLX-ACC-022', category: 'Accessories', buyingPrice: 50, sellingPrice: 200, stock: 80 },
  { id: '8', name: 'Bluetooth Speaker Mini', sku: 'VLX-AUD-011', category: 'Audio', buyingPrice: 900, sellingPrice: 2200, stock: 12 },
];

const Products = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...new Set(mockProducts.map((p) => p.category))];

  const filtered = mockProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">{mockProducts.length} products in inventory</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg gradient-orange px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or SKU…"
            className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-primary/15 text-primary'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Buy Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sell Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Margin</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const margin = ((product.sellingPrice - product.buyingPrice) / product.sellingPrice * 100).toFixed(1);
                const isLowStock = product.stock <= 5;
                return (
                  <tr key={product.id} className="border-b border-border/50 transition-colors hover:bg-secondary/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{product.name}</p>
                          {product.imei && <p className="text-xs text-muted-foreground">IMEI: {product.imei}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{product.sku}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">{product.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">KES {product.buyingPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">KES {product.sellingPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-success">{margin}%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-semibold ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
