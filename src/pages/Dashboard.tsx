import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';

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
  const { user } = useAuth();
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
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [weeklySales, setWeeklySales] = useState<any[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Recent sales
      let salesQuery = supabase.from('sales').select('*').order('created_at', { ascending: false }).limit(10);
      if (isSales) salesQuery = salesQuery.eq('user_id', authUser.id);
      const { data: salesData } = await salesQuery;

      if (salesData) {
        setRecentSales(salesData);
        const today = new Date().toISOString().slice(0, 10);
        const todaySales = salesData.filter(s => s.created_at.slice(0, 10) === today);
        const totalSales = todaySales.reduce((s, r) => s + Number(r.total_amount), 0);
        const totalProfit = todaySales.reduce((s, r) => s + Math.max(0, Number(r.profit)), 0);
        const totalLoss = todaySales.reduce((s, r) => s + Math.abs(Math.min(0, Number(r.profit))), 0);

        // Payment breakdown
        const cash = salesData.filter(s => s.payment_method === 'cash').reduce((s, r) => s + Number(r.total_amount), 0);
        const mpesa = salesData.filter(s => s.payment_method === 'mpesa').reduce((s, r) => s + Number(r.total_amount), 0);
        setPaymentBreakdown([
          { name: 'Cash', value: cash },
          { name: 'M-Pesa', value: mpesa },
        ]);

        // Weekly sales (last 7 days)
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
          txCount: todaySales.length,
        }));
      }

      // Products for stock
      if (!isSales) {
        const { data: products } = await supabase.from('products').select('*');
        if (products) {
          const stockValue = products.reduce((s, p) => s + Number(p.buying_price) * p.stock, 0);
          const lowStock = products.filter(p => p.stock <= p.low_stock_threshold);
          setStats(prev => ({ ...prev, totalStockValue: stockValue, lowStockCount: lowStock.length }));
          setLowStockItems(lowStock.slice(0, 5));
        }
      }
    };
    fetchDashboard();
  }, [isSales]);

  const fmt = (n: number) => `KES ${n.toLocaleString()}`;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">
          {isSales ? 'My Dashboard' : 'Dashboard'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user?.name}. Here's what's happening today.
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

      {!isSales && (
        <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-3">
          <StatCard title="Total Stock Value" value={fmt(stats.totalStockValue)} icon={<Package className="h-5 w-5" />} />
          <StatCard title="Low Stock Items" value={String(stats.lowStockCount)} icon={<AlertTriangle className="h-5 w-5" />} />
          <StatCard
            title="Profit Margin"
            value={stats.todaySales > 0 ? `${((stats.todayProfit / stats.todaySales) * 100).toFixed(1)}%` : '0%'}
            changeType="positive"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Charts */}
      {!isSales && (
        <div className="mb-6 grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Weekly Sales Bar Chart */}
          <div className="glass-card p-5 lg:col-span-2">
            <h3 className="font-display text-base font-semibold text-foreground mb-4">Weekly Sales & Profit</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 18%)" />
                <XAxis dataKey="day" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: 'hsl(220, 14%, 10%)', border: '1px solid hsl(220, 12%, 18%)', borderRadius: '8px', color: 'hsl(40, 10%, 92%)' }}
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="sales" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} name="Sales" />
                <Bar dataKey="profit" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Pie Chart */}
          <div className="glass-card p-5">
            <h3 className="font-display text-base font-semibold text-foreground mb-4">Payment Methods</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={paymentBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {paymentBreakdown.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(220, 14%, 10%)', border: '1px solid hsl(220, 12%, 18%)', borderRadius: '8px', color: 'hsl(40, 10%, 92%)' }}
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {paymentBreakdown.map((p, i) => (
                <div key={p.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tables */}
      <div className={`grid gap-6 ${!isSales ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
        <div className={`glass-card ${!isSales ? 'lg:col-span-2' : ''}`}>
          <div className="border-b border-border p-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Recent Sales</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                  {!isSales && <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profit</th>}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No sales yet</td></tr>
                ) : recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-border/50 transition-colors hover:bg-secondary/50">
                    <td className="px-4 py-3 text-sm font-medium text-primary">{sale.sale_number}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{sale.customer_name || 'Walk-in'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">KES {Number(sale.total_amount).toLocaleString()}</td>
                    {!isSales && (
                      <td className={`px-4 py-3 text-sm font-semibold ${Number(sale.profit) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        KES {Number(sale.profit).toLocaleString()}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                        sale.payment_method === 'mpesa' ? 'bg-success/15 text-success' : 'bg-info/15 text-info'
                      }`}>
                        {sale.payment_method === 'mpesa' ? 'M-Pesa' : 'Cash'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(sale.created_at).toLocaleString('en', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!isSales && (
          <div className="glass-card">
            <div className="border-b border-border p-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Low Stock Alert</h2>
            </div>
            <div className="space-y-3 p-4">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">All stock levels OK</p>
              ) : lowStockItems.map((item) => (
                <div key={item.id} className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.sku}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-destructive font-semibold">{item.stock} left</span>
                    <span className="text-xs text-muted-foreground">Min: {item.low_stock_threshold}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-destructive"
                      style={{ width: `${Math.min((item.stock / item.low_stock_threshold) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
