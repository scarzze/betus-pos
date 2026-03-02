import React, { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { WeeklyBarChart, PaymentPieChart } from "@/components/ui/chart";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag } from "lucide-react";
import api from "@/lib/api";

interface DashboardSummary {
  today_sales_count: number;
  profit_loss: {
    gross_revenue: number;
    total_profit: number;
    total_loss: number;
    net_profit: number;
    profit_margin: number;
  };
  top_products: { name: string; sold: number; revenue: number }[];
  weekly_sales: { date: string; revenue: number }[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.email?.split("@")[0] ?? "User";

  const [weeklySales, setWeeklySales] = useState<any[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todaySalesCount: 0,
    grossRevenue: 0,
    netProfit: 0,
    totalLoss: 0,
    profitMargin: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get<DashboardSummary>("/dashboard/summary");

        setStats({
          todaySalesCount: data.today_sales_count,
          grossRevenue: data.profit_loss.gross_revenue,
          netProfit: data.profit_loss.net_profit,
          totalLoss: data.profit_loss.total_loss,
          profitMargin: data.profit_loss.profit_margin,
        });

        // Map weekly_sales to chart format (fill gaps with zero)
        const today = new Date();
        const weekly = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(today.getDate() - (6 - i));
          const dayStr = d.toISOString().slice(0, 10);
          const match = data.weekly_sales.find(w => w.date === dayStr);
          return {
            day: d.toLocaleDateString("en", { weekday: "short" }),
            sales: match?.revenue ?? 0,
            profit: 0,
          };
        });
        setWeeklySales(weekly);

        // Payment breakdown — fetch from sales list for pie chart
        const salesRes = await api.get<any[]>("/sales");
        const sales = salesRes.data;
        const cash = sales.filter(s => s.payment_method === "cash").reduce((sum: number, r: any) => sum + r.total_amount, 0);
        const mpesa = sales.filter(s => s.payment_method === "mpesa").reduce((sum: number, r: any) => sum + r.total_amount, 0);
        setPaymentBreakdown([
          { name: "Cash", value: cash },
          { name: "M-Pesa", value: mpesa },
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
    {
      label: "Today's Sales",
      value: stats.todaySalesCount,
      icon: ShoppingBag,
      color: "text-primary",
      bg: "bg-primary/10",
      format: (v: number) => v.toString(),
    },
    {
      label: "Gross Revenue",
      value: stats.grossRevenue,
      icon: DollarSign,
      color: "text-success",
      bg: "bg-success/10",
      format: (v: number) => `KES ${v.toLocaleString()}`,
    },
    {
      label: "Net Profit",
      value: stats.netProfit,
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
      format: (v: number) => `KES ${v.toLocaleString()}`,
    },
    {
      label: "Total Loss",
      value: stats.totalLoss,
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-destructive/10",
      format: (v: number) => `KES ${v.toLocaleString()}`,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-bold text-2xl font-display text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, <span className="font-semibold text-foreground capitalize">{displayName}</span></p>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(card => (
          <div key={card.label} className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
            </div>
            <p className={`font-display text-xl font-bold ${card.color}`}>
              {loading ? "—" : card.format(card.value)}
            </p>
          </div>
        ))}
      </div>

      <ResizablePanelGroup direction="horizontal" className="mb-6">
        <ResizablePanel>
          <WeeklyBarChart data={weeklySales} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <PaymentPieChart data={paymentBreakdown} />
        </ResizablePanel>
      </ResizablePanelGroup>

      <div className="mt-6">
        <Calendar />
      </div>
    </div>
  );
};

export default Dashboard;
