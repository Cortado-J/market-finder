import { useEffect, useState, useMemo } from 'react';
// Supabase client is now used in the hook
import { MarketDetail } from './components/MarketDetail';
import { Market } from './types/Market';
// getMarketImageUrl is now used in the hook
// MarketOpening, getUpcomingMarketOpenings are now used in the hook
import { WhenMode } from './components/WhenModeToggle';
import { Weekday } from './components/WeekdaySelector'; // Weekday type is needed for the hook call
import { DateFilter } from './components/DateSelector'; // DateFilter type is needed for the hook call
import { AppHeader } from './components/AppHeader';
import { DateWeekControls } from './components/DateWeekControls';
import { MainContent } from './components/MainContent';
import { format, addDays } from 'date-fns';
// calculateDistance, getCoordinates are not directly used here anymore, but might be by child components
import { useMarketData } from './hooks/useMarketData'; // Import the new hook

// Default location coordinates for BS7 8LZ
const defaultLocation: [number, number] = [-2.5973, 51.4847];

// View mode type
export type ViewMode = 'list' | 'map' | 'detail';

function App() {
  // States managed by App.tsx directly
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentDateFilter, setCurrentDateFilter] = useState<DateFilter>('today');
  const [currentWhenMode, setCurrentWhenMode] = useState<WhenMode>('soon');
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState<Weekday[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

  // Fetching and filtering logic moved to useMarketData hook
  const {
    markets, // All markets, might not be needed directly in App.tsx now
    filteredMarkets,
    marketOpenings,
    loading,
    error
  } = useMarketData({
    currentWhenMode,
    currentDateFilter,
    selectedWeekdays
  });

  // State for preserving list scroll position
  const [listScrollPosition, setListScrollPosition] = useState(0);
  // State for preserving previous view mode (list or map)
  const [previousViewMode, setPreviousViewMode] = useState<'list' | 'map'>('list');
  
  const handleMarketSelect = (market: Market | null) => {
    if (market) {
      if (viewMode === 'list') {
        const listContainer = document.querySelector('.space-y-4.overflow-y-auto');
        if (listContainer) {
          setListScrollPosition(listContainer.scrollTop);
        }
      }
      if (viewMode === 'list' || viewMode === 'map') {
        setPreviousViewMode(viewMode);
      }
      setSelectedMarket(market);
      setViewMode('detail');
    } else {
      // If null is passed (e.g. deselect from map), go back to previous list/map view
      setSelectedMarket(null);
      setViewMode(previousViewMode);
    }
  };
  
  const handleBackToList = () => {
    setViewMode(previousViewMode);
    if (previousViewMode === 'list') {
      setTimeout(() => {
        const listContainer = document.querySelector('.space-y-4.overflow-y-auto');
        if (listContainer) {
          listContainer.scrollTop = listScrollPosition;
        }
      }, 100);
    }
  };
  
  // Determine two-letter day code for Soon mode (can stay in App.tsx)
  const selectedDayCode = useMemo(() => {
    if (currentWhenMode !== 'soon') return undefined;
    let date: Date = new Date();
    if (currentDateFilter === 'today') {
      // use today
    } else if (currentDateFilter === 'tomorrow') {
      date = addDays(date, 1);
    } else if (currentDateFilter.startsWith('day-')) {
      const n = parseInt(currentDateFilter.split('-')[1] || '0', 10);
      date = addDays(date, n - 1); // n-1 because day-3 is 2 days from today
    }
    return format(date, 'EE');
  }, [currentWhenMode, currentDateFilter]);

  // Derive selectedMarketNextOpening based on selectedMarket and marketOpenings
  const selectedMarketNextOpening = useMemo(() => {
    if (!selectedMarket || !marketOpenings) return undefined;
    // Find the first opening for the selected market
    // This logic might need to be more sophisticated based on current date if needed
    return marketOpenings.find(op => op.marketId === selectedMarket.market_id);
  }, [selectedMarket, marketOpenings]);

  if (loading) return <div className="p-4">Loading markets...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {viewMode === 'detail' ? (
        <MarketDetail 
          market={selectedMarket!} 
          onBack={handleBackToList} 
          // Assuming MarketDetail is structured to fill available space, or add style={{ flexGrow: 1 }}
        />
      ) : (
        // This div groups Header, DateControls, and MainContent area
        // It's a flex column and grows to fill space within App's flex column.
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <AppHeader
            debugMode={debugMode}
            setDebugMode={setDebugMode}
            currentWhenMode={currentWhenMode}
            setCurrentWhenMode={setCurrentWhenMode}
            viewMode={viewMode}
            setViewMode={(mode) => setViewMode(mode as 'list' | 'map')} 
          />
          <DateWeekControls
            currentWhenMode={currentWhenMode}
            currentDateFilter={currentDateFilter}
            onDateFilterChange={setCurrentDateFilter}
            selectedWeekdays={selectedWeekdays}
            onWeekdaysChange={setSelectedWeekdays}
            debugMode={debugMode}
          />
          {/* This div is meant to take the rest of the space */}
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <MainContent 
              viewMode={viewMode}
              filteredMarkets={filteredMarkets}
              selectedMarket={selectedMarket}
              defaultLocation={defaultLocation}
              handleMarketSelect={handleMarketSelect}
              selectedMarketNextOpening={selectedMarketNextOpening}
              currentWhenMode={currentWhenMode}
              selectedDayCode={selectedDayCode}
              debugMode={debugMode}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
