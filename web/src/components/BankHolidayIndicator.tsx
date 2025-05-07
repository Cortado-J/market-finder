// No React import needed with modern JSX transform
import { BankHoliday } from '../types/BankHoliday';

interface BankHolidayIndicatorProps {
  holiday: BankHoliday | null;
  className?: string;
}

/**
 * Displays a bank holiday indicator - a dark orange circle with "BH" text
 */
export function BankHolidayIndicator({ holiday, className = '' }: BankHolidayIndicatorProps) {
  if (!holiday) return null;
  
  return (
    <div 
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-700 text-white text-xs font-bold ${className}`}
      title={`Bank Holiday: ${holiday.title}`}
    >
      BH
    </div>
  );
}
