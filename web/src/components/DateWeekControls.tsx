import React from 'react';
import { cn } from '../lib/utils';
import { DateSelector, DateFilter } from './DateSelector';
import { WeekdaySelector, Weekday } from './WeekdaySelector';

interface DateWeekControlsProps {
  currentWhenMode: 'soon' | 'week';
  currentDateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  selectedWeekdays: Weekday[];
  onWeekdaysChange: (days: Weekday[]) => void;
  debugMode: boolean;
}

export function DateWeekControls({
  currentWhenMode,
  currentDateFilter,
  onDateFilterChange,
  selectedWeekdays,
  onWeekdaysChange,
  debugMode,
}: DateWeekControlsProps) {
  // Debug mode classes
  const mainClass = debugMode ? 'border-2 border-dashed border-red-500 box-border' : '';
  const soonContainerClass = debugMode ? 'border-2 border-lime-500 box-border' : '';
  const weekContainerClass = debugMode ? 'border-2 border-blue-500 box-border' : '';

  return (
    <div 
      className={cn("z-30 bg-gray-800 overflow-hidden", mainClass)}
    >
      {currentWhenMode === 'soon' && (
        <div className={cn("px-4 pt-3 pb-3", soonContainerClass)}>
          <DateSelector 
            currentDateFilter={currentDateFilter}
            onDateFilterChange={onDateFilterChange}
            debugMode={debugMode}
          />
        </div>
      )}
      {currentWhenMode === 'week' && (
        <div className={cn("px-4 pt-3 pb-3", weekContainerClass)}>
          <WeekdaySelector 
            selectedDays={selectedWeekdays}
            onChange={onWeekdaysChange}
            debugMode={debugMode}
          />
        </div>
      )}
    </div>
  );
}
