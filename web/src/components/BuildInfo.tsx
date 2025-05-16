import React from 'react';

interface BuildInfoProps {
  isDebugMode: boolean;
}

const BuildInfo: React.FC<BuildInfoProps> = ({ isDebugMode }) => {
  if (!isDebugMode) {
    return null; // Don't render anything if not in debug mode
  }

  return (
    <div 
      id="debug-info" 
      className="fixed bottom-0 right-0 bg-black/70 text-white p-2 text-xs z-50 max-w-[300px] break-words"
    >
      <div>Env vars loaded: {Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')).length}</div>
      <div>Build time: {new Date().toISOString()}</div>
    </div>
  );
};

export { BuildInfo };
