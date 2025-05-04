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
}
