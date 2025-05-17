import { BaseButton } from './BaseButton';

interface ToggleButtonProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  title?: string;
  variant?: 'default' | 'square';
}

export function ToggleButton({ 
  children, 
  isActive, 
  onClick, 
  className = '',
  title = '',
  variant = 'default'
}: ToggleButtonProps) {
  return (
    <BaseButton
      isActive={isActive}
      onClick={onClick}
      className={className}
      title={title}
      variant={variant}
    >
      {children}
    </BaseButton>
  );
}
