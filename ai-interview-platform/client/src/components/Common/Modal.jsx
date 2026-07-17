import React from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  iconBg,
  iconBorder,
  children,
  footer,
  variant = 'default',
  width = '520px',
}) {
  const containerRef = useFocusTrap(open);

  if (!open) return null;

  const borderColor = variant === 'danger' ? '#ff4444' : variant === 'success' ? '#22c55e' : '#2a2a2a';
  const boxShadow = variant === 'danger' ? '0 0 40px rgba(255, 68, 68, 0.1)' : '0 0 40px rgba(0,0,0,0.3)';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(10px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        ref={containerRef}
        style={{
          background: '#111', border: `1px solid ${borderColor}`, borderRadius: '16px',
          padding: '48px', maxWidth: width, width: '100%', textAlign: 'center',
          boxShadow, position: 'relative',
        }}
      >
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#666', padding: '4px', borderRadius: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        )}

        {icon && (
          <div
            style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: iconBg || '#1a1a1a',
              border: `1px solid ${iconBorder || borderColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            {icon}
          </div>
        )}

        {title && (
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#fff', margin: '0 0 12px' }}>
            {title}
          </h2>
        )}

        {description && (
          <p style={{ fontSize: '15px', color: '#aaa', lineHeight: '1.6', margin: '0 0 32px' }}>
            {description}
          </p>
        )}

        {children}

        {footer && (
          <div style={{ marginTop: '24px' }}>{footer}</div>
        )}
      </div>
    </div>
  );
}
