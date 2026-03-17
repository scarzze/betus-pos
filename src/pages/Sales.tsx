import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, X, CreditCard, Banknote, Loader2, CheckCircle, Phone, Package, User as UserIcon, ShieldCheck, Timer, AlertCircle, CheckCircle2, QrCode } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';
import { Receipt, ReceiptData } from '@/components/Receipt';

interface Customer {
  id: string;
  name: string;
  total_debt: number;
}

interface Product {
  id: string;
  name: string;
  selling_price: number;
  buying_price: number;
  stock: number;
  sku: string;
  size?: string;
}

interface CartItem extends Product {
  qty: number;
}

type MpesaStage = 'idle' | 'sending' | 'processing' | 'verifying' | 'success' | 'error';

const Sales = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'credit'>('cash');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [saleComplete, setSaleComplete] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaStage, setMpesaStage] = useState<MpesaStage>('idle');
  const [mpesaStatusMsg, setMpesaStatusMsg] = useState('');
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const isSales = user?.role === 'SALES';
  const socketRef = useRef<WebSocket | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, custRes] = await Promise.all([
          api.get<Product[]>('/products'),
          api.get<Customer[]>('/customers')
        ]);
        setProducts(prodRes.data.filter(p => p.stock > 0));
        setCustomers(custRes.data);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load terminal data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [saleComplete]);

  // Network Status / Offline Mode watcher
  useEffect(() => {
    const handleOnline = () => { 
      setIsOffline(false); 
      toast({ title: '🌐 Online Mode Restored', description: 'Network connection established. Sync active.', variant: 'default' }); 
    };
    const handleOffline = () => { 
      setIsOffline(true); 
      toast({ title: '⚠️ Offline Mode Active', description: 'Transaction logs will cache locally and synchronize once network is restored.', variant: 'destructive' }); 
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // WebSocket for real-time payment confirmation
  useEffect(() => {
    if (user?.org) {
      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'}/${user.org}`;
      const socket = new WebSocket(wsUrl);
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'payment_success') {
          setMpesaStage('success');
          setMpesaStatusMsg('Payment Verified. Transaction Ledger Finalized.');
          toast({ title: '✅ M-Pesa Confirmed', description: 'Payment received successfully.' });
          
          if (receiptData) {
            setTimeout(() => window.print(), 100);
          }
          
          // Clear cart and close modal after a short delay
          setTimeout(() => {
            setCart([]);
            setSaleComplete(true);
            setShowMpesaModal(false);
            setMpesaStage('idle');
            setReceiptData(null);
            setTimeout(() => setSaleComplete(false), 2000);
          }, 1500);
        } else if (data.type === 'payment_failed') {
          setMpesaStage('error');
          setMpesaStatusMsg('Payment Failed or Cancelled by User.');
        }
      };

      socketRef.current = socket;
      return () => socket.close();
    }
  }, [user]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast({ title: 'Out of stock', description: `Only ${product.stock} available`, variant: 'destructive' });
          return prev;
        }
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    const item = cart.find(i => i.id === id);
    if (item && qty > item.stock) {
      toast({ title: 'Out of stock', description: `Only ${item.stock} available`, variant: 'destructive' });
      return;
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const totalAmount = cart.reduce((sum, i) => sum + i.selling_price * i.qty, 0);
  const totalCost = cart.reduce((sum, i) => sum + i.buying_price * i.qty, 0);
  const profit = totalAmount - totalCost;
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const completeSale = async (method: 'cash' | 'mpesa' | 'credit' = paymentMethod) => {
    if (cart.length === 0) return;
    if (method === 'credit' && !selectedCustomerId) {
       toast({ title: 'Customer Required', description: 'Please select a customer for credit sales', variant: 'destructive' });
       return;
    }
    
    if (method === 'mpesa') {
      setMpesaStage('sending');
      setMpesaStatusMsg('Initializing Secure M-Pesa Handshake...');
    } else {
      setCompleting(true);
    }

    try {
      const saleNumber = `S${Date.now().toString(36).toUpperCase()}`;

      // POST sale
      const { data: sale } = await api.post('/sales', {
        sale_number: saleNumber,
        user_id: user?.id,
        customer_id: selectedCustomerId || null,
        payment_method: method,
        total_amount: totalAmount,
        total_cost: totalCost,
        profit,
        status: method === 'mpesa' ? 'PENDING' : (method === 'credit' ? 'UNPAID' : 'COMPLETED'),
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.qty,
          size: item.size,
          selling_price: item.selling_price,
          buying_price: item.buying_price,
          subtotal: item.selling_price * item.qty,
        })),
      });

      const stagedReceipt: ReceiptData = {
        saleNumber,
        cashierName: (user as any)?.first_name || (user as any)?.name || 'System',
        date: new Date().toISOString(),
        paymentMethod: method,
        items: cart.map(i => ({ name: i.name, size: i.size, qty: i.qty, price: i.selling_price })),
        totalAmount
      };
      setReceiptData(stagedReceipt);

      // Handle M-Pesa STK push
      if (method === 'mpesa' && mpesaPhone) {
        try {
          await api.post(`/mpesa/stk/${sale.id}?phone=${mpesaPhone}`);
          setMpesaStage('verifying'); // <--- Shift to Confirm stage
          setMpesaStatusMsg('Checking Verification Ledger. Please confirm PIN on device...');
          // Now we wait for WebSocket confirmation
        } catch (err: any) {
          setMpesaStage('error');
          setMpesaStatusMsg(err.response?.data?.detail || 'Handshake failed. Interface error.');
          toast({ title: 'M-Pesa Error', description: 'Sale saved but payment prompt failed', variant: 'destructive' });
        }
      } else {
        // Non-Mpesa flows
        setTimeout(() => window.print(), 100);
        setCart([]);
        setSaleComplete(true);
        setSelectedCustomerId('');
        if (method === 'cash') toast({ title: '✅ Sale Complete', description: `${saleNumber} — KES ${totalAmount.toLocaleString()}` });
        if (method === 'credit') toast({ title: '📝 Credit Recorded', description: `${saleNumber} — Assigned to Client` });
        setTimeout(() => {
           setSaleComplete(false);
           setReceiptData(null);
        }, 2000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Unknown error';
      toast({ title: 'Sale Failed', description: msg, variant: 'destructive' });
      if (method === 'mpesa') {
        setMpesaStage('error');
        setMpesaStatusMsg(msg);
      }
    } finally {
      if (method !== 'mpesa') setCompleting(false);
    }
  };

  const handleComplete = () => {
    if (paymentMethod === 'mpesa') setShowMpesaModal(true);
    else if (paymentMethod === 'credit') completeSale('credit');
    else completeSale('cash');
  };

  if (loading) return <div className="loader-container animate-fade-in"><Loader2 className="spinner large text-primary" /></div>;

  return (
    <div className="sales-container animate-fade-in">
      {/* Product Grid */}
      <section className="product-discovery bt-glass-panel" style={{ padding: '24px' }}>
        <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
             <h1 className="page-title">Sales Terminal</h1>
             <p className="page-subtitle">Select products to initialize a new transaction</p>
          </div>
          {isOffline && (
             <div className="status-badge theme-danger flex items-center gap-2">
                <AlertCircle size={14} /> Offline Resiliency Mode
             </div>
          )}
        </div>
        
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search catalog by name or SKU…"
            className="bt-input search-input" 
          />
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="bt-glass-panel flex flex-col items-center justify-center py-20 text-muted-foreground" style={{ textAlign: 'center' }}>
            <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <h3 className="chart-title">{search ? 'No matches found' : 'Inventory is empty'}</h3>
            <p className="text-sm">Try a different search term or check stock levels.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <button 
                key={product.id} 
                onClick={() => addToCart(product)} 
                className="bt-glass-card product-card animate-scale-in"
                style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                <div className="product-icon-wrap theme-primary">
                  <Package size={20} className="text-primary" />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">KES {product.selling_price.toLocaleString()}</p>
                  <div className="flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`status-badge ${product.stock < 5 ? 'theme-danger' : 'bg-primary-10 text-primary'}`} style={{ fontSize: '10px' }}>
                      {product.stock} Units
                    </span>
                    {!isSales && <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Margin: KES {(product.selling_price - product.buying_price).toLocaleString()}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Cart Panel */}
      <aside className="cart-sidebar bt-glass-panel">
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingCart size={20} className="text-primary" />
            <span>Active Cart</span>
            <span className="cart-badge">{cart.length}</span>
          </div>
        </div>

        <div className="cart-items-wrapper no-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              {saleComplete ? (
                <>
                  <CheckCircle size={48} className="text-success mb-3" />
                  <p className="font-bold text-success">Transaction Successful</p>
                </>
              ) : (
                <>
                  <ShoppingCart size={40} className="mb-3" />
                  <p className="text-sm font-medium">Your cart is empty</p>
                </>
              )}
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map(item => (
                <div key={item.id} className="cart-item animate-slide-up">
                  <div className="item-details" style={{ flex: 1 }}>
                    <p className="item-name">{item.name} {item.size ? `(${item.size})` : ''}</p>
                    <p className="item-price">KES {item.selling_price.toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="item-controls">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="qty-btn" style={{ fontSize: '18px' }}>−</button>
                      <span className="qty-count">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="qty-btn" style={{ fontSize: '18px' }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="bt-icon-btn" style={{ width: '32px', height: '32px', borderRadius: '8px', color: '#f87171' }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Selection */}
        <div className="summary-section" style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
          <label className="bt-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <UserIcon size={14} className="text-primary" />
            <span>Customer / Client</span>
          </label>
          <select 
            className="bt-input" 
            style={{ width: '100%', fontSize: '13px', background: 'rgba(255,255,255,0.02)' }}
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            <option value="">Walk-in Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} (Debt: KES {c.total_debt.toLocaleString()})</option>
            ))}
          </select>
        </div>

        {/* Checkout Summary */}
        <div className="cart-footer">
          <div className="summary-section" style={{ marginBottom: '20px' }}>
            <div className="summary-row">
              <span style={{ color: 'var(--text-dim)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>KES {totalAmount.toLocaleString()}</span>
            </div>
            {!isSales && (
              <div className="summary-row" style={{ marginTop: '4px', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Expected Profit</span>
                <span className="text-success" style={{ fontWeight: 600 }}>+ KES {profit.toLocaleString()}</span>
              </div>
            )}
            <div className="summary-row total-row">
              <span>Total Pay</span>
              <span className="text-white">KES {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="payment-methods">
            <button 
              onClick={() => setPaymentMethod('cash')}
              className={`method-btn ${paymentMethod === 'cash' ? 'active-cash shadow-glow' : ''}`}
            >
              <Banknote size={16} /> <span>Cash</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('mpesa')}
              className={`method-btn ${paymentMethod === 'mpesa' ? 'active-mpesa shadow-glow' : ''}`}
            >
              <CreditCard size={16} /> <span>M-Pesa</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('credit')}
              className={`method-btn ${paymentMethod === 'credit' ? 'active-credit shadow-glow' : ''}`}
              style={{ borderColor: paymentMethod === 'credit' ? '#f87171' : 'var(--border-light)' }}
            >
              <UserIcon size={16} /> <span>Credit</span>
            </button>
          </div>

          <button 
            disabled={cart.length === 0 || completing} 
            onClick={handleComplete}
            className="bt-submit-btn shadow-glow"
            style={{ padding: '14px', borderRadius: '12px' }}
          >
            {completing ? (
              <><Loader2 size={18} className="animate-spin" /> Finalizing…</>
            ) : (
              `Complete Transaction`
            )}
          </button>
        </div>
      </aside>

      {/* Modern M-Pesa Handshake Modal */}
      {showMpesaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="bt-glass-panel max-w-md w-full p-10 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-scale-in">
            
            {/* Stage Indicator Icons */}
            <div className="flex justify-center mb-10 overflow-hidden">
               <div className="flex items-center gap-2 relative">
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${mpesaStage !== 'idle' ? 'bg-primary' : 'bg-white/10'}`} />
                  <div className={`w-12 h-0.5 transition-all duration-500 ${['processing', 'verifying', 'success'].includes(mpesaStage) ? 'bg-primary' : 'bg-white/10'}`} />
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${['processing', 'verifying', 'success'].includes(mpesaStage) ? 'bg-primary' : 'bg-white/10'}`} />
                  <div className={`w-12 h-0.5 transition-all duration-500 ${mpesaStage === 'success' ? 'bg-primary' : 'bg-white/10'}`} />
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${mpesaStage === 'success' ? 'bg-primary' : 'bg-white/10'}`} />
               </div>
            </div>

            {mpesaStage === 'idle' ? (
              <form 
                onSubmit={(e) => { e.preventDefault(); if(mpesaPhone) completeSale('mpesa'); }}
                className="animate-fade-in"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Phone className="text-primary" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase leading-none">M-Pesa Express</h2>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Initialization Phase</p>
                  </div>
                </div>
                
                <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
                  <div className="relative group">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="tel" 
                      value={mpesaPhone} 
                      onChange={e => setMpesaPhone(e.target.value)} 
                      placeholder="e.g. 07XXXXXXXX"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 transition-all text-sm outline-none font-bold text-white placeholder:text-white/20"
                      autoFocus
                    />
                  </div>
                  
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 md:p-6 text-center">
                    <div className="flex justify-center mb-4">
                       <div className="w-24 h-24 bg-white rounded-xl p-2 flex items-center justify-center">
                          <QRCodeSVG 
                            value={`Till: ${import.meta.env.VITE_MPESA_TILL || '4519967'}\nAmount: ${totalAmount}`} 
                            size={80} 
                            level="M" 
                            fgColor="#05050a"
                            bgColor="#ffffff"
                          />
                       </div>
                    </div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Amount to Charge</p>
                    <p className="text-2xl md:text-3xl font-black text-white">KES {totalAmount.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-primary tracking-widest mt-2">TILL: {import.meta.env.VITE_MPESA_TILL || '4519967'}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowMpesaModal(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white/40 font-bold rounded-2xl border border-white/10 transition-all text-[10px] uppercase tracking-widest">Cancel</button>
                  <button 
                    type="submit"
                    disabled={!mpesaPhone}
                    className="flex-1 py-4 bg-primary text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)]"
                  >
                    Initiate
                  </button>
                </div>
              </form>
            ) : mpesaStage === 'success' ? (
              <div className="text-center animate-scale-in">
                 <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                 </div>
                 <h2 className="text-2xl font-black mb-2 uppercase tracking-tight text-emerald-500">Access Verified</h2>
                 <p className="text-emerald-500 font-medium text-sm mb-10">{mpesaStatusMsg}</p>
                 <div className="py-4 px-6 bg-emerald-500/10 rounded-2xl text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
                    Ledger Finalized • {new Date().toLocaleTimeString()}
                 </div>
              </div>
            ) : (
              <div className="text-center animate-fade-in">
                <div className="relative w-24 h-24 mx-auto mb-10">
                   {mpesaStage === 'error' ? (
                     <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <AlertCircle size={40} className="text-red-500" />
                     </div>
                   ) : (
                     <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                   )}
                   <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck size={32} className={mpesaStage === 'error' ? 'text-red-500/20' : 'text-primary/20'} />
                   </div>
                </div>

                <h3 className="text-xl font-black mb-4 uppercase tracking-tight">
                  {mpesaStage === 'sending' ? 'Sending Request' : 
                   mpesaStage === 'processing' ? 'Checkout Prompt' : 
                   mpesaStage === 'verifying' ? 'Verifying Receipt' : 'Identity Error'}
                </h3>
                <p className={`text-sm font-medium leading-relaxed mb-10 ${mpesaStage === 'error' ? 'text-red-400' : 'text-white/40'}`}>
                  {mpesaStatusMsg}
                </p>

                {mpesaStage === 'error' ? (
                   <div className="flex gap-4">
                      <button onClick={() => setMpesaStage('idle')} className="flex-1 py-4 bg-white/5 text-white/60 font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest text-[10px]">Retry</button>
                      <button onClick={() => setShowMpesaModal(false)} className="flex-1 py-4 bg-white/5 text-white/40 font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest text-[10px]">Close</button>
                   </div>
                ) : (
                  <div className="flex flex-col items-center gap-6">
                     <div className="flex items-center justify-center gap-3 py-2 px-6 bg-primary/5 rounded-full border border-primary/10 animate-pulse">
                        <Timer size={14} className="text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Temporal Handshake Active</span>
                     </div>
                     <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest">Do not disconnect or refresh</p>
                     <button onClick={() => { setMpesaStage('idle'); setShowMpesaModal(false); }} className="px-6 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors mt-2">
                        Cancel Verification
                     </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden Receipt Component printed via CSS visibility toggle */}
      {receiptData && <Receipt data={receiptData} />}
    </div>
  );
};

export default Sales;
