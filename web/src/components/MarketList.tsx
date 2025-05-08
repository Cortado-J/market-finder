import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { Market } from '../types/Market'
import { MarketOpening, getUpcomingMarketOpenings } from '../utils/getMarketOpenings'
import { getCategoryIconUrl, getMarketImageUrl } from '../utils/imageUtils'
// Import location utilities
import { calculateDistance, getCoordinates } from '../utils/locationUtils'

interface MarketListProps {
  markets: Market[]
  selectedMarket: Market | null
  onMarketSelect: (market: Market) => void
  userLocation: [number, number] // [longitude, latitude]
}

export function MarketList({
  markets,
  selectedMarket,
  onMarketSelect,
  userLocation
}: MarketListProps) {
  const [openings, setOpenings] = useState<MarketOpening[]>([]);

  // Fetch upcoming market openings
  useEffect(() => {
    const fetchOpenings = async () => {
      try {
        const result = await getUpcomingMarketOpenings();
        setOpenings(result);
      } catch (error) {
        console.error('Error fetching market openings:', error);
      }
    };
    
    fetchOpenings();
  }, []);

  // Get the next opening for each market with formatted date for display
  const marketNextOpenings = useMemo(() => {
    const now = new Date();
    const marketOpenings = new Map<number, MarketOpening & { formattedDate?: string }>();
    
    for (const opening of openings) {
      if (!opening.date) continue;
      
      const openingDate = new Date(opening.date);
      if (openingDate < now) continue;
      
      if (!marketOpenings.has(opening.marketId)) {
        // Add formatted date for display
        const enhancedOpening = {
          ...opening,
          formattedDate: format(openingDate, 'EEE d MMM')
        };
        marketOpenings.set(opening.marketId, enhancedOpening);
      }
    }
    
    return marketOpenings;
  }, [openings]);

  // Sort markets by distance
  const sortedMarkets = useMemo(() => {
    return [...markets].sort((a, b) => {
      // Get coordinates for distance calculation
      const coordsA = getCoordinates(a);
      const coordsB = getCoordinates(b);
      const distA = coordsA ? calculateDistance(userLocation, coordsA) : Infinity;
      const distB = coordsB ? calculateDistance(userLocation, coordsB) : Infinity;

      // Sort by distance
      return distA - distB;
    });
  }, [markets, userLocation]);

  // Debug log to check if markets are being received and sorted correctly
  console.log('MarketList - received markets:', markets.length);
  console.log('MarketList - sorted markets:', sortedMarkets.length);
  
  // Debug useEffect to log market references and image URLs
  useEffect(() => {
    // Log the first few markets for debugging
    const marketsToLog = markets.slice(0, 3);
    marketsToLog.forEach(market => {
      console.log('Market debugging info:');
      console.log('- Name:', market.name);
      console.log('- Market ref:', market.market_ref);
      console.log('- Image URL:', getMarketImageUrl(market.market_ref || null));
    });
  }, [markets]);

  return (
    <div className="space-y-6 p-4 pb-20 font-sans"> 
      {/* Navigation controls moved to App.tsx */}
      
      {/* Market list - styled with light blue boxes */}
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {markets.length === 0 ? (
          <div className="text-gray-500 py-8 text-center">No markets found for this time period</div>
        ) : (
          markets.map(market => {
            // Get coordinates for distance calculation
            const coords = getCoordinates(market);
            const distance = coords ? calculateDistance(userLocation, coords) : null;
            
            // Get next opening for this market
            const nextOpening = market.market_id ? marketNextOpenings.get(market.market_id) : undefined;

            return (
              <div
                key={market.market_id}
                className={`market-item p-4 bg-blue-50 rounded-lg shadow-sm relative ${selectedMarket?.market_id === market.market_id ? 'selected' : ''}`}
                onClick={() => onMarketSelect(market)}
              >
                <div className="flex items-start">
                  <div className="market-image-container w-16 h-16 mr-3 rounded-md overflow-hidden flex-shrink-0 bg-blue-100 flex items-center justify-center relative">
                    {market.market_ref ? (
                      <img 
                        src={getMarketImageUrl(market.market_ref)}
                        alt={market.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide the image and show initials instead
                          e.currentTarget.style.display = 'none';
                          // Show the fallback div that's already in the DOM
                          const fallbackEl = e.currentTarget.nextElementSibling;
                          if (fallbackEl) {
                            (fallbackEl as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    {/* Fallback to initials if no image or image fails to load */}
                    <div 
                      className="absolute inset-0 w-full h-full flex items-center justify-center text-blue-800 font-bold text-sm"
                      style={{ display: market.market_ref ? 'none' : 'flex' }}
                    >
                      {market.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    {nextOpening && !nextOpening.error && nextOpening.formattedDate && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Next open: {nextOpening.formattedDate}
                      </span>
                    )}
                    <h3 className="market-name text-lg font-semibold text-blue-900 break-words">{market.name}</h3>
                    {distance && <span className="market-distance ml-2 text-sm text-gray-500">({Math.round(distance * 0.621371)} miles)</span>}
                    
                    {/* Categories */}
                    {(market.categories ?? []).length > 0 && (
                      <div className="flex space-x-1 mt-1">
                        {(market.categories ?? []).map(category => (
                          <img
                            key={category}
                            src={getCategoryIconUrl(category)}
                            alt={category}
                            className="w-6 h-6"
                            onError={(e) => { 
                              (e.target as HTMLImageElement).style.display = 'none'; 
                            }}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Address */}
                    <p className="text-gray-600 mt-1">{market.address}</p>
                    
                    {/* Distance */}
                    {distance !== null && (
                      <span className="text-xs text-gray-500">
                        {Math.round(distance * 0.621371)} miles away
                      </span>
                    )}
                    
                    {/* Opening hours */}
                    {market.opening_hours && (
                      <p className="text-sm mt-1 text-gray-500">{market.opening_hours}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
