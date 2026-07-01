import React, { useEffect, useState } from 'react';
export default function HealthIndicator() {
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('DOWN'));
  }, []);
  return <div className="p-2 text-sm">System Status: {status}</div>;
}
