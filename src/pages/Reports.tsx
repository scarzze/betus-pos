import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Package, CreditCard, Download, Loader2, Calendar } from 'lucide-react';
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
      title: 'Sales Intelligence',
      icon: BarChart3,
      theme: 'theme-primary',
      description: 'Transaction volume & revenue flow',
      stats: [
        { label: 'Total Sales', value: salesReport ? salesReport.total_sales.toString() : '—' },
        { label: 'Total Revenue', value: salesReport ? `KES ${salesReport.total_amount.toLocaleString()}` : '—' },
        { label: 'Avg Ticket', value: salesReport ? `KES ${salesReport.average_order_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—' },
      ],
    },
    {
      title: 'Profitability Analysis',
      icon: TrendingUp,
      theme: 'theme-success',
      description: 'Net margins and cost efficiency',
      stats: [
        { label: 'Gross Revenue', value: plReport ? `KES ${plReport.gross_revenue.toLocaleString()}` : '—' },
        { label: 'Total COGS', value: plReport ? `KES ${plReport.total_cogs.toLocaleString()}` : '—' },
        { label: 'Net Profit', value: plReport ? `KES ${plReport.net_profit.toLocaleString()}` : '—', highlight: true },
        { label: 'Profit Margin', value: plReport ? `${plReport.profit_margin.toFixed(1)}%` : '—' },
      ],
    },
    {
      title: 'Inventory Health',
      icon: Package,
      theme: 'theme-info',
      description: 'Stock availability & low alerts',
      stats: [
        { label: 'Active SKUs', value: inventory.length.toString() },
        { label: 'Critical Stock', value: lowStockCount.toString(), critical: lowStockCount > 0 },
      ],
    },
  ];

  return (
    <div className="report-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">Track your business performance and financial health</p>
        
        <div className="report-controls">
          <div className="bt-date-picker">
            <Calendar size={16} className="text-primary" />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>TO</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          
          <button onClick={fetchReports} className="bt-icon-btn" style={{ width: 'auto', padding: '0 16px', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
            Filter Results
          </button>
          
          <button onClick={handleExportCSV} className="bt-submit-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* Grid of Intel Cards */}
      <div className="reports-grid">
        {reportSections.map((section) => (
          <div key={section.title} className="bt-glass-panel" style={{ padding: '24px' }}>
            <div className="section-card-header">
              <div className={`stat-icon-wrapper ${section.theme}`}>
                <section.icon className="stat-icon" />
              </div>
              <div>
                <h3 className="chart-title" style={{ marginBottom: '4px' }}>{section.title}</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{section.description}</p>
              </div>
            </div>
            
            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {section.stats.map((stat) => (
                <div key={stat.label} className="bt-glass-card" style={{ padding: '12px', border: (stat as any).critical ? '1px solid rgba(239, 68, 68, 0.3)' : '' }}>
                  <p className="stat-label" style={{ fontSize: '10px' }}>{stat.label}</p>
                  <p className="stat-value" style={{ fontSize: '18px', color: (stat as any).highlight ? '#4ade80' : (stat as any).critical ? '#f87171' : 'white' }}>
                    {loading ? '...' : stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Financial Detail Table */}
      {plDetails.length > 0 && (
        <div className="bt-table-wrapper animate-slide-up">
          <div className="flex items-center justify-between" style={{ padding: '20px', borderBottom: '1px solid var(--border-light)', display: 'flex' }}>
            <h2 className="chart-title" style={{ margin: 0 }}>Financial Breakdown by Item</h2>
            <span className="status-badge theme-info">Real-time Data</span>
          </div>
          <div className="no-scrollbar" style={{ overflowX: 'auto' }}>
            <table className="bt-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Revenue</th>
                  <th style={{ textAlign: 'right' }}>Cost</th>
                  <th style={{ textAlign: 'right' }}>Profit</th>
                  <th style={{ textAlign: 'right' }}>Margin</th>
                </tr>
              </thead>
              <tbody>
                {plDetails.map((row, i) => {
                  const margin = row.revenue > 0 ? ((row.profit / row.revenue) * 100).toFixed(1) : '0';
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{row.product_name || `SKU: ${row.product_id?.slice(0, 8)}`}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{row.product_id}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>{row.quantity}</td>
                      <td style={{ textAlign: 'right' }}>KES {row.revenue?.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>KES {row.cost?.toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={row.profit >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 700 }}>
                          KES {Math.abs(row.profit).toLocaleString()}
                          {row.profit < 0 && ' (Loss)'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className={`trend-indicator ${Number(margin) >= 0 ? 'trend-up' : 'trend-down'}`}>
                          {Number(margin) >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {margin}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && plDetails.length === 0 && (
        <div className="bt-glass-panel flex flex-col items-center justify-center py-20 text-muted-foreground" style={{ textAlign: 'center' }}>
          <BarChart3 size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3 className="chart-title">No analytics data available</h3>
          <p className="text-sm">Try expanding your date range to capture more sales activity.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
