import React from 'react';
import { DateSelector, DateFilter } from './DateSelector';
import { WeekdaySelector, Weekday } from './WeekdaySelector';

interface DateWeekControlsProps {
  currentWhenMode: 'soon' | 'week';
  currentDateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  selectedWeekdays: Weekday[];
  onWeekdaysChange: (days: Weekday[]) => void;
}

export function DateWeekControls({
  currentWhenMode,
  currentDateFilter,
  onDateFilterChange,
  selectedWeekdays,
  onWeekdaysChange,
}: DateWeekControlsProps) {
  return (
    <div className="z-30 bg-white border-b border-gray-200">
      {currentWhenMode === 'soon' && (
        <DateSelector 
          currentDateFilter={currentDateFilter}
          onDateFilterChange={onDateFilterChange}
        />
      )}
      {currentWhenMode === 'week' && (
        <div className="weekday-controls-container px-4 pt-2">
          <WeekdaySelector 
            selectedDays={selectedWeekdays}
            onChange={onWeekdaysChange}
          />
        </div>
      )}
    </div>
  );
}
