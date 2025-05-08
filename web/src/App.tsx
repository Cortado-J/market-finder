import { useEffect, useState, useMemo } from 'react'
import { supabase } from './utils/supabase'
import { Map } from './components/Map'
import { MarketList } from './components/MarketList'
import { MarketDetail } from './components/MarketDetail'
import { Market } from './types/Market'
import { getMarketImageUrl } from './utils/imageUtils'
import { MarketOpening, getUpcomingMarketOpenings } from './utils/getMarketOpenings'
import { WhenMode, WhenModeToggle } from './components/WhenModeToggle'
import { Weekday, WeekdaySelector } from './components/WeekdaySelector'
import { format, addDays } from 'date-fns'
import { calculateDistance, getCoordinates } from './utils/locationUtils'
import './App.css'

// Date filter type (must match the one in MarketList)
type DateFilter = 'today' | 'tomorrow' | 'day-3' | 'day-4' | 'day-5' | 'day-6' | 'day-7' | 'next-14-days';

// View mode type
type ViewMode = 'list' | 'map' | 'detail';

// Default location coordinates for BS7 8LZ
const defaultLocation: [number, number] = [-2.5973, 51.4847]

function App() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list') // Default to list view
  const [marketOpenings, setMarketOpenings] = useState<MarketOpening[]>([]);
  // State for preserving filter selections
  const [currentDateFilter, setCurrentDateFilter] = useState<DateFilter>('today');
  const [currentWhenMode, setCurrentWhenMode] = useState<WhenMode>('soon');
  const [selectedWeekdays, setSelectedWeekdays] = useState<Weekday[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        // First get raw markets data with opening_hours
        const { data: rawData, error: rawError } = await supabase
          .from('markets')
          .select('market_id, name, opening_hours, market_ref, categories')
        
        if (rawError) throw rawError
        console.log('Raw data from markets table:', rawData)
        
        // Create objects mapping market_id to opening_hours and market_ref
        const openingHoursMap: {[key: number]: string} = {};
        const marketRefMap: {[key: number]: string} = {};
        const categoriesMap: {[key: number]: string[]} = {};
        
        console.log('Raw market data structure:', rawData?.[0]);
        
        rawData?.forEach((market: any) => {
          openingHoursMap[market.market_id] = market.opening_hours;
          console.log(`Market ${market.name} (ID: ${market.market_id}) raw market_ref:`, market.market_ref);
          
          if (market.market_ref) {
            // Store the market_ref value and clean it up
            const cleanRef = market.market_ref.trim().replace(/--/g, '-');
            marketRefMap[market.market_id] = cleanRef;
            console.log(`Added to marketRefMap: ${market.market_id} => ${cleanRef} (original: ${market.market_ref})`);
            // Log the image URL that would be generated
            console.log(`Image URL would be: ${getMarketImageUrl(cleanRef)}`);
          } else {
            console.log(`No market_ref for market: ${market.name}`);
          }
          categoriesMap[market.market_id] = market.categories || [];
        });
        
        console.log('Final marketRefMap:', marketRefMap);
        
        console.log('Opening hours map:', openingHoursMap);
        
        // Get market data from RPC function for locations
        const { data: marketsData, error } = await supabase.rpc('get_markets_with_locations');
        if (error) throw error
        
        console.log('Raw market data:', marketsData)
        console.log('First market:', marketsData?.[0])
        console.log('Market fields:', marketsData?.[0] ? Object.keys(marketsData[0]) : [])
        
        // Transform PostGIS point to GeoJSON format
        const marketsWithLocation = (marketsData || []).map((market: any) => {
          const categories = categoriesMap[market.market_id] || [];
          if (!market.location) {
            console.warn(`Market ${market.name} has no location data`)
            const result = {
              market_id: market.market_id,
              name: market.name,
              description: market.description,
              address: market.address,
              website_url: market.website_url,
              opening_hours: openingHoursMap[market.market_id] || null,
              market_ref: marketRefMap[market.market_id] || null,
              imageUrl: getMarketImageUrl(marketRefMap[market.market_id] || ''),
              categories,
              location: {
                type: 'Point',
                coordinates: [-2.5879, 51.4545] as [number, number] // Default to Bristol center
              }
            }
            console.log('Market with no location:', market.name, 'Opening hours:', result.opening_hours)
            return result
          }

          // Handle string location (PostGIS format)
          if (typeof market.location === 'string') {
            const matches = market.location.match(/POINT\(([-\d.-]+)\s+([-\d.-]+)\)/)
            if (!matches) {
              console.warn(`Invalid location format for market ${market.name}:`, market.location)
              return {
                ...market,
                location: {
                  type: 'Point',
                  coordinates: [-2.5879, 51.4545] as [number, number] // Default to Bristol center
                }
              }
            }
            
            const lng = parseFloat(matches[1])
            const lat = parseFloat(matches[2])
            
            // Validate coordinates
            if (isNaN(lng) || isNaN(lat) || !isFinite(lng) || !isFinite(lat)) {
              console.warn(`Invalid coordinates for market ${market.name}:`, { lng, lat })
              return {
                ...market,
                location: {
                  type: 'Point',
                  coordinates: [-2.5879, 51.4545] as [number, number] // Default to Bristol center
                }
              }
            }

            const transformed = {
              market_id: market.market_id,
              name: market.name,
              description: market.description,
              address: market.address,
              website_url: market.website_url,
              opening_hours: openingHoursMap[market.market_id] || null,
              market_ref: marketRefMap[market.market_id] || null,
              imageUrl: getMarketImageUrl(marketRefMap[market.market_id] || ''),
              categories,
              location: {
                type: 'Point',
                coordinates: [parseFloat(matches[1]), parseFloat(matches[2])] as [number, number]
              }
            }
            console.log('Market with location:', market.name, 'Opening hours:', transformed.opening_hours)
            return transformed
          }

          // If location is already in GeoJSON format
          const marketRef = marketRefMap[market.market_id] || null;
          return {
            ...market,
            opening_hours: openingHoursMap[market.market_id] || null,
            market_ref: marketRef,
            imageUrl: getMarketImageUrl(marketRef || ''),
            categories: categoriesMap[market.market_id] || []
          }
        })
        
        console.log('First transformed market:', marketsWithLocation[0])
        console.log('Transformed market fields:', Object.keys(marketsWithLocation[0]))
        setMarkets(marketsWithLocation)
      } catch (e) {
        console.error('Error fetching markets:', e)
        setError(e instanceof Error ? e.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchMarkets()
    
    // Fetch upcoming market openings
    async function fetchOpenings() {
      try {
        // Get openings for the next 14 days
        const nextOpenings = await getUpcomingMarketOpenings(14);
        setMarketOpenings(nextOpenings);
      } catch (error) {
        console.error('Error fetching market openings:', error);
      }
    }
    
    fetchOpenings();
  }, [])

  // State for preserving list scroll position
  const [listScrollPosition, setListScrollPosition] = useState(0);
  // State for preserving previous view mode (list or map)
  const [previousViewMode, setPreviousViewMode] = useState<'list' | 'map'>('list');
  
  // Handle market selection
  const handleMarketSelect = (market: Market) => {
    // Save current scroll position before navigating to detail
    if (viewMode === 'list') {
      const listContainer = document.querySelector('.space-y-4.overflow-y-auto');
      if (listContainer) {
        setListScrollPosition(listContainer.scrollTop);
      }
    }
    
    // Save current view mode (list or map)
    if (viewMode === 'list' || viewMode === 'map') {
      setPreviousViewMode(viewMode);
    }
    
    setSelectedMarket(market);
    setViewMode('detail');
  };
  
  // Handle back button in detail view
  const handleBackToList = () => {
    // Return to previous view mode (list or map)
    setViewMode(previousViewMode);
    
    // Restore scroll position after render
    if (previousViewMode === 'list') {
      setTimeout(() => {
        const listContainer = document.querySelector('.space-y-4.overflow-y-auto');
        if (listContainer) {
          listContainer.scrollTop = listScrollPosition;
        }
      }, 100); // Increased timeout to ensure DOM is ready
    }
  };
  
  // Listen for toggle-view-mode events from the MarketList component
  useEffect(() => {
    const handleToggleViewMode = (event: CustomEvent) => {
      const mode = event.detail as ViewMode;
      if (mode === 'list' || mode === 'map') {
        setViewMode(mode);
      }
    };
    
    window.addEventListener('toggle-view-mode', handleToggleViewMode as EventListener);
    
    return () => {
      window.removeEventListener('toggle-view-mode', handleToggleViewMode as EventListener);
    };
  }, []);
  
  // Find next opening for selected market
  const selectedMarketNextOpening = selectedMarket ? 
    marketOpenings.find(opening => opening.marketId === selectedMarket.market_id) : 
    undefined;

  // For debugging - log the markets array
  useEffect(() => {
    console.log('Markets array:', markets);
    console.log('Current when mode:', currentWhenMode);
    console.log('Current date filter:', currentDateFilter);
    console.log('Selected weekdays:', selectedWeekdays);
  }, [markets, currentWhenMode, currentDateFilter, selectedWeekdays]);

  // For debugging - log the raw markets array
  useEffect(() => {
    console.log('Raw markets array:', markets);
    console.log('Raw markets length:', markets.length);
  }, [markets]);

  // Filter markets based on date filter and weekdays
  const filteredMarkets = useMemo(() => {
    // For debugging
    console.log('Filtering markets:', markets.length);
    console.log('Current when mode:', currentWhenMode);
    console.log('Current date filter:', currentDateFilter);
    console.log('Selected weekdays:', selectedWeekdays);
    
    if (currentWhenMode === 'soon') {
      // Filter by date
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Create dates for day-3 through day-7
      const nextDays = [];
      for (let i = 2; i <= 6; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        nextDays.push(date);
      }
      
      // Get the date for the selected filter
      let filterDate: Date | null = null;
      
      switch (currentDateFilter) {
        case 'today':
          filterDate = today;
          break;
        case 'tomorrow':
          filterDate = tomorrow;
          break;
        case 'day-3':
          filterDate = nextDays[0];
          break;
        case 'day-4':
          filterDate = nextDays[1];
          break;
        case 'day-5':
          filterDate = nextDays[2];
          break;
        case 'day-6':
          filterDate = nextDays[3];
          break;
        case 'day-7':
          filterDate = nextDays[4];
          break;
        case 'next-14-days':
          // For 'next-14-days', we'll just show all markets
          return markets;
      }
      
      if (!filterDate) return markets;
      
      const dayOfWeek = format(filterDate, 'EEEE').toLowerCase();
      console.log('Filtering by day of week:', dayOfWeek);
      
      // Filter markets by specific date in Soon mode
      const filterDateStr = format(filterDate, 'yyyy-MM-dd');
      return markets.filter(market =>
        marketOpenings.some(opening =>
          opening.marketId === market.market_id &&
          opening.date === filterDateStr
        )
      );
    } else {
      // Week mode - filter by selected weekdays using parsed market openings
      if (selectedWeekdays.length === 0) return [];
      if (selectedWeekdays.length === 7) return markets;

      // Map weekday strings to numeric DOW (0 = Sunday ... 6 = Saturday)
      const weekdayToDOW: { [key in Weekday]: number } = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };

      const selectedDayNumbers = selectedWeekdays.map(day => weekdayToDOW[day]);

      // Collect market IDs with openings on selected days
      const marketIdsWithSelectedDays = new Set<number>();
      marketOpenings.forEach(opening => {
        if (opening.dow !== undefined && selectedDayNumbers.includes(opening.dow)) {
          marketIdsWithSelectedDays.add(opening.marketId);
        }
      });

      return markets.filter(market => marketIdsWithSelectedDays.has(market.market_id));
    }
  }, [markets, currentWhenMode, currentDateFilter, selectedWeekdays, marketOpenings]);
  
  if (loading) return <div className="p-4">Loading markets...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>

  return (
    <div className="app">
      {/* Fixed header with navigation controls */}
      {viewMode !== 'detail' && (
        <div className="fixed top-0 left-0 right-0 z-10 bg-white p-4 shadow-md">
          {/* Top row: Soon/Week and List/Map toggles */}
          <div className="flex justify-between items-center button-row-gap" style={{marginBottom: '40px'}}>
            {/* Soon/Week Toggle */}
            <WhenModeToggle
              initialMode={currentWhenMode}
              onModeChange={setCurrentWhenMode}
            />
            
            {/* List/Map Toggle */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`filter-button ${viewMode === 'list' ? 'active' : ''}`}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`filter-button ${viewMode === 'map' ? 'active' : ''}`}
              >
                Map
              </button>
            </div>
          </div>
          
          {/* Soon Mode: Date filter controls */}
          {currentWhenMode === 'soon' && (
            <div className="overflow-x-auto pb-2">
              <div className="flex space-x-3 min-w-max pb-2">
                <button 
                  onClick={() => setCurrentDateFilter('today')}
                  className={`filter-button ${currentDateFilter === 'today' ? 'active' : ''}`}
                >
                  Today
                </button>
                <button 
                  onClick={() => setCurrentDateFilter('tomorrow')}
                  className={`filter-button ${currentDateFilter === 'tomorrow' ? 'active' : ''}`}
                >
                  Tomorrow
                </button>
                
                {/* Next 5 days as individual buttons */}
                {Array.from({ length: 5 }).map((_, index) => {
                  const dayNum = index + 3; // day-3, day-4, etc.
                  const date = addDays(new Date(), index + 2); // +2 because we start from day after tomorrow
                  const dayName = format(date, 'EEE');
                  const dayOfMonth = date.getDate();
                  const filterName = `day-${dayNum}`;
                  
                  return (
                    <button 
                      key={filterName}
                      onClick={() => setCurrentDateFilter(filterName as DateFilter)}
                      className={`filter-button ${currentDateFilter === filterName ? 'active' : ''}`}
                    >
                      {dayName} {dayOfMonth}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => setCurrentDateFilter('next-14-days')}
                  className={`filter-button ${currentDateFilter === 'next-14-days' ? 'active' : ''}`}
                >
                  Next 14 Days
                </button>
              </div>
            </div>
          )}
          
          {/* Week Mode: Weekday selector */}
          {currentWhenMode === 'week' && (
            <div className="pb-4">
              <WeekdaySelector 
                selectedDays={selectedWeekdays}
                onChange={setSelectedWeekdays}
              />
            </div>
          )}
        </div>
      )}

      {/* Content area with appropriate padding for the fixed header */}
      <div className="content" style={{ 
        paddingTop: viewMode !== 'detail' ? 
          (currentWhenMode === 'soon' ? '160px' : '160px') : '0px'
      }}>
        {/* Conditional rendering based on view mode */}
        {viewMode === 'map' ? (
          <div className="map-container relative" style={{ height: 'calc(100vh - 160px)' }}>
            <Map
              markets={filteredMarkets}
              selectedMarket={selectedMarket}
              userLocation={defaultLocation}
              onMarketSelect={handleMarketSelect}
            />
            {selectedMarket && (
              <div className="absolute bottom-4 left-4 right-4 market-item selected z-10">
                <div>
                  {/* Market name with distance */}
                  <div className="flex items-center">
                    <h3 className="market-name">{selectedMarket.name}</h3>
                    {(() => {
                      const coords = getCoordinates(selectedMarket);
                      if (!coords) return null;
                      const distance = calculateDistance(defaultLocation, coords);
                      const distanceText = `(${Math.round(distance * 0.621371)} miles)`;
                      return <span className="market-distance">{distanceText}</span>;
                    })()}
                  </div>
                  
                  {/* Address */}
                  <p className="mt-2">{selectedMarket.address}</p>
                  
                  {/* Opening hours */}
                  {selectedMarket.opening_hours && (
                    <p className="text-sm mt-1 opacity-90">Regular hours: {selectedMarket.opening_hours}</p>
                  )}
                  
                  {/* Next opening */}
                  {selectedMarketNextOpening && selectedMarketNextOpening.date && (
                    <p className="text-sm mt-1 text-green-600">
                      Next open: {format(new Date(selectedMarketNextOpening.date), 'EEE, MMM d')}
                    </p>
                  )}
                  
                  {/* View details button */}
                  <button 
                    className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={() => handleMarketSelect(selectedMarket)}
                  >
                    View Market Details
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <MarketList 
            markets={filteredMarkets}
            selectedMarket={selectedMarket}
            onMarketSelect={handleMarketSelect}
            userLocation={defaultLocation}
          />
        ) : (
          <MarketDetail 
            market={selectedMarket!}
            onBack={handleBackToList}
          />
        )}
      </div>
    </div>
  )
}

export default App
