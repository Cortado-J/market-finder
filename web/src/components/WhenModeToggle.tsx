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
    <div className="flex space-x-3 when-mode-toggle">
      <button
        className={`filter-button ${mode === 'soon' ? 'active' : ''}`}
        onClick={() => handleModeChange('soon')}
      >
        Soon
      </button>
      <button
        className={`filter-button ${mode === 'week' ? 'active' : ''}`}
        onClick={() => handleModeChange('week')}
      >
        Week
      </button>
    </div>
  );
}
