import React from 'react';

export function EmptyState({ icon: Icon, title = 'Nothing here', message = 'There is no data to display at the moment.', action, style = {} }) {
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        ...style
      }}
    >
      {Icon && <Icon size={40} color="#555" strokeWidth={1.2} />}
      <h3 style={{ margin: Icon ? '16px 0 4px' : '0 0 4px', fontSize: '15px', fontWeight: '600', color: '#ccc' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '13px', color: '#777', lineHeight: '1.5', maxWidth: '360px' }}>{message}</p>
      {action}
    </div>
  );
}
