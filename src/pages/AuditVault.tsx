import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert, Fingerprint, Activity, Clock, User, Info, Loader2, Database } from 'lucide-react';
import api from '@/lib/api';
import { format } from 'date-fns';

interface AuditEntry {
  id: number;
  user_email: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  metadata_json: any;
}

const AuditVault = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get<AuditEntry[]>('/audit');
      setLogs(res.data);
    } catch (err) {
      toast({ title: 'Security Alert', description: 'Failed to access audit vault. Insufficient privileges.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  if (loading) return <div className="loader-container"><Loader2 className="spinner large text-primary" /></div>;

  return (
    <div className="report-container animate-fade-in" style={{ padding: '32px' }}>
      <div className="page-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="text-primary" size={24} />
            <h1 className="page-title" style={{ margin: 0 }}>Security Audit Vault</h1>
          </div>
          <p className="page-subtitle">Real-time forensic monitoring of all administrative and transactional operations.</p>
        </div>
        <button onClick={fetchLogs} className="bt-icon-btn" style={{ width: 'auto', padding: '10px 20px' }}>
          <Activity size={18} />
          Refresh Feed
        </button>
      </div>

      <div className="bt-glass-panel no-padding animate-slide-up" style={{ minHeight: '600px' }}>
        <table className="bt-table">
          <thead>
            <tr>
              <th><div className="flex items-center gap-2"><Clock size={14} /> Timestamp</div></th>
              <th><div className="flex items-center gap-2"><User size={14} /> Identity</div></th>
              <th><div className="flex items-center gap-2"><Fingerprint size={14} /> Action</div></th>
              <th>Module</th>
              <th><div className="flex items-center gap-2"><Info size={14} /> Forensic Details</div></th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-dim)' }}>
                  <div className="flex flex-col items-center gap-4">
                    <Database size={48} opacity={0.2} />
                    <p>No forensic entries recorded in the current session cycle.</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{log.user_email || 'System'}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>ID: {log.id}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      log.action.includes('SUCCESS') ? 'bg-green-500/10 text-green-400' : 
                      log.action.includes('DELETE') ? 'bg-red-500/10 text-red-400' :
                      'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{log.module}</td>
                  <td>
                    <p style={{ fontSize: '13px', maxWidth: '400px', lineHeight: '1.4' }}>{log.details}</p>
                    {log.metadata_json && (
                      <div className="mt-2 p-2 rounded bg-black/30 border border-white/5 font-mono text-[10px] text-primary/80">
                        {JSON.stringify(log.metadata_json)}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditVault;
