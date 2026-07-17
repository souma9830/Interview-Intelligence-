import React from 'react';

export default function EmptyState({ title, description, icon: Icon, actionButton }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      background: '#111',
      border: '1px dashed #222',
      borderRadius: '12px',
      textAlign: 'center',
      margin: '24px 0'
    }}>
      {Icon && <Icon size={40} color="#555" style={{ marginBottom: '16px' }} />}
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: '0 0 8px' }}>{title}</h3>
      <p style={{ fontSize: '13px', color: '#666', maxWidth: '320px', margin: '0 0 20px', lineHeight: '1.5' }}>{description}</p>
      {actionButton}
    </div>
  );
}
