import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Store, CreditCard, Package, Shield, Loader2, Save, Undo2 } from 'lucide-react';
import api from '@/lib/api';

interface SystemSettings {
  shop_name: string;
  phone_number: string;
  location: string;
  receipt_footer: string;
  currency: string;
  mpesa_till_number: string;
  daraja_consumer_key: string;
  daraja_consumer_secret: string;
  payment_timeout: number;
  low_stock_threshold: number;
  sku_prefix: string;
  imei_tracking: boolean;
  session_timeout: number;
  max_login_attempts: number;
  password_min_length: number;
}

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await api.get<SystemSettings>('/settings');
      setSettings(res.data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load system settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast({ title: '✅ Settings Committed', description: 'Global system variables have been synchronized.' });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to update settings';
      toast({ title: 'Commit Failed', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  if (loading) return <div className="loader-container"><Loader2 className="spinner large text-primary" /></div>;
  if (!settings) return null;

  return (
    <div className="report-container animate-fade-in" style={{ padding: '32px' }}>
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <h1 className="page-title">Global Configurations</h1>
        <p className="page-subtitle">Adjust core system variables, payment gateways, and security protocols</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          
          {/* General Section */}
          <div className="bt-glass-panel animate-slide-up" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="stat-icon-wrapper theme-primary" style={{ width: '36px', height: '36px' }}>
                <Store size={18} />
              </div>
              <h2 className="chart-title" style={{ margin: 0, fontSize: '15px' }}>General Business Identity</h2>
            </div>
            <div style={{ padding: '24px', display: 'grid', gap: '20px' }}>
              <div>
                <label className="bt-label">Merchant / Shop Name</label>
                <input value={settings.shop_name} onChange={e => updateField('shop_name', e.target.value)} className="bt-input w-full" />
              </div>
              <div>
                <label className="bt-label">Support Phone</label>
                <input value={settings.phone_number} onChange={e => updateField('phone_number', e.target.value)} className="bt-input w-full" />
              </div>
              <div>
                <label className="bt-label">Physical Location</label>
                <input value={settings.location} onChange={e => updateField('location', e.target.value)} className="bt-input w-full" />
              </div>
              <div>
                <label className="bt-label">Default Receipt Footer</label>
                <input value={settings.receipt_footer} onChange={e => updateField('receipt_footer', e.target.value)} className="bt-input w-full" />
              </div>
              <div>
                <label className="bt-label">Operating Currency</label>
                <input value={settings.currency} onChange={e => updateField('currency', e.target.value)} className="bt-input w-full" />
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bt-glass-panel animate-slide-up" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="stat-icon-wrapper theme-success" style={{ width: '36px', height: '36px' }}>
                <CreditCard size={18} />
              </div>
              <h2 className="chart-title" style={{ margin: 0, fontSize: '15px' }}>Gateway & Payments</h2>
            </div>
            <div style={{ padding: '24px', display: 'grid', gap: '20px' }}>
              <div>
                <label className="bt-label">M-Pesa Till/Paybill</label>
                <input value={settings.mpesa_till_number} onChange={e => updateField('mpesa_till_number', e.target.value)} className="bt-input w-full" />
              </div>
              <div>
                <label className="bt-label">Daraja Consumer Key</label>
                <input type="password" value={settings.daraja_consumer_key || ''} onChange={e => updateField('daraja_consumer_key', e.target.value)} className="bt-input w-full" placeholder="••••••••" />
              </div>
              <div>
                <label className="bt-label">Daraja Consumer Secret</label>
                <input type="password" value={settings.daraja_consumer_secret || ''} onChange={e => updateField('daraja_consumer_secret', e.target.value)} className="bt-input w-full" placeholder="••••••••" />
              </div>
              <div>
                <label className="bt-label">Payment Timeout (seconds)</label>
                <input type="number" value={settings.payment_timeout} onChange={e => updateField('payment_timeout', parseInt(e.target.value))} className="bt-input w-full" />
              </div>
            </div>
          </div>

          {/* Inventory Section */}
          <div className="bt-glass-panel animate-slide-up" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="stat-icon-wrapper theme-info" style={{ width: '36px', height: '36px' }}>
                <Package size={18} />
              </div>
              <h2 className="chart-title" style={{ margin: 0, fontSize: '15px' }}>Inventory Intelligence</h2>
            </div>
            <div style={{ padding: '24px', display: 'grid', gap: '20px' }}>
              <div>
                <label className="bt-label">Low Stock Alert Level</label>
                <input type="number" value={settings.low_stock_threshold} onChange={e => updateField('low_stock_threshold', parseInt(e.target.value))} className="bt-input w-full" />
              </div>
              <div>
                <label className="bt-label">Global SKU Prefix</label>
                <input value={settings.sku_prefix} onChange={e => updateField('sku_prefix', e.target.value)} className="bt-input w-full" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="bt-label">Enable IMEI/Serial Tracking</label>
                <input type="checkbox" checked={settings.imei_tracking} onChange={e => updateField('imei_tracking', e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bt-glass-panel animate-slide-up" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="stat-icon-wrapper theme-danger" style={{ width: '36px', height: '36px' }}>
                <Shield size={18} />
              </div>
              <h2 className="chart-title" style={{ margin: 0, fontSize: '15px' }}>Security Protocols</h2>
            </div>
            <div style={{ padding: '24px', display: 'grid', gap: '20px' }}>
              <div>
                <label className="bt-label">Session Duration (minutes)</label>
                <input type="number" value={settings.session_timeout} onChange={e => updateField('session_timeout', parseInt(e.target.value))} className="bt-input w-full" />
              </div>
              <div>
                <label className="bt-label">Max Identity Retries</label>
                <input type="number" value={settings.max_login_attempts} onChange={e => updateField('max_login_attempts', parseInt(e.target.value))} className="bt-input w-full" />
              </div>
              <div>
                <label className="bt-label">Minimum Key Length</label>
                <input type="number" value={settings.password_min_length} onChange={e => updateField('password_min_length', parseInt(e.target.value))} className="bt-input w-full" />
              </div>
            </div>
          </div>

        </div>

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button type="button" onClick={fetchSettings} className="bt-icon-btn" style={{ padding: '12px 32px', width: 'auto', fontWeight: 600 }}>
            <Undo2 size={18} />
            Discard Changes
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="bt-submit-btn shadow-glow" 
            style={{ padding: '12px 40px', fontSize: '15px', minWidth: '220px' }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Commit Global Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
