import React, { useState, useEffect } from 'react';
import { Award, Calendar, BarChart2, CheckCircle, Clock, FileText, ChevronRight, Plus } from 'lucide-react';
import { SkeletonCard, SkeletonStatCard, SkeletonTable } from '../components/Common/Skeleton';
import { Pagination } from '../components/Common/Pagination';

const ITEMS_PER_PAGE = 5;

export default function Dashboard({ setCurrentTab, setGlobalState }) {
  const [reports, setReports] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({ role: 'Frontend Engineer', scheduledAt: '', durationMinutes: 45, notes: '' });
  const [scheduleStatus, setScheduleStatus] = useState('');
  const [reportPage, setReportPage] = useState(1);
  const [schedulePage, setSchedulePage] = useState(1);

  const fetchReports = async (signal) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('camsense_token') || 'demo_token_active';
      const res = await fetch('/api/report', {
        headers: { Authorization: `Bearer ${token}` },
        signal
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Unable to load assessment reports.');
      }
      setReports(Array.isArray(json.data) ? json.data : []);

      const scheduleRes = await fetch('/api/schedules', {
        headers: { Authorization: `Bearer ${token}` },
        signal
      });
      const scheduleJson = await scheduleRes.json();
      if (scheduleRes.ok && scheduleJson.success) {
        setSchedules(Array.isArray(scheduleJson.data) ? scheduleJson.data : []);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[Fetch Aborted] Request was cancelled.');
        return;
      }
      console.error('Error fetching reports:', err);
      setErrorMessage(err.message || 'Unable to load assessment reports.');
      setReports([]);
    } finally {
      setLoading(false);
    }
    return reportsJson;
  }, []);

  const { loading, error: errorMessage, execute: fetchReports } = useFetch(fetchReportsData, true);

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setScheduleError('');
    setScheduleSuccess('');
    try {
      const token = localStorage.getItem('camsense_token') || 'demo_token_active';
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(scheduleForm)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Unable to schedule interview.');
      }
      setSchedules(prev => [...prev, json.data].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)));
      setScheduleForm({ role: 'Frontend Engineer', scheduledAt: '', durationMinutes: 45, notes: '' });
      setScheduleSuccess('Interview scheduled successfully.');
    } catch (err) {
      setScheduleError(err.message || 'Unable to schedule interview.');
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchReports(controller.signal);
    return () => controller.abort();
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
      <div style={{ maxWidth: '960px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ height: '28px', width: '40%', background: '#1a1a1a', borderRadius: '6px', marginBottom: '8px' }} />
          <div style={{ height: '14px', width: '60%', background: '#1a1a1a', borderRadius: '6px' }} />
        </div>
        <LoadingOverlay message="Loading dashboard..." />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
        <EmptyState
          icon={null}
          title="Unable to load reports"
          message={errorMessage}
          action={
            <button
              onClick={fetchReports}
              style={{ marginTop: '16px', padding: '10px 18px', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Loader2 size={13} /> Retry
            </button>
          }
        />
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleCreateSchedule} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} color="#888" /> Schedule Interview
          </h2>
          <select value={scheduleForm.role} onChange={e => setScheduleForm(p => ({ ...p, role: e.target.value }))} style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e0e0e0', padding: '10px', fontSize: '13px' }}>
            <option>Frontend Engineer</option>
            <option>Backend Engineer</option>
            <option>Fullstack Engineer</option>
            <option>AI / ML Engineer</option>
          </select>
          <input type="datetime-local" value={scheduleForm.scheduledAt} onChange={e => setScheduleForm(p => ({ ...p, scheduledAt: e.target.value }))} required aria-label="Schedule date and time" style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e0e0e0', padding: '10px', fontSize: '13px' }} />
          <input type="number" min="15" max="180" value={scheduleForm.durationMinutes} onChange={e => setScheduleForm(p => ({ ...p, durationMinutes: e.target.value }))} style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e0e0e0', padding: '10px', fontSize: '13px' }} />
          <textarea value={scheduleForm.notes} onChange={e => setScheduleForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Preparation notes or target company context" style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e0e0e0', padding: '10px', fontSize: '13px', resize: 'none', lineHeight: '1.5' }} />
          {scheduleSuccess && <div style={{ color: '#4ade80', fontSize: '12px' }}>{scheduleSuccess}</div>}
          {scheduleError && <ErrorMessage message={scheduleError} />}
          <button type="submit" style={{ padding: '10px 14px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Plus size={14} /> Add Schedule
          </button>
        </form>

        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={14} color="#888" /> Upcoming Sessions
          </h2>
          {schedules.length === 0 ? (
            <EmptyState icon={null} title="No upcoming sessions" message="Schedule your first mock interview above." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(() => {
                const start = (schedulePage - 1) * ITEMS_PER_PAGE;
                return schedules.slice(start, start + ITEMS_PER_PAGE).map(schedule => (
                <div key={schedule._id} style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{schedule.role}</span>
                  <span style={{ fontSize: '11px', color: '#aaa' }}>{new Date(schedule.scheduledAt).toLocaleString()} • {schedule.durationMinutes} min</span>
                  {schedule.notes && <span style={{ fontSize: '11px', color: '#666', lineHeight: '1.4' }}>{schedule.notes}</span>}
                  
                  <button 
                    disabled={new Date(schedule.scheduledAt).getTime() > Date.now()}
                    onClick={() => {
                      setGlobalState(prev => ({ ...prev, role: schedule.role }));
                      setCurrentTab('setup');
                    }}
                    style={{
                      marginTop: '8px', padding: '6px 12px', fontSize: '11px', borderRadius: '4px', border: 'none', cursor: new Date(schedule.scheduledAt).getTime() > Date.now() ? 'not-allowed' : 'pointer',
                      background: new Date(schedule.scheduledAt).getTime() > Date.now() ? '#1a1a1a' : '#fff',
                      color: new Date(schedule.scheduledAt).getTime() > Date.now() ? '#555' : '#000',
                      fontWeight: '600', transition: 'all 0.15s'
                    }}
                  >
                    {new Date(schedule.scheduledAt).getTime() > Date.now() ? 'Starts later' : 'Start Session'}
                  </button>
                </div>
              );
            })}
            </div>
            <Pagination currentPage={schedulePage} totalPages={Math.ceil(schedules.length / ITEMS_PER_PAGE)} onPageChange={setSchedulePage} />
          )}
        </div>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="No interview attempts recorded"
          message="To generate your analytics metrics, configure and complete your first mock interview session."
          action={
            <button
              onClick={() => setCurrentTab('setup')}
              style={{ marginTop: '16px', padding: '10px 20px', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Start Setup Session
            </button>
          }
        />
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
              {(() => {
                const start = (reportPage - 1) * ITEMS_PER_PAGE;
                return reports.slice(start, start + ITEMS_PER_PAGE).map((r) => (
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
              );
            })}
            </div>
            <Pagination currentPage={reportPage} totalPages={Math.ceil(reports.length / ITEMS_PER_PAGE)} onPageChange={setReportPage} />
          </div>

        </div>
      )}

    </div>
  );
}

// Integrated system backup tools interface
