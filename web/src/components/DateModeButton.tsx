import React from 'react';
import { cn } from '../lib/utils';

export interface DateModeButtonProps {
  label: React.ReactNode; // Changed from string to React.ReactNode to support JSX elements
  onClick: () => void;
  isActive: boolean;
  debugMode?: boolean;
}

export function DateModeButton({ label, onClick, isActive, debugMode }: DateModeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded-md transition-colors text-sm min-w-[2.5rem]',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isActive 
          ? 'bg-gray-500 text-white hover:bg-gray-600' 
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
        debugMode && 'border-2 border-hotpink box-border'
      )}
    >
      {label}
    </button>
  );
}
