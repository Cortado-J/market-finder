import { useEffect, useState, useMemo } from 'react';
// Supabase client is now used in the hook
import { MarketDetail } from './components/market/MarketDetail';
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

import { supabase } from './utils/supabase'; // Import supabase client
// For debugging purposes, expose supabase to the window
if (import.meta.env.DEV) { // Only do this in development
  (window as any).supabase = supabase;
}

const VITE_ADMIN_USER_ID = import.meta.env.VITE_ADMIN_USER_ID as string | undefined;

import { useMarketData } from './hooks/useMarketData'; // Import the new hook
import { BuildInfo } from './components/BuildInfo'; // Import BuildInfo from its new location
import { MarketEditForm } from './components/MarketEditForm'; // Import the new form
import Login from './components/Login'; // Added Login component
import { Session } from '@supabase/supabase-js'; // Added for type safety
import TailwindDirectTest from './TailwindDirectTest'; // Import direct style test component
import TailwindVerification from './TailwindVerification'; // Import Tailwind verification component

// Default location coordinates for BS7 8LZ
const defaultLocation: [number, number] = [-2.5973, 51.4847];

// View mode type
export type ViewMode = 'list' | 'map' | 'detail' | 'editDetail' | 'login'; // All possible view modes
type MainViewMode = 'list' | 'map' | 'detail' | 'login'; // View modes for the main content

