// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { WeeklyBarChart, PaymentPieChart } from "@/components/ui/chart";
import { useAuth } from "@/contexts/AuthContext";

// Dashboard types
interface Sale {
  id: string;
  total_amount: number;
  profit: number;
  payment_method: string;
  created_at: string;
}

interface UserMetadata {
  full_name?: string;
  username?: string;
}

interface User {
  id: string;
  email?: string;
  user_metadata?: UserMetadata;
  role?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth<User>();
  const displayName =
    user?.user_metadata?.full_name ?? user?.user_metadata?.username ?? "User";

  const [weeklySales, setWeeklySales] = useState<any[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayProfit: 0,
    todayLoss: 0,
    netRevenue: 0,
    txCount: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/sales");
        const sales: Sale[] = await res.json();
        const today = new Date().toISOString().slice(0, 10);

        const todaySalesArr = sales.filter(
          (s) => s.created_at.slice(0, 10) === today
        );

        const totalSales = todaySalesArr.reduce(
          (sum, r) => sum + r.total_amount,
          0
        );
        const totalProfit = todaySalesArr.reduce(
          (sum, r) => sum + Math.max(0, r.profit),
          0
        );
        const totalLoss = todaySalesArr.reduce(
          (sum, r) => sum + Math.abs(Math.min(0, r.profit)),
          0
        );

        const cash = sales
          .filter((s) => s.payment_method === "cash")
          .reduce((sum, r) => sum + r.total_amount, 0);
        const mpesa = sales
          .filter((s) => s.payment_method === "mpesa")
          .reduce((sum, r) => sum + r.total_amount, 0);

        setPaymentBreakdown([
          { name: "Cash", value: cash },
          { name: "M-Pesa", value: mpesa },
        ]);

        setStats({
          todaySales: totalSales,
          todayProfit: totalProfit,
          todayLoss: totalLoss,
          netRevenue: totalSales - totalLoss,
          txCount: todaySalesArr.length,
        });

        const weekly = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dayStr = d.toISOString().slice(0, 10);
          return {
            day: d.toLocaleDateString("en", { weekday: "short" }),
            sales: sales
              .filter((s) => s.created_at.slice(0, 10) === dayStr)
              .reduce((sum, r) => sum + r.total_amount, 0),
            profit: sales
              .filter((s) => s.created_at.slice(0, 10) === dayStr)
              .reduce((sum, r) => sum + r.profit, 0),
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
