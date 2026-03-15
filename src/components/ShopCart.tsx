import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart, Trash2, ArrowRight, Phone, Mail, MapPin, User, Loader2, CheckCircle2, ShieldCheck, Timer, AlertCircle, QrCode } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

type CheckoutStage = 'cart' | 'details' | 'handshake';
type MpesaStage = 'sending' | 'processing' | 'verifying' | 'success' | 'error';

export const ShopCart = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
   const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
   const [stage, setStage] = useState<CheckoutStage>('cart');
   const [mpesaStage, setMpesaStage] = useState<MpesaStage>('sending');
   const [mpesaStatusMsg, setMpesaStatusMsg] = useState('');

   // User Details
   const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      address: ''
   });

   const socketRef = useRef<WebSocket | null>(null);

   useEffect(() => {
      if (!isOpen) {
         setStage('cart');
         return;
      }

      // Connect to WebSocket for payment confirmation
      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'}/GLOBAL`;
      const socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
         const data = JSON.parse(event.data);
         if (data.type === 'web_order_paid') {
            setMpesaStage('success');
            setMpesaStatusMsg('Transaction Authorized. Order Dispatched for Fulfillment.');
            toast.success('Payment Received Successfully');
            setTimeout(() => {
               clearCart();
               onClose();
            }, 1500);
         }
      };

      socketRef.current = socket;
      return () => socket.close();
   }, [isOpen]);

   const handleCheckout = async () => {
      setStage('handshake');
      setMpesaStage('sending');
      setMpesaStatusMsg('Initializing Digital Transaction Protocol...');

      try {
         await api.post('/shop/checkout', {
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            shipping_address: formData.address,
            payment_method: 'MPESA',
            items: cart.map(i => ({ product_id: i.id, quantity: i.quantity }))
         });

         setMpesaStage('verifying');
         setMpesaStatusMsg('Synchronization Pulse Sent. Awaiting Final M-Pesa Verification...');

      } catch (err: any) {
         setMpesaStage('error');
         setMpesaStatusMsg(err.response?.data?.detail || 'Handshake Interrupted.');
      }
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-[200] flex justify-end animate-fade-in">
         {/* Backdrop */}
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

         {/* Drawer */}
         <div className="relative w-full max-w-xl bg-[#080808] border-l border-white/5 h-screen shadow-[-50px_0_100px_rgba(0,0,0,0.5)] flex flex-col animate-slide-left">

            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/50 backdrop-blur-md">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                     <ShoppingCart className="text-primary" size={24} />
                  </div>
                  <div>
                     <h2 className="text-xl font-black tracking-tight uppercase">
                        {stage === 'cart' ? 'Your Inventory' : stage === 'details' ? 'Delivery Logic' : 'Handshake'}
                     </h2>
                     <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        Secure Commerce Channel
                     </p>
                  </div>
               </div>
               <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/40">
                  <X size={20} />
               </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
               {stage === 'cart' ? (
                  <div className="space-y-4 md:space-y-6">
                     {cart.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center opacity-20">
                           <ShoppingCart size={48} className="mb-4" />
                           <p className="font-bold uppercase tracking-widest text-[10px]">No Gear Detected</p>
                        </div>
                     ) : (
                        cart.map(item => (
                           <div key={item.id} className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-white/5 rounded-3xl border border-white/5 group transition-all hover:border-white/10">
                              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-black border border-white/5 overflow-hidden flex-shrink-0">
                                 {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/10 italic text-[10px]">NO_IMG</div>
                                 )}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h3 className="font-bold text-base md:text-lg mb-1 truncate">{item.name}</h3>
                                 <p className="text-primary font-black text-sm">${item.price.toLocaleString()}</p>
                              </div>
                              <div className="flex items-center gap-2 md:gap-3">
                                 <div className="flex items-center bg-black border border-white/10 rounded-xl px-1 md:px-2">
                                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }} className="p-2 text-white/40 hover:text-white transition-colors">-</button>
                                    <span className="w-6 md:w-8 text-center text-xs font-black">{item.quantity}</span>
                                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }} className="p-2 text-white/40 hover:text-white transition-colors">+</button>
                                 </div>
                                 <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }} className="p-2 md:p-3 text-red-500/40 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               ) : stage === 'details' ? (
                  <div className="space-y-6 md:space-y-8 animate-fade-in">
                     <form
                        onSubmit={(e) => { e.preventDefault(); if (formData.name && formData.phone && formData.address) handleCheckout(); }}
                        className="space-y-4"
                     >
                        <div className="relative group">
                           <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors" />
                           <input
                              placeholder="Full Identifier (Name)"
                              value={formData.name}
                              autoFocus
                              onChange={e => setFormData({ ...formData, name: e.target.value })}
                              className="w-full pl-14 pr-6 py-4 md:py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 outline-none transition-all font-bold text-sm text-white placeholder:text-white/20"
                           />
                        </div>
                        <div className="relative group">
                           <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors" />
                           <input
                              placeholder="Electronic Mail (Email)"
                              type="email"
                              value={formData.email}
                              onChange={e => setFormData({ ...formData, email: e.target.value })}
                              className="w-full pl-14 pr-6 py-4 md:py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 outline-none transition-all font-bold text-sm text-white placeholder:text-white/20"
                           />
                        </div>
                        <div className="relative group">
                           <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors" />
                           <input
                              placeholder="M-Pesa Synchronized Phone"
                              type="tel"
                              value={formData.phone}
                              onChange={e => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full pl-14 pr-6 py-4 md:py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 outline-none transition-all font-bold text-sm text-white placeholder:text-white/20"
                           />
                        </div>
                        <div className="relative group">
                           <MapPin size={16} className="absolute left-6 top-6 text-primary/60 group-focus-within:text-primary transition-colors" />
                           <textarea
                              placeholder="Geographic Deployment Sector (Address)"
                              rows={3}
                              value={formData.address}
                              onChange={e => setFormData({ ...formData, address: e.target.value })}
                              className="w-full pl-14 pr-6 py-4 md:py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 outline-none transition-all font-bold text-sm text-white placeholder:text-white/20 resize-none"
                           />
                        </div>
                     </form>
                  </div>
               ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in p-4">
                     {mpesaStage === 'success' ? (
                        <div className="animate-scale-in">
                           <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 md:mb-10 border border-emerald-500/20">
                              <CheckCircle2 size={48} className="text-emerald-500" />
                           </div>
                           <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter text-emerald-500">Authorized</h2>
                           <p className="text-emerald-500 font-medium text-sm md:text-base mb-8 md:mb-12">{mpesaStatusMsg}</p>
                        </div>
                     ) : (
                        <>
                           <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8 md:mb-10">
                              {mpesaStage === 'error' ? (
                           <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                              <AlertCircle size={36} className="text-red-500" />
                           </div>
                        ) : mpesaStage === 'sending' ? (
                           <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl flex items-center justify-center mx-auto overflow-hidden">
                              <QRCodeSVG 
                                value={`Till: ${import.meta.env.VITE_MPESA_TILL || '4519967'}\nAmount: ${totalPrice}`} 
                                size={110} 
                                level="M" 
                                fgColor="#05050a"
                                bgColor="#ffffff"
                              />
                           </div>
                        ) : (
                           <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           {mpesaStage === 'sending' ? null : (
                              <ShieldCheck size={32} className={mpesaStage === 'error' ? 'text-red-500/20' : 'text-primary/20'} />
                           )}
                        </div>
                     </div>
                     <h2 className="text-2xl md:text-3xl font-black mb-4 uppercase tracking-tighter leading-none mt-4">
                        {mpesaStage === 'sending' ? 'Sending Logic' : mpesaStage === 'processing' ? 'Awaiting PIN' : 'Handshake Failed'}
                           </h2>
                           <p className={`text-xs md:text-sm font-medium leading-relaxed max-w-xs mx-auto mb-8 md:mb-12 ${mpesaStage === 'error' ? 'text-red-400' : 'text-white/40'}`}>
                              {mpesaStatusMsg}
                           </p>

                           {mpesaStage === 'error' ? (
                              <button onClick={() => setStage('details')} className="px-8 md:px-10 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 transition-colors">
                                 Return to Ops
                              </button>
                           ) : (
                              <div className="flex flex-col items-center gap-6">
                                 <div className="flex items-center justify-center gap-3 py-2 px-6 bg-primary/5 rounded-full border border-primary/10 animate-pulse">
                                    <Timer size={14} className="text-primary" />
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Temporal Sync Active</span>
                                 </div>
                                 <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest">Do not disconnect or refresh</p>
                                 <button onClick={() => setStage('details')} className="px-6 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors mt-2">
                                    Cancel 
                                 </button>
                              </div>
                           )}
                        </>
                     )}
                  </div>
               )}
            </div>

            {/* Footer Actions */}
            {stage !== 'handshake' && (
               <div className="p-6 md:p-8 bg-black/80 backdrop-blur-3xl border-t border-white/5 mt-auto">
                  <div className="flex justify-between items-end mb-6 md:mb-8">
                     <div>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] mb-1">Omni-Total</p>
                        <p className="text-3xl md:text-4xl font-black text-white">${totalPrice.toLocaleString()}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] mb-1">Currency</p>
                        <p className="text-xs md:text-sm font-black text-primary">USD (KES Conversion Applied)</p>
                     </div>
                  </div>

                  {stage === 'cart' ? (
                     <button
                        disabled={cart.length === 0}
                        onClick={() => setStage('details')}
                        className="w-full py-5 md:py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] md:text-xs rounded-3xl hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)] group disabled:opacity-50"
                     >
                        Initiate Checkout
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                  ) : (
                     <div className="flex gap-4">
                        <button onClick={() => setStage('cart')} className="flex-1 py-5 md:py-6 bg-white/5 text-white/40 border border-white/10 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs rounded-3xl hover:bg-white/10 transition-colors">
                           Back
                        </button>
                        <button
                           onClick={handleCheckout}
                           disabled={!formData.name || !formData.phone || !formData.address}
                           className="flex-[2] py-5 md:py-6 bg-primary text-black font-black uppercase tracking-[0.3em] text-[10px] md:text-xs rounded-3xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] disabled:opacity-50"
                        >
                           Pay with M-Pesa
                        </button>
                     </div>
                  )}
               </div>
            )}

         </div>
      </div>
   );
};
