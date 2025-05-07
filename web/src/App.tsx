import { useEffect, useState } from 'react'
import { supabase } from './utils/supabase'
import { Map } from './components/Map'
import { MarketList } from './components/MarketList'
import { MarketDetail } from './components/MarketDetail'
import { Market } from './types/Market'
import { getMarketImageUrl } from './utils/imageUtils'
import { MarketOpening, getUpcomingMarketOpenings } from './utils/getMarketOpenings'
import './App.css'

// Date filter type (must match the one in MarketList)
type DateFilter = 'today' | 'tomorrow' | 'day-3' | 'day-4' | 'day-5' | 'day-6' | 'day-7' | 'next-14-days';

// View mode type
type ViewMode = 'list' | 'map' | 'detail';

// Helper function to calculate distance between two coordinates
function calculateDistance(
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number]
): number {
  // Haversine formula for calculating distance between two points
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Helper function to get coordinates from market location
function getCoordinates(market: Market): [number, number] | null {
  if (typeof market.location === 'string') {
    const matches = market.location.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/)
    return matches ? [parseFloat(matches[1]), parseFloat(matches[2])] : null
  }
  return market.location.coordinates
}

// Using shared Supabase client from utils/supabase.ts

// Default location coordinates for BS7 8LZ
const defaultLocation: [number, number] = [-2.5973, 51.4847]

function App() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list') // Default to list view
  const [marketOpenings, setMarketOpenings] = useState<MarketOpening[]>([]);
  // State for preserving date filter selection
  const [currentDateFilter, setCurrentDateFilter] = useState<DateFilter>('today');

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
            // Store the market_ref value
            marketRefMap[market.market_id] = market.market_ref;
            console.log(`Added to marketRefMap: ${market.market_id} => ${market.market_ref}`);
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
              imageUrl: getMarketImageUrl(marketRefMap[market.market_id]),
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
              imageUrl: getMarketImageUrl(marketRefMap[market.market_id]),
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
            imageUrl: getMarketImageUrl(marketRef),
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
  
  // Find next opening for selected market
  const selectedMarketNextOpening = selectedMarket ? 
    marketOpenings.find(opening => opening.marketId === selectedMarket.market_id) : 
    undefined;
  
  if (loading) return <div className="p-4">Loading markets...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>

  return (
    <div className="app">
      <div className="content">
        {/* View toggle button */}
        <div className="flex justify-center my-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-100'}`}
            >
              List View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${viewMode === 'map' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-100'}`}
            >
              Map View
            </button>
          </div>
        </div>

        {/* Conditional rendering based on view mode */}
        {viewMode === 'map' ? (
          <div className="map-container relative" style={{ height: 'calc(100vh - 120px)' }}>
            <Map
              markets={markets}
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
                </div>
              </div>
            )}
          </div>
        ) : viewMode === 'detail' && selectedMarket ? (
          <MarketDetail 
            market={selectedMarket} 
            onBack={handleBackToList}
            marketNextOpening={selectedMarketNextOpening}
          />
        ) : (
          <MarketList
            markets={markets}
            selectedMarket={selectedMarket}
            onMarketSelect={handleMarketSelect}
            userLocation={defaultLocation}
            initialDateFilter={currentDateFilter}
            onDateFilterChange={setCurrentDateFilter}
          />
        )}
      </div>
    </div>
  )
}

export default App
