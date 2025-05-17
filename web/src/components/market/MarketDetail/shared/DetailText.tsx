import { CSSProperties } from 'react';

interface DetailTextProps {
  children: React.ReactNode;
  isDebugMode?: boolean;
  textColorClassName?: string;
  className?: string;
}

export function DetailText({
  children,
  isDebugMode,
  textColorClassName = 'text-gray-200',
  className = ''
}: DetailTextProps) {
  const elementStyle: CSSProperties = {}; 
  if (isDebugMode) {
    elementStyle.border = '1px dashed orange';
    elementStyle.boxSizing = 'border-box';
  }
  
  return (
    <p 
      className={`text-base ${textColorClassName} ${className}`} 
      style={elementStyle}
    >
      {children}
    </p>
  );
}
