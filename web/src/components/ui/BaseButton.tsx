import React from 'react';

interface BaseButtonProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'debug' | 'square';
  size?: 'sm' | 'md' | 'lg';
}

export function BaseButton({ 
  children, 
  isActive = false, 
  onClick, 
  className = '',
  title = '',
  type = 'button',
  variant = 'default',
  size = 'md'
}: BaseButtonProps) {
  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  };

  const baseClasses = `transition-colors rounded-md ${sizeClasses[size]}`;
  const focusClasses = 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  
  const variantClasses = {
    default: isActive 
      ? 'bg-gray-600 text-white' 
      : 'bg-transparent text-gray-300 hover:bg-gray-700',
    debug: 'border-2 border-hotpink box-border',
    square: 'flex items-center justify-center w-10 h-10 p-0 m-0',
    'square-active': 'bg-gray-600 text-white',
    'square-inactive': 'bg-transparent text-gray-300 hover:bg-gray-700'
  };
  
  // Special handling for square variant
  if (variant === 'square') {
    return (
      <button
        type={type}
        onClick={onClick}
        title={title}
        className={`
          ${variantClasses.square}
          ${focusClasses}
          ${isActive ? variantClasses['square-active'] : variantClasses['square-inactive']}
          ${className}
          flex items-center justify-center
        `}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      title={title}
      className={`
        ${baseClasses}
        ${focusClasses}
        ${variant === 'debug' 
          ? variantClasses.debug 
          : variantClasses.default}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
