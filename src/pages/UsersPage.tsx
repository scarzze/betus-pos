import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, MoreVertical, Shield, UserCheck, UserX, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

  const handleDeactivate = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      toast({ title: '✅ User Deactivated' });
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to deactivate user';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const filtered = users.filter(
    u => u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">{users.length} users in system</p>
        </div>
        {(isSuperAdmin || user?.role === 'ADMIN') && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg gradient-orange px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" />
            Add User
          </button>
        )}
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users…"
          className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">No users found.</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="border-b border-border/50 transition-colors hover:bg-secondary/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary text-sm">
                        {u.email[0].toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-foreground">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${roleColors[u.role] || 'bg-secondary text-foreground'}`}>
                      <Shield className="h-3 w-3" />
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.is_active ? 'text-success' : 'text-muted-foreground'}`}>
                      {u.is_active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isSuperAdmin && u.is_active && (
                      <button
                        onClick={() => handleDeactivate(u.id)}
                        className="rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        Deactivate
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md mx-4 p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground">Add User</h2>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="John Doe" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="user@vinlex.co.ke" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Password *</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="••••••••" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="SALES">Sales</option>
                  <option value="ADMIN">Admin</option>
                  {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowModal(false); setForm(emptyForm); }} className="flex-1 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground">Cancel</button>
                <button onClick={handleAddUser} disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg gradient-orange px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
