import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LoadingScreen from '@/components/LoadingScreen';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name } },
            });
            if (error) {
                toast({ title: 'Sign Up Failed', description: error.message, variant: 'destructive' });
            }
            else {
                toast({ title: 'Account created!', description: 'You can now sign in.' });
                setIsSignUp(false);
            }
            return;
        }
        const success = await login(email, password);
        if (success) {
            setShowLoading(true);
        }
        else {
            toast({ title: 'Login Failed', description: 'Invalid email or password.', variant: 'destructive' });
        }
    };
    if (showLoading) {
        return _jsx(LoadingScreen, { onComplete: () => navigate('/dashboard') });
    }
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center gradient-dark p-4", children: _jsxs("div", { className: "w-full max-w-md animate-fade-in", children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-orange glow-orange animate-pulse-glow", children: _jsx(Zap, { className: "h-8 w-8 text-primary-foreground" }) }), _jsx("h1", { className: "font-display text-3xl font-bold text-gradient-orange", children: "VinLex Electronics" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Cloud POS System" })] }), _jsxs("div", { className: "glass-card p-8", children: [_jsx("h2", { className: "mb-6 font-display text-xl font-semibold text-foreground", children: isSignUp ? 'Create Account' : 'Sign In' }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [isSignUp && (_jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-muted-foreground", children: "Full Name" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), className: "w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary", placeholder: "Dan Cheru", required: true })] })), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-muted-foreground", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary", placeholder: "you@vinlex.co.ke", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-muted-foreground", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), className: "w-full rounded-lg border border-border bg-secondary px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, minLength: 6 }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: showPassword ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] })] }), _jsx("button", { type: "submit", disabled: isLoading, className: "flex w-full items-center justify-center gap-2 rounded-lg gradient-orange px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin" }), isSignUp ? 'Creating…' : 'Signing in…'] })) : (isSignUp ? 'Create Account' : 'Sign In') })] }), _jsx("div", { className: "mt-4 text-center", children: _jsx("button", { onClick: () => setIsSignUp(!isSignUp), className: "text-sm text-primary hover:underline", children: isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up" }) })] })] }) }));
};
export default Login;
