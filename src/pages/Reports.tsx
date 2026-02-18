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
  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Financial intelligence & analytics</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80">
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="mb-8 grid gap-4 grid-cols-1 md:grid-cols-2">
        {reportSections.map((section) => (
          <div key={section.title} className="glass-card p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <section.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">{section.title}</h3>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {section.stats.map((stat) => (
                <div key={stat.label} className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-lg font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* P&L Breakdown Table */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Profit & Loss Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Qty Sold</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cost</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profit</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Loss</th>
              </tr>
            </thead>
            <tbody>
              {plBreakdown.map((row) => (
                <tr key={row.product} className="border-b border-border/50 transition-colors hover:bg-secondary/50">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{row.product}</td>
                  <td className="px-4 py-3 text-right text-sm text-muted-foreground">{row.qtySold}</td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">KES {row.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm text-muted-foreground">KES {row.cost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-success">
                    {row.profit > 0 ? `KES ${row.profit.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-destructive">
                    {row.loss > 0 ? `KES ${row.loss.toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
