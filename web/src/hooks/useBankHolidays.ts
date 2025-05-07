import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { BankHoliday } from '../types/BankHoliday';
import { fetchBankHolidays } from '../utils/bankHolidays';

/**
 * Hook to fetch and manage bank holidays
 * @returns Object with bank holidays data and utility functions
 */
export function useBankHolidays() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [bankHolidays, setBankHolidays] = useState<BankHoliday[]>([]);
  const [bankHolidayMap, setBankHolidayMap] = useState<Record<string, BankHoliday>>({});

  useEffect(() => {
    async function loadBankHolidays() {
      try {
        setLoading(true);
        const data = await fetchBankHolidays();
        
        // Use England and Wales holidays by default
        const holidays = data['england-and-wales'].events;
        setBankHolidays(holidays);
        
        // Create a map for quick lookup by date
        const holidayMap: Record<string, BankHoliday> = {};
        holidays.forEach(holiday => {
          holidayMap[holiday.date] = holiday;
        });
        setBankHolidayMap(holidayMap);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load bank holidays'));
        setLoading(false);
      }
    }
    
    loadBankHolidays();
  }, []);
  
  /**
   * Check if a date is a bank holiday
   * @param date Date to check
   * @returns Bank holiday information or null
   */
  const isBankHoliday = (date: Date): BankHoliday | null => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return bankHolidayMap[formattedDate] || null;
  };
  
  return {
    loading,
    error,
    bankHolidays,
    isBankHoliday
  };
}
