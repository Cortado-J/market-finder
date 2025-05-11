export interface Market {
  market_id: number
  name: string
  description: string | null
  address: string | null
  website_url: string | null
  opening_hours: string | null  // OpenStreetMap opening_hours format
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
  more_info?: string | null
  postcode?: string | null // Added postcode field
}
