import { useState } from 'react';
import { ToggleButton } from './ui/ToggleButton';

export type WhenMode = 'soon' | 'week';

interface WhenModeToggleProps {
  initialMode?: WhenMode;
  onModeChange: (mode: WhenMode) => void;
  className?: string;
}

/**
 * Toggle component for switching between "Soon" and "Week" modes
 */
export function WhenModeToggle({ 
  initialMode = 'soon', 
  onModeChange,
  className = ''
}: WhenModeToggleProps) {
  const [mode, setMode] = useState<WhenMode>(initialMode);

  const handleModeChange = (newMode: WhenMode) => {
    setMode(newMode);
    onModeChange(newMode);
  };

  return (
    <div className={className}>
      <ToggleButton
        isActive={mode === 'soon'}
        onClick={() => handleModeChange('soon')}
      >
        Soon Mode
      </ToggleButton>
      <ToggleButton
        isActive={mode === 'week'}
        onClick={() => handleModeChange('week')}
      >
        Week Mode
      </ToggleButton>
    </div>
  );
}
