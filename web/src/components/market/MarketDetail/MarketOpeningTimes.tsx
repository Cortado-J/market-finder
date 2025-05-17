import { Market } from '../../../types/Market';
import { MarketOpening } from '../../../utils/getMarketOpenings';
import { DetailItem } from './shared/DetailItem';
import { DetailText } from './shared/DetailText';
import { SubsectionWrapper } from './shared/SubsectionWrapper';
import { format, parseISO } from 'date-fns';
import { useMarketOpenings } from '../../../hooks/useMarketOpenings';

interface MarketOpeningTimesProps {
  market: Market;
  schedule?: Record<string, string | string[]> | null;
  isDebugMode?: boolean;
}

export function MarketOpeningTimes({ 
  market,
  schedule, 
  isDebugMode = false 
}: MarketOpeningTimesProps) {
  const { nextOpenings, isLoading, error } = useMarketOpenings(market);

  // Format schedule if available
  const formatSchedule = () => {
    if (!schedule) return 'No schedule available';
    
    try {
      return Object.entries(schedule).map(([day, times]) => {
        if (!times || (Array.isArray(times) && times.length === 0)) {
          return null;
        }
        
        let displayTimes;
        if (Array.isArray(times)) {
          displayTimes = times.join(', ');
        } else if (typeof times === 'string') {
          displayTimes = times;
        } else {
          return null;
        }
        
        return (
          <div key={day} className="flex justify-between">
            <span className="font-medium">{day.charAt(0).toUpperCase() + day.slice(1)}:</span>
            <span>{displayTimes}</span>
          </div>
        );
      }).filter(Boolean);
    } catch (error) {
      console.error('Error formatting schedule:', error);
      return 'Error loading schedule';
    }
  };

  // Format opening time for display
  const formatOpeningTime = (opening: MarketOpening) => {
    if (!opening.date) return 'Date not available';
    
    const dateStr = format(parseISO(opening.date), 'EEEE, MMMM d');
    
    if (opening.startTime && opening.endTime) {
      return `${dateStr} • ${opening.startTime} - ${opening.endTime}`;
    }
    
    return `${dateStr} (Times TBC)`;
  };

  return (
    <div className="space-y-6">
      {/* Regular Schedule */}
      {schedule && Object.keys(schedule).length > 0 && (
        <SubsectionWrapper isDebugMode={isDebugMode}>
          <DetailItem title="Regular Opening Hours" isDebugMode={isDebugMode}>
            <div className="space-y-2">
              {formatSchedule()}
            </div>
          </DetailItem>
        </SubsectionWrapper>
      )}

      {/* Next Dates */}
      <SubsectionWrapper isDebugMode={isDebugMode}>
        <DetailItem title="Upcoming Dates" isDebugMode={isDebugMode}>
          {isLoading ? (
            <DetailText>Loading upcoming dates...</DetailText>
          ) : error ? (
            <DetailText className="text-red-500">
              Error loading upcoming dates: {error.message}
            </DetailText>
          ) : nextOpenings.length > 0 ? (
            <div className="space-y-2">
              {nextOpenings.map((opening, index) => (
                <div 
                  key={index} 
                  className="bg-blue-50 dark:bg-blue-900/30 rounded-md p-2"
                >
                  <DetailText isDebugMode={isDebugMode}>
                    {formatOpeningTime(opening)}
                  </DetailText>
                </div>
              ))}
            </div>
          ) : (
            <DetailText>No upcoming dates scheduled</DetailText>
          )}
        </DetailItem>
      </SubsectionWrapper>
    </div>
  );
}
