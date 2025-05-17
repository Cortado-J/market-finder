export interface Market {
  market_id: number
  name: string
  description: string | null
  address: string | null
  website: string | null
  website_url: string | null
  opening_hours: string | null  // OpenStreetMap opening_hours format
  schedule?: Record<string, string | string[]> | null  // Formatted schedule
  location: string | {
    type: string
    coordinates: [number, number] // [longitude, latitude]
  }
  market_ref?: string  // Reference code for the market
  imageUrl?: string    // URL to the market image
  categories?: string[] // Categories for market icons
  contact_name?: string | null
  phone?: string | null
  email?: string | null
  contact_phone?: string | null
  contact_email?: string | null
  social_media?: Record<string, string> | null
  more_info?: string | null
  postcode?: string | null
  place_id?: string | null
}

// Helper type to safely access location coordinates
type MarketLocation = Extract<Market['location'], { coordinates: [number, number] }>;

export function hasCoordinates(market: Market): market is Omit<Market, 'location'> & { location: MarketLocation } {
  return typeof market.location !== 'string' && Array.isArray(market.location?.coordinates);
}
