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
  selectedMarket: Market | null
  onMarketSelect: (market: Market) => void
  userLocation: [number, number] // [longitude, latitude]
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

function calculateDistance(
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number]
): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export function Map({ markets, selectedMarket, onMarketSelect, userLocation }: MapProps) {
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

  // Add user location marker
  useEffect(() => {
    const currentMap = map.current
    if (!currentMap || !userLocation) return

    // Create user location marker
    const el = document.createElement('div')
    el.className = 'user-location'
    el.style.width = '16px'
    el.style.height = '16px'
    el.style.backgroundColor = '#4B89F0'
    el.style.borderRadius = '50%'
    el.style.border = '3px solid white'
    el.style.boxShadow = '0 0 0 2px #4B89F0'

    // Add accuracy radius
    const accuracyRadius = document.createElement('div')
    accuracyRadius.className = 'accuracy-radius'
    accuracyRadius.style.position = 'absolute'
    accuracyRadius.style.borderRadius = '50%'
    accuracyRadius.style.width = '50px'
    accuracyRadius.style.height = '50px'
    accuracyRadius.style.backgroundColor = 'rgba(75, 137, 240, 0.1)'
    accuracyRadius.style.border = '2px solid rgba(75, 137, 240, 0.2)'
    accuracyRadius.style.transform = 'translate(-50%, -50%)'
    el.appendChild(accuracyRadius)

    // Add marker to map
    const marker = new mapboxgl.Marker(el)
      .setLngLat(userLocation)
      .addTo(currentMap)

    // Store marker reference
    markersRef.current.push(marker)

    // Center map on user location
    currentMap.flyTo({
      center: userLocation,
      zoom: 13
    })

  }, [userLocation])

  // Add market markers
  useEffect(() => {
    const currentMap = map.current
    if (!currentMap) return

    clearMarkers()

    // Sort markets by distance from user location
    const marketsWithDistance = markets
      .map(market => {
        const coords = parseLocation(market.location)
        return {
          market,
          coordinates: coords,
          distance: coords ? calculateDistance(userLocation, coords) : Infinity
        }
      })
      .sort((a, b) => a.distance - b.distance)

    // Add markers for each market
    marketsWithDistance.forEach((item, index) => {
      const { market, coordinates } = item
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
      el.style.display = 'flex'
      el.style.alignItems = 'center'
      el.style.justifyContent = 'center'
      el.style.color = 'white'
      el.style.fontSize = '12px'
      el.style.fontWeight = 'bold'
      el.innerText = `${index + 1}`

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
