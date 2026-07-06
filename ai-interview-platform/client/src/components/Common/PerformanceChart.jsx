import React from 'react';

export default function PerformanceChart({ scores }) {
  if (!scores || scores.length === 0) return null;

  const maxScore = 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #222' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0 }}>Category Score Breakdown</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {scores.map((item, idx) => {
          const percentage = Math.min(100, Math.max(0, (item.score / maxScore) * 100));
          let barColor = '#3b82f6'; // blue
          if (percentage >= 80) barColor = '#10b981'; // green
          else if (percentage < 50) barColor = '#ef4444'; // red

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa' }}>
                <span>{item.category}</span>
                <span style={{ fontWeight: '600', color: '#fff' }}>{item.score}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: barColor,
                    borderRadius: '4px',
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
