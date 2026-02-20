import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import vinlexLogo from '@/assets/vinlex-logo.png';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, Users, } from 'lucide-react';
const AppLayout = ({ children }) => {
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
    const roleColors = {
        SUPER_ADMIN: 'bg-primary/20 text-primary',
        ADMIN: 'bg-info/20 text-info',
        SALES: 'bg-success/20 text-success',
    };
    return (_jsxs("div", { className: "flex h-screen overflow-hidden", children: [_jsxs("aside", { className: `${collapsed ? 'w-[72px]' : 'w-64'} flex flex-col border-r border-border bg-sidebar transition-all duration-300`, children: [_jsxs("div", { className: "flex h-16 items-center gap-3 border-b border-border px-4", children: [_jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden", children: _jsx("img", { src: vinlexLogo, alt: "VinLex", className: "h-full w-full object-contain" }) }), !collapsed && (_jsxs("div", { className: "overflow-hidden", children: [_jsx("h1", { className: "font-display text-lg font-bold leading-tight text-foreground", children: "VinLex" }), _jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-muted-foreground", children: "Electronics POS" })] }))] }), _jsx("nav", { className: "flex-1 space-y-1 px-3 py-4", children: filteredNav.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (_jsxs(Link, { to: item.path, className: `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'bg-primary/10 text-primary glow-orange' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`, children: [_jsx(item.icon, { className: `h-5 w-5 shrink-0 ${isActive ? 'text-primary' : ''}` }), !collapsed && _jsx("span", { children: item.label })] }, item.path));
                        }) }), _jsxs("div", { className: "border-t border-border p-3", children: [!collapsed && user && (_jsxs("div", { className: "mb-3 rounded-lg bg-secondary p-3", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: user.name }), _jsx("p", { className: "text-xs text-muted-foreground", children: user.email }), _jsx("span", { className: `mt-1.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${roleColors[user.role] || ''}`, children: user.role.replace('_', ' ') })] })), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setCollapsed(!collapsed), className: "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground", children: collapsed ? _jsx(ChevronRight, { className: "h-4 w-4" }) : _jsx(ChevronLeft, { className: "h-4 w-4" }) }), !collapsed && (_jsxs("button", { onClick: handleLogout, className: "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive", children: [_jsx(LogOut, { className: "h-4 w-4" }), "Logout"] }))] })] })] }), _jsx("main", { className: "flex-1 overflow-auto", children: children })] }));
};
export default AppLayout;
