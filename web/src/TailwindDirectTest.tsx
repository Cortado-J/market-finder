import React from 'react';

// This component uses direct inline styles that match Tailwind's utility classes
// We'll use this to compare with our Tailwind component
const TailwindDirectTest = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: 50,
      backgroundColor: 'white',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '16px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px'
    }}>
      <h2 style={{ fontSize: '24px', color: '#2563eb', fontWeight: 'bold', marginBottom: '8px' }}>
        Tailwind Direct Test
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ height: '16px', width: '100%', backgroundColor: '#ef4444' }}></div>
        <div style={{ height: '16px', width: '100%', backgroundColor: '#f97316' }}></div>
        <div style={{ height: '16px', width: '100%', backgroundColor: '#eab308' }}></div>
        <div style={{ height: '16px', width: '100%', backgroundColor: '#22c55e' }}></div>
        <div style={{ height: '16px', width: '100%', backgroundColor: '#3b82f6' }}></div>
        <div style={{ height: '16px', width: '100%', backgroundColor: '#6366f1' }}></div>
        <div style={{ height: '16px', width: '100%', backgroundColor: '#a855f7' }}></div>
      </div>
      <p style={{ marginTop: '8px', fontSize: '14px', color: '#4b5563' }}>
        This box uses direct inline styles (no Tailwind classes)
      </p>
    </div>
  );
};

export default TailwindDirectTest;
