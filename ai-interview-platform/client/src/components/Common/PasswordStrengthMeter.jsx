import React from 'react';
import { calculatePasswordStrength } from '../../utils/passwordRules';

export default function PasswordStrengthMeter({ password }) {
  const { score, label, color } = calculatePasswordStrength(password);
  
  return (
    <div style={{ marginTop: '8px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>Password Strength:</span>
        <span style={{ fontSize: '12px', fontWeight: '600', color }}>{label}</span>
      </div>
      <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: i < score ? color : '#2a2a2a',
              borderRadius: '2px',
              transition: 'background-color 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
