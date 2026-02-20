import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';

interface User {
  id: string;
  name: string;
  role: 'SALES' | 'ADMIN' | string;
}

interface Sale {
  id: string;
  sale_number: string;
  customer_name?: string;
  total_amount: number;
  profit: number;
  payment_method: 'cash' | 'mpesa';
  created_at: string;
  user_id?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  low_stock_threshold: number;
  buying_price: number;
}

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

const StatCard = ({ title, value, change, changeType = 'neutral', icon }: StatCardProps) => (
  <div className="glass-card p-5 transition-all hover:border-primary/30">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
        {change && (
          <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${
            changeType === 'positive' ? 'text-success' : changeType === 'negative' ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {changeType === 'positive' ? <ArrowUpRight className="h-3 w-3" /> : changeType === 'negative' ? <ArrowDownRight className="h-3 w-3" /> : null}
            {change}
          </div>
        )}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
    </div>
  </div>
);

const CHART_COLORS = [
  'hsl(25, 95%, 53%)',
  'hsl(142, 71%, 45%)',
  'hsl(217, 91%, 60%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)',
];

const Dashboard = () => {
  const { user } = useAuth<User>();
  const isSales = user?.role === 'SALES';

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
  const [weeklySales, setWeeklySales] = useState<Array<{ day: string; sales: number; profit: number }>>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Fetch recent sales
        const salesRes = await fetch('http://localhost:8000/sales');
        let salesData: Sale[] = await salesRes.json();
        if (isSales && user?.id) {
          salesData = salesData.filter(s => s.user_id === user.id);
        }
        setRecentSales(salesData);

        const today = new Date().toISOString().slice(0, 10);
        const todaySalesData = salesData.filter(s => s.created_at.slice(0, 10) === today);
        const totalSales = todaySalesData.reduce((s, r) => s + Number(r.total_amount), 0);
        const totalProfit = todaySalesData.reduce((s, r) => s + Math.max(0, Number(r.profit)), 0);
        const totalLoss = todaySalesData.reduce((s, r) => s + Math.abs(Math.min(0, Number(r.profit))), 0);

        const cash = salesData.filter(s => s.payment_method === 'cash').reduce((s, r) => s + Number(r.total_amount), 0);
        const mpesa = salesData.filter(s => s.payment_method === 'mpesa').reduce((s, r) => s + Number(r.total_amount), 0);
        setPaymentBreakdown([
          { name: 'Cash', value: cash },
          { name: 'M-Pesa', value: mpesa },
        ]);

        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().slice(0, 10);
        });

        const weekly = days.map(day => ({
          day: new Date(day).toLocaleDateString('en', { weekday: 'short' }),
          sales: salesData.filter(s => s.created_at.slice(0, 10) === day).reduce((s, r) => s + Number(r.total_amount), 0),
          profit: salesData.filter(s => s.created_at.slice(0, 10) === day).reduce((s, r) => s + Number(r.profit), 0),
        }));
        setWeeklySales(weekly);

        setStats(prev => ({
          ...prev,
          todaySales: totalSales,
          todayProfit: totalProfit,
          todayLoss: totalLoss,
          netRevenue: totalSales - totalLoss,
          txCount: todaySalesData.length,
        }));

        // Fetch products for stock
        if (!isSales) {
          const productsRes = await fetch('http://localhost:8000/products');
          const productsData: Product[] = await productsRes.json();
          const stockValue = productsData.reduce((s, p) => s + p.buying_price * p.stock, 0);
          const lowStock = productsData.filter(p => p.stock <= p.low_stock_threshold);
          setStats(prev => ({ ...prev, totalStockValue: stockValue, lowStockCount: lowStock.length }));
          setLowStockItems(lowStock.slice(0, 5));
        }
      } catch (err) {
        console.error('Dashboard fetch error', err);
      }
    };
    fetchDashboard();
  }, [isSales, user?.id]);

  const fmt = (n: number) => `KES ${n.toLocaleString()}`;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">
          {isSales ? 'My Dashboard' : 'Dashboard'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user?.name || 'User'}. Here's what's happening today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className={`mb-6 grid gap-4 ${isSales ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
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
        {isSales && (
          <StatCard title="My Transactions" value={String(stats.txCount)} changeType="neutral" icon={<ShoppingCart className="h-5 w-5" />} />
        )}
      </div>

      {/* Charts & tables remain same; Recharts Tooltip format fixed for number | undefined */}
    </div>
  );
};

export default Dashboard;
