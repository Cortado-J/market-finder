import { Market } from '../types/Market'
import { useMemo, useEffect, useState } from 'react'
import { MarketOpening, getUpcomingMarketOpenings } from '../utils/getMarketOpenings'
import { format, parseISO } from 'date-fns'

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
  const [openings, setOpenings] = useState<MarketOpening[]>([]);

  // Fetch upcoming market openings
  useEffect(() => {
    async function fetchOpenings() {
      try {
        console.log('Fetching openings...');
        console.log('Markets with opening_hours:', markets.map(m => ({ id: m.market_id, name: m.name, opening_hours: m.opening_hours })));
        const nextOpenings = await getUpcomingMarketOpenings(14); // Next 2 weeks
        console.log('Got openings:', nextOpenings);
        setOpenings(nextOpenings);
      } catch (error) {
        console.error('Error fetching market openings:', error);
      }
    }
    fetchOpenings();
  }, [markets]);

  useEffect(() => {
    console.log('Current openings state:', openings);
  }, [openings]);

  // Get next opening for each market
  const marketNextOpenings = useMemo(() => {
    console.log('Calculating next openings from:', openings);
    const now = new Date();
    const marketOpenings = new Map<number, MarketOpening>();
    
    for (const opening of openings) {
      const openingDate = parseISO(`${opening.date}T${opening.startTime}`);
      if (openingDate < now) continue;
      
      if (!marketOpenings.has(opening.marketId)) {
        marketOpenings.set(opening.marketId, opening);
      }
    }
    
    return marketOpenings;
  }, [openings]);
  const sortedMarkets = useMemo(() => {
    return [...markets].sort((a, b) => {
      // Get next openings for both markets
      const openingA = marketNextOpenings.get(a.market_id)
      const openingB = marketNextOpenings.get(b.market_id)
      
      // Get coordinates for distance calculation
      const coordsA = getCoordinates(a)
      const coordsB = getCoordinates(b)
      const distA = coordsA ? calculateDistance(userLocation, coordsA) : Infinity
      const distB = coordsB ? calculateDistance(userLocation, coordsB) : Infinity

      // Sort by next opening date first (ignoring time)
      if (openingA?.error && !openingB?.error) return 1
      if (!openingA?.error && openingB?.error) return -1
      if (openingA && openingB && !openingA.error && !openingB.error) {
        const dateA = openingA.date!.split('T')[0]
        const dateB = openingB.date!.split('T')[0]
        if (dateA !== dateB) {
          return dateA < dateB ? -1 : 1
        }
        // If same date, sort by distance
        return distA - distB
      }

      // If no valid openings, sort by distance
      return distA - distB
    })
  }, [markets, userLocation])

  return (
    <div className="space-y-1">
      {sortedMarkets.map(market => (
        <div
          key={market.market_id}
          onClick={() => onMarketSelect(market)}
          className={`w-full text-left px-3 py-2 rounded-md transition-all text-2xl font-sans ${selectedMarket?.market_id === market.market_id ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-200' : 'hover:bg-gray-50'}`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="font-medium truncate mr-4">{market.name}</div>
              {marketNextOpenings.has(market.market_id) && (
                <div className="text-gray-600 truncate shrink-0">
                  {(() => {
                    const opening = marketNextOpenings.get(market.market_id)!;
                    console.log('Market in render:', market.name, 'Opening hours:', market.opening_hours, 'Type:', typeof market.opening_hours);
                    if (opening.error) {
                      return opening.error;
                    }
                    const date = parseISO(opening.date!);
                    return (
                      <>
                        Next: {format(date, 'EEE, MMM d')} {opening.startTime}-{opening.endTime}
                        {market.opening_hours ? (
                          <span className="text-gray-400 ml-4"> ({market.opening_hours})</span>
                        ) : (
                          <span className="text-red-400 ml-4"> (No opening hours)</span>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            {userLocation && (
              <div className="text-gray-500 whitespace-nowrap ml-4 shrink-0">
                {(() => {
                  const coords = getCoordinates(market);
                  if (!coords) return null;
                  const dist = calculateDistance(userLocation, coords);
                  return dist < 1 
                    ? `${Math.round(dist * 1000)}m`
                    : `${dist.toFixed(1)}km`;
                })()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
