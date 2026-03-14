import { useEffect, useState } from 'react';
import BrandLogo from './BrandLogo';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
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

  return (
    <div className="fixed inset-0 z-50 animate-fade-in gradient-dark" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <BrandLogo size={64} />
      </div>
      <h1 className="mb-2 font-display text-2xl font-bold text-gradient-orange" style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Betus Electronics POS</h1>
      <p className="mb-8 text-sm text-muted-foreground" style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Initializing system…</p>
      <div className="h-1 w-64 overflow-hidden rounded-full" style={{ height: '0.25rem', width: '16rem', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <div
          className="h-full rounded-full gradient-orange transition-all duration-300 ease-out"
          style={{ height: '100%', borderRadius: '9999px', width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground" style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>{Math.min(Math.round(progress), 100)}%</p>
    </div>
  );
};

export default LoadingScreen;
