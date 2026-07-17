import React, { useEffect, useState } from 'react';
import { Pagination } from '../components/Common/Pagination';

const ITEMS_PER_PAGE = 5;

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then(res => res.json())
      .then(data => setLogs(data.data || data.logs || []))
      .catch(console.error);
  }, []);

  const totalPages = Math.max(1, Math.ceil(logs.length / ITEMS_PER_PAGE));
  const paginatedLogs = logs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div style={{ padding: '32px', background: '#0a0a0a', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>System Audit Logs</h1>
      <div style={{ background: '#111', borderRadius: '8px', padding: '16px', border: '1px solid #222' }}>
        {paginatedLogs.length === 0 ? (
          <p style={{ color: '#777', fontSize: '13px', textAlign: 'center', padding: '24px' }}>No audit logs available.</p>
        ) : (
          paginatedLogs.map((log, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < paginatedLogs.length - 1 ? '1px solid #222' : 'none', fontSize: '14px' }}>
              <strong>{log.action}</strong> by {log.user} - <span style={{ color: '#888' }}>{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
