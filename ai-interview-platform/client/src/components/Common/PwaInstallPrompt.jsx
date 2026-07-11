import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
      background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px',
      padding: '16px', maxWidth: '320px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    }}>
      <p style={{ fontSize: '13px', color: '#e0e0e0', margin: '0 0 10px', fontWeight: 500 }}>
        Install CamSense AI for the best experience
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleInstall} style={{
          flex: 1, background: '#fff', color: '#000', border: 'none', borderRadius: '6px',
          padding: '8px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
        }}>
          <Download size={12} /> Install
        </button>
        <button onClick={() => setShowPrompt(false)} style={{
          background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: '6px',
          padding: '8px 12px', fontSize: '12px', cursor: 'pointer',
        }}>
          Dismiss
        </button>
      </div>
    </div>
  );
}