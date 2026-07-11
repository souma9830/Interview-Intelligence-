import React from 'react';

export default function ShortcutsDialog({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: '#111',
        border: '1px solid #222',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        padding: '24px',
        boxSizing: 'border-box'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: '0 0 16px' }}>Keyboard Shortcuts</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#888' }}>Open shortcuts dialog</span>
            <kbd style={{ background: '#222', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>Alt + H</kbd>
          </div>
        </div>
        <button onClick={onClose} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
          Close
        </button>
      </div>
    </div>
  );
}
