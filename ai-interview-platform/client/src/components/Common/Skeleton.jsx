import React from 'react';

export function Skeleton({ width = '100%', height = '16px', borderRadius = '6px', style = {} }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ rows = 3, height = '140px' }) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      style={{
        background: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: '12px',
        padding: '24px',
        height,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <Skeleton width="40%" height="14px" />
      <Skeleton width="100%" height="12px" />
      <Skeleton width="85%" height="12px" />
      {rows > 3 && <Skeleton width="70%" height="12px" />}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div
      aria-hidden="true"
      style={{
        background: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: '10px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <Skeleton width="60%" height="12px" />
      <Skeleton width="40%" height="28px" borderRadius="4px" />
      <Skeleton width="50%" height="10px" />
    </div>
  );
}

export function SkeletonTable({ rows = 4 }) {
  return (
    <div
      role="status"
      aria-label="Loading table data"
      style={{
        background: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <Skeleton width="30%" height="16px" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < rows - 1 ? '1px solid #1e1e1e' : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <Skeleton width="50%" height="12px" />
            <Skeleton width="30%" height="10px" />
          </div>
          <Skeleton width="60px" height="28px" borderRadius="4px" />
        </div>
      ))}
    </div>
  );
}
