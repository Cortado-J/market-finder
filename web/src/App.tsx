import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseKey)

const supabase = createClient(supabaseUrl, supabaseKey)

// Market type definition
interface Market {
  market_id: number
  name: string
  description: string | null
  address: string | null
  website_url: string | null
}

function App() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMarkets() {
      console.log('Fetching markets...')
      try {
        // Test the connection first
        const { data: testData, error: testError } = await supabase
          .from('markets')
          .select('count')
          .single()
        
        console.log('Connection test:', { testData, testError })

        // Fetch the actual data
        const { data, error } = await supabase
          .from('markets')
          .select('market_id, name, description, address, website_url')
          .order('name')
        
        console.log('Received data:', data)
        console.log('Received error:', error)
        
        if (error) throw error
        setMarkets(data || [])
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bristol Markets ({markets.length})</h1>
      {markets.length === 0 ? (
        <div className="text-gray-600">No markets found</div>
      ) : (
        <div className="space-y-4">
          {markets.map(market => (
            <div key={market.market_id} className="border rounded-lg p-4 shadow bg-white">
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
      )}
    </div>
  )
}

export default App
