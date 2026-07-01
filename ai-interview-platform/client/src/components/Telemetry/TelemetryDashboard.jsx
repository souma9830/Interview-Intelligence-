import React, { useEffect, useState } from 'react';
export default function TelemetryDashboard() {
  const [metrics, setMetrics] = useState({});
  useEffect(() => {
    fetch('/api/telemetry/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error);
  }, []);
  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Telemetry Dashboard</h1>
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  );
}
