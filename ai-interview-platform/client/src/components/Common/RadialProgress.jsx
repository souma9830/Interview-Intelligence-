import React from 'react';

export default function RadialProgress({ score, size = 120, strokeWidth = 10, title = 'Overall Score' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  let strokeColor = '#3b82f6'; // blue
  if (score >= 80) strokeColor = '#10b981'; // green
  else if (score < 50) strokeColor = '#ef4444'; // red

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#222"
            strokeWidth={strokeWidth}
          />
          {/* Foreground circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{score}</span>
          <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>%</span>
        </div>
      </div>
      {title && <span style={{ fontSize: '12px', color: '#aaa', fontWeight: '500' }}>{title}</span>}
    </div>
  );
}
