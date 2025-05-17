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
    <div className="w-full">
      {/* Horizontal scrolling container */}
      <div
        ref={scrollContainerRef}
        className="flex flex-nowrap overflow-x-auto touch-pan-x py-1.5 px-2 -mx-2 scrollbar-hide bg-white dark:bg-gray-800"
      >
        {/* Today button */}
        <DateModeButton
          label={
              <>
                  <span className="font-bold block mb-1">Today</span>
                  <span className="text-base block">{format(new Date(), 'd')}</span>
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
                  <span className="font-bold block mb-1">{format(addDays(new Date(), 1), 'EEE')}</span>
                  <span className="text-base block">{format(addDays(new Date(), 1), 'd')}</span>
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
                  <span className="font-bold block mb-1">{dayName}</span>
                  <span className="text-base block">{dayOfMonth}</span>
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
                  <span className="font-bold block mb-1">14 Days</span>
                  <span className="text-base block">View</span>
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
