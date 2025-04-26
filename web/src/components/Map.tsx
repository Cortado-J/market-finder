import { useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Market } from '../types/Market'

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
if (!mapboxToken) {
  console.error('Mapbox token is missing. Please add VITE_MAPBOX_TOKEN to .env.local')
}
mapboxgl.accessToken = mapboxToken

interface MapProps {
  markets: Market[]
  onMarketSelect?: (market: Market) => void
}

function parseLocation(location: Market['location']): [number, number] | null {
  if (typeof location === 'string') {
    // Parse PostGIS point string format: 'POINT(lng lat)'
    const matches = location.match(/POINT\(([\d.-]+)\s+([\d.-]+)\)/)
    if (matches) {
      return [parseFloat(matches[1]), parseFloat(matches[2])]
    }
    return null
  }
  return location.coordinates
}

export function Map({ markets, onMarketSelect }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
  }, [])

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-2.5879, 51.4545], // Bristol city center
      zoom: 12
    })

    // Add navigation controls
    newMap.addControl(new mapboxgl.NavigationControl())

    map.current = newMap

    // Cleanup on unmount
    return () => {
      clearMarkers()
      newMap.remove()
    }
  }, [])

  // Add markers when markets change
  useEffect(() => {
    const currentMap = map.current
    if (!currentMap) return

    clearMarkers()

    // Add markers for each market
    markets.forEach((market) => {
      const coordinates = parseLocation(market.location)
      if (!coordinates) return

      const [lng, lat] = coordinates

      // Create marker element
      const el = document.createElement('div')
      el.className = 'marker'
      el.style.backgroundColor = '#FF4B4B'
      el.style.width = '24px'
      el.style.height = '24px'
      el.style.borderRadius = '50%'
      el.style.border = '2px solid white'
      el.style.cursor = 'pointer'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <strong>${market.name}</strong>
          ${market.address ? `<p>${market.address}</p>` : ''}
        `)

      // Add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(currentMap)

      // Store marker reference
      markersRef.current.push(marker)

      // Add click handler
      el.addEventListener('click', () => {
        onMarketSelect?.(market)
      })
    })
  }, [markets, onMarketSelect, clearMarkers])

  return (
    <div 
      ref={mapContainer} 
      className="map-container rounded-lg shadow-lg"
    />
  )
}
