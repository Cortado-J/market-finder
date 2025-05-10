import { format, addDays } from 'date-fns';
import React, { useRef, useEffect } from 'react';
import { DateModeButton } from './DateModeButton'; // Assuming DateModeButton is in the same directory

// Date filter type
export type DateFilter = 'today' | 'tomorrow' | 'day-3' | 'day-4' | 'day-5' | 'day-6' | 'day-7' | 'next-14-days';

interface DateSelectorProps {
  currentDateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  debugMode?: boolean;
}

export function DateSelector({ currentDateFilter, onDateFilterChange, debugMode }: DateSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to the active button if it's out of view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeButton = scrollContainerRef.current.querySelector('.date-button.active') as HTMLElement;
      if (activeButton) {
        const container = scrollContainerRef.current;
        const buttonLeft = activeButton.offsetLeft;
        const buttonWidth = activeButton.offsetWidth;
        const containerScrollLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;

        // Check if the button is not fully visible
        if (buttonLeft < containerScrollLeft || buttonLeft + buttonWidth > containerScrollLeft + containerWidth) {
          // Scroll to make the button visible
          container.scrollTo({
            left: buttonLeft - (containerWidth / 2) + (buttonWidth / 2), // Center the button
            behavior: 'smooth'
          });
        }
      }
    }
  }, [currentDateFilter]); // Rerun when the active filter changes

  return (
    <div className="date-controls-container">
      
      {/* Horizontal scrolling container */}
      <div 
        ref={scrollContainerRef}
        className="date-buttons-strip"
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch', // For smooth scrolling on iOS
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
          touchAction: 'pan-x', // Enable touch panning
          paddingTop: '0.4rem',
          paddingRight: '0.5rem',
          paddingBottom: '0.4rem',
          paddingLeft: '0.5rem',
        }}
      >
        {/* Today button */}
        <DateModeButton
          label={
            <>
              <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Today</span>
              <span style={{ fontSize: '16px', display: 'block' }}>{format(new Date(), 'd')}</span>
            </>
          }
          onClick={() => onDateFilterChange('today')}
          isActive={currentDateFilter === 'today'}
          debugMode={debugMode}
        />
        
        {/* Tomorrow button */}
        <DateModeButton
          label={
            <>
              <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{format(addDays(new Date(), 1), 'EEE')}</span>
              <span style={{ fontSize: '16px', display: 'block' }}>{format(addDays(new Date(), 1), 'd')}</span>
            </>
          }
          onClick={() => onDateFilterChange('tomorrow')}
          isActive={currentDateFilter === 'tomorrow'}
          debugMode={debugMode}
        />
        
        {/* Next 5 days as individual buttons */}
        {Array.from({ length: 5 }).map((_, index) => {
          const dayNum = index + 3;
          const date = addDays(new Date(), index + 2);
          const dayName = format(date, 'EEE');
          const dayOfMonth = date.getDate();
          const filterName = `day-${dayNum}` as DateFilter;
          return (
            <DateModeButton
              key={filterName}
              label={
                <>
                  <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{dayName}</span>
                  <span style={{ fontSize: '16px', display: 'block' }}>{dayOfMonth}</span>
                </>
              }
              onClick={() => onDateFilterChange(filterName)}
              isActive={currentDateFilter === filterName}
              debugMode={debugMode}
            />
          );
        })}
        
        {/* Next 14 days button */}
        <DateModeButton
          label={
            <>
              <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>14 Days</span>
              <span style={{ fontSize: '16px', display: 'block' }}>View</span>
            </>
          }
          onClick={() => onDateFilterChange('next-14-days')}
          isActive={currentDateFilter === 'next-14-days'}
          debugMode={debugMode}
        />
      </div>
    </div>
  );
}
