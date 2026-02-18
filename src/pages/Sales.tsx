import { useState, useEffect } from 'react';
import { Search, ShoppingCart, X, CreditCard, Banknote, Loader2, CheckCircle, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  selling_price: number;
  buying_price: number;
  stock: number;
  sku: string;
}

interface CartItem extends Product {
  qty: number;
}

const Sales = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa'>('cash');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [saleComplete, setSaleComplete] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const isSales = user?.role === 'SALES';

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, selling_price, buying_price, stock, sku')
        .gt('stock', 0)
        .order('name');
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, [saleComplete]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast({ title: 'Out of stock', description: `Only ${product.stock} available`, variant: 'destructive' });
          return prev;
        }
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    const item = cart.find(i => i.id === id);
    if (item && qty > item.stock) {
      toast({ title: 'Out of stock', description: `Only ${item.stock} available`, variant: 'destructive' });
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const totalAmount = cart.reduce((sum, i) => sum + i.selling_price * i.qty, 0);
  const totalCost = cart.reduce((sum, i) => sum + i.buying_price * i.qty, 0);
  const profit = totalAmount - totalCost;
  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const completeSale = async (method: 'cash' | 'mpesa' = paymentMethod) => {
    if (cart.length === 0) return;
    setCompleting(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      setCompleting(false);
      return;
    }

    const saleNumber = `S${Date.now().toString(36).toUpperCase()}`;

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        sale_number: saleNumber,
        user_id: authUser.id,
        payment_method: method,
        total_amount: totalAmount,
        total_cost: totalCost,
        profit,
        status: method === 'mpesa' ? 'pending' : 'completed',
      })
      .select()
      .single();

    if (saleError || !sale) {
      toast({ title: 'Sale Failed', description: saleError?.message || 'Unknown error', variant: 'destructive' });
      setCompleting(false);
      return;
    }

    const saleItems = cart.map((item) => ({
      sale_id: sale.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.qty,
      selling_price: item.selling_price,
      buying_price: item.buying_price,
      subtotal: item.selling_price * item.qty,
    }));

    await supabase.from('sale_items').insert(saleItems);

    // Deduct stock
    for (const item of cart) {
      await supabase.from('products').update({ stock: item.stock - item.qty }).eq('id', item.id);
    }

    // If M-Pesa, trigger STK push
    if (method === 'mpesa' && mpesaPhone) {
      try {
        const { data: stkData, error: stkError } = await supabase.functions.invoke('mpesa-stk', {
          body: { phone: mpesaPhone, amount: totalAmount, sale_id: sale.id },
        });
        if (stkError) {
          toast({ title: 'M-Pesa STK Failed', description: 'Sale saved but M-Pesa prompt failed. Payment pending.', variant: 'destructive' });
        } else {
          toast({ title: '📱 M-Pesa Prompt Sent', description: `Check phone ${mpesaPhone} for payment prompt` });
        }
      } catch {
        toast({ title: 'M-Pesa Error', description: 'Sale saved. Collect payment manually.', variant: 'destructive' });
      }
    }

    setCart([]);
    setCompleting(false);
    setSaleComplete(true);
    setShowMpesaModal(false);
    setMpesaPhone('');
    if (method === 'cash') {
      toast({ title: '✅ Sale Complete', description: `${saleNumber} — KES ${totalAmount.toLocaleString()}` });
    }
    setTimeout(() => setSaleComplete(false), 2000);
  };

  const handleComplete = () => {
    if (paymentMethod === 'mpesa') {
      setShowMpesaModal(true);
    } else {
      completeSale('cash');
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

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
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
            className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <button key={product.id} onClick={() => addToCart(product)}
              className="glass-card p-4 text-left transition-all hover:border-primary/40 hover:glow-orange">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground leading-tight">{product.name}</p>
              <p className="mt-1 font-display text-lg font-bold text-primary">KES {product.selling_price.toLocaleString()}</p>
              {!isSales && <p className="text-xs text-muted-foreground">Buy: KES {product.buying_price.toLocaleString()}</p>}
              <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
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
                {saleComplete ? (
                  <><CheckCircle className="mb-3 h-10 w-10 text-success" /><p className="text-sm text-success font-semibold">Sale Completed!</p></>
                ) : (
                  <><ShoppingCart className="mb-3 h-10 w-10 opacity-30" /><p className="text-sm">Cart is empty</p></>
                )}
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">KES {item.selling_price.toLocaleString()} each</p>
                    {!isSales && <p className="text-xs text-muted-foreground/60">Cost: KES {item.buying_price.toLocaleString()}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-sm font-bold text-foreground hover:bg-primary/20">−</button>
                    <span className="w-6 text-center text-sm font-semibold text-foreground">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-sm font-bold text-foreground hover:bg-primary/20">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                </div>
              ))
            )}
          </div>

          {/* Checkout */}
          <div className="border-t border-border p-4 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                <span className="text-sm font-semibold text-foreground">KES {totalAmount.toLocaleString()}</span>
              </div>
              {!isSales && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total Cost</span>
                    <span className="text-xs text-muted-foreground">KES {totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Profit</span>
                    <span className={`text-xs font-semibold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>KES {profit.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-medium text-muted-foreground">Total</span>
                <span className="font-display text-2xl font-bold text-foreground">KES {totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  paymentMethod === 'cash' ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground border border-transparent'}`}>
                <Banknote className="h-4 w-4" />Cash
              </button>
              <button onClick={() => setPaymentMethod('mpesa')}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  paymentMethod === 'mpesa' ? 'bg-success/15 text-success border border-success/30' : 'bg-secondary text-muted-foreground border border-transparent'}`}>
                <CreditCard className="h-4 w-4" />M-Pesa
              </button>
            </div>

            <button disabled={cart.length === 0 || completing} onClick={handleComplete}
              className="w-full rounded-lg gradient-orange px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30 flex items-center justify-center gap-2">
              {completing ? <><Loader2 className="h-4 w-4 animate-spin" />Processing…</> : `Complete Sale — KES ${totalAmount.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>

      {/* M-Pesa Phone Modal */}
      {showMpesaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm mx-4 p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground">M-Pesa Payment</h2>
              <button onClick={() => setShowMpesaModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Enter customer's phone number to send STK push</p>
            <div className="relative mb-4">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="tel" value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)}
                placeholder="0712345678" className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-success focus:outline-none focus:ring-1 focus:ring-success" />
            </div>
            <p className="text-center font-display text-xl font-bold text-foreground mb-4">KES {totalAmount.toLocaleString()}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowMpesaModal(false)} className="flex-1 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground">Cancel</button>
              <button onClick={() => completeSale('mpesa')} disabled={!mpesaPhone || completing}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground hover:opacity-90 disabled:opacity-50">
                {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Send STK Push
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
