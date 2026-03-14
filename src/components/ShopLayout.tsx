import React, { ReactNode } from 'react';
import { ShoppingCart, Search, User, Menu, Cpu, Rocket } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { ShopCart } from './ShopCart';
import { useState } from 'react';

const ShopLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-black">
      {/* Premium Storefront Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/50 backdrop-blur-2xl border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-8">
          <Link to="/shop" className="flex items-center gap-3 group">
            <BrandLogo size={40} />
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight leading-none">BETUS</h1>
              <span className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase opacity-80">Digital Flagship</span>
            </div>
          </Link>

          {/* Precision Search */}
          <div className="flex-1 max-w-2xl relative group hidden md:block">
            <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-full" />
            <div className="relative bg-white/5 border border-white/10 rounded-full px-6 py-2.5 flex items-center gap-3 focus-within:border-primary/50 transition-all">
              <Search size={18} className="text-white/30" />
              <input 
                placeholder="Search premium electronics, components, specialized gear..." 
                className="bg-transparent border-none outline-none w-full text-sm placeholder:text-white/20"
              />
              <kbd className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white/40">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-white/50">
              <Link to="/shop" className="hover:text-primary transition-colors">Catalog</Link>
              <Link to="/shop" className="hover:text-primary transition-colors">Innovations</Link>
              <Link to="/shop" className="hover:text-primary transition-colors">Support</Link>
            </nav>
            
            <div className="h-6 w-px bg-white/10 hidden lg:block" />

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors relative"
              >
                <ShoppingCart size={20} className="text-white/80" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black">
                    {totalItems}
                  </span>
                )}
              </button>
              <button onClick={() => navigate('/login')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <User size={20} className="text-white/80" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      <ShopCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Main Content Area */}
      <main className="pt-20">
        {children}
      </main>

      {/* Futuristic Footer */}
      <footer className="bg-black border-t border-white/5 pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <BrandLogo size={48} />
                <h2 className="text-3xl font-black tracking-tighter">BETUS ELECTRONICS</h2>
              </div>
              <p className="max-w-md text-white/40 leading-relaxed text-sm mb-8">
                 Revolutionizing the digital landscape with precision-engineered POS solutions and elite consumer electronics. 
                 Born in the laboratory, perfected in the market.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                   <Cpu size={16} className="text-primary" />
                   <span className="text-[10px] font-bold tracking-widest uppercase">Verified Tech</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                   <Rocket size={16} className="text-primary" />
                   <span className="text-[10px] font-bold tracking-widest uppercase">Global Ship</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-primary">Architecture</h3>
              <nav className="flex flex-col gap-4 text-sm text-white/50">
                <a href="#" className="hover:text-white transition-colors">Supply Chain</a>
                <a href="#" className="hover:text-white transition-colors">Components</a>
                <a href="#" className="hover:text-white transition-colors">Processors</a>
                <a href="#" className="hover:text-white transition-colors">Terminals</a>
              </nav>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-primary">Enterprise</h3>
              <nav className="flex flex-col gap-4 text-sm text-white/50">
                <a href="#" className="hover:text-white transition-colors">Compliance</a>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Cloud Sync</a>
                <a href="#" className="hover:text-white transition-colors">Login</a>
              </nav>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase">
             <span>© 2026 BETUS ELECTRONICS CORP.</span>
             <div className="flex gap-8">
               <a href="#" className="hover:text-white transition-colors">Terms</a>
               <a href="#" className="hover:text-white transition-colors">Security</a>
               <a href="#" className="hover:text-white transition-colors">Identity</a>
             </div>
             <span>System Status: Optimal</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShopLayout;
