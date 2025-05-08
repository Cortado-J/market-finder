/**
 * Utility functions for handling market images
 */
import { supabaseUrl } from './supabase';

/**
 * Generates a URL for a market image based on the market_ref
 * @param marketRef The market reference code
 * @returns The full URL to the market image
 */
export function getMarketImageUrl(marketRef: string | null): string {
  if (!marketRef) return '/market-placeholder.jpg';
  
  // Clean up the market_ref by removing any extra spaces and replacing double hyphens
  const cleanRef = marketRef.trim().replace(/--/g, '-');
  
  // Use correct bucket 'markets-photos' and append '-main' suffix per filename pattern
  return `${supabaseUrl}/storage/v1/object/public/market-photos/main/${cleanRef}-main.png`;
}

/**
 * Generates a URL for a category icon
 * @param category The category name
 * @returns The full URL to the category icon
 */
export function getCategoryIconUrl(category: string): string {
  // Format the category name for the icon (lowercase, no spaces)
  const formattedCategory = category.toLowerCase().replace(/\s+/g, '-');
  
  // Return the path to the category icon
  return `/icons/categories/${formattedCategory}.svg`;
}

/**
 * Generates a URL for a category icon from Supabase
 * @param category The category name
 * @returns The full URL to the category icon
 */
export function getCategoryIconUrlFromSupabase(category: string): string {
  // Clean up the category name
  const cleanCategory = category.trim().replace(/--/g, '-');
  // Construct the category icon URL
  return `${supabaseUrl}/storage/v1/object/public/graphics/icon-${cleanCategory}.png`;
}
