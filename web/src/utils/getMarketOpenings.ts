import { createClient } from '@supabase/supabase-js';
import opening_hours from 'opening_hours';
import { eachDayOfInterval, format, addDays } from 'date-fns';

// Types
interface DatabaseMarket {
  market_id: number;
  name: string;
  opening_hours: string | null;
}

export interface MarketOpening {
  marketId: number;
  marketName: string;
  error?: string;    // If present, indicates an error with the opening hours
  date?: string;     // ISO yyyy-mm-dd (local)
  dow?: number;      // 0 = Sun … 6 = Sat
  startTime?: string; // HH:mm
  endTime?: string;  // HH:mm
}

// Supabase client - use the same instance as App.tsx
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to build one‑day interval [00:00, 24:00) in local time
function dayBoundaries(date: Date): [Date, Date] {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = addDays(start, 1); // exactly 24 h later
  return [start, end];
}

/**
 * Returns all market openings between start and end dates (inclusive).
 * Uses OpenStreetMap opening_hours format for schedule parsing.
 * 
 * @param start - Start date (string 'YYYY-MM-DD' or Date object)
 * @param end - End date (string 'YYYY-MM-DD' or Date object)
 * @returns Array of MarketOpening objects sorted by date, market name, and start time
 */
export async function marketOpeningsBetween(
  start: string | Date,
  end: string | Date
): Promise<MarketOpening[]> {
  // 1. Normalize inputs to Date objects (local timezone)
  const startDate = typeof start === 'string' ? new Date(start + 'T00:00') : new Date(start);
  const endDate = typeof end === 'string' ? new Date(end + 'T00:00') : new Date(end);

  if (isNaN(startDate.valueOf()) || isNaN(endDate.valueOf())) {
    throw new Error('Invalid start or end date');
  }
  if (startDate > endDate) {
    throw new Error('start date must be <= end date');
  }

  // 2. Pull schedules from Supabase
  const { data: markets, error } = await supabase
    .from('markets')
    .select('market_id, name, opening_hours');

  if (error) throw error;
  if (!markets?.length) return [];

  console.log('Markets from getMarketOpenings:', markets);

  // 3. Prepare date list upfront (inclusive range)
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // 4. Loop through markets & days, collect openings
  const openings: MarketOpening[] = [];

  for (const market of markets) {
    if (!market.opening_hours?.trim()) continue;

    // Parse once per market (opening_hours.js is stateful but cheap)
    let oh: opening_hours;
    try {
      oh = new opening_hours(market.opening_hours);
    } catch (e) {
      console.warn(`Invalid opening_hours for '${market.name}':`, e);
      openings.push({
        marketId: market.market_id,
        marketName: market.name,
        error: 'Invalid Opening Hours'
      });
      continue;
    }

    for (const day of days) {
      const [dayStart, dayEnd] = dayBoundaries(day);
      
      // Get intervals for this day
      try {
        const intervals = oh.getOpenIntervals(dayStart, dayEnd);
        
        for (const [start, end] of intervals) {
          openings.push({
            marketId: market.market_id,
            marketName: market.name,
            date: format(day, 'yyyy-MM-dd'),
            dow: day.getDay(),
            startTime: format(start, 'HH:mm'),
            endTime: format(end, 'HH:mm')
          });
        }
      } catch (e) {
        console.warn(`Error getting intervals for '${market.name}' on ${format(day, 'yyyy-MM-dd')}:`, e);
        continue;
      }
    }
  }

  // Sort by name, date, and time
  openings.sort((a, b) => {
    // Handle error cases first
    if (a.error && !b.error) return 1
    if (!a.error && b.error) return -1
    if (a.error && b.error) return a.marketName.localeCompare(b.marketName)

    // At this point, neither a nor b has an error, so their date/time fields are defined
    const aOpening = a as Required<MarketOpening>
    const bOpening = b as Required<MarketOpening>

    // First by date
    if (aOpening.date < bOpening.date) return -1
    if (aOpening.date > bOpening.date) return 1

    // Then by start time
    if (aOpening.startTime < bOpening.startTime) return -1
    if (aOpening.startTime > bOpening.startTime) return 1

    // Finally by market name
    return aOpening.marketName.localeCompare(bOpening.marketName)
  });

  return openings;
}

// Export a function to get upcoming market openings (next N days)
export async function getUpcomingMarketOpenings(days = 30): Promise<MarketOpening[]> {
  const start = new Date();
  const end = addDays(start, days);
  return marketOpeningsBetween(start, end);
}
