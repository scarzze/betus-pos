import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, ArrowRight, Zap, Shield, Globe, Loader2, PackageSearch } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import BrandLogo from '@/components/BrandLogo';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  selling_price: number;
  category: string;
  stock_quantity: number;
  specifications: any;
}

const Storefront = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/shop/products');
        setProducts(res.data);
      } catch (err) {
        toast.error('Failed to sync with catalog.');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-white/20 font-mono text-xs tracking-[0.5em] uppercase">Syncing digital inventory...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Cinematic Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full animate-pulse-glow" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full" />
        </div>
        
        <div className="relative z-10 max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-slide-down">
            <Zap size={14} className="text-primary" />
            <span className="text-[10px] font-black tracking-widest uppercase">Precision Electronics Platform</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-none bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            THE APEX OF<br />DIGITAL GEAR.
          </h1>
          <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto font-medium">
            Discover the next generation of enterprise-grade hardware and specialized components. Engineered for the enthusiasts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="#catalog" className="px-10 py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-primary transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
              Explore Catalog
            </a>
            <div className="flex items-center gap-4 text-white/40">
              <Shield size={18} />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Encrypted Payments</span>
              <span className="opacity-20">|</span>
              <Globe size={18} />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Verified Supply Chain</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section id="catalog" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-4">ENGINEERED SELECTION</h2>
            <p className="text-white/40 text-sm font-medium tracking-tight">Browse our real-time inventory of audited electronics.</p>
          </div>
          <div className="flex gap-4">
             {['All Gear', 'Terminals', 'Processors', 'I/O Devices'].map((filter) => (
               <button key={filter} className="text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-white/5 bg-white/5 hover:border-primary/50 transition-colors">
                 {filter}
               </button>
             ))}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center gap-6 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <PackageSearch size={64} className="text-white/10" />
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Our Digital Shelves are Being Calibrated</h3>
              <p className="text-white/40 text-sm">Please synchronize later for the next hardware drop.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group relative bg-[#0a0a0a] border border-white/5 rounded-[32px] overflow-hidden hover:border-primary/30 transition-all duration-500 hover:-translate-y-2">
                {/* Product Image Placeholder */}
                <div className="h-72 bg-gradient-to-br from-white/5 to-transparent relative flex items-center justify-center overflow-hidden">
                   {product.image_url ? (
                     <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                     <BrandLogo size={80} className="opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-700" />
                   )}
                   <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-[0.2em]">
                     {product.category || 'General'}
                   </div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{product.name}</h3>
                    <div className="text-xl font-black text-white/90">
                      ${product.selling_price.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed mb-8 line-clamp-2">
                    {product.description || 'Precision engineered hardware designed for the most demanding digital environments.'}
                  </p>
                  
                  <div className="flex items-center justify-between gap-4">
                    <button 
                      onClick={() => addToCart(product)}
                      className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={14} />
                      Initialize Purchase
                    </button>
                    <button className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust Markers */}
      <section className="bg-white/5 border-y border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
              <Zap size={24} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Instant Fulfillment</h4>
            <p className="text-xs text-white/40 leading-relaxed font-medium">Automatic dispatch synchronization with our global terminals.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
              <Shield size={24} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Audit Guard</h4>
            <p className="text-xs text-white/40 leading-relaxed font-medium">Every transaction recorded in our immutable security ledger.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
              <Star size={24} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Elite Support</h4>
            <p className="text-xs text-white/40 leading-relaxed font-medium">24/7 priority diagnostic assistance for your critical gear.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Storefront;
