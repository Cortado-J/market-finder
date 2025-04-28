import { Market } from '../types/Market'
import { useMemo, useEffect, useState } from 'react'
import { MarketOpening, getUpcomingMarketOpenings } from '../utils/getMarketOpenings'
import { format, parseISO, addDays, isWithinInterval } from 'date-fns'

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

// Date filter options
type DateFilter = 'today' | 'tomorrow' | 'day-3' | 'day-4' | 'day-5' | 'day-6' | 'day-7' | 'next-14-days';

export function MarketList({ markets, selectedMarket, onMarketSelect, userLocation }: MarketListProps) {
  const [openings, setOpenings] = useState<MarketOpening[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today'); // Default to today

  // Fetch upcoming market openings
  useEffect(() => {
    async function fetchOpenings() {
      try {
        console.log('Fetching openings...');
        console.log('Markets with opening_hours:', markets.map(m => ({ id: m.market_id, name: m.name, opening_hours: m.opening_hours })));
        // Get openings for the next 14 days
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

  // We no longer need the marketAdditionalDays since we're not showing the "Also open on" text
  
  // Group markets by all days they're open, not just the next opening
  const marketsByDateCategory = useMemo(() => {
    const today: Market[] = [];
    const tomorrow: Market[] = [];
    const day3: Market[] = [];
    const day4: Market[] = [];
    const day5: Market[] = [];
    const day6: Market[] = [];
    const day7: Market[] = [];
    const next14Days: Set<Market> = new Set(); // Use Set to avoid duplicates
    const noSchedule: Market[] = [];
    
    const now = new Date();
    const todayDate = now;
    const tomorrowDate = addDays(now, 1);
    const day3Date = addDays(now, 2); // Day after tomorrow
    const day4Date = addDays(now, 3);
    const day5Date = addDays(now, 4);
    const day6Date = addDays(now, 5);
    const day7Date = addDays(now, 6);
    const twoWeeksLater = addDays(now, 14);
    
    console.log('Today date:', format(todayDate, 'yyyy-MM-dd'));
    console.log('Tomorrow date:', format(tomorrowDate, 'yyyy-MM-dd'));
    
    // Group all openings by market_id
    const marketOpeningsMap = new Map<number, MarketOpening[]>();
    for (const opening of openings) {
      if (opening.error) continue;
      
      const marketOpenings = marketOpeningsMap.get(opening.marketId) || [];
      marketOpenings.push(opening);
      marketOpeningsMap.set(opening.marketId, marketOpenings);
    }
    
    // Process each market and its openings
    for (const market of sortedMarkets) {
      const marketOpenings = marketOpeningsMap.get(market.market_id) || [];
      
      if (marketOpenings.length === 0) {
        noSchedule.push(market);
        continue;
      }
      
      let addedToAnyCategory = false;
      
      // Check each opening and add market to appropriate categories
      for (const opening of marketOpenings) {
        const openingDate = parseISO(opening.date!);
        
        console.log('Market:', market.name, 'Opening date:', format(openingDate, 'yyyy-MM-dd'), 'Opening time:', opening.startTime);
        
        // Skip past openings - but only if they're before the start of today
        const todayStart = new Date(todayDate);
        todayStart.setHours(0, 0, 0, 0);
        if (openingDate < todayStart) {
          console.log('Skipping past opening for', market.name);
          continue;
        }
        
        // Add to all relevant day categories
        const openingDateStr = format(openingDate, 'yyyy-MM-dd');
        const todayDateStr = format(todayDate, 'yyyy-MM-dd');
        const tomorrowDateStr = format(tomorrowDate, 'yyyy-MM-dd');
        const day3DateStr = format(day3Date, 'yyyy-MM-dd');
        const day4DateStr = format(day4Date, 'yyyy-MM-dd');
        const day5DateStr = format(day5Date, 'yyyy-MM-dd');
        const day6DateStr = format(day6Date, 'yyyy-MM-dd');
        const day7DateStr = format(day7Date, 'yyyy-MM-dd');
        
        console.log('Comparing:', openingDateStr, 'to today:', todayDateStr, 'match?', openingDateStr === todayDateStr);
        
        if (openingDateStr === todayDateStr) {
          console.log('Adding', market.name, 'to TODAY');
          today.push(market);
          next14Days.add(market);
          addedToAnyCategory = true;
        } else if (openingDateStr === tomorrowDateStr) {
          console.log('Adding', market.name, 'to TOMORROW');
          tomorrow.push(market);
          next14Days.add(market);
          addedToAnyCategory = true;
        } else if (openingDateStr === day3DateStr) {
          console.log('Adding', market.name, 'to DAY 3');
          day3.push(market);
          next14Days.add(market);
          addedToAnyCategory = true;
        } else if (openingDateStr === day4DateStr) {
          console.log('Adding', market.name, 'to DAY 4');
          day4.push(market);
          next14Days.add(market);
          addedToAnyCategory = true;
        } else if (openingDateStr === day5DateStr) {
          console.log('Adding', market.name, 'to DAY 5');
          day5.push(market);
          next14Days.add(market);
          addedToAnyCategory = true;
        } else if (openingDateStr === day6DateStr) {
          console.log('Adding', market.name, 'to DAY 6');
          day6.push(market);
          next14Days.add(market);
          addedToAnyCategory = true;
        } else if (openingDateStr === day7DateStr) {
          console.log('Adding', market.name, 'to DAY 7');
          day7.push(market);
          next14Days.add(market);
          addedToAnyCategory = true;
        } else if (isWithinInterval(openingDate, { start: todayStart, end: twoWeeksLater })) {
          console.log('Adding', market.name, 'to NEXT 14 DAYS');
          next14Days.add(market);
          addedToAnyCategory = true;
        }
      }
      
      // If market wasn't added to any category, add to noSchedule
      if (!addedToAnyCategory) {
        noSchedule.push(market);
      }
    }
    
    return { 
      today, 
      tomorrow, 
      day3, 
      day4, 
      day5, 
      day6, 
      day7, 
      next14Days: Array.from(next14Days), // Convert Set back to array
      noSchedule 
    };
  }, [sortedMarkets, openings]);
  
  // Filter markets based on selected date filter
  const filteredMarkets = useMemo(() => {
    console.log('Filtering markets by:', dateFilter);
    console.log('Markets by category:', {
      today: marketsByDateCategory.today.length,
      tomorrow: marketsByDateCategory.tomorrow.length,
      day3: marketsByDateCategory.day3.length,
      day4: marketsByDateCategory.day4.length,
      day5: marketsByDateCategory.day5.length,
      day6: marketsByDateCategory.day6.length,
      day7: marketsByDateCategory.day7.length,
      next14Days: marketsByDateCategory.next14Days.length
    });
    
    let result;
    switch (dateFilter) {
      case 'today':
        result = marketsByDateCategory.today;
        break;
      case 'tomorrow':
        result = marketsByDateCategory.tomorrow;
        break;
      case 'day-3':
        result = marketsByDateCategory.day3;
        break;
      case 'day-4':
        result = marketsByDateCategory.day4;
        break;
      case 'day-5':
        result = marketsByDateCategory.day5;
        break;
      case 'day-6':
        result = marketsByDateCategory.day6;
        break;
      case 'day-7':
        result = marketsByDateCategory.day7;
        break;
      case 'next-14-days':
        result = [...marketsByDateCategory.today, ...marketsByDateCategory.tomorrow, 
                ...marketsByDateCategory.day3, ...marketsByDateCategory.day4, 
                ...marketsByDateCategory.day5, ...marketsByDateCategory.day6, 
                ...marketsByDateCategory.day7, ...marketsByDateCategory.next14Days];
        break;
      default:
        result = sortedMarkets;
    }
    
    console.log('Filtered markets count:', result.length);
    return result;
  }, [dateFilter, marketsByDateCategory, sortedMarkets]);

  // Generate day names for filter buttons with ordinal dates
  const dayNames = useMemo(() => {
    const now = new Date();
    
    // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    // Format date with ordinal suffix
    const formatDateWithOrdinal = (date: Date) => {
      const day = date.getDate();
      return `${format(date, 'EEE')} (${day}${getOrdinalSuffix(day)})`;
    };
    
    return [
      { filter: 'day-3', date: addDays(now, 2), label: formatDateWithOrdinal(addDays(now, 2)) },
      { filter: 'day-4', date: addDays(now, 3), label: formatDateWithOrdinal(addDays(now, 3)) },
      { filter: 'day-5', date: addDays(now, 4), label: formatDateWithOrdinal(addDays(now, 4)) },
      { filter: 'day-6', date: addDays(now, 5), label: formatDateWithOrdinal(addDays(now, 5)) },
      { filter: 'day-7', date: addDays(now, 6), label: formatDateWithOrdinal(addDays(now, 6)) },
    ];
  }, []);
  
  // Determine if the current filter is for a single day or multiple days
  const isSingleDayFilter = useMemo(() => {
    return ['today', 'tomorrow', 'day-3', 'day-4', 'day-5', 'day-6', 'day-7'].includes(dateFilter);
  }, [dateFilter]);
  
  return (
    <div className="space-y-4 p-4 font-sans">
      {/* Date filter controls - scrollable horizontally */}
      <div className="overflow-x-auto pb-4 border-b border-gray-200">
        <div className="flex space-x-3 min-w-max pb-2">
          <button 
            onClick={() => setDateFilter('today')}
            className={`filter-button ${dateFilter === 'today' ? 'active' : ''}`}
          >
            Today
          </button>
          <button 
            onClick={() => setDateFilter('tomorrow')}
            className={`filter-button ${dateFilter === 'tomorrow' ? 'active' : ''}`}
          >
            Tomorrow
          </button>
          
          {/* Next 5 days as individual buttons */}
          {dayNames.map(day => {
            return (
              <button 
                key={day.filter}
                onClick={() => setDateFilter(day.filter as DateFilter)}
                className={`filter-button ${dateFilter === day.filter ? 'active' : ''}`}
              >
                {day.label}
              </button>
            );
          })}
          
          <button 
            onClick={() => setDateFilter('next-14-days')}
            className={`filter-button ${dateFilter === 'next-14-days' ? 'active' : ''}`}
          >
            Next 14 Days
          </button>
        </div>
      </div>
      
      {/* Market list - styled with light blue boxes */}
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {filteredMarkets.length === 0 ? (
          <div className="text-gray-500 py-8 text-center">No markets found for this time period</div>
        ) : (
          filteredMarkets.map(market => {
            // Calculate distance for each market
            const coords = userLocation ? getCoordinates(market) : null;
            const distance = coords && userLocation ? calculateDistance(userLocation, coords) : null;
            // Convert to miles and show as whole numbers
            const distanceText = distance ? 
              `(${Math.round(distance * 0.621371)} miles)` : '';
            
            return (
              <div
                key={market.market_id}
                onClick={() => onMarketSelect(market)}
                className={`market-item ${selectedMarket?.market_id === market.market_id ? 'selected' : ''}`}
              >
                <div>
                  {/* Market name in larger font with distance */}
                  <div className="flex items-center">
                    <h3 className="market-name">{market.name}</h3>
                    {distanceText && (
                      <span className="market-distance">{distanceText}</span>
                    )}
                  </div>
                  
                  {/* Opening time based on filter type */}
                  {marketNextOpenings.has(market.market_id) && (
                    <div className="mt-0">
                      {(() => {
                        const opening = marketNextOpenings.get(market.market_id)!;
                        if (opening.error) {
                          return <p className="text-red-200">{opening.error}</p>;
                        }
                        
                        const date = parseISO(opening.date!);
                        
                        if (isSingleDayFilter) {
                          // For single day filter, always show the selected date
                          let displayDate = date;
                          
                          // Get the date based on the selected filter
                          if (dateFilter === 'today') {
                            displayDate = new Date();
                          } else if (dateFilter === 'tomorrow') {
                            displayDate = addDays(new Date(), 1);
                          } else if (dateFilter.startsWith('day-')) {
                            const dayOffset = parseInt(dateFilter.replace('day-', ''));
                            displayDate = addDays(new Date(), dayOffset - 1);
                          }
                          
                          return (
                            <p>Opening times on {format(displayDate, 'EEE d MMM')}: {opening.startTime}-{opening.endTime}</p>
                          );
                        } else {
                          // For multiple day filter, show first opening in the period
                          return (
                            <p>First open in this period on {format(date, 'EEE d MMM')}: {opening.startTime}-{opening.endTime}</p>
                          );
                        }
                      })()}
                    </div>
                  )}
                  
                  {/* Regular opening hours */}
                  {market.opening_hours && (
                    <p className="text-sm mt-1 opacity-90">Regular hours: {market.opening_hours}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
