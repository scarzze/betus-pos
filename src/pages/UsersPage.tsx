import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, MoreVertical, Shield, UserCheck, UserX } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SALES';
  status: 'active' | 'inactive';
  lastActive: string;
}

const mockUsers: UserRecord[] = [
  { id: '1', name: 'Dan Cheru', email: 'hydancheru@gmail.com', role: 'SUPER_ADMIN', status: 'active', lastActive: 'Now' },
  { id: '2', name: 'Jane Wanjiku', email: 'admin@vinlex.co.ke', role: 'ADMIN', status: 'active', lastActive: '5 min ago' },
  { id: '3', name: 'Kevin Ochieng', email: 'sales@vinlex.co.ke', role: 'SALES', status: 'active', lastActive: '1 hr ago' },
  { id: '4', name: 'Grace Akinyi', email: 'grace@vinlex.co.ke', role: 'SALES', status: 'inactive', lastActive: '3 days ago' },
];

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-primary/15 text-primary',
  ADMIN: 'bg-info/15 text-info',
  SALES: 'bg-success/15 text-success',
};

const UsersPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const filtered = mockUsers.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">{mockUsers.length} users in system</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg gradient-orange px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
          <Plus className="h-4 w-4" />
          Add User
        </button>
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Active</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border/50 transition-colors hover:bg-secondary/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary text-sm">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${roleColors[u.role]}`}>
                      <Shield className="h-3 w-3" />
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.status === 'active' ? 'text-success' : 'text-muted-foreground'}`}>
                      {u.status === 'active' ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.lastActive}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
