/**
 * Bank Holidays utility
 * Fetches and caches UK bank holidays from the government API
 */
import { format } from 'date-fns';
import { BankHoliday, BankHolidayDivision, BankHolidaysResponse } from '../types/BankHoliday';

// Cache for bank holidays to avoid repeated API calls
let bankHolidaysCache: BankHolidaysResponse | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetch bank holidays from the UK government API
 * @returns Promise with bank holidays data
 */
export async function fetchBankHolidays(): Promise<BankHolidaysResponse> {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (bankHolidaysCache && (now - lastFetchTime < CACHE_DURATION)) {
    return bankHolidaysCache;
  }
  
  try {
    const response = await fetch('https://www.gov.uk/bank-holidays.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch bank holidays: ${response.status}`);
    }
    
    const data: BankHolidaysResponse = await response.json();
    
    // Update cache
    bankHolidaysCache = data;
    lastFetchTime = now;
    
    return data;
  } catch (error) {
    console.error('Error fetching bank holidays:', error);
    
    // Return cached data if available, even if expired
    if (bankHolidaysCache) {
      return bankHolidaysCache;
    }
    
    // If no cached data, return empty structure
    return {
      'england-and-wales': { division: 'england-and-wales', events: [] },
      'scotland': { division: 'scotland', events: [] },
      'northern-ireland': { division: 'northern-ireland', events: [] }
    };
  }
}

/**
 * Check if a date is a bank holiday in England and Wales
 * @param date Date to check
 * @returns Promise with bank holiday info or null if not a holiday
 */
export async function isBankHoliday(date: Date): Promise<BankHoliday | null> {
  try {
    const holidays = await fetchBankHolidays();
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Check England and Wales holidays (default)
    const englandWalesHolidays = holidays['england-and-wales'].events;
    
    // Find matching holiday
    const holiday = englandWalesHolidays.find(h => h.date === formattedDate);
    return holiday || null;
  } catch (error) {
    console.error('Error checking bank holiday:', error);
    return null;
  }
}

/**
 * Get all bank holidays for a specific year
 * @param year Year to get holidays for
 * @returns Promise with array of bank holidays
 */
export async function getBankHolidaysForYear(year: number): Promise<BankHoliday[]> {
  try {
    const holidays = await fetchBankHolidays();
    const englandWalesHolidays = holidays['england-and-wales'].events;
    
    // Filter holidays for the specified year
    return englandWalesHolidays.filter(h => h.date.startsWith(`${year}-`));
  } catch (error) {
    console.error('Error getting bank holidays for year:', error);
    return [];
  }
}
