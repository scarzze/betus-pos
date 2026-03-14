import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, MoreVertical, Shield, UserCheck, UserX, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ActionModal from '@/components/ActionModal';
import api from '@/lib/api';

interface UserRecord {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SALES';
  is_active: boolean;
}

interface NewUserForm {
  name: string;
  email: string;
  password: string;
  role: string;
}

const emptyForm: NewUserForm = { name: '', email: '', password: '', role: 'SALES' };

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-primary/15 text-primary',
  ADMIN: 'bg-info/15 text-info',
  SALES: 'bg-success/15 text-success',
};

const UsersPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewUserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get<UserRecord[]>('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async () => {
    if (!form.email || !form.password) {
      toast({ title: 'Validation Error', description: 'Email and password are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await api.post('/users', form);
      toast({ title: '✅ User Created' });
      setShowModal(false);
      setForm(emptyForm);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to create user';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (id: string) => {
    setDeactivateId(id);
  };

  const confirmDeactivate = async () => {
    if (!deactivateId) return;
    setIsProcessing(true);
    try {
      await api.delete(`/users/${deactivateId}`);
      toast({ title: '✅ User Deactivated' });
      setDeactivateId(null);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to deactivate user';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = users.filter(
    u => u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="report-container animate-fade-in" style={{ padding: '32px' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Identity & Access</h1>
            <p className="page-subtitle">Manage system users, administrative privileges, and security roles</p>
          </div>
          {(isSuperAdmin || user?.role === 'ADMIN') && (
            <button onClick={() => setShowModal(true)} className="bt-submit-btn shadow-glow" style={{ padding: '12px 24px' }}>
              <Plus size={18} />
              <span>Provision New User</span>
            </button>
          )}
        </div>

        <div className="search-bar-wrapper" style={{ width: '100%', maxWidth: '500px', margin: '24px 0 0 0' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search directory by email or name…"
            className="bt-input search-input"
          />
        </div>
      </div>

      <div className="bt-table-wrapper animate-slide-up">
        <div className="no-scrollbar" style={{ overflowX: 'auto' }}>
          <table className="bt-table">
            <thead>
              <tr>
                <th>Profile Information</th>
                <th>Security Role</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'center' }}>Permission Tier</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '100px 0' }}><Loader2 size={32} className="animate-spin text-primary opacity-50" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '100px 0', opacity: 0.3 }}><p>Zero matching records found in local directory.</p></td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="stat-icon-wrapper theme-primary" style={{ width: '36px', height: '36px', borderRadius: '10px', fontSize: '14px', fontWeight: 800 }}>
                        {u.email[0].toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{u.email}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>UID: {u.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={`status-badge ${u.role === 'SUPER_ADMIN' ? 'theme-primary' : u.role === 'ADMIN' ? 'theme-info' : 'bg-primary-10 text-primary'}`} style={{ fontSize: '10px', fontWeight: 700 }}>
                      <Shield size={10} style={{ marginRight: '6px' }} />
                      {u.role.replace('_', ' ')}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {u.is_active ? (
                        <div className="status-badge theme-success" style={{ fontSize: '10px' }}>
                          <UserCheck size={12} style={{ marginRight: '4px' }} />
                          ACTIVE
                        </div>
                      ) : (
                        <div className="status-badge theme-danger" style={{ fontSize: '10px', opacity: 0.6 }}>
                          <UserX size={12} style={{ marginRight: '4px' }} />
                          INACTIVE
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>
                      {u.role === 'SUPER_ADMIN' ? 'Level 10' : u.role === 'ADMIN' ? 'Level 5' : 'Level 2'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {isSuperAdmin && u.is_active && u.id !== user?.id && (
                      <button
                        onClick={() => handleDeactivate(u.id)}
                        className="bt-icon-btn"
                        style={{ color: '#f87171', width: 'auto', padding: '6px 14px', fontSize: '12px', fontWeight: 600 }}
                      >
                        REVOKE ACCESS
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="bt-modal-overlay animate-fade-in">
          <div className="bt-glass-panel animate-scale-in" style={{ maxWidth: '450px', width: '100%', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="stat-icon-wrapper theme-primary" style={{ width: '40px', height: '40px' }}>
                  <Plus size={20} />
                </div>
                <h2 className="chart-title" style={{ margin: 0 }}>Create Identity</h2>
              </div>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }} className="bt-icon-btn"><X size={18} /></button>
            </div>

            <div style={{ padding: '32px' }}>
              <div className="bt-form-group">
                <label className="bt-label">Account Label / Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="bt-input" placeholder="Legal Name" />
              </div>
              <div className="bt-form-group">
                <label className="bt-label">Primary Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="bt-input" placeholder="e.g. staff@betus.co.ke" />
              </div>
              <div className="bt-form-group">
                <label className="bt-label">System Access Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="bt-input" placeholder="••••••••" />
              </div>
              <div className="bt-form-group">
                <label className="bt-label">Privilege Tier</label>
                <div style={{ position: 'relative' }}>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    className="bt-input" style={{ width: '100%', appearance: 'none', paddingRight: '40px' }}>
                    <option value="SALES">Standard Sales Tier</option>
                    <option value="ADMIN">Administrative Tier</option>
                    {isSuperAdmin && <option value="SUPER_ADMIN">Elevated Super Admin</option>}
                  </select>
                  <Shield size={16} style={{ position: 'absolute', right: '14px', top: '14px', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '15px', marginTop: '32px' }}>
                <button onClick={() => { setShowModal(false); setForm(emptyForm); }} className="bt-icon-btn" style={{ width: '100%', height: '48px', fontWeight: 600 }}>Cancel</button>
                <button onClick={handleAddUser} disabled={saving} className="bt-submit-btn shadow-glow" style={{ height: '48px' }}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <MoreVertical size={18} style={{ transform: 'rotate(90deg)' }} />}
                  <span>Initialize User Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ActionModal 
        isOpen={!!deactivateId}
        onClose={() => setDeactivateId(null)}
        onConfirm={confirmDeactivate}
        title="Security Protocol Alert"
        description="Are you sure you want to revoke system access for this identity? They will be immediately disconnected from the application."
        confirmText="Revoke Access"
        type="danger"
        loading={isProcessing}
      />
    </div>
  );
};

export default UsersPage;
