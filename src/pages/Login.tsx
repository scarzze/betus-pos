import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2, ShieldCheck, Lock, ShieldAlert, Timer, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LoadingScreen from '@/components/LoadingScreen';
import BrandLogo from '@/components/BrandLogo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [handshake, setHandshake] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockMsg, setLockMsg] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setHandshake(0);
    setLocalLoading(false);
    toast({ 
      title: 'Protocol Aborted', 
      description: 'Handshake terminated. You may retry authorization.', 
      variant: 'default' 
    });
    // We don't reload the page here to allow immediate retry
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    
    // If already loading, this click acts as a 'Stop'
    if (localLoading) {
      handleStop();
      return;
    }

    setLocalLoading(true);
    setHandshake(0);
    timerRef.current = setInterval(() => {
      setHandshake(prev => {
        const next = prev + Math.floor(Math.random() * 8) + 2;
        return next > 98 ? 98 : next;
      });
    }, 120);

    try {
      const success = await login(email, password);
      
      // If we stopped manually while the request was in flight, ignore the result
      if (!timerRef.current && !localLoading) return;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (success) {
        setHandshake(100);
        toast({ 
          title: '🔒 Access Granted', 
          description: `Welcome back, ${email.split('@')[0]}. Initializing secure session...`,
        });
        setShowLoading(true);
      } else {
        setHandshake(0);
        setLocalLoading(false);
        toast({ 
          title: 'Authentication Failed', 
          description: 'The credentials provided do not match our records.', 
          variant: 'destructive' 
        });
      }
    } catch (err: any) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setHandshake(0);
      setLocalLoading(false);
      
      const status = err.response?.status;
      const detail = err.response?.data?.detail;

      if (status === 423) {
        setIsLocked(true);
        setLockMsg(detail || "Shield Protocol Active. Account Locked.");
        toast({ 
          title: '🚨 SECURITY LOCKDOWN', 
          description: 'Too many failed attempts. Identity verification suspended.', 
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Identity Error', 
          description: detail || 'Verification failed. Please check your credentials.', 
          variant: 'destructive' 
        });
      }
    }
  };

  if (showLoading) {
    return <LoadingScreen onComplete={() => navigate('/dashboard')} />;
  }

  return (
    <div className="betus-login-root animate-fade-in">
      {/* Dynamic Background */}
      <div className={`betus-blob betus-blob-1 ${isLocked ? 'bg-red-500/20' : 'bg-primary/20'}`} />
      <div className={`betus-blob betus-blob-2 ${isLocked ? 'bg-red-600/20' : 'bg-indigo-500/20'}`} />
      <div className="betus-blob betus-blob-3" />

      {/* Security Lockdown Overlay */}
      {isLocked && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="bt-glass-panel p-12 max-w-md text-center border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-scale-in">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                <ShieldAlert size={40} className="text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">Access Restricted</h1>
            <p className="text-red-400 font-bold mb-6 text-sm bg-red-500/10 p-4 rounded-lg border border-red-500/20">
              {lockMsg}
            </p>
            <div className="flex items-center justify-center gap-3 text-white/40 mb-8">
              <Timer size={16} />
              <span className="text-xs font-mono uppercase tracking-widest">Temporal Lockout Active</span>
            </div>
            <button 
              onClick={() => setIsLocked(false)}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all font-bold text-sm uppercase tracking-widest"
            >
              Back to Terminal
            </button>
          </div>
        </div>
      )}

      <div className="betus-login-card">
        {/* Superior Branding */}
        <div className="betus-brand">
          <BrandLogo size={120} className="mb-6" />
          <h1 className="betus-title">Betus Electronics</h1>
          <p className="betus-subtitle">Apex Enterprise Suite</p>
        </div>

        {/* Authentication Terminal */}
        <div className="betus-form-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <ShieldCheck size={18} className="text-primary" />
            <h2 className="betus-welcome" style={{ margin: 0 }}>Secure Terminal</h2>
          </div>
          <p className="betus-welcome-sub">Enter credentials to initialize your session</p>

          <form onSubmit={handleSubmit} className="betus-form">
            <div className="betus-field">
              <label htmlFor="betus-email" className="betus-label">Access Email</label>
              <input
                id="betus-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="betus-input"
                placeholder="operator@betus.co.ke"
                required
                disabled={localLoading || isLocked}
              />
            </div>

            <div className="betus-field">
              <label htmlFor="betus-password" className="betus-label">Security Key</label>
              <div className="betus-input-wrap">
                <input
                  id="betus-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="betus-input"
                  placeholder="••••••••"
                  required
                  disabled={localLoading || isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="betus-eye-btn"
                  aria-label="Toggle password visibility"
                  disabled={localLoading || isLocked}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                id="betus-login-btn"
                type="submit"
                disabled={isLocked}
                className={`betus-submit-btn overflow-hidden relative ${isLocked ? 'opacity-50 grayscale' : ''} ${localLoading ? 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30' : ''}`}
              >
                {/* Progress highlight for unified button */}
                {localLoading && (
                  <div 
                    className="absolute inset-0 bg-primary/10 transition-all duration-300" 
                    style={{ width: `${handshake}%` }} 
                  />
                )}
                
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {localLoading ? (
                    <>
                      <XCircle size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
                      <span className="font-black">TERMINATE HANDSHAKE ({handshake}%)</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>Authorize Access</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>

          <div className="betus-footer-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
             <span>Betus System Architecture</span>
             <span style={{ opacity: 0.3 }}>|</span>
             <span>v2.4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
