import React, { useState, useEffect } from 'react';
import { Award, Calendar, BarChart2, CheckCircle, Clock, FileText, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function Dashboard({ setCurrentTab, setGlobalState }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('camsense_token') || 'demo_token_active';
      const res = await fetch('/api/report', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Unable to load assessment reports.');
      }
      setReports(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setErrorMessage(err.message || 'Unable to load assessment reports.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleViewReport = (report) => {
    // Populate global state to render Result screen properly
    setGlobalState(prev => ({
      ...prev,
      role: report.role || 'Software Engineer',
      interviewId: report.interviewId,
      difficulty: report.difficulty || 'Medium',
      violationCount: 0,
      userAnswers: [],
      interviewQuestions: [],
      // Override reports with current data
      questionScores: []
    }));
    setCurrentTab('result');
  };

  const calculateStats = () => {
    if (reports.length === 0) return { total: 0, avg: 0, max: 0, hireRate: 0 };
    const scores = reports.map(r => r.overallScore || 0);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / reports.length);
    const max = Math.max(...scores);
    const hires = reports.filter(r => r.hiringRecommendation === 'Strong Hire' || r.hiringRecommendation === 'Hire').length;
    const hireRate = Math.round((hires / reports.length) * 100);
    return { total: reports.length, avg, max, hireRate };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#555', fontSize: '13px' }}>
        Loading historical assessment records…
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: '#111', border: '1px solid #3a1f1f', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <AlertCircle size={34} color="#f87171" style={{ marginBottom: '16px' }} />
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 8px' }}>Unable to load reports</h1>
          <p style={{ fontSize: '13px', color: '#aaa', maxWidth: '420px', margin: '0 auto 24px', lineHeight: '1.5' }}>
            {errorMessage}
          </p>
          <button
            onClick={fetchReports}
            style={{ padding: '10px 18px', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Dashboard Title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Performance Dashboard</h1>
        <p style={{ fontSize: '14px', color: '#aaa', lineHeight: '1.6' }}>
          Monitor your assessment attempts, skill improvements, and hiring readiness reports.
        </p>
      </div>

      {reports.length === 0 ? (
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <BarChart2 size={36} color="#444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>No interview attempts recorded</h2>
          <p style={{ fontSize: '13px', color: '#888', maxWidth: '380px', margin: '0 auto 24px', lineHeight: '1.5' }}>
            To generate your analytics metrics, configure and complete your first mock interview session.
          </p>
          <button
            onClick={() => setCurrentTab('setup')}
            style={{ padding: '10px 20px', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            Start Setup Session
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { label: 'Interviews Completed', val: stats.total, icon: FileText, desc: 'Total sessions completed' },
              { label: 'Average Score', val: `${stats.avg}%`, icon: Award, desc: 'Overall mean score' },
              { label: 'Peak Performance', val: `${stats.max}%`, icon: BarChart2, desc: 'Highest score achieved' },
              { label: 'Hiring Compatibility', val: `${stats.hireRate}%`, icon: CheckCircle, desc: 'Hire recommendation rate' }
            ].map((st, i) => (
              <div key={i} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '500' }}>{st.label}</span>
                  <st.icon size={14} color="#888" />
                </div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#fff' }}>{st.val}</div>
                <span style={{ fontSize: '10px', color: '#555' }}>{st.desc}</span>
              </div>
            ))}
          </div>

          {/* Historical Attempts List */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} color="#888" /> Assessment History
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {reports.map((r) => (
                <div
                  key={r._id}
                  style={{
                    background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', padding: '16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{r.role || 'Software Engineer'}</span>
                      <span style={{ fontSize: '10px', background: '#1e1e1e', border: '1px solid #333', color: '#aaa', padding: '2px 6px', borderRadius: '4px' }}>
                        Score: {r.overallScore}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#666' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={10} /> {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                      <span>•</span>
                      <span style={{ color: r.hiringRecommendation?.includes('Hire') ? '#4ade80' : '#ff4444' }}>
                        Verdict: {r.hiringRecommendation || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewReport(r)}
                    style={{
                      background: 'transparent', border: '1px solid #333', color: '#ccc', borderRadius: '6px',
                      padding: '6px 12px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s'
                    }}
                  >
                    View Report <ChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
