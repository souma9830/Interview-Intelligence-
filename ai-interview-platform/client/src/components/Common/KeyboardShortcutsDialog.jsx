import React from 'react';
import { Keyboard, X } from 'lucide-react';

const categoryOrder = ['General', 'Navigation'];
const categoryColors = {
  General: '#888',
  Navigation: '#4ade80',
};

export function KeyboardShortcutsDialog({ isOpen, onClose, shortcuts = {} }) {
  React.useEffect(() => {
    if (isOpen) {
      const handler = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const grouped = {};
  Object.entries(shortcuts).forEach(([key, val]) => {
    const cat = val.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ key, ...val });
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111', border: '1px solid #2a2a2a', borderRadius: '14px',
          padding: '28px', maxWidth: '420px', width: '100%',
          maxHeight: '80vh', overflowY: 'auto',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Keyboard size={18} color="#888" />
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#fff' }}>Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts dialog"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>

        {categoryOrder.map(cat => {
          const items = grouped[cat];
          if (!items || items.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: categoryColors[cat] || '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{cat}</div>
              {items.map(({ key: shortcutKey, label }) => (
                <div key={shortcutKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ fontSize: '13px', color: '#ccc' }}>{label}</span>
                  <kbd style={{
                    background: '#1e1e1e', border: '1px solid #333', borderRadius: '4px',
                    padding: '2px 8px', fontSize: '11px', color: '#aaa', fontFamily: 'monospace', minWidth: '24px', textAlign: 'center'
                  }}>
                    {shortcutKey === ' ' ? 'Space' : shortcutKey}
                  </kbd>
                </div>
              ))}
            </div>
          );
        })}

        <p style={{ fontSize: '11px', color: '#555', margin: '16px 0 0', textAlign: 'center', borderTop: '1px solid #222', paddingTop: '12px' }}>
          Press <kbd style={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: '3px', padding: '1px 5px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>?</kbd> to toggle this dialog
        </p>
      </div>
    </div>
  );
}
