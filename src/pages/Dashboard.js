// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { WeeklyBarChart, PaymentPieChart } from "@/components/ui/chart";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ShoppingCart, DollarSign, TrendingUp, TrendingDown, Package, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";

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

interface Product {
  id: string;
  name: string;
  stock: number;
  low_stock_threshold: number;
  buying_price: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isSales = user?.role === "SALES";

  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [weeklySales, setWeeklySales] = useState<any[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayProfit: 0,
    todayLoss: 0,
    netRevenue: 0,
    txCount: 0,
    totalStockValue: 0,
    lowStockCount: 0,
  });

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

        const weekly = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dayStr = d.toISOString().slice(0, 10);
          return {
            day: d.toLocaleDateString("en", { weekday: "short" }),
            sales: salesData.filter((s) => s.created_at.slice(0, 10) === dayStr).reduce((s, r) => s + Number(r.total_amount), 0),
            profit: salesData.filter((s) => s.created_at.slice(0, 10) === dayStr).reduce((s, r) => s + Number(r.profit), 0),
          };
        });
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
        console.error(err);
      }
    };
    fetchDashboard();
  }, [user?.id, isSales]);

  const fmt = (n: number) => `KES ${n.toLocaleString()}`;
  const displayName = user?.full_name ?? user?.username ?? "User";

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="text-muted-foreground mb-4">Welcome back, {displayName}</p>

      {/* Resizable Charts */}
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <WeeklyBarChart data={weeklySales} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <PaymentPieChart data={paymentBreakdown} />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Calendar */}
      <div className="mt-6">
        <Calendar />
      </div>
    </div>
  );
};

export default Dashboard;
