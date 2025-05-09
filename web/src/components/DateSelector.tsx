import { format, addDays } from 'date-fns';
import React from 'react';

// Date filter type
export type DateFilter = 'today' | 'tomorrow' | 'day-3' | 'day-4' | 'day-5' | 'day-6' | 'day-7' | 'next-14-days';

interface DateSelectorProps {
  currentDateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
}

export function DateSelector({ currentDateFilter, onDateFilterChange }: DateSelectorProps) {
  return (
    <div className="date-controls-container px-4 pt-0 mt-1">
      {/* Mobile scroll indicator */}
      <div style={{ textAlign: 'right', fontSize: '12px', color: '#888', marginBottom: '4px' }}>
        Swipe for more dates →
      </div>
      
      {/* Horizontal scrolling container */}
      <div 
        className="date-buttons-strip"
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          paddingBottom: '8px',
          width: '100%',
          msOverflowStyle: 'none', /* Hide scrollbar in IE and Edge */
          scrollbarWidth: 'none', /* Hide scrollbar in Firefox */
          touchAction: 'pan-x', /* Enable horizontal panning gestures */
          cursor: 'grab'
        }}
      >
        {/* Today button */}
        <button 
          onClick={() => onDateFilterChange('today')}
          className={`date-button ${currentDateFilter === 'today' ? 'active' : ''}`}
          style={{ 
            flex: '0 0 auto',
            margin: '0 4px',
            padding: '8px 4px',
            height: '60px',
            width: '65px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            border: currentDateFilter === 'today' ? '1px solid #007bff' : '1px solid #ddd',
            scrollSnapAlign: 'start'
          }}
        >
          <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Today</span>
          <span style={{ fontSize: '16px', display: 'block' }}>{format(new Date(), 'd')}</span>
        </button>
        
        {/* Tomorrow button */}
        <button 
          onClick={() => onDateFilterChange('tomorrow')}
          className={`date-button ${currentDateFilter === 'tomorrow' ? 'active' : ''}`}
          style={{ 
            flex: '0 0 auto',
            margin: '0 4px',
            padding: '8px 4px',
            height: '60px',
            width: '65px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            border: currentDateFilter === 'tomorrow' ? '1px solid #007bff' : '1px solid #ddd',
            scrollSnapAlign: 'start'
          }}
        >
          <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{format(addDays(new Date(), 1), 'EEE')}</span>
          <span style={{ fontSize: '16px', display: 'block' }}>{format(addDays(new Date(), 1), 'd')}</span>
        </button>
        
        {/* Next 5 days as individual buttons */}
        {Array.from({ length: 5 }).map((_, index) => {
          const dayNum = index + 3; // day-3, day-4, etc.
          const date = addDays(new Date(), index + 2); // +2 because we start from day after tomorrow
          const dayName = format(date, 'EEE');
          const dayOfMonth = date.getDate();
          const filterName = `day-${dayNum}` as DateFilter;
          
          return (
            <button 
              key={filterName}
              onClick={() => onDateFilterChange(filterName)}
              className={`date-button ${currentDateFilter === filterName ? 'active' : ''}`}
              style={{ 
                flex: '0 0 auto',
                margin: '0 4px',
                padding: '8px 4px',
                height: '60px',
                width: '65px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                border: currentDateFilter === filterName ? '1px solid #007bff' : '1px solid #ddd',
                scrollSnapAlign: 'start'
              }}
            >
              <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{dayName}</span>
              <span style={{ fontSize: '16px', display: 'block' }}>{dayOfMonth}</span>
            </button>
          );
        })}
        
        {/* Next 14 days button */}
        <button 
          onClick={() => onDateFilterChange('next-14-days')}
          className={`date-button ${currentDateFilter === 'next-14-days' ? 'active' : ''}`}
          style={{ 
            flex: '0 0 auto',
            margin: '0 4px',
            padding: '8px 4px',
            height: '60px',
            width: '65px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            border: currentDateFilter === 'next-14-days' ? '1px solid #007bff' : '1px solid #ddd',
            scrollSnapAlign: 'start'
          }}
        >
          <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Next</span>
          <span style={{ fontSize: '16px', display: 'block' }}>14</span>
        </button>
      </div>
    </div>
  );
}
