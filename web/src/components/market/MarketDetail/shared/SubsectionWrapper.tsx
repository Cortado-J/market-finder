import { ReactNode } from 'react';

interface SubsectionWrapperProps {
  children: ReactNode;
  isDebugMode?: boolean;
  className?: string;
}

export function SubsectionWrapper({ 
  children, 
  isDebugMode, 
  className = '' 
}: SubsectionWrapperProps) {
  const containerStyle: React.CSSProperties = {};
  
  if (isDebugMode) {
    containerStyle.border = '1px dashed green';
    containerStyle.padding = '4px';
    containerStyle.margin = '4px 0';
    containerStyle.boxSizing = 'border-box';
  }

  return (
    <div className={className} style={containerStyle}>
      {children}
    </div>
  );
}
