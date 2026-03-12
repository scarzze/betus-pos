import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LoadingScreen from '@/components/LoadingScreen';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      setShowLoading(true);
    } else {
      toast({ title: 'Login Failed', description: 'Invalid email or password.', variant: 'destructive' });
    }
  };

  if (showLoading) {
    return <LoadingScreen onComplete={() => navigate('/dashboard')} />;
  }

  return (
    <div className="betus-login-root">
      {/* Animated background blobs */}
      <div className="betus-blob betus-blob-1" />
      <div className="betus-blob betus-blob-2" />
      <div className="betus-blob betus-blob-3" />

      <div className="betus-login-card">
        {/* Brand */}
        <div className="betus-brand">
          <div className="betus-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="betus-logo-svg">
              <rect width="40" height="40" rx="12" fill="url(#betusGrad)" />
              <path d="M10 20 L20 10 L30 20 L20 30 Z" fill="white" fillOpacity="0.9" />
              <path d="M20 14 L26 20 L20 26 L14 20 Z" fill="url(#betusGrad2)" />
              <defs>
                <linearGradient id="betusGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="betusGrad2" x1="14" y1="14" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#c4b5fd" />
                  <stop offset="1" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="betus-title">Betus POS</h1>
          <p className="betus-subtitle">Point of Sale System</p>
        </div>

        {/* Card */}
        <div className="betus-form-wrapper">
          <h2 className="betus-welcome">Welcome back</h2>
          <p className="betus-welcome-sub">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="betus-form">
            <div className="betus-field">
              <label htmlFor="betus-email" className="betus-label">Email address</label>
              <input
                id="betus-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="betus-input"
                placeholder="admin@betus.co.ke"
                required
              />
            </div>

            <div className="betus-field">
              <label htmlFor="betus-password" className="betus-label">Password</label>
              <div className="betus-input-wrap">
                <input
                  id="betus-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="betus-input betus-input-padded"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="betus-eye-btn"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="betus-login-btn"
              type="submit"
              disabled={isLoading}
              className="betus-submit-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="betus-spin" />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="betus-footer-text">
            Betus POS &copy; {new Date().getFullYear()} &mdash; Secure &amp; Fast
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
