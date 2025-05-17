import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  children: ReactNode;
  isDebugMode?: boolean;
  className?: string;
}

export function SectionCard({ 
  title, 
  children, 
  isDebugMode = false,
  className = ''
}: SectionCardProps) {
  const containerStyle = isDebugMode 
    ? { border: '2px solid blue', padding: '8px', margin: '8px 0' } 
    : {};

  return (
    <div className={`bg-gray-800 rounded-lg p-4 mb-6 ${className}`} style={containerStyle}>
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
