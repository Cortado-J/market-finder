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
    <div className={`flex items-center space-x-0.5 ${className}`}>
      <div className="flex flex-col items-center">
        <ToggleButton
          variant="square"
          isActive={mode === 'soon'}
          onClick={() => handleModeChange('soon')}
          title="Show markets opening soon"
        >
          S
        </ToggleButton>
        <span className="text-xs mt-0.5 text-gray-400">Soon</span>
      </div>
      <div className="flex flex-col items-center">
        <ToggleButton
          variant="square"
          isActive={mode === 'week'}
          onClick={() => handleModeChange('week')}
          title="Show markets by day of week"
        >
          W
        </ToggleButton>
        <span className="text-xs mt-0.5 text-gray-400">Week</span>
      </div>
    </div>
  );
}
