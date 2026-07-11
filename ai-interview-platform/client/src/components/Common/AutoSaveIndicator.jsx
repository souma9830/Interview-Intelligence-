import React from 'react';
import { Cloud, CloudLightning } from 'lucide-react';

export default function AutoSaveIndicator({ isSaving, lastSaved }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: '#666',
      fontFamily: 'Inter, sans-serif'
    }}>
      {isSaving ? (
        <>
          <CloudLightning size={14} style={{ animation: 'pulse 1s infinite' }} />
          <span>Saving draft...</span>
        </>
      ) : lastSaved ? (
        <>
          <Cloud size={14} />
          <span>Draft saved {lastSaved.toLocaleTimeString()}</span>
        </>
      ) : null}
    </div>
  );
}
