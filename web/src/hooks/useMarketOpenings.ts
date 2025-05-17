import { useEffect, useState } from 'react';
import { Market } from '../types/Market';
import { MarketOpening, marketOpeningsBetween } from '../utils/getMarketOpenings';

export function useMarketOpenings(market: Market) {
  const [nextOpenings, setNextOpenings] = useState<MarketOpening[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!market) return;

    const fetchOpenings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get openings for the next 30 days
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        const openings = await marketOpeningsBetween(startDate, endDate);

        // Filter for this market
        const marketOpenings = openings.filter(opening => 
          opening.marketId === market.market_id
        );

        // Get the next 3 unique dates
        const uniqueDates = new Set<string>();
        const nextThree: MarketOpening[] = [];

        for (const opening of marketOpenings) {
          if (!opening.date) continue;
          
          if (!uniqueDates.has(opening.date)) {
            uniqueDates.add(opening.date);
            nextThree.push(opening);
            
            if (nextThree.length >= 3) break;
          }
        }
        
        setNextOpenings(nextThree);
      } catch (err) {
        console.error('Error calculating next openings:', err);
        setError(err instanceof Error ? err : new Error('Failed to load market openings'));
        setNextOpenings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpenings();
  }, [market]);

  return { 
    nextOpenings, 
    isLoading, 
    error 
  };
}
