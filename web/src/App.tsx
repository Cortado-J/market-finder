import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Map } from './components/Map'
import { Market } from './types/Market'
import './App.css'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

function App() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const { data, error } = await supabase
          .rpc('get_markets_with_locations')
        
        if (error) throw error

        console.log('Raw market data:', JSON.stringify(data, null, 2))
        console.log('Number of markets:', data?.length || 0)

        // Transform PostGIS point to GeoJSON format
        const marketsWithLocation = (data || []).map(market => {
          // Debug log for each market's location
          console.log(`Market ${market.name} location:`, market.location)
          
          if (!market.location) {
            console.warn(`Market ${market.name} has no location data`)
            return {
              ...market,
              location: {
                type: 'Point',
                coordinates: [-2.5879, 51.4545] as [number, number] // Default to Bristol center
              }
            }
          }

          // Handle string location (PostGIS format)
          if (typeof market.location === 'string') {
            const matches = market.location.match(/POINT\(([\d.-]+)\s+([\d.-]+)\)/)
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

            return {
              ...market,
              location: {
                type: 'Point',
                coordinates: [lng, lat] as [number, number]
              }
            }
          }

          // If location is already in GeoJSON format
          return market
        })
        
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bristol Markets ({markets.length})</h1>
      
      {/* Map Section */}
      <div className="mb-8">
        <Map 
          markets={markets} 
          onMarketSelect={setSelectedMarket}
        />
      </div>

      {/* Market List Section */}
      <div className="space-y-4">
        {markets.map(market => (
          <div 
            key={market.market_id} 
            className={`border rounded-lg p-4 shadow bg-white transition-colors ${
              selectedMarket?.market_id === market.market_id 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : ''
            }`}
            onClick={() => setSelectedMarket(market)}
          >
            <h2 className="text-xl font-semibold">{market.name}</h2>
            {market.description && (
              <p className="mt-2 text-gray-600">{market.description}</p>
            )}
            {market.address && (
              <p className="mt-2 text-gray-500">{market.address}</p>
            )}
            {market.website_url && (
              <a
                href={market.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-blue-500 hover:underline block"
              >
                Visit website
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
