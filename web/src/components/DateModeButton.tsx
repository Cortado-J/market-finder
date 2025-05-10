import React from 'react';

export interface DateModeButtonProps {
  label: React.ReactNode; // Changed from string to React.ReactNode to support JSX elements
  onClick: () => void;
  isActive: boolean;
  debugMode?: boolean; // Add debugMode prop
}

export function DateModeButton({ label, onClick, isActive, debugMode }: DateModeButtonProps) {
  const buttonStyle = debugMode ? { border: '2px solid hotpink', boxSizing: 'border-box' as 'border-box' } : {};

  return (
    <button
      onClick={onClick}
      style={buttonStyle} // Apply conditional style
      className={`date-button ${isActive ? 'active' : ''}`}
    >
      {label}
    </button>
  );
}
