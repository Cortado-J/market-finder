import { useState, useEffect } from 'react';
import { DateModeButton } from './DateModeButton'; // Assuming DateModeButton is in the same directory

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface WeekdaySelectorProps {
  selectedDays: Weekday[];
  onChange: (days: Weekday[]) => void;
  debugMode?: boolean;
}

/**
 * Component for selecting multiple days of the week
 */
export function WeekdaySelector({ selectedDays = [], onChange, debugMode }: WeekdaySelectorProps) {
  const [selected, setSelected] = useState<Weekday[]>(selectedDays);

  // Update parent component when selection changes
  useEffect(() => {
    onChange(selected);
  }, [selected, onChange]);

  const weekdays: { id: Weekday; label: string }[] = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' },
  ];

  // Check if all days are selected
  const allSelected = weekdays.every(day => selected.includes(day.id));

  // Toggle a specific day with the requested behavior
  const toggleDay = (day: Weekday) => {
    if (allSelected) {
      // If all is selected and user clicks a day, select only that day
      setSelected([day]);
    } else if (selected.includes(day)) {
      // If the day is already selected, toggle it off
      setSelected(selected.filter(d => d !== day));
    } else {
      // Otherwise, toggle it on
      setSelected([...selected, day]);
    }
  };

  // Toggle all days on/off
  const toggleAll = () => {
    if (allSelected) {
      // If all are selected, deselect all
      setSelected([]);
    } else {
      // Otherwise, select all
      setSelected(weekdays.map(day => day.id));
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 py-1.5 text-gray-900 dark:text-gray-100">
        {/* All button */}
        <DateModeButton
          label="All"
          onClick={toggleAll}
          isActive={allSelected}
          debugMode={debugMode}
        />
        
        {/* Day buttons */}
        {weekdays.map(day => (
          <DateModeButton
            key={day.id}
            label={day.label}
            onClick={() => toggleDay(day.id)}
            isActive={selected.includes(day.id)}
            debugMode={debugMode}
          />
        ))}
      </div>
    </div>
  );
}
