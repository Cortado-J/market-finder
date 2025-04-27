import { Market } from '../types/Market'
import { useMemo } from 'react'

interface MarketListProps {
  markets: Market[]
  selectedMarket: Market | null
  onMarketSelect: (market: Market) => void
  userLocation: [number, number] // [longitude, latitude]
}

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

function getCoordinates(market: Market): [number, number] | null {
  if (typeof market.location === 'string') {
    const matches = market.location.match(/POINT\\(([-\\d.]+)\\s+([-\\d.]+)\\)/)
    return matches ? [parseFloat(matches[1]), parseFloat(matches[2])] : null
  }
  return market.location.coordinates
}

export function MarketList({ markets, selectedMarket, onMarketSelect, userLocation }: MarketListProps) {
  const sortedMarkets = useMemo(() => {
    return [...markets].sort((a, b) => {
      const coordsA = getCoordinates(a)
      const coordsB = getCoordinates(b)
      
      if (!coordsA) return 1
      if (!coordsB) return -1
      
      const distA = calculateDistance(userLocation, coordsA)
      const distB = calculateDistance(userLocation, coordsB)
      
      return distA - distB // Increasing order (nearest first)
    })
  }, [markets, userLocation])

  return (
    <div className="space-y-1">
      {sortedMarkets.map((market, index) => (
        <button
          key={market.market_id}
          onClick={() => onMarketSelect(market)}
          className={`w-full text-left px-3 py-2 rounded-md transition-all
            ${selectedMarket?.market_id === market.market_id
              ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-200'
              : 'hover:bg-gray-50'
            }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-red-500 text-white text-sm font-bold rounded-full">
                {index + 1}
              </span>
              <span className="font-medium">{market.name}</span>
            </div>
            {userLocation && (
              <span className="text-sm text-gray-500">
                {(() => {
                  const coords = getCoordinates(market)
                  if (!coords) return null
                  const dist = calculateDistance(userLocation, coords)
                  return dist < 1 
                    ? `${Math.round(dist * 1000)}m`
                    : `${dist.toFixed(1)}km`
                })()}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
