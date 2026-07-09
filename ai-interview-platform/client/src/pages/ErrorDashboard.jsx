import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, Search, ArrowLeft } from 'lucide-react';

const ERROR_LEVELS = { error: '#ef4444', warn: '#facc15', info: '#3b82f6' };

export default function ErrorDashboard({ setCurrentTab }) {
  const [errors, setErrors] = useState({ docs: [], total: 0, page: 1, totalPages: 0 });
  const [stats, setStats] = useState({ total: 0, unresolved: 0, byLevel: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const fetchErrors = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('camsense_token');
      const query = new URLSearchParams({ page, limit: 20 });
      if (filter !== 'all') query.set('level', filter);

      const [errorsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/errors?${query}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/errors/stats', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const errorsData = await errorsRes.json();
      const statsData = await statsRes.json();

      if (errorsData.success) setErrors(errorsData.data);
      if (statsData.success) setStats(statsData.data);
    } catch {
      /* silently handle fetch errors */
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchErrors(); }, [fetchErrors]);

  const handleResolve = async (id) => {
    try {
      const token = localStorage.getItem('camsense_token');
      await fetch(`/api/admin/errors/${id}/resolve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchErrors();
    } catch {}
  };

  const inputStyle = { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '8px 12px 8px 32px', fontSize: '13px', color: '#e0e0e0', outline: 'none', width: '200px' };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => setCurrentTab('dashboard')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
          <ArrowLeft size={13} /> Back
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>Error Monitoring</h1>
        <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Track and manage application errors in real-time.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Errors (24h)', val: stats.total, color: '#ef4444' },
          { label: 'Unresolved', val: stats.unresolved, color: '#facc15' },
          { label: 'Error Types', val: stats.byLevel?.length || 0, color: '#3b82f6' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '18px' }}>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={14} color="#888" /> Error Log
          </h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#e0e0e0', padding: '6px 8px', fontSize: '12px' }}>
              <option value="all">All Levels</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
            </select>
            <button onClick={fetchErrors} style={{ background: 'transparent', border: '1px solid #333', borderRadius: '6px', color: '#aaa', cursor: 'pointer', padding: '6px', display: 'flex' }}>
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#555', fontSize: '13px' }}>Loading errors...</div>
        ) : errors.docs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#555', fontSize: '13px' }}>No errors recorded in this period.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {errors.docs.map(err => (
              <div key={err._id} style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    {err.resolved ? <CheckCircle size={14} color="#4ade80" /> : <XCircle size={14} color={ERROR_LEVELS[err.level] || '#888'} />}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{err.message}</span>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '2px', fontSize: '11px', color: '#888' }}>
                        <span>{err.path || '-'}</span>
                        <span>•</span>
                        <span>{err.code || '-'}</span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Clock size={10} /> {new Date(err.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {!err.resolved && (
                    <button onClick={() => handleResolve(err._id)} style={{ background: 'transparent', border: '1px solid #333', borderRadius: '4px', color: '#aaa', cursor: 'pointer', padding: '4px 8px', fontSize: '11px' }}>
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {errors.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
            {Array.from({ length: errors.totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                background: p === page ? '#fff' : 'transparent',
                color: p === page ? '#000' : '#888',
                border: '1px solid #333', borderRadius: '4px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer',
              }}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}