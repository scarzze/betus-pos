import React from 'react';
import { X, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  loading = false
}) => {
  if (!isOpen) return null;

  const getTheme = () => {
    switch (type) {
      case 'danger': return { icon: AlertTriangle, color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' };
      case 'warning': return { icon: AlertCircle, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' };
      case 'success': return { icon: CheckCircle2, color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)' };
      default: return { icon: AlertCircle, color: 'var(--primary)', bg: 'rgba(99, 102, 241, 0.1)' };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <div className="bt-modal-overlay animate-fade-in" style={{ zIndex: 1000 }} onClick={onClose}>
      <div 
        className="bt-glass-panel animate-scale-in" 
        style={{ width: '400px', padding: '32px', textAlign: 'center' }} 
        onClick={e => e.stopPropagation()}
      >
        <div 
          className="stat-icon-wrapper" 
          style={{ 
            width: '64px', 
            height: '64px', 
            margin: '0 auto 24px', 
            background: theme.bg,
            color: theme.color,
            borderRadius: '20px'
          }}
        >
          <Icon size={32} />
        </div>
        
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>{title}</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px' }}>
          {description}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button 
            className="bt-icon-btn" 
            style={{ width: '100%', height: '48px', fontWeight: 600 }}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className="bt-submit-btn" 
            style={{ 
              height: '48px', 
              background: type === 'danger' ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : undefined,
              boxShadow: type === 'danger' ? '0 8px 16px -4px rgba(239, 68, 68, 0.4)' : undefined
            }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
