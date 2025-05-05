/**
 * Utility functions for handling market images
 */

/**
 * Generates a URL for a market image based on the market_ref
 * @param supabaseUrl The Supabase URL
 * @param marketRef The market reference code
 * @returns The full URL to the market image
 */
export function getMarketImageUrl(supabaseUrl: string, marketRef: string | null): string | null {
  if (!marketRef) return null;
  
  // Clean up the market_ref by removing any extra spaces and replacing double hyphens
  const cleanRef = marketRef.trim().replace(/--/g, '-');
  
  // Construct the image URL
  return `${supabaseUrl}/storage/v1/object/public/market-photos/main/${cleanRef}-main.png`;
}

// Add new function for category icons
export function getCategoryIconUrl(supabaseUrl: string, category: string): string {
  // Clean up the category name
  const cleanCategory = category.trim().replace(/--/g, '-');
  // Construct the category icon URL
  return `${supabaseUrl}/storage/v1/object/public/graphics/icon-${cleanCategory}.png`;
}
