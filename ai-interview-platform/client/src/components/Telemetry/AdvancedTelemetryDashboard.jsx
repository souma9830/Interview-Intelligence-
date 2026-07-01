
import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdvancedTelemetryDashboard() {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    fetch('/api/telemetry/metrics')
      .then(res => res.json())
      .then(data => setLogs(data.recentLogs || []))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: '24px', background: '#0a0a0a', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Shield size={28} color="#fff" />
        <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>Advanced Proctoring Telemetry</h1>
      </div>
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#aaa', marginBottom: '16px' }}>Real-time Compliance Log</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {logs.map((log, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#161616', border: '1px solid #2a2a2a', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {log.severity === 'high' ? <AlertTriangle color="#ef4444" size={16} /> : <CheckCircle color="#22c55e" size={16} />}
                <span>{log.description}</span>
              </div>
              <span style={{ fontSize: '12px', color: '#666' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
      