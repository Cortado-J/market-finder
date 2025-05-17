import { BaseButton } from './BaseButton';

interface DateButtonProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  title?: string;
  debugMode?: boolean;
  variant?: 'default' | 'square';
  size?: 'sm' | 'md' | 'lg';
}

export function DateButton({ 
  children, 
  isActive, 
  onClick, 
  className = '',
  title = '',
  debugMode = false,
  variant = 'default',
  size = 'md'
}: DateButtonProps) {
  const actualVariant = debugMode ? 'debug' : variant;
  
  return (
    <BaseButton
      isActive={isActive}
      onClick={onClick}
      className={className}
      title={title}
      variant={actualVariant}
      size={size}
    >
      {children}
    </BaseButton>
  );
}
