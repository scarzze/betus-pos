import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Search, ShoppingCart, X, CreditCard, Banknote, Loader2, CheckCircle, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
const Sales = () => {
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [saleComplete, setSaleComplete] = useState(false);
    const [mpesaPhone, setMpesaPhone] = useState('');
    const [showMpesaModal, setShowMpesaModal] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();
    const isSales = user?.role === 'SALES';
    // Fetch products from FastAPI
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('http://localhost:8000/products');
                const data = await res.json();
                setProducts(data.filter(p => p.stock > 0));
            }
            catch (err) {
                console.error(err);
                toast({ title: 'Error', description: 'Failed to load products', variant: 'destructive' });
            }
            finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [saleComplete]);
    const addToCart = (product) => {
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
    const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
    const updateQty = (id, qty) => {
        if (qty <= 0)
            return removeFromCart(id);
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
    const completeSale = async (method = paymentMethod) => {
        if (cart.length === 0)
            return;
        setCompleting(true);
        try {
            const saleNumber = `S${Date.now().toString(36).toUpperCase()}`;
            // 1. Create sale in backend
            const saleRes = await fetch('http://localhost:8000/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sale_number: saleNumber,
                    user_id: user?.id,
                    payment_method: method,
                    total_amount: totalAmount,
                    total_cost: totalCost,
                    profit,
                    status: method === 'mpesa' ? 'pending' : 'completed',
                    items: cart.map(item => ({
                        product_id: item.id,
                        product_name: item.name,
                        quantity: item.qty,
                        selling_price: item.selling_price,
                        buying_price: item.buying_price,
                        subtotal: item.selling_price * item.qty
                    }))
                })
            });
            if (!saleRes.ok)
                throw new Error('Failed to save sale');
            const sale = await saleRes.json();
            // 2. Deduct stock
            for (const item of cart) {
                await fetch(`http://localhost:8000/products/${item.id}/deduct`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ qty: item.qty })
                });
            }
            // 3. Handle M-Pesa STK
            if (method === 'mpesa' && mpesaPhone) {
                try {
                    await fetch('http://localhost:8000/mpesa/stk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: mpesaPhone, amount: totalAmount, sale_id: sale.id })
                    });
                    toast({ title: '📱 M-Pesa Prompt Sent', description: `Check phone ${mpesaPhone} for payment prompt` });
                }
                catch {
                    toast({ title: 'M-Pesa Error', description: 'Sale saved but payment failed', variant: 'destructive' });
                }
            }
            setCart([]);
            setCompleting(false);
            setSaleComplete(true);
            setShowMpesaModal(false);
            setMpesaPhone('');
            if (method === 'cash')
                toast({ title: '✅ Sale Complete', description: `${saleNumber} — KES ${totalAmount.toLocaleString()}` });
            setTimeout(() => setSaleComplete(false), 2000);
        }
        catch (err) {
            console.error(err);
            toast({ title: 'Sale Failed', description: err.message || 'Unknown error', variant: 'destructive' });
            setCompleting(false);
        }
    };
    const handleComplete = () => {
        if (paymentMethod === 'mpesa')
            setShowMpesaModal(true);
        else
            completeSale('cash');
    };
    if (loading)
        return _jsx("div", { className: "flex h-full items-center justify-center", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) });
    return (_jsxs("div", { className: "flex h-full flex-col lg:flex-row", children: [_jsxs("div", { className: "flex-1 p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "New Sale" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Select products to add to cart" })] }), _jsxs("div", { className: "relative mb-4", children: [_jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), _jsx("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Search products\u2026", className: "w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" })] }), _jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4", children: filteredProducts.map(product => (_jsxs("button", { onClick: () => addToCart(product), className: "glass-card p-4 text-left transition-all hover:border-primary/40 hover:glow-orange", children: [_jsx("div", { className: "mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10", children: _jsx(ShoppingCart, { className: "h-5 w-5 text-primary" }) }), _jsx("p", { className: "text-sm font-medium text-foreground leading-tight", children: product.name }), _jsxs("p", { className: "mt-1 font-display text-lg font-bold text-primary", children: ["KES ", product.selling_price.toLocaleString()] }), !isSales && _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Buy: KES ", product.buying_price.toLocaleString()] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [product.stock, " in stock"] })] }, product.id))) })] }), _jsx("div", { className: "w-full border-l border-border bg-sidebar lg:w-96", children: _jsxs("div", { className: "flex h-full flex-col", children: [_jsx("div", { className: "border-b border-border p-4", children: _jsxs("h2", { className: "font-display text-lg font-semibold text-foreground", children: ["Cart (", cart.length, ")"] }) }), _jsx("div", { className: "flex-1 overflow-auto p-4 space-y-3", children: cart.length === 0 ? (_jsx("div", { className: "flex flex-col items-center justify-center py-12 text-muted-foreground", children: saleComplete ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "mb-3 h-10 w-10 text-success" }), _jsx("p", { className: "text-sm text-success font-semibold", children: "Sale Completed!" })] })) : (_jsxs(_Fragment, { children: [_jsx(ShoppingCart, { className: "mb-3 h-10 w-10 opacity-30" }), _jsx("p", { className: "text-sm", children: "Cart is empty" })] })) })) : cart.map(item => (_jsxs("div", { className: "flex items-center gap-3 rounded-lg bg-secondary p-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-foreground", children: item.name }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["KES ", item.selling_price.toLocaleString(), " each"] }), !isSales && _jsxs("p", { className: "text-xs text-muted-foreground/60", children: ["Cost: KES ", item.buying_price.toLocaleString()] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => updateQty(item.id, item.qty - 1), className: "flex h-7 w-7 items-center justify-center rounded-md bg-muted text-sm font-bold text-foreground hover:bg-primary/20", children: "\u2212" }), _jsx("span", { className: "w-6 text-center text-sm font-semibold text-foreground", children: item.qty }), _jsx("button", { onClick: () => updateQty(item.id, item.qty + 1), className: "flex h-7 w-7 items-center justify-center rounded-md bg-muted text-sm font-bold text-foreground hover:bg-primary/20", children: "+" })] }), _jsx("button", { onClick: () => removeFromCart(item.id), className: "text-muted-foreground hover:text-destructive", children: _jsx(X, { className: "h-4 w-4" }) })] }, item.id))) }), _jsxs("div", { className: "border-t border-border p-4 space-y-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Subtotal" }), _jsxs("span", { className: "text-sm font-semibold text-foreground", children: ["KES ", totalAmount.toLocaleString()] })] }), !isSales && _jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: "Total Cost" }), _jsxs("span", { className: "text-xs text-muted-foreground", children: ["KES ", totalCost.toLocaleString()] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: "Profit" }), _jsxs("span", { className: `text-xs font-semibold ${profit >= 0 ? 'text-success' : 'text-destructive'}`, children: ["KES ", profit.toLocaleString()] })] })] }), _jsxs("div", { className: "flex items-center justify-between pt-1", children: [_jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Total" }), _jsxs("span", { className: "font-display text-2xl font-bold text-foreground", children: ["KES ", totalAmount.toLocaleString()] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("button", { onClick: () => setPaymentMethod('cash'), className: `flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${paymentMethod === 'cash' ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground border border-transparent'}`, children: [_jsx(Banknote, { className: "h-4 w-4" }), "Cash"] }), _jsxs("button", { onClick: () => setPaymentMethod('mpesa'), className: `flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${paymentMethod === 'mpesa' ? 'bg-success/15 text-success border border-success/30' : 'bg-secondary text-muted-foreground border border-transparent'}`, children: [_jsx(CreditCard, { className: "h-4 w-4" }), "M-Pesa"] })] }), _jsx("button", { disabled: cart.length === 0 || completing, onClick: handleComplete, className: "w-full rounded-lg gradient-orange px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30 flex items-center justify-center gap-2", children: completing ? _jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin" }), "Processing\u2026"] }) : `Complete Sale — KES ${totalAmount.toLocaleString()}` })] })] }) }), showMpesaModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm", children: _jsxs("div", { className: "glass-card w-full max-w-sm mx-4 p-6 animate-scale-in", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "font-display text-lg font-semibold text-foreground", children: "M-Pesa Payment" }), _jsx("button", { onClick: () => setShowMpesaModal(false), className: "text-muted-foreground hover:text-foreground", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Enter customer's phone number to send STK push" }), _jsxs("div", { className: "relative mb-4", children: [_jsx(Phone, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), _jsx("input", { type: "tel", value: mpesaPhone, onChange: e => setMpesaPhone(e.target.value), placeholder: "0712345678", className: "w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-success focus:outline-none focus:ring-1 focus:ring-success" })] }), _jsxs("p", { className: "text-center font-display text-xl font-bold text-foreground mb-4", children: ["KES ", totalAmount.toLocaleString()] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setShowMpesaModal(false), className: "flex-1 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground", children: "Cancel" }), _jsxs("button", { onClick: () => completeSale('mpesa'), disabled: !mpesaPhone || completing, className: "flex flex-1 items-center justify-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground hover:opacity-90 disabled:opacity-50", children: [completing ? _jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : _jsx(CreditCard, { className: "h-4 w-4" }), "Send STK Push"] })] })] }) }))] }));
};
export default Sales;
