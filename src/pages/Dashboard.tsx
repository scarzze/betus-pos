import React, { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { WeeklyBarChart, PaymentPieChart } from "@/components/ui/chart";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Calendar as CalendarIcon, Loader2, Receipt } from "lucide-react";
import api from "@/lib/api";

interface DashboardSummary {
  today_sales_count: number;
  profit_loss: {
    gross_revenue: number;
    total_profit: number;
    total_loss: number;
    total_expenses: number;
    net_profit: number;
    profit_margin: number;
  };
  top_products: { name: string; sold: number; revenue: number }[];
  weekly_sales: { date: string; revenue: number }[];
  low_stock: { id: string; name: string; stock: number; threshold: number }[];
  recent_sales: { id: string; sale_number: string; total: number; status: string; created_at: string }[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.email?.split("@")[0] ?? "User";

  const [weeklySales, setWeeklySales] = useState<any[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todaySalesCount: 0,
    grossRevenue: 0,
    netProfit: 0,
    totalExpenses: 0,
    totalLoss: 0,
    profitMargin: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get<DashboardSummary>("/dashboard/summary");

        setStats({
          todaySalesCount: data.today_sales_count || 0,
          grossRevenue: data.profit_loss?.gross_revenue || 0,
          netProfit: data.profit_loss?.net_profit || 0,
          totalExpenses: data.profit_loss?.total_expenses || 0,
          totalLoss: data.profit_loss?.total_loss || 0,
          profitMargin: data.profit_loss?.profit_margin || 0,
        });

        setLowStock(data.low_stock || []);
        setRecentSales(data.recent_sales || []);

        // Map weekly_sales to chart format (fill gaps with zero)
        const today = new Date();
        const weekly = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(today.getDate() - (6 - i));
          const dayStr = d.toISOString().slice(0, 10);
          const match = data.weekly_sales?.find(w => w.date === dayStr);
          return {
            day: d.toLocaleDateString("en", { weekday: "short" }),
            sales: match?.revenue ?? 0,
            profit: 0,
          };
        });
        setWeeklySales(weekly);

        // Payment breakdown
        const salesRes = await api.get<any[]>("/sales");
        const sales = salesRes.data || [];
        const cash = sales.filter((s: any) => s.payment_method?.toLowerCase() === "cash").reduce((sum: number, r: any) => sum + r.total_amount, 0);
        const mpesa = sales.filter((s: any) => s.payment_method?.toLowerCase() === "mpesa").reduce((sum: number, r: any) => sum + r.total_amount, 0);
        const credit = sales.filter((s: any) => s.payment_method?.toLowerCase() === "credit").reduce((sum: number, r: any) => sum + r.total_amount, 0);
        
