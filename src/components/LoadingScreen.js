import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import vinlexLogo from '@/assets/vinlex-logo.png';
const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 300);
                    return 100;
                }
                return prev + Math.random() * 15 + 5;
            });
        }, 200);
        return () => clearInterval(interval);
    }, [onComplete]);
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex flex-col items-center justify-center gradient-dark", children: [_jsx("div", { className: "mb-8 flex h-24 w-24 items-center justify-center rounded-2xl glow-orange animate-pulse-glow overflow-hidden", children: _jsx("img", { src: vinlexLogo, alt: "VinLex Logo", className: "h-full w-full object-contain" }) }), _jsx("h1", { className: "mb-2 font-display text-2xl font-bold text-gradient-orange", children: "VinLex Electronics POS" }), _jsx("p", { className: "mb-8 text-sm text-muted-foreground", children: "Initializing system\u2026" }), _jsx("div", { className: "h-1 w-64 overflow-hidden rounded-full bg-secondary", children: _jsx("div", { className: "h-full rounded-full gradient-orange transition-all duration-300 ease-out", style: { width: `${Math.min(progress, 100)}%` } }) }), _jsxs("p", { className: "mt-3 text-xs text-muted-foreground", children: [Math.min(Math.round(progress), 100), "%"] })] }));
};
export default LoadingScreen;
