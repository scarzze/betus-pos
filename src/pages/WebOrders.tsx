import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Package, 
  Truck, 
  AlertCircle, 
  Search, 
  Filter,
  ExternalLink,
  User,
  MapPin,
  Phone,
  Mail,
  MoreVertical,
  Activity
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_reference: string;
  created_at: string;
  items: any[];
  pos_sale_id?: string;
}

const WebOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/web-orders');
      setOrders(res.data);
    } catch (err) {
      toast.error('Forensic sync failed. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleFulfill = async (orderId: string) => {
    try {
      toast.loading('Initializing Order Fulfillment Protocol...');
      await api.post(`/web-orders/${orderId}/fulfill`);
      toast.dismiss();
      toast.success('Omni-Ledger Synced: Order fulfilled successfully.');
      fetchOrders();
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.response?.data?.detail || 'Fulfillment sequence failed.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} className="text-amber-400" />;
      case 'PAID': return <CheckCircle2 size={16} className="text-primary" />;
      case 'SHIPPED': return <Truck size={16} className="text-indigo-400" />;
      case 'DELIVERED': return <Package size={16} className="text-emerald-400" />;
      default: return <AlertCircle size={16} className="text-white/40" />;
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.id.includes(search)
  );

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <ShoppingBag className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">Order Intelligence</h1>
            <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold tracking-widest uppercase mt-1">
              <Activity size={12} className="text-emerald-500 animate-pulse" />
              <span>Real-time Storefront Synchronization Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by Order ID or Customer Identity..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary/50 transition-all text-sm outline-none"
            />
          </div>
          <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <Filter size={20} className="text-white/60" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders Ledger */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {loading ? (
             <div className="p-20 text-center animate-pulse">
                <p className="text-white/20 font-mono text-xs uppercase tracking-[0.4em]">Decrypting Ledger...</p>
             </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-20 text-center border border-dashed border-white/10 rounded-3xl">
              <ShoppingBag size={48} className="mx-auto text-white/5 mb-6" />
              <p className="text-white/30 font-medium">No digital transactions detected in this sector.</p>
            </div>
          ) : filteredOrders.map((order) => (
            <div 
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer group ${selectedOrder?.id === order.id ? 'bg-primary/5 border-primary/30 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${order.status === 'DELIVERED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10'}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{order.customer_name}</h3>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full border tracking-widest uppercase ${order.status === 'DELIVERED' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                      <span>ID: {order.id.slice(0, 8)}</span>
                      <span className="opacity-20">•</span>
                      <span>{format(new Date(order.created_at), 'MMM dd, HH:mm')}</span>
                      <span className="opacity-20">•</span>
                      <span className="text-white/60">{order.items.length} Units</span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-end gap-2 text-right">
                  <span className="text-xl font-black text-white/90">${order.total_amount.toLocaleString()}</span>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-primary/60 uppercase tracking-widest">
                    <CheckCircle2 size={12} />
                    <span>{order.payment_method} Verified</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Intelligence Detail Panel */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="sticky top-8 bg-white/5 border border-white/10 rounded-[40px] p-8 overflow-hidden animate-slide-left">
              <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 bg-primary/10 blur-3xl rounded-full" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Order<br />Fulfillment</h2>
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black tracking-widest uppercase">
                    Ref: {selectedOrder.id.slice(0, 8)}
                  </div>
                </div>

                {/* Identity Profile */}
                <div className="space-y-8 mb-12">
                   <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                        <User size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Customer Identifier</p>
                        <p className="font-bold">{selectedOrder.customer_name}</p>
                        <div className="flex items-center gap-4 mt-2">
                           <a href={`tel:${selectedOrder.customer_phone}`} className="text-xs text-white/40 hover:text-primary transition-colors flex items-center gap-1">
                             <Phone size={12} /> {selectedOrder.customer_phone}
                           </a>
                           <a href={`mailto:${selectedOrder.customer_email}`} className="text-xs text-white/40 hover:text-primary transition-colors flex items-center gap-1">
                             <Mail size={12} /> Email
                           </a>
                        </div>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <MapPin size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Fulfillment Sector</p>
                        <p className="text-sm font-medium leading-relaxed">{selectedOrder.shipping_address}</p>
                      </div>
                   </div>
                </div>

                {/* Manifest */}
                <div className="bg-black/40 border border-white/5 rounded-3xl p-6 mb-10">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-6">Inventory Manifest</h4>
                   <div className="space-y-4">
                      {selectedOrder.items.map((item: any, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                           <div className="flex items-center gap-3">
                              <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded text-[9px] font-black">{item.quantity}x</span>
                              <span className="text-sm font-bold truncate max-w-[150px]">{item.name}</span>
                           </div>
                           <span className="text-xs font-mono text-white/60">${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                   </div>
                   <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Omni-Total</span>
                      <span className="text-2xl font-black tracking-tighter text-primary">${selectedOrder.total_amount.toLocaleString()}</span>
                   </div>
                </div>

                {/* Action Protocols */}
                <div className="space-y-3">
                  {selectedOrder.status !== 'DELIVERED' ? (
                    <button 
                      onClick={() => handleFulfill(selectedOrder.id)}
                      className="w-full py-5 bg-primary text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(var(--primary-rgb),0.2)]"
                    >
                      Authorize Fulfillment
                    </button>
                  ) : (
                    <div className="w-full py-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3">
                      <CheckCircle2 size={16} />
                      Ledger Finalized
                    </div>
                  )}
                  <button className="w-full py-4 bg-white/5 border border-white/10 text-white/40 font-bold uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-colors">
                    Issue Transmission
                  </button>
                </div>

                {selectedOrder.pos_sale_id && (
                   <div className="mt-8 pt-8 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                         <ExternalLink size={12} />
                         <span>Linked POS Sale: {selectedOrder.pos_sale_id.slice(0, 8)}</span>
                      </div>
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 border border-dashed border-white/10 rounded-[60px] text-center">
               <Activity size={48} className="text-white/5 mb-8" />
               <p className="text-white/20 font-medium text-sm">Select a transaction from the ledger to initialize fulfillment diagnostics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebOrders;
