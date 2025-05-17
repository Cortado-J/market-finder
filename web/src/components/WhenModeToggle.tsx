import { useState } from 'react';

export type WhenMode = 'soon' | 'week';

interface WhenModeToggleProps {
  initialMode?: WhenMode;
  onModeChange: (mode: WhenMode) => void;
}

/**
 * Toggle component for switching between "Soon" and "Schedule" modes
 */
export function WhenModeToggle({ 
  initialMode = 'soon', 
  onModeChange 
}: WhenModeToggleProps) {
  const [mode, setMode] = useState<WhenMode>(initialMode);

  const handleModeChange = (newMode: WhenMode) => {
    setMode(newMode);
    onModeChange(newMode);
  };

  return (
    <div className="inline-flex bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => handleModeChange('soon')}
        className={`px-4 py-2 rounded-md transition-colors ${mode === 'soon' 
          ? 'bg-gray-600 text-white' 
          : 'bg-transparent text-gray-300 hover:bg-gray-700'}`}
      >
        Soon
      </button>
      <button
        onClick={() => handleModeChange('week')}
        className={`px-4 py-2 rounded-md transition-colors ${mode === 'week' 
          ? 'bg-gray-600 text-white' 
          : 'bg-transparent text-gray-300 hover:bg-gray-700'}`}
      >
        Week
      </button>
    </div>
  );
}
