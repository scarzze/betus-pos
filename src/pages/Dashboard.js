import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { WeeklyBarChart, PaymentPieChart } from "@/components/ui/chart";
import { useAuth } from "@/contexts/AuthContext";
const Dashboard = () => {
    const { user } = useAuth(); // removed <User>() generic
    const displayName = user?.full_name ??
        user?.username ??
        user?.user_metadata?.full_name ??
        user?.user_metadata?.username ??
        "User";
    const [weeklySales, setWeeklySales] = useState([]);
    const [paymentBreakdown, setPaymentBreakdown] = useState([]);
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
                const sales = await res.json();
                const today = new Date().toISOString().slice(0, 10);
                const todaySalesArr = sales.filter((s) => s.created_at.slice(0, 10) === today);
                const totalSales = todaySalesArr.reduce((sum, r) => sum + r.total_amount, 0);
                const totalProfit = todaySalesArr.reduce((sum, r) => sum + Math.max(0, r.profit), 0);
                const totalLoss = todaySalesArr.reduce((sum, r) => sum + Math.abs(Math.min(0, r.profit)), 0);
                const cash = sales.filter((s) => s.payment_method === "cash")
                    .reduce((sum, r) => sum + r.total_amount, 0);
                const mpesa = sales.filter((s) => s.payment_method === "mpesa")
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
                        sales: sales.filter((s) => s.created_at.slice(0, 10) === dayStr)
                            .reduce((sum, r) => sum + r.total_amount, 0),
                        profit: sales.filter((s) => s.created_at.slice(0, 10) === dayStr)
                            .reduce((sum, r) => sum + r.profit, 0),
                    };
                });
                setWeeklySales(weekly);
            }
            catch (err) {
                console.error(err);
            }
        };
        fetchDashboard();
    }, [user?.id]);
    return (_jsxs("div", { className: "p-6", children: [_jsx("h1", { className: "font-bold text-2xl", children: "Dashboard" }), _jsxs("p", { className: "mb-4 text-muted-foreground", children: ["Welcome back, ", displayName] }), _jsxs(ResizablePanelGroup, { direction: "horizontal", children: [_jsx(ResizablePanel, { children: _jsx(WeeklyBarChart, { data: weeklySales }) }), _jsx(ResizableHandle, {}), _jsx(ResizablePanel, { children: _jsx(PaymentPieChart, { data: paymentBreakdown }) })] }), _jsx("div", { className: "mt-6", children: _jsx(Calendar, {}) })] }));
};
export default Dashboard;
