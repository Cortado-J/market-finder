/**
 * Types for UK bank holidays data
 */

export interface BankHoliday {
  title: string;
  date: string; // ISO format: YYYY-MM-DD
  notes: string;
  bunting: boolean;
}

export interface BankHolidayDivision {
  division: string;
  events: BankHoliday[];
}

export interface BankHolidaysResponse {
  'england-and-wales': BankHolidayDivision;
  'scotland': BankHolidayDivision;
  'northern-ireland': BankHolidayDivision;
}
