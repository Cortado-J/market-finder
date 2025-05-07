import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Market } from '../types/Market'
import { getMarketImageUrl } from '../utils/imageUtils'

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
if (!mapboxToken) {
  console.error('Mapbox token missing! Please add VITE_MAPBOX_TOKEN to your .env file')
}

interface MapProps {
  markets: Market[]
  selectedMarket: Market | null
  onMarketSelect: (market: Market) => void
  userLocation: [number, number] // [longitude, latitude]
}

function parseLocation(location: Market['location']): [number, number] | null {
  if (!location) return null
  
  if (typeof location === 'string') {
    // Parse from POINT(lon lat) format
    const matches = location.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/)
    if (matches && matches.length >= 3) {
      return [parseFloat(matches[1]), parseFloat(matches[2])]
    }
    return null
  }
  
  // Handle GeoJSON format
  if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
    return [location.coordinates[0], location.coordinates[1]]
  }
  
  return null
}

export function Map({ 
  markets, 
  selectedMarket, 
  onMarketSelect, 
  userLocation
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const homeMarker = useRef<mapboxgl.Marker | null>(null)
  const isTouchDevice = useRef<boolean>(false)
  
  // Check if device is touch-enabled
  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }, [])
  
  // Clear all markers from the map
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
  }, [])
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return
    
    mapboxgl.accessToken = mapboxToken as string
    
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation,
      zoom: 11
    })
    
    map.on('load', () => {
      console.log('Map loaded')
    })
    
    mapRef.current = map
    
    // Add home marker
    homeMarker.current = new mapboxgl.Marker({ color: '#FF0000' })
      .setLngLat(userLocation)
      .addTo(map)
    
    // Add geolocate control
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
    )
    
    // Add zoom controls
    map.addControl(new mapboxgl.NavigationControl())
    
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [userLocation])
  
  // Add markers for markets
  useEffect(() => {
    if (!mapRef.current) return
    
    clearMarkers()
    
    markets.forEach(market => {
      const coords = parseLocation(market.location)
      if (!coords) return
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="map-popup">
          <h3 class="text-lg font-semibold">${market.name}</h3>
          <p class="text-sm text-gray-600">${market.address}</p>
          <button class="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md text-sm view-details-btn">
            View Market Details
          </button>
        </div>
      `)
      
      // Add click handler to popup button
      popup.on('open', () => {
        setTimeout(() => {
          const btn = document.querySelector('.view-details-btn')
          if (btn) {
            btn.addEventListener('click', (e) => {
              e.preventDefault()
              e.stopPropagation()
              onMarketSelect(market)
            })
          }
        }, 10)
      })
      
      // Create marker
      const marker = new mapboxgl.Marker()
        .setLngLat(coords)
        .setPopup(popup)
      
      // Add hover tooltip for desktop only
      if (!isTouchDevice.current) {
        const markerElement = marker.getElement()
        markerElement.addEventListener('mouseenter', () => {
          const tooltip = document.createElement('div')
          tooltip.className = 'market-tooltip'
          tooltip.innerHTML = `
            <div class="p-2 bg-white rounded shadow text-sm">
              ${market.name}
            </div>
          `
          markerElement.appendChild(tooltip)
        })
        
        markerElement.addEventListener('mouseleave', () => {
          const tooltip = markerElement.querySelector('.market-tooltip')
          if (tooltip) {
            markerElement.removeChild(tooltip)
          }
        })
      }
      
      marker.addTo(mapRef.current)
      markersRef.current.push(marker)
    })
    
    // If there's a selected market, fly to it
    if (selectedMarket) {
      const coords = parseLocation(selectedMarket.location)
      if (coords && mapRef.current) {
        mapRef.current.flyTo({
          center: coords,
          zoom: 14,
          essential: true
        })
        
        // Find and open the popup for the selected market
        markersRef.current.forEach(marker => {
          const markerCoords = marker.getLngLat()
          if (markerCoords.lng === coords[0] && markerCoords.lat === coords[1]) {
            marker.togglePopup()
          }
        })
      }
    }
  }, [markets, selectedMarket, clearMarkers, onMarketSelect])
  
  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div 
        ref={mapContainer} 
        className="map-container" 
        style={{ 
          width: '100%', 
          height: '100%'
        }}
      ></div>
    </div>
  )
}
