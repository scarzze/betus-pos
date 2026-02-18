import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import vinlexLogo from '@/assets/vinlex-logo.png';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'SALES'] },
    { icon: Package, label: 'Products', path: '/products', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { icon: ShoppingCart, label: 'Sales', path: '/sales', roles: ['SUPER_ADMIN', 'ADMIN', 'SALES'] },
    { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { icon: Users, label: 'Users', path: '/users', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['SUPER_ADMIN', 'ADMIN'] },
  ];

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-primary/20 text-primary',
    ADMIN: 'bg-info/20 text-info',
    SALES: 'bg-success/20 text-success',
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} flex flex-col border-r border-border bg-sidebar transition-all duration-300`}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden">
            <img src={vinlexLogo} alt="VinLex" className="h-full w-full object-contain" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display text-lg font-bold leading-tight text-foreground">VinLex</h1>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Electronics POS</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? 'bg-primary/10 text-primary glow-orange' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}>
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-3">
          {!collapsed && user && (
            <div className="mb-3 rounded-lg bg-secondary p-3">
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <span className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${roleColors[user.role] || ''}`}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => setCollapsed(!collapsed)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            {!collapsed && (
              <button onClick={handleLogout}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default AppLayout;
