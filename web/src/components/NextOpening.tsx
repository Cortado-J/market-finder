import { MarketOpening } from '../utils/getMarketOpenings';
import { format, parseISO } from 'date-fns';

// Re-export the type for use in other components
export type { MarketOpening };

interface OpenOnProps {
  opening: MarketOpening;
  className?: string;
  weekMode?: boolean;
}

export function OpenOn({ opening, className = '', weekMode = false }: OpenOnProps) {
  if (!opening || opening.error || !opening.date) return null;
  // Format date always from the ISO string
  const dateText = format(parseISO(opening.date), 'EEE, MMM d');
  let content = dateText;
  if (opening.startTime && opening.endTime) {
    content += `, ${opening.startTime} to ${opening.endTime}`;
  }
  return <p className={`font-bold ${className}`}>{!weekMode ? 'Open on ' : ''}{content}</p>;
}

// Legacy component name for backwards compatibility
export const NextOpening = OpenOn;
