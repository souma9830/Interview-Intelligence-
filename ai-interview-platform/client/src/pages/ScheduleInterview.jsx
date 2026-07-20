import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Loader2, Briefcase, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '../components/Common/ToastProvider';

const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' };
const inp = { width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#e0e0e0', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };

const roles = ['Frontend Engineer', 'Backend Engineer', 'Fullstack Engineer', 'AI / ML Engineer'];

export default function ScheduleInterview({ setCurrentTab }) {
  const toast = useToast();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ role: roles[0], scheduledAt: '', durationMinutes: 45, notes: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('camsense_token');
      const res = await fetch('/api/schedules', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setSchedules(json.data || []);
      }
    } catch (err) {
      console.warn('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.scheduledAt) {
      toast.show('Please select a date and time', 'error');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('camsense_token');
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        toast.show('Interview scheduled successfully!', 'success');
        setShowForm(false);
        setFormData({ role: roles[0], scheduledAt: '', durationMinutes: 45, notes: '' });
        fetchSchedules();
      } else {
        toast.show(json.message || 'Failed to schedule', 'error');
      }
    } catch {
      toast.show('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem('camsense_token');
      await fetch(`/api/schedules/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.show('Schedule removed', 'success');
      setSchedules(prev => prev.filter(s => s._id !== id));
    } catch {
      toast.show('Failed to delete', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <button onClick={() => setCurrentTab('dashboard')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
        <ArrowLeft size={13} /> Back to Dashboard
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: '0 0 6px' }}>Schedule Interview</h1>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Plan your interview sessions in advance</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '10px 20px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> {showForm ? 'Cancel' : 'New Schedule'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: '0 0 20px' }}>Create Interview Schedule</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#888', display: 'block', marginBottom: '6px' }}>Role</label>
              <select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))} style={inp}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#888', display: 'block', marginBottom: '6px' }}>Date & Time</label>
              <input type="datetime-local" value={formData.scheduledAt} onChange={e => setFormData(p => ({ ...p, scheduledAt: e.target.value }))} min={getMinDateTime()} style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#888', display: 'block', marginBottom: '6px' }}>Duration (min)</label>
                <select value={formData.durationMinutes} onChange={e => setFormData(p => ({ ...p, durationMinutes: Number(e.target.value) }))} style={inp}>
                  {[15, 30, 45, 60, 90, 120].map(m => <option key={m} value={m}>{m} min</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#888', display: 'block', marginBottom: '6px' }}>Notes (optional)</label>
                <input type="text" placeholder="Preparation notes..." value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} style={inp} />
              </div>
            </div>
            <button type="submit" disabled={saving} style={{ padding: '11px', background: saving ? '#1a1a1a' : '#fff', color: saving ? '#555' : '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Scheduling…</> : <>Schedule Interview <Calendar size={16} /></>}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <p>Loading schedules...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', padding: '40px' }}>
            <Calendar size={32} color="#555" style={{ marginBottom: '12px' }} />
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>No interviews scheduled yet. Click "New Schedule" to plan one.</p>
          </div>
        ) : (
          schedules.map(schedule => (
            <div key={schedule._id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Briefcase size={18} color="#ccc" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>{schedule.role}</div>
                  <div style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {formatDate(schedule.scheduledAt)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {schedule.durationMinutes || 45} min
                    </span>
                  </div>
                  {schedule.notes && <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>{schedule.notes}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', background: new Date(schedule.scheduledAt) > new Date() ? '#1a2e1a' : '#2e1a1a', color: new Date(schedule.scheduledAt) > new Date() ? '#4ade80' : '#ef4444', border: `1px solid ${new Date(schedule.scheduledAt) > new Date() ? '#1e3a1e' : '#3a1e1e'}` }}>
                  {new Date(schedule.scheduledAt) > new Date() ? 'Upcoming' : 'Past'}
                </div>
                <button onClick={() => handleDelete(schedule._id)} disabled={deletingId === schedule._id} style={{ padding: '8px', background: 'transparent', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                  {deletingId === schedule._id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}