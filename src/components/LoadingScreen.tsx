import { useEffect, useState } from 'react';
import vinlexLogo from '@/assets/vinlex-logo.png';

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-dark">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl glow-orange animate-pulse-glow overflow-hidden">
        <img src={vinlexLogo} alt="VinLex Logo" className="h-full w-full object-contain" />
      </div>
      <h1 className="mb-2 font-display text-2xl font-bold text-gradient-orange">VinLex Electronics POS</h1>
      <p className="mb-8 text-sm text-muted-foreground">Initializing system…</p>
      <div className="h-1 w-64 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full gradient-orange transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{Math.min(Math.round(progress), 100)}%</p>
    </div>
  );
};

export default LoadingScreen;
