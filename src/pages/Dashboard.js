import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, TrendingUp, TrendingDown, ShoppingCart, Package, AlertTriangle, ArrowUpRight, ArrowDownRight, } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, } from 'recharts';
const StatCard = ({ title, value, change, changeType = 'neutral', icon }) => (_jsx("div", { className: "glass-card p-5 transition-all hover:border-primary/30", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: title }), _jsx("p", { className: "mt-1 font-display text-2xl font-bold text-foreground", children: value }), change && (_jsxs("div", { className: `mt-2 flex items-center gap-1 text-xs font-medium ${changeType === 'positive' ? 'text-success' : changeType === 'negative' ? 'text-destructive' : 'text-muted-foreground'}`, children: [changeType === 'positive' ? _jsx(ArrowUpRight, { className: "h-3 w-3" }) : changeType === 'negative' ? _jsx(ArrowDownRight, { className: "h-3 w-3" }) : null, change] }))] }), _jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary", children: icon })] }) }));
const CHART_COLORS = [
    'hsl(25, 95%, 53%)',
    'hsl(142, 71%, 45%)',
    'hsl(217, 91%, 60%)',
    'hsl(38, 92%, 50%)',
    'hsl(0, 72%, 51%)',
];
const Dashboard = () => {
    const { user } = useAuth();
    const isSales = user?.role === 'SALES';
    const [stats, setStats] = useState({
        todaySales: 0,
        todayProfit: 0,
        todayLoss: 0,
        netRevenue: 0,
        totalStockValue: 0,
        txCount: 0,
        lowStockCount: 0,
    });
    const [recentSales, setRecentSales] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [weeklySales, setWeeklySales] = useState([]);
    const [paymentBreakdown, setPaymentBreakdown] = useState([]);
    useEffect(() => {
        const fetchDashboard = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser)
                return;
            // Recent sales
            let salesQuery = supabase.from('sales').select('*').order('created_at', { ascending: false }).limit(10);
            if (isSales)
                salesQuery = salesQuery.eq('user_id', authUser.id);
            const { data: salesData } = await salesQuery;
            if (salesData) {
                setRecentSales(salesData);
                const today = new Date().toISOString().slice(0, 10);
                const todaySales = salesData.filter(s => s.created_at.slice(0, 10) === today);
                const totalSales = todaySales.reduce((s, r) => s + Number(r.total_amount), 0);
                const totalProfit = todaySales.reduce((s, r) => s + Math.max(0, Number(r.profit)), 0);
                const totalLoss = todaySales.reduce((s, r) => s + Math.abs(Math.min(0, Number(r.profit))), 0);
                // Payment breakdown
                const cash = salesData.filter(s => s.payment_method === 'cash').reduce((s, r) => s + Number(r.total_amount), 0);
                const mpesa = salesData.filter(s => s.payment_method === 'mpesa').reduce((s, r) => s + Number(r.total_amount), 0);
                setPaymentBreakdown([
                    { name: 'Cash', value: cash },
                    { name: 'M-Pesa', value: mpesa },
                ]);
                // Weekly sales (last 7 days)
                const days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d.toISOString().slice(0, 10);
                });
                const weekly = days.map(day => ({
                    day: new Date(day).toLocaleDateString('en', { weekday: 'short' }),
                    sales: salesData.filter(s => s.created_at.slice(0, 10) === day).reduce((s, r) => s + Number(r.total_amount), 0),
                    profit: salesData.filter(s => s.created_at.slice(0, 10) === day).reduce((s, r) => s + Number(r.profit), 0),
                }));
                setWeeklySales(weekly);
                setStats(prev => ({
                    ...prev,
                    todaySales: totalSales,
                    todayProfit: totalProfit,
                    todayLoss: totalLoss,
                    netRevenue: totalSales - totalLoss,
                    txCount: todaySales.length,
                }));
            }
            // Products for stock
            if (!isSales) {
                const { data: products } = await supabase.from('products').select('*');
                if (products) {
                    const stockValue = products.reduce((s, p) => s + Number(p.buying_price) * p.stock, 0);
                    const lowStock = products.filter(p => p.stock <= p.low_stock_threshold);
                    setStats(prev => ({ ...prev, totalStockValue: stockValue, lowStockCount: lowStock.length }));
                    setLowStockItems(lowStock.slice(0, 5));
                }
            }
        };
        fetchDashboard();
    }, [isSales]);
    const fmt = (n) => `KES ${n.toLocaleString()}`;
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: isSales ? 'My Dashboard' : 'Dashboard' }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Welcome back, ", user?.name, ". Here's what's happening today."] })] }), _jsxs("div", { className: `mb-6 grid gap-4 ${isSales ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`, children: [_jsx(StatCard, { title: isSales ? "My Today's Sales" : "Today's Sales", value: fmt(stats.todaySales), change: `${stats.txCount} transactions`, changeType: "positive", icon: _jsx(ShoppingCart, { className: "h-5 w-5" }) }), !isSales && (_jsxs(_Fragment, { children: [_jsx(StatCard, { title: "Today's Profit", value: fmt(stats.todayProfit), changeType: "positive", icon: _jsx(TrendingUp, { className: "h-5 w-5" }) }), _jsx(StatCard, { title: "Today's Loss", value: fmt(stats.todayLoss), changeType: "negative", icon: _jsx(TrendingDown, { className: "h-5 w-5" }) }), _jsx(StatCard, { title: "Net Revenue", value: fmt(stats.netRevenue), changeType: "positive", icon: _jsx(DollarSign, { className: "h-5 w-5" }) })] })), isSales && (_jsx(StatCard, { title: "My Transactions", value: String(stats.txCount), changeType: "neutral", icon: _jsx(ShoppingCart, { className: "h-5 w-5" }) }))] }), !isSales && (_jsxs("div", { className: "mb-6 grid gap-4 grid-cols-1 sm:grid-cols-3", children: [_jsx(StatCard, { title: "Total Stock Value", value: fmt(stats.totalStockValue), icon: _jsx(Package, { className: "h-5 w-5" }) }), _jsx(StatCard, { title: "Low Stock Items", value: String(stats.lowStockCount), icon: _jsx(AlertTriangle, { className: "h-5 w-5" }) }), _jsx(StatCard, { title: "Profit Margin", value: stats.todaySales > 0 ? `${((stats.todayProfit / stats.todaySales) * 100).toFixed(1)}%` : '0%', changeType: "positive", icon: _jsx(TrendingUp, { className: "h-5 w-5" }) })] })), !isSales && (_jsxs("div", { className: "mb-6 grid gap-6 grid-cols-1 lg:grid-cols-3", children: [_jsxs("div", { className: "glass-card p-5 lg:col-span-2", children: [_jsx("h3", { className: "font-display text-base font-semibold text-foreground mb-4", children: "Weekly Sales & Profit" }), _jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(BarChart, { data: weeklySales, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(220, 12%, 18%)" }), _jsx(XAxis, { dataKey: "day", stroke: "hsl(220, 10%, 55%)", fontSize: 12 }), _jsx(YAxis, { stroke: "hsl(220, 10%, 55%)", fontSize: 12 }), _jsx(Tooltip, { contentStyle: { background: 'hsl(220, 14%, 10%)', border: '1px solid hsl(220, 12%, 18%)', borderRadius: '8px', color: 'hsl(40, 10%, 92%)' }, formatter: (value) => [`KES ${value.toLocaleString()}`, ''] }), _jsx(Bar, { dataKey: "sales", fill: "hsl(25, 95%, 53%)", radius: [4, 4, 0, 0], name: "Sales" }), _jsx(Bar, { dataKey: "profit", fill: "hsl(142, 71%, 45%)", radius: [4, 4, 0, 0], name: "Profit" })] }) })] }), _jsxs("div", { className: "glass-card p-5", children: [_jsx("h3", { className: "font-display text-base font-semibold text-foreground mb-4", children: "Payment Methods" }), _jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: paymentBreakdown, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 90, paddingAngle: 5, dataKey: "value", children: paymentBreakdown.map((_, i) => (_jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i))) }), _jsx(Tooltip, { contentStyle: { background: 'hsl(220, 14%, 10%)', border: '1px solid hsl(220, 12%, 18%)', borderRadius: '8px', color: 'hsl(40, 10%, 92%)' }, formatter: (value) => [`KES ${value.toLocaleString()}`, ''] })] }) }), _jsx("div", { className: "flex justify-center gap-4 mt-2", children: paymentBreakdown.map((p, i) => (_jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx("div", { className: "h-2 w-2 rounded-full", style: { background: CHART_COLORS[i] } }), p.name] }, p.name))) })] })] })), _jsxs("div", { className: `grid gap-6 ${!isSales ? 'lg:grid-cols-3' : 'grid-cols-1'}`, children: [_jsxs("div", { className: `glass-card ${!isSales ? 'lg:col-span-2' : ''}`, children: [_jsx("div", { className: "border-b border-border p-4", children: _jsx("h2", { className: "font-display text-lg font-semibold text-foreground", children: "Recent Sales" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border", children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "ID" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Customer" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Total" }), !isSales && _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Profit" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Method" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Time" })] }) }), _jsx("tbody", { children: recentSales.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "px-4 py-8 text-center text-sm text-muted-foreground", children: "No sales yet" }) })) : recentSales.map((sale) => (_jsxs("tr", { className: "border-b border-border/50 transition-colors hover:bg-secondary/50", children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-primary", children: sale.sale_number }), _jsx("td", { className: "px-4 py-3 text-sm text-foreground", children: sale.customer_name || 'Walk-in' }), _jsxs("td", { className: "px-4 py-3 text-sm font-semibold text-foreground", children: ["KES ", Number(sale.total_amount).toLocaleString()] }), !isSales && (_jsxs("td", { className: `px-4 py-3 text-sm font-semibold ${Number(sale.profit) >= 0 ? 'text-success' : 'text-destructive'}`, children: ["KES ", Number(sale.profit).toLocaleString()] })), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `inline-block rounded-md px-2 py-0.5 text-xs font-medium ${sale.payment_method === 'mpesa' ? 'bg-success/15 text-success' : 'bg-info/15 text-info'}`, children: sale.payment_method === 'mpesa' ? 'M-Pesa' : 'Cash' }) }), _jsx("td", { className: "px-4 py-3 text-sm text-muted-foreground", children: new Date(sale.created_at).toLocaleString('en', { hour: '2-digit', minute: '2-digit' }) })] }, sale.id))) })] }) })] }), !isSales && (_jsxs("div", { className: "glass-card", children: [_jsx("div", { className: "border-b border-border p-4", children: _jsx("h2", { className: "font-display text-lg font-semibold text-foreground", children: "Low Stock Alert" }) }), _jsx("div", { className: "space-y-3 p-4", children: lowStockItems.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "All stock levels OK" })) : lowStockItems.map((item) => (_jsxs("div", { className: "rounded-lg bg-secondary/50 p-3", children: [_jsx("p", { className: "text-sm font-medium text-foreground", children: item.name }), _jsx("p", { className: "text-xs text-muted-foreground", children: item.sku }), _jsxs("div", { className: "mt-2 flex items-center justify-between", children: [_jsxs("span", { className: "text-xs text-destructive font-semibold", children: [item.stock, " left"] }), _jsxs("span", { className: "text-xs text-muted-foreground", children: ["Min: ", item.low_stock_threshold] })] }), _jsx("div", { className: "mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted", children: _jsx("div", { className: "h-full rounded-full bg-destructive", style: { width: `${Math.min((item.stock / item.low_stock_threshold) * 100, 100)}%` } }) })] }, item.id))) })] }))] })] }));
};
export default Dashboard;
