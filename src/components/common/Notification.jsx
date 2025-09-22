import React from 'react';

export default function Notification({ type, message, onClose }) {
  if (!message) return null;

  const typeStyles = {
    success: {
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      color: '#10b981'
    },
    error: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      color: '#ef4444'
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.1)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      color: '#f59e0b'
    },
    info: {
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      color: '#3b82f6'
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 20px',
        borderRadius: '12px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        zIndex: 9999,
        maxWidth: '400px',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: '500' }}>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '4px',
              marginLeft: '12px',
              borderRadius: '4px',
              fontSize: '18px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}