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
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const homeMarker = useRef<mapboxgl.Marker | null>(null)
  const isTouchDevice = useRef<boolean>(false)
  
  // Detect if device supports touch events
  useEffect(() => {
    isTouchDevice.current = ('ontouchstart' in window) || 
                           (navigator.maxTouchPoints > 0) || 
                           ('msMaxTouchPoints' in navigator && (navigator as any).msMaxTouchPoints > 0);
    console.log('Is touch device:', isTouchDevice.current);
  }, [])

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker: mapboxgl.Marker) => marker.remove())
    markersRef.current = []
  }, [])

  useEffect(() => {
    if (!mapContainer.current) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation,
      zoom: 12
    })

    mapRef.current = map

    // Add home marker
    homeMarker.current = new mapboxgl.Marker({
      color: '#3b82f6', // blue-500
      scale: 1.2
    })
      .setLngLat(userLocation)
      .addTo(map)

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add geolocate control
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }),
      'top-right'
    )

    // Clean up on unmount
    return () => map.remove()
  }, [userLocation]) // Re-run if user location changes

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear existing markers
    clearMarkers()

    // Add new markers for each market
    markets.forEach(market => {
      const location = parseLocation(market.location)
      if (!location) return

      const distance = calculateDistance(userLocation, location)
      const color = selectedMarket?.market_id === market.market_id ? '#ef4444' : '#000000'

      // Create a custom marker element
      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.style.backgroundColor = color
      el.style.width = '24px' // Slightly larger for better touch targets
      el.style.height = '24px'
      el.style.borderRadius = '50%'
      el.style.cursor = 'pointer'
      el.style.border = '2px solid white' // Add border for better visibility
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)' // Add shadow for depth
      
      // Create the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat(location)
        .addTo(map)
      
      // Create popup with details and a button
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: true })
        .setHTML(
          `<div style="min-width: 180px;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">${market.name}</h3>
            <p style="font-size: 14px; color: #666; margin-bottom: 8px;">${market.description || 'No description available'}</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 12px;">${(distance / 1000).toFixed(1)} km away</p>
            <button class="popup-details-btn" style="background-color: #3b82f6; color: white; padding: 8px 12px; border-radius: 4px; border: none; font-weight: bold; cursor: pointer; width: 100%; font-size: 14px;">View Market Details</button>
          </div>`
        )

      // Attach popup to marker
      marker.setPopup(popup);

      if (!isTouchDevice.current) {
        // Desktop: show popup on hover
        el.addEventListener('mouseenter', () => {
          popup.addTo(map)
        })
        el.addEventListener('mouseleave', () => {
          popup.remove()
        })
      } else {
        // Touch: show popup on tap
        el.addEventListener('click', () => {
          popup.addTo(map)
        })
      }

      // When popup opens, attach click handler to details button
      popup.on('open', () => {
        const btn = document.querySelector('.popup-details-btn') as HTMLButtonElement
        if (btn) {
          btn.onclick = () => onMarketSelect(market)
        }
      })

      markersRef.current.push(marker)
    })

    // Pan to selected market if exists
    if (selectedMarket) {
      const location = parseLocation(selectedMarket.location)
      if (location && map) {
        map.flyTo({
          center: location,
          zoom: 15,
          essential: true
        })
      }
    }
  }, [markets, selectedMarket, onMarketSelect, userLocation, clearMarkers])

  return (
    <div ref={mapContainer} className="w-full h-full" />
  )
}
