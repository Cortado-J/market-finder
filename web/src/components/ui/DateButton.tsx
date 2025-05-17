import React from 'react';

interface DateButtonProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  title?: string;
  debugMode?: boolean;
}

export function DateButton({ 
  children, 
  isActive, 
  onClick, 
  className = '',
  title = '',
  debugMode = false
}: DateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        px-4 py-2 transition-colors text-sm rounded-md
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isActive 
          ? 'bg-gray-600 text-white' 
          : 'bg-transparent text-gray-300 hover:bg-gray-700'}
        ${debugMode ? 'border-2 border-hotpink box-border' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
