import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Map } from './components/Map'
import { MarketList } from './components/MarketList'
import { Market } from './types/Market'
import { getMarketImageUrl } from './utils/imageUtils'
import './App.css'

// View mode type
type ViewMode = 'list' | 'map';

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

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Default location coordinates for BS7 8LZ
const defaultLocation: [number, number] = [-2.5973, 51.4847]

function App() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list') // Default to list view

  useEffect(() => {
    async function fetchMarkets() {
      try {
        // First get raw markets data with opening_hours
        const { data: rawData, error: rawError } = await supabase
          .from('markets')
          .select('market_id, name, opening_hours, market_ref')
        
        if (rawError) throw rawError
        console.log('Raw data from markets table:', rawData)
        
        // Create objects mapping market_id to opening_hours and market_ref
        const openingHoursMap: {[key: number]: string} = {};
        const marketRefMap: {[key: number]: string} = {};
        rawData?.forEach((market: any) => {
          openingHoursMap[market.market_id] = market.opening_hours;
          if (market.market_ref) {
            // Store the market_ref value
            marketRefMap[market.market_id] = market.market_ref;
            console.log(`Market ${market.name} has ref: ${market.market_ref}`);
          }
        });
        
        console.log('Opening hours map:', openingHoursMap);
        
        // Get market data from RPC function for locations
        const { data: marketsData, error } = await supabase.rpc('get_markets_with_locations');
        if (error) throw error
        
        console.log('Raw market data:', marketsData)
        console.log('First market:', marketsData?.[0])
        console.log('Market fields:', marketsData?.[0] ? Object.keys(marketsData[0]) : [])
        
        // Transform PostGIS point to GeoJSON format
        const marketsWithLocation = (marketsData || []).map((market: any) => {
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
              imageUrl: getMarketImageUrl(supabaseUrl, marketRefMap[market.market_id]),
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
              imageUrl: getMarketImageUrl(supabaseUrl, marketRefMap[market.market_id]),
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
            imageUrl: getMarketImageUrl(supabaseUrl, marketRef)
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
  }, [])

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
              onMarketSelect={setSelectedMarket}
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
        ) : (
          <MarketList
            markets={markets}
            selectedMarket={selectedMarket}
            onMarketSelect={setSelectedMarket}
            userLocation={defaultLocation}
          />
        )}
      </div>
    </div>
  )
}

export default App
