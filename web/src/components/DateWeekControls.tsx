import React from 'react';
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
  const mainStyle = debugMode ? { border: '2px dashed red', boxSizing: 'border-box' as 'border-box' } : {};
  const soonContainerStyle = debugMode ? { border: '2px solid limegreen', boxSizing: 'border-box' as 'border-box' } : {};
  const weekContainerStyle = debugMode ? { border: '2px solid blue', boxSizing: 'border-box' as 'border-box' } : {};

  return (
    <div 
      className="z-30 bg-white overflow-hidden"
      style={mainStyle}
    >
      {currentWhenMode === 'soon' && (
        <div 
          className="date-scroll-container px-4 pt-3 pb-3"
          style={soonContainerStyle}
        >
          <DateSelector 
            currentDateFilter={currentDateFilter}
            onDateFilterChange={onDateFilterChange}
            debugMode={debugMode}
          />
        </div>
      )}
      {currentWhenMode === 'week' && (
        <div 
          className="date-scroll-container week-mode-active px-4 pt-3 pb-3"
          style={weekContainerStyle}
        >
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
