
import React, { useEffect, useState } from 'react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then(res => res.json())
      .then(data => setLogs(data.logs || []))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: '32px', background: '#0a0a0a', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>System Audit Logs</h1>
      <div style={{ background: '#111', borderRadius: '8px', padding: '16px', border: '1px solid #222' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #222', fontSize: '14px' }}>
            <strong>{log.action}</strong> by {log.user} - <span style={{ color: '#888' }}>{new Date(log.timestamp).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
      