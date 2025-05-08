import { Market } from '../types/Market';
import { format, parseISO } from 'date-fns';
import { MarketOpening } from '../utils/getMarketOpenings';
import { getMarketImageUrl, getCategoryIconUrl } from '../utils/imageUtils';
import { humanizeOpeningHours } from '../utils/scheduleUtils';
import { useEffect, useState } from 'react';

interface MarketDetailProps {
  market: Market;
  onBack: () => void;
  marketNextOpening?: MarketOpening;
}

export function MarketDetail({ market, onBack, marketNextOpening }: MarketDetailProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Generate image URL
  const imageUrl = getMarketImageUrl(market.market_ref || null);
  
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
        {marketNextOpening && !marketNextOpening.error ? (
          <p className="mb-1">
            Next open: {format(parseISO(marketNextOpening.date!), 'EEE d MMM')}, {marketNextOpening.startTime}-{marketNextOpening.endTime}
          </p>
        ) : null}
        {market.opening_hours ? (
          <p className="text-sm opacity-90">Regular hours: {humanizeOpeningHours(market.opening_hours)}</p>
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
