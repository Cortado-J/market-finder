import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Map } from './components/Map'
import { MarketList } from './components/MarketList'
import { Market } from './types/Market'
import './App.css'

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

  useEffect(() => {
    async function fetchMarkets() {
      try {
        // First get raw markets data with opening_hours
        const { data: rawData, error: rawError } = await supabase
          .from('markets')
          .select('market_id, name, opening_hours')
        
        if (rawError) throw rawError
        console.log('Raw data from markets table:', rawData)
        
        // Create an object mapping market_id to opening_hours
        const openingHoursMap: {[key: number]: string} = {};
        rawData?.forEach((market: any) => {
          openingHoursMap[market.market_id] = market.opening_hours;
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
              location: {
                type: 'Point',
                coordinates: [parseFloat(matches[1]), parseFloat(matches[2])] as [number, number]
              }
            }
            console.log('Market with location:', market.name, 'Opening hours:', transformed.opening_hours)
            return transformed
          }

          // If location is already in GeoJSON format
          return {
            ...market,
            opening_hours: openingHoursMap[market.market_id] || null
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
        <div className="map-container" style={{ height: '400px', marginBottom: '20px' }}>
          <Map
            markets={markets}
            selectedMarket={selectedMarket}
            userLocation={defaultLocation}
            onMarketSelect={setSelectedMarket}
          />
        </div>
        <MarketList
          markets={markets}
          selectedMarket={selectedMarket}
          onMarketSelect={setSelectedMarket}
          userLocation={defaultLocation}
        />
      </div>
    </div>
  )
}

export default App
