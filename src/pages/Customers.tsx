import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  History,
  Loader2,
  Trash2,
  Save,
  CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  total_debt: number;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  reference: string;
  note: string;
  created_at: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'cash',
    reference: '',
    note: ''
  });

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch customers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', formData);
      toast({ title: 'Success', description: 'Customer profile created' });
      setShowAddModal(false);
      setFormData({ name: '', phone: '', email: '', address: '' });
      fetchCustomers();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to create customer', variant: 'destructive' });
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      await api.post(`/customers/${selectedCustomer.id}/payments`, {
        ...paymentData,
        amount: parseFloat(paymentData.amount)
      });
      toast({ title: 'Payment Recorded', description: 'Customer debt has been updated' });
      setShowPaymentModal(false);
      setPaymentData({ amount: '', payment_method: 'cash', reference: '', note: '' });
      fetchCustomers();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to record payment', variant: 'destructive' });
    }
  };

  const fetchPayments = async (customerId: string) => {
    try {
      const { data } = await api.get(`/customers/${customerId}/payments`);
      setPayments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  if (loading) return <div className="loader-container" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="spinner large text-primary animate-spin" /></div>;

  return (
    <div className="report-container animate-fade-in" style={{ padding: '32px' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '32px' }}>Customer Relations</h1>
          <p className="page-subtitle">Manage client profiles and monitor outstanding debt ledger.</p>
        </div>
        <button className="bt-submit-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>New Customer</span>
        </button>
      </header>

      {/* Debt Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="bt-glass-card animate-slide-up" style={{ padding: '24px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div className="stat-icon-wrapper theme-danger" style={{ width: '48px', height: '48px' }}>
              <CreditCard size={22} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="bt-label" style={{ margin: 0 }}>Total Receivables</p>
            </div>
          </div>
          <p className="stat-value text-danger" style={{ fontSize: '28px', margin: 0 }}>
            KES {customers.reduce((sum, c) => sum + c.total_debt, 0).toLocaleString()}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>Aggregated outstanding credit across all clients</p>
        </div>

        <div className="bt-glass-card animate-slide-up" style={{ padding: '24px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div className="stat-icon-wrapper theme-primary" style={{ width: '48px', height: '48px' }}>
              <User size={22} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="bt-label" style={{ margin: 0 }}>Client Base</p>
            </div>
          </div>
          <p className="stat-value" style={{ fontSize: '28px', margin: 0 }}>
            {customers.length} Registered
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>Total number of unique customer profiles</p>
        </div>
      </div>

      {/* Search & List */}
      <div className="bt-glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
         <div className="search-bar-wrapper" style={{ marginBottom: 0 }}>
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="bt-input" 
              style={{ width: '100%', paddingLeft: '44px' }}
              placeholder="Search clients by name or phone number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="bt-glass-panel animate-slide-up" style={{ padding: '24px', position: 'relative' }}>
            {customer.total_debt > 0 && (
              <div className="status-badge theme-danger" style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '10px' }}>
                DEBTOR
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div className="stat-icon-wrapper theme-info" style={{ width: '48px', height: '48px', borderRadius: '50%' }}>
                <User size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{customer.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>ID: {customer.id.slice(0, 8)}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                <Phone size={14} />
                <span style={{ fontSize: '13px' }}>{customer.phone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                <Mail size={14} />
                <span style={{ fontSize: '13px' }}>{customer.email || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                <MapPin size={14} />
                <span style={{ fontSize: '13px' }}>{customer.address || 'N/A'}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Current Debt</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: customer.total_debt > 0 ? '#f87171' : '#4ade80' }}>
                  KES {customer.total_debt.toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                className="bt-submit-btn" 
                style={{ flex: 1, background: 'linear-gradient(135deg, var(--primary), #4f46e5)' }}
                onClick={() => {
                  setSelectedCustomer(customer);
                  setShowPaymentModal(true);
                }}
              >
                <Plus size={16} />
                <span>Pay Debt</span>
              </button>
              <button 
                className="bt-icon-btn" 
                title="View History"
                onClick={() => {
                   setSelectedCustomer(customer);
                   fetchPayments(customer.id);
                }}
              >
                <History size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="bt-modal-overlay animate-fade-in" onClick={() => setShowAddModal(false)}>
          <div className="bt-glass-panel animate-slide-up" style={{ width: '450px', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div className="stat-icon-wrapper theme-primary" style={{ width: '36px', height: '36px' }}>
                <Plus size={18} />
              </div>
              <h2 className="chart-title" style={{ margin: 0, fontSize: '18px' }}>Add New Client</h2>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="bt-form-group">
                <label className="bt-label">Full Name</label>
                <input 
                  type="text" 
                  className="bt-input" 
                  style={{ width: '100%' }}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="bt-form-group">
                <label className="bt-label">Phone Number</label>
                <input 
                  type="text" 
                  className="bt-input" 
                  style={{ width: '100%' }}
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="bt-form-group">
                <label className="bt-label">Email Address</label>
                <input 
                  type="email" 
                  className="bt-input" 
                  style={{ width: '100%' }}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="bt-form-group">
                <label className="bt-label">Physical Address</label>
                <textarea 
                  className="bt-input" 
                  style={{ width: '100%', minHeight: '60px' }}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <button type="submit" className="bt-submit-btn" style={{ height: '44px', marginTop: '12px' }}>
                <CheckCircle2 size={18} />
                Create Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="bt-modal-overlay animate-fade-in" onClick={() => setShowPaymentModal(false)}>
          <div className="bt-glass-panel animate-slide-up" style={{ width: '450px', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div className="stat-icon-wrapper theme-success" style={{ width: '36px', height: '36px' }}>
                <CheckCircle2 size={18} />
              </div>
              <h2 className="chart-title" style={{ margin: 0, fontSize: '18px' }}>Record Payment</h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Recording settlement for <span style={{ color: 'white', fontWeight: 800 }}>{selectedCustomer.name}</span>. Current balance: KES {selectedCustomer.total_debt.toLocaleString()}
            </p>
            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="bt-form-group">
                <label className="bt-label">Amount Paid</label>
                <input 
                  type="number" 
                  className="bt-input" 
                  style={{ width: '100%' }}
                  value={paymentData.amount}
                  onChange={e => setPaymentData({...paymentData, amount: e.target.value})}
                  required
                />
              </div>
              <div className="bt-form-group">
                <label className="bt-label">Payment Method</label>
                <select 
                  className="bt-input" 
                  style={{ width: '100%' }}
                  value={paymentData.payment_method}
                  onChange={e => setPaymentData({...paymentData, payment_method: e.target.value})}
                >
                  <option value="cash">Cash Settlement</option>
                  <option value="mpesa">M-Pesa Transaction</option>
                </select>
              </div>
              <div className="bt-form-group">
                <label className="bt-label">Reference (Optional)</label>
                <input 
                  type="text" 
                  className="bt-input" 
                  style={{ width: '100%' }}
                  placeholder="e.g. M-Pesa Code"
                  value={paymentData.reference}
                  onChange={e => setPaymentData({...paymentData, reference: e.target.value})}
                />
              </div>
              <button type="submit" className="bt-submit-btn" style={{ height: '44px', marginTop: '12px' }}>
                <Save size={18} />
                Finalize Settlement
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
