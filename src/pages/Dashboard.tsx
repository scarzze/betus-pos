import { useAuth } from '@/contexts/AuthContext';
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

// Mock data
const recentSales = [
  { id: 'S001', customer: 'Walk-in', items: 'iPhone 15 Case, Screen Protector', total: 'KES 2,500', method: 'M-Pesa', time: '2 min ago' },
  { id: 'S002', customer: 'James Mwangi', items: 'Samsung Charger', total: 'KES 1,200', method: 'Cash', time: '15 min ago' },
  { id: 'S003', customer: 'Walk-in', items: 'USB-C Cable x3', total: 'KES 900', method: 'M-Pesa', time: '30 min ago' },
  { id: 'S004', customer: 'Mary Njeri', items: 'Earbuds Pro', total: 'KES 3,800', method: 'M-Pesa', time: '1 hr ago' },
  { id: 'S005', customer: 'Walk-in', items: 'Phone Holder, AUX Cable', total: 'KES 1,500', method: 'Cash', time: '2 hrs ago' },
];

const lowStockItems = [
  { name: 'iPhone 15 Pro Max Case', sku: 'VLX-CSE-001', stock: 3, threshold: 10 },
  { name: 'Samsung S24 Screen Protector', sku: 'VLX-SPR-012', stock: 5, threshold: 15 },
  { name: 'USB-C Fast Charger', sku: 'VLX-CHR-008', stock: 2, threshold: 10 },
];

const Dashboard = () => {
  const { user } = useAuth();
  const isSales = user?.role === 'SALES';

  return (
    <div className="p-6">
      {/* Header */}
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
          value={isSales ? 'KES 12,400' : 'KES 87,500'}
          change="+12% from yesterday"
          changeType="positive"
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        {!isSales && (
          <>
            <StatCard
              title="Today's Profit"
              value="KES 23,100"
              change="+8.2% from yesterday"
              changeType="positive"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatCard
              title="Today's Loss"
              value="KES 1,200"
              change="-3% from yesterday"
              changeType="negative"
              icon={<TrendingDown className="h-5 w-5" />}
            />
            <StatCard
              title="Net Revenue"
              value="KES 21,900"
              change="+5.4% from yesterday"
              changeType="positive"
              icon={<DollarSign className="h-5 w-5" />}
            />
          </>
        )}
        {isSales && (
          <StatCard
            title="My Transactions"
            value="8"
            change="3 pending"
            changeType="neutral"
            icon={<ShoppingCart className="h-5 w-5" />}
          />
        )}
      </div>

      {/* Admin-level metrics */}
      {!isSales && (
        <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Stock Value" value="KES 1.2M" icon={<Package className="h-5 w-5" />} />
          <StatCard title="Active Users" value="4" icon={<Users className="h-5 w-5" />} />
          <StatCard title="Profit Margin" value="26.4%" change="+2.1%" changeType="positive" icon={<TrendingUp className="h-5 w-5" />} />
          <StatCard title="Pending M-Pesa" value="3" change="KES 4,200" changeType="neutral" icon={<AlertTriangle className="h-5 w-5" />} />
        </div>
      )}

      {/* Tables */}
      <div className={`grid gap-6 ${!isSales ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* Recent Sales */}
        <div className={`glass-card ${!isSales ? 'lg:col-span-2' : ''}`}>
          <div className="border-b border-border p-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Recent Sales</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-border/50 transition-colors hover:bg-secondary/50">
                    <td className="px-4 py-3 text-sm font-medium text-primary">{sale.id}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{sale.items}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{sale.total}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                        sale.method === 'M-Pesa' ? 'bg-success/15 text-success' : 'bg-info/15 text-info'
                      }`}>
                        {sale.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{sale.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        {!isSales && (
          <div className="glass-card">
            <div className="border-b border-border p-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Low Stock Alert</h2>
            </div>
            <div className="space-y-3 p-4">
              {lowStockItems.map((item) => (
                <div key={item.sku} className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.sku}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-destructive font-semibold">{item.stock} left</span>
                    <span className="text-xs text-muted-foreground">Min: {item.threshold}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-destructive"
                      style={{ width: `${(item.stock / item.threshold) * 100}%` }}
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
