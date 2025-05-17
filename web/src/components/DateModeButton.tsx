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
        'px-4 py-2 rounded-md transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isActive 
          ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800' 
          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600',
        debugMode && 'border-2 border-hotpink box-border'
      )}
    >
      {label}
    </button>
  );
}