        setPaymentBreakdown([
          { name: "Cash", value: cash },
          { name: "M-Pesa", value: mpesa },
          { name: "Credit", value: credit },
        ]);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user?.id]);

  const statCards = [
    { label: "Today's Sales", value: stats.todaySalesCount, icon: ShoppingBag, theme: "primary", format: (v: number) => v.toString() },
    { label: "Gross Revenue", value: stats.grossRevenue, icon: DollarSign, theme: "success", format: (v: number) => `KES ${v.toLocaleString()}` },
    { label: "Operating Expenses", value: stats.totalExpenses, icon: Receipt, theme: "danger", format: (v: number) => `KES ${v.toLocaleString()}` },
    { label: "Actual Net Profit", value: stats.netProfit, icon: TrendingUp, theme: "success", format: (v: number) => `KES ${v.toLocaleString()}` },
  ];

  if (loading) return <div className="loader-container"><Loader2 className="spinner large text-primary" /></div>;

  return (
    <div className="report-container animate-fade-in" style={{ padding: '32px' }}>
      <header className="page-header" style={{ marginBottom: '40px' }}>
        <h1 className="page-title" style={{ fontSize: '32px' }}>Operational Overview</h1>
        <p className="page-subtitle">Welcome back, <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{displayName}</span>. Here is your business performance for today.</p>
      </header>

      {/* Hero Stats Grid */}
      <section className="stats-grid" style={{ marginBottom: '32px' }}>
        {statCards.map(card => (
          <div key={card.label} className="bt-glass-card animate-slide-up" style={{ padding: '24px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div className={`stat-icon-wrapper theme-${card.theme}`} style={{ width: '48px', height: '48px' }}>
                <card.icon size={22} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="bt-label" style={{ margin: 0 }}>{card.label}</p>
              </div>
            </div>
            <p className={`stat-value text-${card.theme}`} style={{ fontSize: '28px', margin: 0 }}>
              {card.format(card.value)}
            </p>
          </div>
        ))}
      </section>

      {/* Charts Grid */}
      <div className="reports-grid" style={{ marginBottom: '32px' }}>
        <div className="bt-glass-panel animate-slide-up" style={{ padding: '24px' }}>
          <div className="section-card-header">
            <div className="stat-icon-wrapper theme-primary" style={{ width: '40px', height: '40px' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="chart-title" style={{ margin: 0, fontSize: '15px' }}>Revenue Velocity</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Weekly sales trend analysis</p>
            </div>
          </div>
          <div className="chart-wrapper" style={{ height: '240px', marginTop: '20px' }}>
             <WeeklyBarChart data={weeklySales} />
          </div>
        </div>

        <div className="bt-glass-panel animate-slide-up" style={{ padding: '24px' }}>
          <div className="section-card-header">
            <div className="stat-icon-wrapper theme-secondary" style={{ width: '40px', height: '40px' }}>
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="chart-title" style={{ margin: 0, fontSize: '15px' }}>Payment Distribution</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Revenue split by channel</p>
            </div>
          </div>
          <div className="chart-wrapper" style={{ height: '240px', marginTop: '20px' }}>
            <PaymentPieChart data={paymentBreakdown} />
          </div>
        </div>
      </div>

      {/* Operations Grid */}
      <div className="reports-grid" style={{ marginBottom: '32px' }}>
        {/* Low Stock Alerts */}
        <div className="bt-glass-panel animate-slide-up" style={{ padding: '24px' }}>
          <div className="section-card-header" style={{ marginBottom: '20px' }}>
            <div className="stat-icon-wrapper theme-danger" style={{ width: '36px', height: '36px' }}>
              <Package size={18} />
            </div>
            <h3 className="chart-title" style={{ margin: 0, fontSize: '15px' }}>Inventory Risks</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lowStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 opacity-50">
                <Package size={32} className="mb-2" />
                <p style={{ fontSize: '12px' }}>No inventory risks detected.</p>
              </div>
            ) : lowStock.map((p: any) => (
              <div key={p.id} className="bt-glass-card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>{p.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0 }}>Threshold: {p.threshold} units</p>
                </div>
                <div className="status-badge theme-danger" style={{ fontSize: '10px', fontWeight: 800 }}>
                  {p.stock} LEFT
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bt-glass-panel animate-slide-up" style={{ padding: '24px' }}>
          <div className="section-card-header" style={{ marginBottom: '20px' }}>
            <div className="stat-icon-wrapper theme-info" style={{ width: '36px', height: '36px' }}>
              <ShoppingBag size={18} />
            </div>
            <h3 className="chart-title" style={{ margin: 0, fontSize: '15px' }}>Live Activity</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 opacity-50">
                <ShoppingBag size={32} className="mb-2" />
                <p style={{ fontSize: '12px' }}>No recent activity.</p>
              </div>
            ) : recentSales.map((s: any) => (
              <div key={s.id} className="bt-glass-card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>{s.sale_number}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0 }}>{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>KES {s.total.toLocaleString()}</p>
                  <span className={`status-badge ${s.status === 'PAID' || s.status === 'COMPLETED' ? 'theme-success' : 'theme-info'}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline / Calendar */}
      <section className="animate-slide-up">
        <div className="bt-glass-panel" style={{ padding: '24px' }}>
          <div className="section-card-header">
            <div className="stat-icon-wrapper theme-info" style={{ width: '40px', height: '40px' }}>
              <CalendarIcon size={20} />
            </div>
            <div>
              <h3 className="chart-title" style={{ margin: 0, fontSize: '15px' }}>Business Calendar</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Daily transaction density and scheduled events</p>
            </div>
          </div>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
            <Calendar mode="single" className="bt-glass-card" style={{ border: '1px solid var(--border-light)', padding: '20px' }} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
