import React from 'react';

// A simple component to display build time and other debug info
interface BuildInfoProps {
  isDebugMode: boolean;
}

const BuildInfo: React.FC<BuildInfoProps> = ({ isDebugMode }) => {
  if (!isDebugMode) {
    return null; // Don't render anything if not in debug mode
  }

  // Styles for the build info box
  const style: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    right: 0,
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '8px',
    fontSize: '12px',
    zIndex: 9999,
    maxWidth: '300px',
    overflowWrap: 'break-word'
  };

  return (
    <div id="debug-info" style={style}>
      <div>Env vars loaded: {Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')).length}</div>
      <div>Build time: {new Date().toISOString()}</div>
    </div>
  );
};

export { BuildInfo };
