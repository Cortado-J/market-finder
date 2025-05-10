import { Market } from '../types/Market';
import { MarketOpening, marketOpeningsBetween } from '../utils/getMarketOpenings';
import { getMarketImageUrl, getCategoryIconUrl } from '../utils/imageUtils';
import { humanizeOpeningHours } from '../utils/scheduleUtils';
import { useEffect, useState } from 'react';
import { OpenOn } from './NextOpening';
import { addDays, format, parseISO } from 'date-fns';

interface MarketDetailProps {
  market: Market;
  onBack: () => void;
  marketNextOpening?: MarketOpening;
  isDebugMode?: boolean; // Added for debug borders
}

export function MarketDetail({ market, onBack, marketNextOpening, isDebugMode = false }: MarketDetailProps) {
  // State to detect if user is on a mobile device
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // Direction URLs for different map services
  const [directionsUrls, setDirectionsUrls] = useState<{
    google: string | null;
    apple: string | null;
  }>({ google: null, apple: null });
  
  // State to store the next three market openings
  const [nextThreeOpenings, setNextThreeOpenings] = useState<MarketOpening[]>([]);

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
        apple: appleUrl // Provide Apple Maps for all devices as requested
      });
    } else {
      // Fallback to address if coordinates aren't available
      const address = market.address ? encodeURIComponent(market.address) : null;
      
      if (address) {
        setDirectionsUrls({
          google: `https://www.google.com/maps/dir/?api=1&destination=${address}`,
          apple: `https://maps.apple.com/?daddr=${address}`
        });
      } else {
        setDirectionsUrls({ google: null, apple: null });
      }
    }
    
    // Fetch next three market openings
    const fetchNextOpenings = async () => {
      try {
        const today = new Date();
        const nextMonth = addDays(today, 30); // Look ahead 30 days
        
        // Get all upcoming openings for this specific market
        const openings = await marketOpeningsBetween(today, nextMonth);
        const filteredOpenings = openings.filter(o => o.marketId === market.market_id);
        
        // Take the first three openings
        setNextThreeOpenings(filteredOpenings.slice(0, 3));
      } catch (error) {
        console.error('Error fetching next openings:', error);
      }
    };
    
    fetchNextOpenings();
  }, [market]);
  
  // Extract postcode from address if available
  const postcode = market.address ? 
    market.address.match(/[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/i)?.[0] : null;
  
  // Format address without postcode if we extracted it
  const addressWithoutPostcode = market.address && postcode ? 
    market.address.replace(postcode, '').trim().replace(/,\s*$/, '') : 
    market.address;

  // Function to capitalize each word in a string
  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };
  
  // Section styling helper
  const SectionCard = ({ title, icon, children, isDebugMode: cardDebugMode }: { title: string, icon: string, children: React.ReactNode, isDebugMode?: boolean }) => (
    <div 
      className="shadow-sm text-blue-900 mb-[0.5rem]" 
      style={{
        paddingTop: '0px', 
        paddingLeft: '12px', 
        paddingRight: '12px', 
        paddingBottom: '12px', 
        backgroundColor: '#bfdbfe', 
        borderRadius: '0.5rem',
        ...(cardDebugMode && { border: '2px dashed hotpink', boxSizing: 'border-box' }) 
      }}
    >
      <div className="flex items-center mb-0">
        <span className="text-lg mr-1" aria-hidden="true">{icon}</span>
        <h2 className="text-lg font-semibold text-blue-900">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );

  return (
    // Main container for MarketDetail - flex column to allow fixed header and scrollable content
    <div className="market-detail flex flex-col h-full max-w-2xl mx-auto bg-white" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
      {/* Fixed Header Area - Reduced Padding */}
      <div className="pt-1 pb-1 border-b border-gray-200 bg-white">
        {/* Market name & Back Button in a styled box */}
        <div 
          className="mb-1 shadow-sm flex items-center gap-2"
          style={{
            backgroundColor: '#bfdbfe',
            padding: '2px 12px',
            borderRadius: '0.5rem'
          }}
        >
          {/* Back button - reverted to less-than character */}
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-[3.15rem] h-[3.2rem] rounded-lg border border-gray-300 bg-blue-50 text-blue-700 shadow-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            aria-label="Back to list"
          >
            <span className="text-6xl font-bold">&lt;</span>
          </button>
          {/* Market name - takes remaining space and centers text */}
          <h2 className="text-lg font-bold text-blue-900 flex-grow text-center">{market.name}</h2>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto py-1">
        {/* Market image - now part of scrollable content */}
        {imageUrl && (
          <div 
            className="shadow-sm mb-[0.5rem]" 
            style={{
              padding: '8px', 
              backgroundColor: '#bfdbfe',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              ...(isDebugMode && { border: '2px dashed hotpink', boxSizing: 'border-box' }) 
            }}
          >
            <div className="rounded-lg overflow-hidden"> 
              <img
                src={imageUrl}
                alt={`${market.name}`}
                className="w-full h-auto object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
        
        {/* WHERE section */}
        <SectionCard title="WHERE" icon="🧭" isDebugMode={isDebugMode}>
          {(addressWithoutPostcode || postcode) && (
            <div>
              <h3 className="text-sm font-bold mt-0 mb-px">Address</h3>
              {addressWithoutPostcode && <p className="text-sm text-gray-700 leading-tight mt-0 mb-0">{addressWithoutPostcode}</p>}
              {postcode && <p className="text-sm text-blue-800 leading-tight mt-0 mb-0">{postcode}</p>}
            </div>
          )}
          
          {(directionsUrls.google || directionsUrls.apple) && (
            <div className="mt-0.5">
              <h3 className="text-sm font-bold mt-0 mb-px">Directions</h3>
              <div className="flex gap-2">
                {directionsUrls.google && (
                  <button 
                    onClick={() => {
                      if (directionsUrls.google) {
                        window.open(directionsUrls.google, '_blank');
                      }
                    }}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-center flex-1"
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    Google Maps
                  </button>
                )}
                {directionsUrls.apple && (
                  <button 
                    onClick={() => {
                    if (directionsUrls.apple) {
                      window.open(directionsUrls.apple, '_blank');
                    }
                  }}
                    className="bg-gray-600 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors text-center flex-1"
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    Apple Maps
                  </button>
                )}
              </div>
            </div>
          )}
        </SectionCard>
        
        {/* WHEN section */}
        <SectionCard title="WHEN" icon="🕒" isDebugMode={isDebugMode}>
          {market.opening_hours && (
            <div>
              <h3 className="text-sm font-bold mt-0 mb-px">Opening Hours</h3>
              <p className="text-sm text-gray-700 leading-tight mt-0 mb-0">{humanizeOpeningHours(market.opening_hours)}</p>
            </div>
          )}
          
          <div className="mt-1"> 
            <h3 className="text-sm font-bold mt-0 mb-px">Next Dates</h3>
            {nextThreeOpenings.length > 0 ? (
              <div className="space-y-1">
                {nextThreeOpenings.map((opening, index) => (
                  <div key={index} className="rounded-md leading-tight py-0.5 px-1 text-sm text-gray-700" 
                       style={{ backgroundColor: '#edf5ff' }}>
                    {opening.startTime && opening.endTime ? (
                      <span>{format(parseISO(opening.date!), 'EEEE, MMMM d')} {opening.startTime} to {opening.endTime}</span>
                    ) : (
                      <span>{format(parseISO(opening.date!), 'EEEE, MMMM d')}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No upcoming dates available</p>
            )}
          </div>
        </SectionCard>
        
        {/* WHAT section */}
        <SectionCard title="WHAT" icon="🛍️" isDebugMode={isDebugMode}>
          {/* Website URL */}
          {market.website_url && (
            <div>
              <h3 className="text-sm font-bold mt-0 mb-px">Website URL</h3>
              <a 
                href={market.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm break-all"
              >
                {market.website_url}
              </a>
            </div>
          )}
          
          {/* Description */}
          {market.description && (
            <div>
              <h3 className="text-sm font-bold mt-0 mb-px">Description</h3>
              <p className="text-sm text-gray-700 leading-tight mt-0 mb-0">{market.description}</p>
            </div>
          )}
          
          {/* Categories */}
          {market.categories && market.categories.length > 0 && (
            <div className={market.website_url || market.description ? "mt-2" : ""}> 
              <h3 className="text-sm font-bold mt-0 mb-px">Categories</h3>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {market.categories.map((category, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700 leading-tight">
                    <img
                      src={getCategoryIconUrl(category)}
                      alt=""
                      className="w-[16px] h-[16px] mr-1"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span>{capitalizeWords(category)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
