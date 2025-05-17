import { useState, useEffect, useMemo } from 'react'
import { cn } from '../lib/utils'
import { format } from 'date-fns'
import { Market } from '../types/Market'
import { MarketOpening, getUpcomingMarketOpenings } from '../utils/getMarketOpenings'
import { getCategoryIconUrl, getMarketImageUrl } from '../utils/imageUtils'
import { humanizeOpeningHours, humanizeOpeningForDay } from '../utils/scheduleUtils';
// Import location utilities
import { calculateDistance, getCoordinates } from '../utils/locationUtils'
import { OpenOn } from './NextOpening';

interface MarketListProps {
  markets: Market[]
  selectedMarket: Market | null
  onMarketSelect: (market: Market) => void
  userLocation: [number, number] // [longitude, latitude]
  // Two-letter code for selected day in Soon mode (e.g. 'Tu', 'Sa')
  selectedDayCode?: string
  // Is the app in week mode
  isWeekMode?: boolean
  // Debug mode for showing raw schedule data
  debugMode?: boolean
  style?: React.CSSProperties
}

export function MarketList({
  markets,
  selectedMarket,
  onMarketSelect,
  userLocation,
  selectedDayCode,
  isWeekMode = false,
  debugMode = false,
  style
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

  // Handle image error by hiding the image and showing the fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    // Hide the image
    target.style.display = 'none';
    // Show the fallback div that's already in the DOM
    const fallbackEl = target.nextElementSibling as HTMLElement;
    if (fallbackEl) {
      fallbackEl.style.display = 'flex';
    }
  };

  return (
    <div className={cn("space-y-6 p-4 pb-20 font-sans", style?.toString())}>
      {/* Navigation controls moved to App.tsx */}
      
      {/* Market list - styled with light blue boxes */}
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {sortedMarkets.length === 0 ? (
          <div className="text-gray-500 py-8 text-center">No markets found for this time period</div>
        ) : (
          sortedMarkets.map(market => {
            // Get coordinates for distance calculation
            const coords = getCoordinates(market);
            const distance = coords ? calculateDistance(userLocation, coords) : null;
            
            // Get next opening for this market
            const nextOpening = market.market_id ? marketNextOpenings.get(market.market_id) : undefined;

            return (
              <div
                key={market.market_id}
                className={cn(
                  "p-4 bg-blue-50 dark:bg-gray-800 rounded-lg shadow-sm relative cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors",
                  selectedMarket?.market_id === market.market_id && "ring-2 ring-blue-500"
                )}
                onClick={() => onMarketSelect(market)}
              >
                <div className="flex items-start">
                  <div className="market-image-container w-24 h-24 md:w-28 md:h-28 ml-3 mr-4 rounded-md overflow-hidden flex-shrink-0 bg-blue-100 dark:bg-gray-700 flex items-center justify-center relative">
                    {market.market_ref ? (
                      <img 
                        src={getMarketImageUrl(market.market_ref)}
                        alt={market.name}
                        className="object-contain object-center w-full h-full p-1"
                        onError={handleImageError}
                      />
                    ) : null}
                    {/* Fallback to initials if no image or image fails to load */}
                    <div 
                      className={cn(
                        "absolute inset-0 w-full h-full items-center justify-center text-blue-800 dark:text-blue-200 font-bold text-xs",
                        market.market_ref ? "hidden" : "flex"
                      )}
                    >
                      {market.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    {/* Title only */}
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="market-name text-lg font-semibold text-gray-900 dark:text-gray-100 break-words leading-normal">{market.name}</h3>
                    </div>
                    
                    {/* Open On (Soon mode) or Next Open (All modes) - hidden in Week mode */}
                    {selectedDayCode ? (
                      <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                        <span className="font-bold">{humanizeOpeningForDay(market.opening_hours || '', selectedDayCode)}</span>
                      </p>
                    ) : !isWeekMode && nextOpening && (
                      <p className="mt-1 inline-block">
                        <span className="font-bold inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <OpenOn opening={nextOpening} className="font-bold" />
                        </span>
                      </p>
                    )}
                    
                    {/* Regular opening hours */}
                    {market.opening_hours && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>Opening hours:</span> {humanizeOpeningHours(market.opening_hours)}
                      </p>
                    )}
                    
                    {/* Debug mode: Show raw schedule */}
                    {debugMode && market.opening_hours && (
                      <p className="text-xs mt-1 bg-yellow-100 text-yellow-800 p-1 rounded">
                        <code>Raw: {market.opening_hours}</code>
                      </p>
                    )}
                    
                    {/* Address and distance (moved to bottom) - combined into one text element */}
                    {market.address && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {market.address} {distance && `(${Math.round(distance * 0.621371)} miles)`}
                      </p>
                    )}
                    
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
