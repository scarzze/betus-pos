import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from '@/contexts/AuthContext';
import { Store, CreditCard, Package, Shield } from 'lucide-react';
const settingsSections = [
    {
        title: 'General',
        icon: Store,
        fields: [
            { label: 'Shop Name', value: 'VinLex Electronics', type: 'text' },
            { label: 'Phone Number', value: '+254 712 345 678', type: 'text' },
            { label: 'Location', value: 'Nairobi, Kenya', type: 'text' },
            { label: 'Receipt Footer', value: 'Thank you for shopping at VinLex!', type: 'text' },
            { label: 'Currency', value: 'KES', type: 'text' },
        ],
    },
    {
        title: 'Payment Settings',
        icon: CreditCard,
        fields: [
            { label: 'M-Pesa Till Number', value: '123456', type: 'text' },
            { label: 'Daraja Consumer Key', value: '••••••••••••', type: 'password' },
            { label: 'Daraja Consumer Secret', value: '••••••••••••', type: 'password' },
            { label: 'Payment Timeout (seconds)', value: '60', type: 'text' },
        ],
    },
    {
        title: 'Inventory',
        icon: Package,
        fields: [
            { label: 'Low Stock Threshold', value: '10', type: 'text' },
            { label: 'SKU Prefix', value: 'VLX', type: 'text' },
            { label: 'IMEI Tracking', value: 'Enabled', type: 'text' },
        ],
    },
    {
        title: 'Security',
        icon: Shield,
        fields: [
            { label: 'Session Timeout (min)', value: '30', type: 'text' },
            { label: 'Max Login Attempts', value: '5', type: 'text' },
            { label: 'Password Min Length', value: '8', type: 'text' },
        ],
    },
];
const SettingsPage = () => {
    const { user } = useAuth();
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "Settings" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Manage your shop configuration" })] }), _jsx("div", { className: "grid gap-6", children: settingsSections.map((section) => (_jsxs("div", { className: "glass-card", children: [_jsxs("div", { className: "flex items-center gap-3 border-b border-border p-4", children: [_jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary", children: _jsx(section.icon, { className: "h-5 w-5" }) }), _jsx("h2", { className: "font-display text-base font-semibold text-foreground", children: section.title })] }), _jsx("div", { className: "grid gap-4 p-5 sm:grid-cols-2", children: section.fields.map((field) => (_jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-muted-foreground", children: field.label }), _jsx("input", { type: field.type, defaultValue: field.value, className: "w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" })] }, field.label))) })] }, section.title))) }), _jsx("div", { className: "mt-6 flex justify-end", children: _jsx("button", { className: "rounded-lg gradient-orange px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90", children: "Save Settings" }) })] }));
};
export default SettingsPage;