function App() {
  // States managed by App.tsx directly
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  // Cast viewMode to MainViewMode when needed for components that don't need editDetail
  const mainViewMode: MainViewMode = viewMode === 'editDetail' ? 'detail' : viewMode;
  
  // For header, we only want list or map view
  const headerViewMode = viewMode === 'list' || viewMode === 'map' ? viewMode : 'list';
  const [currentDateFilter, setCurrentDateFilter] = useState<DateFilter>('today');
  const [currentWhenMode, setCurrentWhenMode] = useState<WhenMode>('soon');
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState<Weekday[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
  const [session, setSession] = useState<Session | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetching and filtering logic moved to useMarketData hook
  const {
    markets, // All markets, might not be needed directly in App.tsx now
    filteredMarkets,
    marketOpenings,
    loading,
    error,
    triggerRefetchMarkets, // Get the refetch trigger
  } = useMarketData({
    currentWhenMode,
    currentDateFilter,
    selectedWeekdays
  });

  // State for preserving list scroll position
  const [listScrollPosition, setListScrollPosition] = useState(0);
  // State for preserving previous view mode (list or map)
  const [previousViewMode, setPreviousViewMode] = useState<'list' | 'map' | 'detail'>('list');

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
      setViewMode(previousViewMode as 'list' | 'map');
    }
  };

  // Handle mode changes with transition
  const handleWhenModeChange = (mode: WhenMode) => {
    setIsTransitioning(true);
    // Use requestAnimationFrame to ensure the state update is batched
    requestAnimationFrame(() => {
      setCurrentWhenMode(mode);
      setIsTransitioning(false);
    });
  };

  // Handle date filter changes with transition
  const handleDateFilterChange = (filter: DateFilter) => {
    setIsTransitioning(true);
    requestAnimationFrame(() => {
      setCurrentDateFilter(filter);
      setIsTransitioning(false);
    });
  };

  // Handle weekday changes with transition
  const handleWeekdaysChange = (weekdays: Weekday[]) => {
    setIsTransitioning(true);
    requestAnimationFrame(() => {
      setSelectedWeekdays(weekdays);
      setIsTransitioning(false);
    });
  };

  const handleBackToList = () => {
    setViewMode(previousViewMode as 'list' | 'map'); // Ensure it goes to list or map
    if (previousViewMode === 'list') {
      setTimeout(() => {
        const listContainer = document.querySelector('.space-y-4.overflow-y-auto');
        if (listContainer) {
          listContainer.scrollTop = listScrollPosition;
        }
      }, 100);
    }
  };

  const handleGoToEditMarket = (market: Market) => {
    if (!session) {
      setViewMode('login'); // Redirect to login if not authenticated
    } else {
      setSelectedMarket(market);
      setViewMode('editDetail');
    }
  };

  const handleCancelEdit = () => {
    setViewMode('detail'); // Go back to the detail view
  };

  const handleSaveMarket = async (updatedMarketData: Partial<Market>) => {
    console.log('Attempting to save market data:', updatedMarketData);

    if (!updatedMarketData.market_id) {
      console.error('Market ID is missing. Cannot save.');
      alert('Error: Market ID is missing. Cannot save.');
      return;
    }

    const { market_id, ...dataToSave } = updatedMarketData;

    console.log('Data being sent to Supabase for update:', JSON.stringify(dataToSave));

    try {
      const { data: updateData, error: supabaseError } = await supabase
        .from('markets')
        .update(dataToSave)
        .eq('market_id', market_id)
        .select();

      if (supabaseError || !updateData || updateData.length === 0) {
        console.error('Error updating market or no data returned:', supabaseError, 'Updated Data:', updateData);
        let alertMessage = 'Save Failed. ';
        if (supabaseError) {
          alertMessage += supabaseError.message;
        } else {
          alertMessage += 'The record could not be updated, possibly due to permissions.';
        }
        alert(alertMessage);
        setViewMode('detail'); 
        return; 
      }

      console.log('Market data saved successfully. Response data:', updateData);
      triggerRefetchMarkets(); 

      if (selectedMarket && market_id === selectedMarket.market_id) {
        setSelectedMarket(prev => {
          if (!prev) return null; 
          return { ...prev, ...(updateData[0] || dataToSave) }; 
        });
      }
      setViewMode('detail'); 
    } catch (err) {
      console.error('Unexpected error during save:', err);
      alert('An unexpected error occurred while saving. Please try again.');
      setViewMode('detail');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      alert('Error logging out: ' + error.message);
    } else {
      // Session will be set to null by onAuthStateChange, which will trigger UI updates.
      // No need to explicitly setViewMode here as onAuthStateChange handles SIGNED_OUT
      console.log('Logged out successfully');
    }
  };

  const handleLogin = () => {
    setViewMode('login');
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

  // Memoize the main content to prevent unnecessary re-renders
  const mainContent = useMemo(() => {
    // Only show map or list view in the main content area
    if (mainViewMode !== 'list' && mainViewMode !== 'map') {
      return null;
    }
    
    return (
      <MainContent
        viewMode={mainViewMode}
        filteredMarkets={filteredMarkets}
        selectedMarket={selectedMarket}
        defaultLocation={defaultLocation}
        handleMarketSelect={handleMarketSelect}
        selectedMarketNextOpening={selectedMarketNextOpening}
        currentWhenMode={currentWhenMode}
        selectedDayCode={selectedDayCode}
        debugMode={debugMode}
      />
    );
  }, [
    mainViewMode,
    filteredMarkets,
    selectedMarket,
    defaultLocation,
    handleMarketSelect,
    selectedMarketNextOpening,
    currentWhenMode,
    selectedDayCode,
    debugMode
  ]);

  // Memoize the date/week controls
  const dateWeekControls = useMemo(() => (
    <DateWeekControls
      currentWhenMode={currentWhenMode}
      currentDateFilter={currentDateFilter}
      onDateFilterChange={handleDateFilterChange}
      selectedWeekdays={selectedWeekdays}
      onWeekdaysChange={handleWeekdaysChange}
      debugMode={debugMode}
    />
  ), [
    currentWhenMode, 
    currentDateFilter, 
    selectedWeekdays, 
    debugMode
  ]);

  // Effect for Supabase auth state changes
  useEffect(() => {
    // Get current session on initial load
    supabase.auth.getSession().then(({ data: { session: currentSession }}) => {
      setSession(currentSession);
    });

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log(`Supabase auth event: ${event}`, newSession); // For debugging
        setSession(newSession); // Update session state

        // Handle navigation based on auth events
        if (event === 'SIGNED_IN') {
          // If user signs in and they are on the login page, navigate them to the list view.
          setViewMode(prevViewMode => (prevViewMode === 'login' ? 'list' : prevViewMode));
        } else if (event === 'SIGNED_OUT') {
          // If user signs out, and they are on a page that requires auth (e.g., 'editDetail'),
          // navigate them to a public page (e.g., 'list').
          setViewMode(prevViewMode => (prevViewMode === 'editDetail' ? 'list' : prevViewMode));
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [setViewMode]); // setViewMode is stable and ensures the effect uses the latest setter

  // Render Login view if viewMode is 'login'
  // Enable dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Check if we should show Tailwind test components
  const showTailwindTests = import.meta.env.VITE_SHOW_TAILWIND_TESTS === 'true';

  if (viewMode === 'login') {
    return <Login />;
  }

  if (loading) return <div className="p-4">Loading markets...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="app flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Test Components - Only shown when VITE_SHOW_TAILWIND_TESTS=true */}
      {showTailwindTests && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-4">
          <TailwindDirectTest />
          <TailwindVerification />
        </div>
      )}
      {viewMode === 'detail' && selectedMarket ? (
        <MarketDetail
          market={selectedMarket}
          onBack={handleBackToList}
          onEdit={session ? handleGoToEditMarket : undefined}
          isDebugMode={debugMode}
          session={session}
          adminUserId={VITE_ADMIN_USER_ID}
        />
      ) : viewMode === 'editDetail' && selectedMarket ? (
        <MarketEditForm
          market={selectedMarket}
          onSave={handleSaveMarket}
          onCancel={handleCancelEdit}
        />
      ) : (
        // This div groups Header, DateControls, and MainContent area
        // It's a flex column and grows to fill space within App's flex column.
        <div className="flex flex-col h-screen bg-gray-900">
          <div className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-75' : 'opacity-100'}`}>
            <AppHeader
              debugMode={debugMode}
              setDebugMode={setDebugMode}
              currentWhenMode={currentWhenMode}
              setCurrentWhenMode={handleWhenModeChange}
              viewMode={headerViewMode}
              setViewMode={(mode) => {
                // Only update view mode if it's a valid header view mode
                if (mode === 'list' || mode === 'map') {
                  setViewMode(mode);
                }
              }}
              session={session}
              onLogout={handleLogout}
              onLogin={handleLogin}
            />
            {/* Date/Week Controls */}
            {dateWeekControls}
          </div>
          {/* Main Content - outside transition div to prevent layout shifts */}
          <div className="flex-1">
            {mainContent}
          </div>
        </div>
      )}
      <BuildInfo isDebugMode={debugMode} /> {/* Render BuildInfo here */}
    </div>
  );
}

export default App;
