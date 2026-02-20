// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { WeeklyBarChart, PaymentPieChart } from "@/components/ui/chart";
import { useAuth } from "@/contexts/AuthContext";

interface Sale {
  id: string;
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

  const displayName = user?.full_name ?? user?.username ?? "User";

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const salesRes = await fetch("/api/sales");
        const salesData: Sale[] = await salesRes.json();
        const today = new Date().toISOString().slice(0, 10);
        const todaySales = salesData.filter((s) => s.created_at.slice(0, 10) === today);

        const totalSales = todaySales.reduce((sum, r) => sum + r.total_amount, 0);
        const totalProfit = todaySales.reduce((sum, r) => sum + Math.max(0, r.profit), 0);
        const totalLoss = todaySales.reduce((sum, r) => sum + Math.abs(Math.min(0, r.profit)), 0);

        const cash = salesData.filter((s) => s.payment_method === "cash").reduce((sum, r) => sum + r.total_amount, 0);
        const mpesa = salesData.filter((s) => s.payment_method === "mpesa").reduce((sum, r) => sum + r.total_amount, 0);

        setPaymentBreakdown([{ name: "Cash", value: cash }, { name: "M-Pesa", value: mpesa }]);
        setStats({ ...stats, todaySales: totalSales, todayProfit: totalProfit, todayLoss: totalLoss, netRevenue: totalSales - totalLoss, txCount: todaySales.length });

        const weekly = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dayStr = d.toISOString().slice(0, 10);
          return {
            day: d.toLocaleDateString("en", { weekday: "short" }),
            sales: salesData.filter((s) => s.created_at.slice(0, 10) === dayStr).reduce((sum, r) => sum + r.total_amount, 0),
            profit: salesData.filter((s) => s.created_at.slice(0, 10) === dayStr).reduce((sum, r) => sum + r.profit, 0),
          };
        });
        setWeeklySales(weekly);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, [user?.id]);

  return (
    <div className="p-6">
      <h1 className="font-bold text-2xl">Dashboard</h1>
      <p className="mb-4 text-muted-foreground">Welcome back, {displayName}</p>

      <ResizablePanelGroup direction="horizontal">
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
