import { useState } from 'react';
import { Plus, Search, ShoppingCart, X, CreditCard, Banknote } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

const productCatalog = [
  { id: '1', name: 'iPhone 15 Pro Max Case', price: 500 },
  { id: '2', name: 'Samsung S24 Screen Protector', price: 300 },
  { id: '3', name: 'USB-C Fast Charger 65W', price: 1500 },
  { id: '4', name: 'Wireless Earbuds Pro', price: 3800 },
  { id: '5', name: 'Lightning Cable 2m', price: 400 },
  { id: '6', name: 'Samsung Galaxy A15', price: 19500 },
  { id: '7', name: 'Phone Ring Holder', price: 200 },
  { id: '8', name: 'Bluetooth Speaker Mini', price: 2200 },
];

const Sales = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa'>('cash');

  const addToCart = (product: typeof productCatalog[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const filteredProducts = productCatalog.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Product Grid */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">New Sale</h1>
          <p className="text-sm text-muted-foreground">Select products to add to cart</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="glass-card p-4 text-left transition-all hover:border-primary/40 hover:glow-orange"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground leading-tight">{product.name}</p>
              <p className="mt-1 font-display text-lg font-bold text-primary">KES {product.price.toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full border-l border-border bg-sidebar lg:w-96">
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Cart ({cart.length})</h2>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ShoppingCart className="mb-3 h-10 w-10 opacity-30" />
                <p className="text-sm">Cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">KES {item.price.toLocaleString()} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-sm font-bold text-foreground hover:bg-primary/20">−</button>
                    <span className="w-6 text-center text-sm font-semibold text-foreground">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-sm font-bold text-foreground hover:bg-primary/20">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Checkout */}
          <div className="border-t border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="font-display text-2xl font-bold text-foreground">KES {total.toLocaleString()}</span>
            </div>

            {/* Payment method */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  paymentMethod === 'cash' ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground border border-transparent'
                }`}
              >
                <Banknote className="h-4 w-4" />
                Cash
              </button>
              <button
                onClick={() => setPaymentMethod('mpesa')}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  paymentMethod === 'mpesa' ? 'bg-success/15 text-success border border-success/30' : 'bg-secondary text-muted-foreground border border-transparent'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                M-Pesa
              </button>
            </div>

            <button
              disabled={cart.length === 0}
              className="w-full rounded-lg gradient-orange px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30"
            >
              Complete Sale — KES {total.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
