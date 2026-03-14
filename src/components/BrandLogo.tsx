import React from 'react';

interface BrandProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

const BrandLogo: React.FC<BrandProps> = ({ size = 40, className = '', showText = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="relative flex items-center justify-center animate-pulse-glow"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full drop-shadow-2xl"
        >
          {/* Outer Ring - Dynamic Rotation */}
          <circle 
            cx="50" 
            cy="50" 
            r="48" 
            stroke="url(#brandGrad)" 
            strokeWidth="1" 
            strokeDasharray="10 5" 
            opacity="0.3"
            className="animate-spin-slow"
          />
          
          {/* Background Prism */}
          <path 
            d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" 
            fill="url(#brandGrad)" 
            fillOpacity="0.08" 
          />
          
          {/* Inner Geometric Shield */}
          <path 
            d="M30 35 L50 20 L70 35 L70 65 L50 80 L30 65 Z" 
            fill="url(#brandGrad)" 
            fillOpacity="0.15" 
            stroke="url(#brandGrad)" 
            strokeWidth="0.5"
          />

          {/* Core Symbol: 'B' inspired geometric path */}
          <path 
            d="M35 30 L60 30 C70 30 75 35 75 42 L75 42 C75 49 70 54 60 54 L35 54 L60 54 C70 54 75 59 75 66 L75 66 C75 73 70 78 60 78 L35 78 Z" 
            stroke="white" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="drop-shadow-lg"
          >
            <animate 
              attributeName="stroke-dasharray" 
              from="0 200" 
              to="200 0" 
              dur="2.5s" 
              repeatCount="1" 
            />
          </path>
          
          {/* Center Point */}
          <circle cx="45" cy="54" r="3" fill="white" className="animate-pulse" />

          <defs>
            <linearGradient id="brandGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" /> {/* Indigo */}
              <stop offset="0.5" stopColor="#8b5cf6" /> {/* Violet */}
              <stop offset="1" stopColor="#ec4899" /> {/* Pink */}
            </linearGradient>
            
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter text-white leading-none uppercase">
            BETUS<span className="text-primary">-</span>ELECTRONICS
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-primary/80 uppercase leading-none mt-1">
            Enterprise POS
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
