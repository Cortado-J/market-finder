import React from 'react';
import { DateButton } from './ui/DateButton';

export interface DateModeButtonProps {
  label: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
  debugMode?: boolean;
  className?: string;
}

export function DateModeButton({ 
  label, 
  onClick, 
  isActive, 
  debugMode, 
  className = ''
}: DateModeButtonProps) {
  return (
    <DateButton
      isActive={isActive}
      onClick={onClick}
      debugMode={debugMode}
      className={className}
    >
      {label}
    </DateButton>
  );
}
