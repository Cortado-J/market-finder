import { useEffect, useState } from 'react';
import { Market, hasCoordinates } from '../../../types/Market';
import { DetailText } from './shared/DetailText';

interface MarketMapProps {
  market: Market;
  isDebugMode?: boolean;
}

export function MarketMap({ market, isDebugMode = false }: MarketMapProps) {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [directionsUrls, setDirectionsUrls] = useState<{
    google: string | null;
    apple: string | null;
  }>({ google: null, apple: null });

  useEffect(() => {
    // Simple mobile detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobileDevice(isMobile);
    
    // Get coordinates from the market location
    if (!hasCoordinates(market)) return;
    
    const [lng, lat] = market.location.coordinates;
    
    if (!lat || !lng) return;
    
    // Generate static map image URL
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
    setMapImageUrl(staticMapUrl);
    
    // Generate directions URLs
    const address = encodeURIComponent([
      market.address,
      market.postcode
    ].filter(Boolean).join(', '));
    
    setDirectionsUrls({
      google: `https://www.google.com/maps/dir/?api=1&destination=${address}${market.place_id ? `&destination_place_id=${market.place_id}` : ''}`,
      apple: `http://maps.apple.com/?daddr=${address}&dirflg=d`
    });
  }, [market]);

  if (!hasCoordinates(market) || !mapImageUrl) {
    return null;
  }

  const [lng, lat] = market.location.coordinates;
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <div className="space-y-4">
      <a 
        href={directionsUrls.google || '#'}
        target="_blank" 
        rel="noopener noreferrer"
        className="block relative rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors"
        style={isDebugMode ? { border: '1px dashed orange' } : {}}
      >
        <img 
          src={mapImageUrl} 
          alt={`Map of ${market.name}`} 
          className="w-full h-48 object-cover"
        />
      </a>
      
      <div className="flex justify-between">
        {directionsUrls.google && (
          <a 
            href={directionsUrls.google}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-sm"
          >
            Open in Google Maps
          </a>
        )}
        <a 
          href={openStreetMapUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline text-sm"
        >
          Open in OpenStreetMap
        </a>
      </div>
      
      {isMobileDevice && directionsUrls.apple && (
        <a
          href={directionsUrls.apple}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-black hover:bg-gray-800 text-white text-center py-2 px-4 rounded-md transition-colors text-sm w-full"
        >
          Open in Apple Maps
        </a>
      )}
      
      <div className="mt-2">
        <DetailText isDebugMode={isDebugMode}>
          {market.address}
          {market.postcode && `, ${market.postcode}`}
        </DetailText>
      </div>
    </div>
  );
}
