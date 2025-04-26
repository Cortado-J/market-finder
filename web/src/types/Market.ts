export interface Market {
  market_id: number
  name: string
  description: string | null
  address: string | null
  website_url: string | null
  location: string | {
    type: string
    coordinates: [number, number] // [longitude, latitude]
  }
}
