import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart3, TrendingUp, Package, CreditCard, Download } from 'lucide-react';
const reportSections = [
    {
        title: 'Sales Report',
        icon: BarChart3,
        description: 'Total sales, transactions, and average order value by date range, staff, and payment method.',
        stats: [
            { label: 'Total Sales', value: 'KES 487,500' },
            { label: 'Transactions', value: '342' },
            { label: 'Avg Order Value', value: 'KES 1,425' },
        ],
    },
    {
        title: 'Profit & Loss',
        icon: TrendingUp,
        description: 'Gross revenue, COGS, net profit, loss, and profit margin breakdown.',
        stats: [
            { label: 'Gross Revenue', value: 'KES 487,500' },
            { label: 'COGS', value: 'KES 312,000' },
            { label: 'Net Profit', value: 'KES 175,500' },
            { label: 'Profit Margin', value: '36%' },
        ],
    },
    {
        title: 'Inventory Report',
        icon: Package,
        description: 'Current stock, stock value, low stock items, and stock movement history.',
        stats: [
            { label: 'Total Products', value: '156' },
            { label: 'Stock Value', value: 'KES 1.2M' },
            { label: 'Low Stock Items', value: '8' },
        ],
    },
    {
        title: 'M-Pesa Transactions',
        icon: CreditCard,
        description: 'Transaction codes, amounts, references, status, and dates.',
        stats: [
            { label: 'Total M-Pesa', value: 'KES 298,400' },
            { label: 'Successful', value: '189' },
            { label: 'Pending', value: '3' },
        ],
    },
];
// P&L breakdown table
const plBreakdown = [
    { product: 'Wireless Earbuds Pro', qtySold: 42, revenue: 159600, cost: 50400, profit: 109200, loss: 0 },
    { product: 'Samsung Galaxy A15', qtySold: 8, revenue: 156000, cost: 120000, profit: 36000, loss: 0 },
    { product: 'USB-C Fast Charger', qtySold: 65, revenue: 97500, cost: 52000, profit: 45500, loss: 0 },
    { product: 'iPhone 15 Case', qtySold: 120, revenue: 60000, cost: 30000, profit: 30000, loss: 0 },
    { product: 'Screen Protector (Defective)', qtySold: 15, revenue: 4500, cost: 6000, profit: 0, loss: 1500 },
];
const Reports = () => {
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "Reports" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Financial intelligence & analytics" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { className: "flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80", children: [_jsx(Download, { className: "h-4 w-4" }), "Export PDF"] }), _jsxs("button", { className: "flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80", children: [_jsx(Download, { className: "h-4 w-4" }), "Export CSV"] })] })] }), _jsx("div", { className: "mb-8 grid gap-4 grid-cols-1 md:grid-cols-2", children: reportSections.map((section) => (_jsxs("div", { className: "glass-card p-5", children: [_jsxs("div", { className: "mb-4 flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary", children: _jsx(section.icon, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-display text-base font-semibold text-foreground", children: section.title }), _jsx("p", { className: "text-xs text-muted-foreground", children: section.description })] })] }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: section.stats.map((stat) => (_jsxs("div", { className: "rounded-lg bg-secondary p-3", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: stat.label }), _jsx("p", { className: "font-display text-lg font-bold text-foreground", children: stat.value })] }, stat.label))) })] }, section.title))) }), _jsxs("div", { className: "glass-card overflow-hidden", children: [_jsx("div", { className: "border-b border-border p-4", children: _jsx("h2", { className: "font-display text-lg font-semibold text-foreground", children: "Profit & Loss Breakdown" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border", children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Product" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Qty Sold" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Revenue" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Cost" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Profit" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Loss" })] }) }), _jsx("tbody", { children: plBreakdown.map((row) => (_jsxs("tr", { className: "border-b border-border/50 transition-colors hover:bg-secondary/50", children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-foreground", children: row.product }), _jsx("td", { className: "px-4 py-3 text-right text-sm text-muted-foreground", children: row.qtySold }), _jsxs("td", { className: "px-4 py-3 text-right text-sm text-foreground", children: ["KES ", row.revenue.toLocaleString()] }), _jsxs("td", { className: "px-4 py-3 text-right text-sm text-muted-foreground", children: ["KES ", row.cost.toLocaleString()] }), _jsx("td", { className: "px-4 py-3 text-right text-sm font-semibold text-success", children: row.profit > 0 ? `KES ${row.profit.toLocaleString()}` : '—' }), _jsx("td", { className: "px-4 py-3 text-right text-sm font-semibold text-destructive", children: row.loss > 0 ? `KES ${row.loss.toLocaleString()}` : '—' })] }, row.product))) })] }) })] })] }));
};
export default Reports;
