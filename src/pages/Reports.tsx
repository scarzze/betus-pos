import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, CreditCard, Download, Loader2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface SalesReport {
  total_sales: number;
  total_amount: number;
  average_order_value: number;
}

interface ProfitLossReport {
  gross_revenue: number;
  total_cogs: number;
  total_profit: number;
  total_loss: number;
  net_profit: number;
  profit_margin: number;
}

interface InventoryItem {
  id: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold: number;
}

const Reports = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Default: last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));

  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [plReport, setPlReport] = useState<ProfitLossReport | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [plDetails, setPlDetails] = useState<any[]>([]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const start = new Date(startDate).toISOString();
      const end = new Date(endDate + 'T23:59:59').toISOString();

      const [salesRes, plRes, invRes] = await Promise.all([
        api.get<SalesReport>(`/reports/sales?start_date=${start}&end_date=${end}`),
        api.get<ProfitLossReport>(`/reports/profit-loss?start_date=${start}&end_date=${end}`),
        api.get<InventoryItem[]>('/reports/inventory'),
      ]);

      setSalesReport(salesRes.data);
      setPlReport(plRes.data);
      setInventory(invRes.data);
      setPlDetails((plRes.data as any).details || []);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to load reports', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleExportCSV = async () => {
    try {
      const start = new Date(startDate).toISOString();
      const end = new Date(endDate + 'T23:59:59').toISOString();
      const res = await api.get<{ csv: string }>(`/reports/export/sales/csv?start_date=${start}&end_date=${end}`);
      const blob = new Blob([res.data.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${startDate}-to-${endDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Error', description: 'Failed to export CSV', variant: 'destructive' });
    }
  };

  const lowStockCount = inventory.filter(p => p.stock_quantity <= p.low_stock_threshold).length;

  const reportSections = [
    {
      title: 'Sales Report',
      icon: BarChart3,
      description: 'Total sales, transactions, and average order value for the selected period.',
      stats: [
        { label: 'Total Sales', value: salesReport ? salesReport.total_sales.toString() : '—' },
        { label: 'Total Revenue', value: salesReport ? `KES ${salesReport.total_amount.toLocaleString()}` : '—' },
        { label: 'Avg Order Value', value: salesReport ? `KES ${salesReport.average_order_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—' },
      ],
    },
    {
      title: 'Profit & Loss',
      icon: TrendingUp,
      description: 'Gross revenue, COGS, net profit, loss, and profit margin.',
      stats: [
        { label: 'Gross Revenue', value: plReport ? `KES ${plReport.gross_revenue.toLocaleString()}` : '—' },
        { label: 'COGS', value: plReport ? `KES ${plReport.total_cogs.toLocaleString()}` : '—' },
        { label: 'Net Profit', value: plReport ? `KES ${plReport.net_profit.toLocaleString()}` : '—' },
        { label: 'Profit Margin', value: plReport ? `${plReport.profit_margin.toFixed(1)}%` : '—' },
      ],
    },
    {
      title: 'Inventory',
      icon: Package,
      description: 'Current stock levels and low stock alerts.',
      stats: [
        { label: 'Total Products', value: inventory.length.toString() },
        { label: 'Low Stock Items', value: lowStockCount.toString() },
      ],
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Financial intelligence & analytics</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Date range picker */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="bg-transparent text-foreground focus:outline-none" />
            <span>→</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="bg-transparent text-foreground focus:outline-none" />
          </div>
          <button onClick={fetchReports} className="flex items-center gap-2 rounded-lg bg-primary/15 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/25">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            Refresh
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="mb-8 grid gap-4 grid-cols-1 md:grid-cols-3">
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
                  <p className="font-display text-lg font-bold text-foreground">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* P&L Breakdown Table */}
      {plDetails.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="border-b border-border p-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Profit & Loss Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product ID</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Qty Sold</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revenue</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cost</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profit</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Loss</th>
                </tr>
              </thead>
              <tbody>
                {plDetails.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 transition-colors hover:bg-secondary/50">
                    <td className="px-4 py-3 text-sm font-medium text-foreground font-mono">{row.product_id?.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">{row.quantity}</td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">KES {row.revenue?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">KES {row.cost?.toLocaleString()}</td>
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
      )}

      {!loading && plDetails.length === 0 && (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-muted-foreground">
          <BarChart3 className="mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm">No sales data for the selected period.</p>
          <p className="mt-1 text-xs">Try adjusting the date range above.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
