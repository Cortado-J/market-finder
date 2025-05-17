import { DetailText } from './DetailText';

interface DetailItemProps {
  title: string;
  children: React.ReactNode;
  isDebugMode?: boolean;
  className?: string;
}

export function DetailItem({ 
  title, 
  children, 
  isDebugMode = false,
  className = ''
}: DetailItemProps) {
  const containerStyle = isDebugMode 
    ? { border: '1px dashed red', padding: '4px', margin: '4px 0' } 
    : {};

  return (
    <div className={`mb-4 ${className}`} style={containerStyle}>
      <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
      <div className="pl-2">
        {children}
      </div>
    </div>
  );
}
