import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { Market } from '../types/Market';
import { MarketOpening, getUpcomingMarketOpenings } from '../utils/getMarketOpenings';
import { getMarketImageUrl } from '../utils/imageUtils';
import { DateFilter } from '../components/DateSelector'; // Assuming DateFilter type is exported
import { WhenMode } from '../components/WhenModeToggle'; // Assuming WhenMode type is exported
import { Weekday } from '../components/WeekdaySelector'; // Assuming Weekday type is exported
import { format } from 'date-fns';

interface UseMarketDataProps {
  currentWhenMode: WhenMode;
  currentDateFilter: DateFilter;
  selectedWeekdays: Weekday[];
}

// Cache for markets and openings data
let cachedMarkets: Market[] | null = null;
let cachedMarketOpenings: MarketOpening[] | null = null;

// Time when data was last fetched
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export function useMarketData({
  currentWhenMode,
  currentDateFilter,
  selectedWeekdays,
}: UseMarketDataProps) {
  const [markets, setMarkets] = useState<Market[]>(cachedMarkets || []);
  const [marketOpenings, setMarketOpenings] = useState<MarketOpening[]>(cachedMarketOpenings || []);
  const [isInitialLoad, setIsInitialLoad] = useState(!cachedMarkets);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefetchMarkets = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const now = Date.now();
    const shouldUseCache = cachedMarkets && (now - lastFetchTime) < CACHE_DURATION;
    
    // If we have cached data and it's not a forced refresh, use the cache
    if (shouldUseCache && refreshTrigger === 0) {
      setMarkets(cachedMarkets!);
      setMarketOpenings(cachedMarketOpenings!);
      return;
    }

    async function fetchMarketsAndOpenings() {
      const isInitial = !cachedMarkets;
      if (isInitial) {
        setIsInitialLoad(true);
      }
      
      try {
        // Fetch raw market data (for opening_hours, market_ref, categories)
        const { data: rawData, error: rawError } = await supabase
          .from('markets')
          .select('market_id, name, opening_hours, market_ref, categories, postcode');
        if (rawError) throw rawError;

        const openingHoursMap: { [key: number]: string } = {};
        const marketRefMap: { [key: number]: string } = {};
        const categoriesMap: { [key: number]: string[] } = {};
        const postcodeMap: { [key: number]: string } = {};

        rawData?.forEach((market: any) => {
          openingHoursMap[market.market_id] = market.opening_hours;
          if (market.market_ref) {
            const cleanRef = market.market_ref.trim().replace(/--/g, '-');
            marketRefMap[market.market_id] = cleanRef;
          }
          categoriesMap[market.market_id] = market.categories || [];
          if (market.postcode) {
            postcodeMap[market.market_id] = market.postcode;
          }
        });

        // Fetch market data with locations from RPC
        const { data: marketsData, error: rpcError } = await supabase.rpc('get_markets_with_locations');
        if (rpcError) throw rpcError;

        const transformedMarkets = (marketsData || []).map((market: any) => {
          const categories = categoriesMap[market.market_id] || [];
          const marketRef = marketRefMap[market.market_id] || null;
          let coordinates: [number, number] = [-2.5879, 51.4545]; // Default

          if (market.location && typeof market.location === 'string') {
            const matches = market.location.match(/POINT\(([-\d.-]+)\s+([-\d.-]+)\)/);
            if (matches) {
              const lng = parseFloat(matches[1]);
              const lat = parseFloat(matches[2]);
              if (!isNaN(lng) && !isNaN(lat) && isFinite(lng) && isFinite(lat)) {
                coordinates = [lng, lat];
              }
            }
          } else if (market.location && market.location.coordinates) {
            coordinates = market.location.coordinates;
          }

          return {
            market_id: market.market_id,
            name: market.name,
            description: market.description,
            address: market.address,
            website_url: market.website_url,
            opening_hours: openingHoursMap[market.market_id] || null,
            market_ref: marketRef,
            imageUrl: getMarketImageUrl(marketRef || ''),
            categories,
            postcode: postcodeMap[market.market_id] || null,
            location: {
              type: 'Point',
              coordinates,
            }
          } as Market;
        });
        // Update state and cache
        setMarkets(transformedMarkets);
        cachedMarkets = transformedMarkets;
        
        // Only fetch openings if we don't have them or if forced
        if (!cachedMarketOpenings || refreshTrigger > 0) {
          const nextOpenings = await getUpcomingMarketOpenings(14);
          setMarketOpenings(nextOpenings);
          cachedMarketOpenings = nextOpenings;
        } else {
          setMarketOpenings(cachedMarketOpenings);
        }
        
        lastFetchTime = Date.now();

      } catch (e) {
        console.error('Error in useMarketData:', e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
      } finally {
        if (isInitial) {
          setIsInitialLoad(false);
        }
      }
    }

    // Fetch data initially and whenever dependencies change
    fetchMarketsAndOpenings();

    // No cleanup function needed for this effect's current logic
  // Only include refreshTrigger in deps to prevent unnecessary refetches
  // when only the filtering params change
  }, [refreshTrigger]);

  // Filtered markets logic (memoized)
  const filteredMarkets = useMemo(() => {
    if (currentWhenMode === 'soon') {
      const today = new Date();
      let filterDate: Date | null = null;
      switch (currentDateFilter) {
        case 'today': filterDate = today; break;
        case 'tomorrow': filterDate = new Date(today.setDate(today.getDate() + 1)); break;
        case 'day-3': case 'day-4': case 'day-5': case 'day-6': case 'day-7':
          const dayNum = parseInt(currentDateFilter.split('-')[1] || '0', 10);
          filterDate = new Date(new Date().setDate(new Date().getDate() + dayNum -1 ));
          break;
        case 'next-14-days': return markets;
      }
      if (!filterDate) return markets;
      const filterDateStr = format(filterDate, 'yyyy-MM-dd');
      return markets.filter(market =>
        marketOpenings.some(opening =>
          opening.marketId === market.market_id && opening.date === filterDateStr
        )
      );
    } else { // Week mode
      if (selectedWeekdays.length === 0) return [];
      if (selectedWeekdays.length === 7) return markets;
      const weekdayToDOW: { [key in Weekday]: number } = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
      };
      const selectedDayNumbers = selectedWeekdays.map(day => weekdayToDOW[day]);
      const marketIdsWithSelectedDays = new Set<number>();
      marketOpenings.forEach(opening => {
        if (opening.dow !== undefined && selectedDayNumbers.includes(opening.dow)) {
          marketIdsWithSelectedDays.add(opening.marketId);
        }
      });
      return markets.filter(market => marketIdsWithSelectedDays.has(market.market_id));
    }
  }, [markets, marketOpenings, currentWhenMode, currentDateFilter, selectedWeekdays]);

  // Only show loading on initial data load
  const loading = isInitialLoad && markets.length === 0;
  
  return {
    markets,
    filteredMarkets,
    marketOpenings,
    loading,
    error,
    triggerRefetchMarkets,
  };
}
