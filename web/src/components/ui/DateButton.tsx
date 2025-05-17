import { BaseButton } from './BaseButton';

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
    <BaseButton
      isActive={isActive}
      onClick={onClick}
      className={className}
      title={title}
      variant={debugMode ? 'debug' : 'default'}
    >
      {children}
    </BaseButton>
  );
}
