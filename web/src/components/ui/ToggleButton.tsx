import { cn } from '../../lib/utils';

interface ToggleButtonProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  title?: string;
}

export function ToggleButton({ 
  children, 
  isActive, 
  onClick, 
  className = '',
  title = ''
}: ToggleButtonProps) {
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
        ${className}
      `}
    >
      {children}
    </button>
  );
}
