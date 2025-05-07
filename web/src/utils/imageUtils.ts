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
  // For now, let's use placeholder images while we debug the Supabase image loading
  return '/market-placeholder.jpg';
  
  /* Commented out until we resolve the 400 errors
  if (!marketRef) return '/market-placeholder.jpg';
  
  // Clean up the market_ref by removing any extra spaces and replacing double hyphens
  const cleanRef = marketRef.trim().replace(/--/g, '-');
  
  // Try both bucket names to see which one works
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/market-photos/main/${cleanRef}-main.png`;
  
  console.log('Market image URL:', imageUrl);
  return imageUrl;
  */
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
