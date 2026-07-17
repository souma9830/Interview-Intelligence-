import React from 'react';

export default function QuestionInputCard({ index, value, onChange, onRemove }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      background: '#111',
      border: '1px solid #222',
      borderRadius: '8px',
      marginBottom: '10px'
    }}>
      <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>Q{index + 1}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter custom telemetry evaluation prompt..."
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '13px',
          outline: 'none'
        }}
      />
      {onRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>
          Remove
        </button>
      )}
    </div>
  );
}
