import { Market } from '../types/Market';
import { MarketOpening } from '../utils/getMarketOpenings';
import { getMarketImageUrl, getCategoryIconUrl } from '../utils/imageUtils';
import { humanizeOpeningHours } from '../utils/scheduleUtils';
import { useEffect, useState } from 'react';
import { OpenOn } from './NextOpening';

interface MarketDetailProps {
  market: Market;
  onBack: () => void;
  marketNextOpening?: MarketOpening;
}

export function MarketDetail({ market, onBack, marketNextOpening }: MarketDetailProps) {
  // State to detect if user is on a mobile device
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // Direction URLs for different map services
  const [directionsUrls, setDirectionsUrls] = useState<{
    google: string | null;
    apple: string | null;
  }>({ google: null, apple: null });

  // Generate image URL
  const imageUrl = getMarketImageUrl(market.market_ref || null);
  
  // Detect mobile device and set up map links
  useEffect(() => {
    // Simple mobile detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobileDevice(isMobile);
    
    // Get coordinates from the market location
    let lat, lng;
    if (market.location) {
      if (typeof market.location === 'object' && market.location.coordinates) {
        // Coordinates are stored as [longitude, latitude]
        [lng, lat] = market.location.coordinates;
      }
    }
    
    if (lat && lng) {
      // Create map URLs
      const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      const appleUrl = `https://maps.apple.com/?daddr=${lat},${lng}`;
      
      setDirectionsUrls({
        google: googleUrl,
        apple: isMobile ? appleUrl : null // Only provide Apple Maps on mobile
      });
    } else {
      // Fallback to address if coordinates aren't available
      const address = market.address ? encodeURIComponent(market.address) : null;
      
      if (address) {
        setDirectionsUrls({
          google: `https://www.google.com/maps/dir/?api=1&destination=${address}`,
          apple: isMobile ? `https://maps.apple.com/?daddr=${address}` : null
        });
      } else {
        setDirectionsUrls({ google: null, apple: null });
      }
    }
  }, [market]);
  
  // Extract postcode from address if available
  const postcode = market.address ? 
    market.address.match(/[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/i)?.[0] : null;
  
  // Format address without postcode if we extracted it
  const addressWithoutPostcode = market.address && postcode ? 
    market.address.replace(postcode, '').trim().replace(/,\s*$/, '') : 
    market.address;

  return (
    <div className="market-detail p-4 max-w-2xl mx-auto">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="mb-4 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        ← Back to list
      </button>
      
      {/* Market name */}
      <h1 className="text-2xl font-bold mb-3">{market.name}</h1>
      
      {/* Schedule & opening times */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-[1px]">Opening Times</h2>
        {marketNextOpening && (
          <OpenOn opening={marketNextOpening} className="mb-1" />
        )}
        {market.opening_hours ? (
          <p className="text-sm opacity-90">Opening hours: {humanizeOpeningHours(market.opening_hours)}</p>
        ) : (
          <p className="text-sm opacity-90">No regular schedule available</p>
        )}
      </div>
      
      {/* Large image */}
      {imageUrl && (
        <div className="mb-4">
          <img
            src={imageUrl}
            alt={`${market.name} image`}
            className="h-[300px] w-auto object-cover rounded-md shadow-md"
            onError={(e) => {
              // Hide the image on error
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      {/* Description */}
      {market.description && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-[1px]">Description</h2>
          <p>{market.description}</p>
        </div>
      )}
      
      {/* Website URL */}
      {market.website_url && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-[1px]">Website</h2>
          <a 
            href={market.website_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {market.website_url}
          </a>
        </div>
      )}
      
      {/* Address */}
      {addressWithoutPostcode && (
        <div className="mb-2">
          <h2 className="text-lg font-semibold mb-[1px]">Address</h2>
          <p>{addressWithoutPostcode}</p>
        </div>
      )}
      
      {/* Postcode */}
      {postcode && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-[1px]">Postcode</h2>
          <p>{postcode}</p>
        </div>
      )}
      
      {/* Directions */}
      {(directionsUrls.google || directionsUrls.apple) && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-[1px]">Directions</h2>
          <div className="mt-1">
            {isMobileDevice ? (
              // On mobile, show both Google Maps and Apple Maps options
              <div className="flex gap-3">
                {directionsUrls.google && (
                  <a 
                    href={directionsUrls.google}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-3 py-1 rounded-md inline-flex items-center hover:bg-blue-700 transition-colors"
                  >
                    Google Maps
                  </a>
                )}
                {directionsUrls.apple && (
                  <a 
                    href={directionsUrls.apple}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-600 text-white px-3 py-1 rounded-md inline-flex items-center hover:bg-gray-700 transition-colors"
                  >
                    Apple Maps
                  </a>
                )}
              </div>
            ) : (
              // On desktop, only show Google Maps
              directionsUrls.google && (
                <a 
                  href={directionsUrls.google}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-3 py-1 rounded-md inline-flex items-center hover:bg-blue-700 transition-colors"
                >
                  Get Directions
                </a>
              )
            )}
          </div>
        </div>
      )}
      
      {/* Categories */}
      {market.categories && market.categories.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-[1px]">Categories</h2>
          <ul className="list-none p-0 m-0">
            {market.categories.map(cat => (
              <li key={cat} className="flex items-center mb-1">
                <img
                  src={getCategoryIconUrl(cat)}
                  alt={cat}
                  className="w-[30px] h-[30px] mr-2"
                  onError={e => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                />
                <span>{cat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
