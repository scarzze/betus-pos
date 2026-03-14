import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  TrendingDown, 
  Calendar,
  Loader2,
  Receipt
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ActionModal from '@/components/ActionModal';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  expense_date: string;
  created_at: string;
}

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Utilities',
    description: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Rent', 'Salaries', 'Utilities', 'Maintenance', 'Marketing', 'Taxes', 'Other'];

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get('/expenses');
      setExpenses(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch expenses', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast({ title: 'Success', description: 'Expense recorded successfully' });
      setShowModal(false);
      setFormData({ title: '', amount: '', category: 'Utilities', description: '', expense_date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to record expense', variant: 'destructive' });
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/expenses/${deleteId}`);
      toast({ title: 'Deleted', description: 'Expense removed from ledger' });
      setDeleteId(null);
      fetchExpenses();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete expense', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMonthly = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) return <div className="loader-container" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="spinner large text-primary animate-spin" /></div>;

  return (
    <div className="report-container animate-fade-in" style={{ padding: '32px' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '32px' }}>Expense Ledger</h1>
          <p className="page-subtitle">Track operating costs and manage business burn rate.</p>
        </div>
        <button className="bt-submit-btn" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>Record Expense</span>
        </button>
      </header>

      {/* Burn Rate Overview */}
      <div className="stats-grid" style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <div className="bt-glass-card animate-slide-up" style={{ padding: '24px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div className="stat-icon-wrapper theme-danger" style={{ width: '48px', height: '48px' }}>
              <TrendingDown size={22} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="bt-label" style={{ margin: 0 }}>Total Expenditure</p>
            </div>
          </div>
          <p className="stat-value text-danger" style={{ fontSize: '28px', margin: 0 }}>
            KES {totalMonthly.toLocaleString()}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>Aggregated operating costs for the current period</p>
        </div>

        <div className="bt-glass-card animate-slide-up" style={{ padding: '24px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div className="stat-icon-wrapper theme-primary" style={{ width: '48px', height: '48px' }}>
              <Receipt size={22} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="bt-label" style={{ margin: 0 }}>Record Count</p>
            </div>
          </div>
          <p className="stat-value" style={{ fontSize: '28px', margin: 0 }}>
            {expenses.length} Entries
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>Total number of unique expense records</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bt-glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
         <div className="search-bar-wrapper" style={{ flex: 1, marginBottom: 0, position: 'relative' }}>
            <Search className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={18} />
            <input 
              type="text" 
              className="bt-input" 
              style={{ width: '100%', paddingLeft: '40px' }}
              placeholder="Search expenses by title or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      {/* Expense Table */}
      <div className="bt-table-wrapper">
        <table className="bt-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Expense Details</th>
              <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Amount</th>
              <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  No expense records found.
                </td>
              </tr>
            ) : filteredExpenses.map(expense => (
              <tr key={expense.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                <td style={{ padding: '16px', width: '160px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} style={{ color: 'var(--text-dim)' }} />
                    <span style={{ fontSize: '14px' }}>
                      {new Date(expense.expense_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <p style={{ fontWeight: 600, margin: 0, fontSize: '14px', color: 'white' }}>{expense.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>{expense.description || 'No description provided'}</p>
                </td>
                <td style={{ padding: '16px' }}>
                  <span className="status-badge theme-info" style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>{expense.category}</span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ fontWeight: 800, color: '#f87171', fontSize: '14px' }}>KES {expense.amount.toLocaleString()}</span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button 
                    className="bt-icon-btn" 
                    style={{ color: '#f87171', border: 'none', background: 'transparent' }} 
                    onClick={() => handleDelete(expense.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Modal */}
      {showModal && (
        <div className="bt-modal-overlay animate-fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
          <div className="bt-glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div className="stat-icon-wrapper theme-primary" style={{ width: '36px', height: '36px' }}>
                <Plus size={18} />
              </div>
              <h2 className="chart-title" style={{ margin: 0, fontSize: '18px' }}>Record New Expense</h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="bt-form-group">
                <label className="bt-label" style={{ display: 'block', marginBottom: '8px' }}>Expense Title</label>
                <input 
                  type="text" 
                  className="bt-input" 
                  style={{ width: '100%' }}
                  placeholder="e.g. Monthly Rent March"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="bt-form-group">
                  <label className="bt-label" style={{ display: 'block', marginBottom: '8px' }}>Amount (KES)</label>
                  <input 
                    type="number" 
                    className="bt-input" 
                    style={{ width: '100%' }}
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="bt-form-group">
                  <label className="bt-label" style={{ display: 'block', marginBottom: '8px' }}>Category</label>
                  <select 
                    className="bt-input"
                    style={{ width: '100%' }}
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="bt-form-group">
                <label className="bt-label" style={{ display: 'block', marginBottom: '8px' }}>Expense Date</label>
                <input 
                  type="date" 
                  className="bt-input"
                  style={{ width: '100%' }}
                  value={formData.expense_date}
                  onChange={e => setFormData({...formData, expense_date: e.target.value})}
                  required
                />
              </div>

              <div className="bt-form-group">
                <label className="bt-label" style={{ display: 'block', marginBottom: '8px' }}>Description (Optional)</label>
                <textarea 
                  className="bt-input" 
                  style={{ width: '100%', minHeight: '80px', padding: '12px' }}
                  placeholder="Add context to this expenditure..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="bt-icon-btn" style={{ flex: 1, height: '44px', borderRadius: '12px', border: '1px solid var(--border-light)' }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="bt-submit-btn" style={{ flex: 2, height: '44px' }}>
                  Verify & Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ActionModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Internal Audit Warning"
        description="Are you sure you want to purge this expense from the digital ledger? This action is irreversible."
        confirmText="Purge Record"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
};

export default Expenses;
