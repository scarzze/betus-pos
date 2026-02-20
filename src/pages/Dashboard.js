// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, DollarSign, TrendingUp, TrendingDown, Package, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { DayPicker } from "@/components/ui/calendar";
import { WeeklyBarChart, PaymentPieChart, CHART_COLORS } from "@/components/ui/chart";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType = "neutral", icon }) => (
  <div className="glass-card p-5 transition-all hover:border-primary/30">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
        {change && (
          <div
            className={`mt-2 flex items-center gap-1 text-xs font-medium ${
              changeType === "positive"
                ? "text-success"
                : changeType === "negative"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {changeType === "positive" ? <ArrowUpRight className="h-3 w-3" /> : changeType === "negative" ? <ArrowDownRight className="h-3 w-3" /> : null}
            {change}
          </div>
        )}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
    </div>
  </div>
);

interface WeeklyData {
  day: string;
  sales: number;
  profit: number;
}

interface PaymentData {
  name: string;
  value: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  low_stock_threshold: number;
  buying_price: number;
}

interface Sale {
  id: string;
  sale_number: string;
  customer_name?: string;
  total_amount: number;
  profit: number;
  payment_method: string;
  created_at: string;
  user_id?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isSales = user?.role === "SALES";

  const [stats, setStats] = useState({
    todaySales: 0,
    todayProfit: 0,
    todayLoss: 0,
    netRevenue: 0,
    totalStockValue: 0,
    txCount: 0,
    lowStockCount: 0,
  });

  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [weeklySales, setWeeklySales] = useState<WeeklyData[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentData[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const salesRes = await fetch("http://localhost:8000/sales");
        let salesData: Sale[] = await salesRes.json();
        if (isSales) salesData = salesData.filter((s) => s.user_id === user?.id);
        setRecentSales(salesData);

        const today = new Date().toISOString().slice(0, 10);
        const todaySales = salesData.filter((s) => s.created_at.slice(0, 10) === today);
        const totalSales = todaySales.reduce((s, r) => s + Number(r.total_amount), 0);
        const totalProfit = todaySales.reduce((s, r) => s + Math.max(0, Number(r.profit)), 0);
        const totalLoss = todaySales.reduce((s, r) => s + Math.abs(Math.min(0, Number(r.profit))), 0);

        const cash = salesData.filter((s) => s.payment_method === "cash").reduce((s, r) => s + Number(r.total_amount), 0);
        const mpesa = salesData.filter((s) => s.payment_method === "mpesa").reduce((s, r) => s + Number(r.total_amount), 0);
        setPaymentBreakdown([
          { name: "Cash", value: cash },
          { name: "M-Pesa", value: mpesa },
        ]);

        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().slice(0, 10);
        });

        const weekly = days.map((day) => ({
          day: new Date(day).toLocaleDateString("en", { weekday: "short" }),
          sales: salesData.filter((s) => s.created_at.slice(0, 10) === day).reduce((s, r) => s + Number(r.total_amount), 0),
          profit: salesData.filter((s) => s.created_at.slice(0, 10) === day).reduce((s, r) => s + Number(r.profit), 0),
        }));

        setWeeklySales(weekly);

        setStats((prev) => ({
          ...prev,
          todaySales: totalSales,
          todayProfit: totalProfit,
          todayLoss: totalLoss,
          netRevenue: totalSales - totalLoss,
          txCount: todaySales.length,
        }));

        if (!isSales) {
          const productsRes = await fetch("http://localhost:8000/products");
          const productsData: Product[] = await productsRes.json();
          const stockValue = productsData.reduce((s, p) => s + p.buying_price * p.stock, 0);
          const lowStock = productsData.filter((p) => p.stock <= p.low_stock_threshold);
          setStats((prev) => ({ ...prev, totalStockValue: stockValue, lowStockCount: lowStock.length }));
          setLowStockItems(lowStock.slice(0, 5));
        }
      } catch (err) {
        console.error("Dashboard fetch error", err);
      }
    };
    fetchDashboard();
  }, [isSales, user?.id]);

  const fmt = (n: number) => `KES ${n.toLocaleString()}`;
  const displayName = user?.full_name ?? user?.username ?? "User";

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">{isSales ? "My Dashboard" : "Dashboard"}</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {displayName}. Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className={`mb-6 grid gap-4 ${isSales ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
        <StatCard
          title={isSales ? "My Today's Sales" : "Today's Sales"}
          value={fmt(stats.todaySales)}
          change={`${stats.txCount} transactions`}
          changeType="positive"
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        {!isSales && (
          <>
            <StatCard title="Today's Profit" value={fmt(stats.todayProfit)} changeType="positive" icon={<TrendingUp className="h-5 w-5" />} />
            <StatCard title="Today's Loss" value={fmt(stats.todayLoss)} changeType="negative" icon={<TrendingDown className="h-5 w-5" />} />
            <StatCard title="Net Revenue" value={fmt(stats.netRevenue)} changeType="positive" icon={<DollarSign className="h-5 w-5" />} />
          </>
        )}
        {isSales && <StatCard title="My Transactions" value={String(stats.txCount)} changeType="neutral" icon={<ShoppingCart className="h-5 w-5" />} />}
      </div>

      {!isSales && (
        <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-3">
          <StatCard title="Total Stock Value" value={fmt(stats.totalStockValue)} icon={<Package className="h-5 w-5" />} />
          <StatCard title="Low Stock Items" value={String(stats.lowStockCount)} icon={<AlertTriangle className="h-5 w-5" />} />
          <StatCard
            title="Profit Margin"
            value={stats.todaySales > 0 ? `${((stats.todayProfit / stats.todaySales) * 100).toFixed(1)}%` : "0%"}
            changeType="positive"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Charts */}
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <WeeklyBarChart data={weeklySales} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <PaymentPieChart data={paymentBreakdown} />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Calendar */}
      <div className="mt-6">
        <DayPicker />
      </div>

      {/* Recent Sales */}
      <div className="mt-6 glass-card p-4">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Recent Sales</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th>ID</th>
                <th>Customer</th>
                <th>Total</th>
                {!isSales && <th>Profit</th>}
                <th>Method</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No sales yet
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.sale_number}</td>
                    <td>{sale.customer_name ?? "Walk-in"}</td>
                    <td>{fmt(Number(sale.total_amount))}</td>
                    {!isSales && <td className={Number(sale.profit) >= 0 ? "text-success" : "text-destructive"}>{fmt(Number(sale.profit))}</td>}
                    <td>{sale.payment_method === "mpesa" ? "M-Pesa" : "Cash"}</td>
                    <td>{new Date(sale.created_at).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
