import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Receipt,
  ShieldAlert,
  ShoppingBag
} from 'lucide-react';
import BrandLogo from './BrandLogo';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'SALES'] },
    { icon: Package, label: 'Products', path: '/products', roles: ['SUPER_ADMIN', 'ADMIN'] },
    {icon: ShoppingCart, label: 'Sales', path: '/sales', roles: ['SUPER_ADMIN', 'ADMIN', 'SALES'] },
    { icon: Users, label: 'Customers', path: '/customers', roles: ['SUPER_ADMIN', 'ADMIN', 'SALES'] },
    { icon: Receipt, label: 'Expenses', path: '/expenses', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { icon: ShoppingBag, label: 'Web Orders', path: '/web-orders', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { icon: Users, label: 'Users', path: '/users', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { icon: ShieldAlert, label: 'Audit Vault', path: '/audit', roles: ['SUPER_ADMIN'] },
  ];

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'rgba(99, 102, 241, 0.15)',
    ADMIN: 'rgba(59, 130, 246, 0.15)',
    SALES: 'rgba(34, 197, 94, 0.15)',
  };

  return (
    <div className="bt-layout animate-fade-in">
      {/* Persistent Animated Background */}
      <div className="flow-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <aside className="bt-sidebar" style={{ width: collapsed ? '80px' : '260px' }}>
        {/* Logo Section */}
        <div className="flex items-center gap-3 border-b border-border p-4" style={{ height: '84px', borderBottom: '1px solid var(--border-light)' }}>
          <BrandLogo size={42} showText={!collapsed} />
        </div>

        {/* Navigation Section */}
        <nav className="nav-container no-scrollbar">
          {filteredNav.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`bt-nav-item ${isActive ? 'active shadow-glow' : ''}`}
                style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                <item.icon className="bt-nav-icon" />
                {!collapsed && <span className="bt-nav-label animate-fade-in">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User & Toggle Section */}
        <div className="border-t border-border p-4" style={{ borderColor: 'var(--border-light)', padding: '20px 16px' }}>
          {!collapsed && user && (
            <div className="mb-5 rounded-xl bg-white/5 p-3 animate-fade-in" style={{ border: '1px solid rgba(255,255,255,0.03)' }}>
              <p className="truncate text-xs font-semibold text-white">{user.email}</p>
              <span 
                className="mt-2 inline-block rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: roleColors[user.role], color: 'var(--primary)' }}
              >
                {user.role.replace('_', ' ')}
              </span>
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="bt-icon-btn"
                style={{ flexShrink: 0 }}
                title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
              
              {!collapsed && (
                <button
                  onClick={handleLogout}
                  className="bt-logout-btn shadow-glow"
                >
                  <LogOut className="logout-icon" />
                  <span>Logout</span>
                </button>
              )}
            </div>

            {collapsed && (
              <button
                onClick={handleLogout}
                className="bt-icon-btn animate-fade-in"
                style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="bt-main-content">
        <div className="animate-slide-up h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
