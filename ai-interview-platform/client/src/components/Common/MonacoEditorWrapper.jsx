import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const Editor = React.lazy(() => import('@monaco-editor/react'));

function EditorFallback({ onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#0d0d0d', borderRadius: '8px', gap: '12px', padding: '24px' }}>
      <AlertTriangle size={28} color="#888" />
      <span style={{ fontSize: '13px', color: '#888' }}>Monaco editor failed to load</span>
      <button
        onClick={onRetry}
        style={{ padding: '8px 16px', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <RefreshCw size={13} /> Retry
      </button>
    </div>
  );
}

export default function MonacoEditorWrapper({ language, value, onChange, options }) {
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  if (hasError) {
    return <MonacoFallback onRetry={() => { setHasError(false); setRetryKey(k => k + 1); }} />;
  }

  return (
    <React.Suspense
      fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#0d0d0d' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>Loading editor...</span>
        </div>
      }
    >
      <Editor
        key={retryKey}
        height="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineHeight: 20,
          padding: { top: 12, bottom: 12 },
          scrollBeyondLastLine: false,
          cursorBlinking: "smooth",
          ...options,
        }}
        loading={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><span style={{ fontSize: '12px', color: '#666' }}>Loading editor...</span></div>}
        onError={() => setHasError(true)}
      />
    </React.Suspense>
  );
}