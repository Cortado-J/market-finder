import type { Market } from '../types/Market';
import { type MarketOpening, marketOpeningsBetween } from '../utils/getMarketOpenings';
import { getMarketImageUrl } from '../utils/imageUtils';
import { humanizeOpeningHours } from '../utils/scheduleUtils';
import { useEffect, useState, CSSProperties } from 'react';

import { addDays, format, parseISO } from 'date-fns';
import { Session } from '@supabase/supabase-js';

interface MarketDetailProps {
  market: Market;
  onBack: () => void;
  onEdit?: (market: Market) => void;
  isDebugMode?: boolean;
  session: Session | null;
  adminUserId?: string;
}

// DetailText Component
interface DetailTextProps {
  children: React.ReactNode;
  isDebugMode?: boolean;
  textColorClassName?: string;
}

const DetailText: React.FC<DetailTextProps> = ({
  children,
  isDebugMode,
  textColorClassName = "text-gray-200"
}) => {
  const elementStyle: CSSProperties = {}; 
  if (isDebugMode) {
    elementStyle.border = '1px dashed orange';
    elementStyle.boxSizing = 'border-box';
  }
  return (
    <p className={`text-base ${textColorClassName}`} style={elementStyle}>
      {children}
    </p>
  );
};

// DetailItem Component
interface DetailItemProps {
  title: string;
  children: React.ReactNode;
  isDebugMode?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ title, children, isDebugMode = false }) => {
  return (
    <div className="mb-3 last:mb-0" style={isDebugMode ? { border: '1px dashed green', boxSizing: 'border-box' } : {}}>
      <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
      <div className="text-sm text-gray-200">
        {children}
      </div>
    </div>
  );
};

// SubsectionWrapper Component
interface SubsectionWrapperProps {
  children: React.ReactNode;
  isDebugMode?: boolean;
  className?: string;
}

const SubsectionWrapper: React.FC<SubsectionWrapperProps> = ({ 
  children, 
  isDebugMode, 
  className = '' 
}) => {
  const style: CSSProperties = {
    paddingTop: '8px',
    paddingBottom: '8px',
  };
  if (isDebugMode) {
    style.border = '1px dashed blue';
    style.boxSizing = 'border-box';
  }
  return (
    <div className={`${className} bg-gray-800 p-4 rounded-md shadow-sm`} style={style}>
      {children}
    </div>
  );
};

// SectionCard Component
interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  isDebugMode?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children, isDebugMode = false }) => {
  const h2DebugStyle: CSSProperties = isDebugMode 
    ? { border: '1px dashed cyan', boxSizing: 'border-box', margin: '0px', padding: '0px', lineHeight: '1' } 
    : { margin: '0px', padding: '0px', lineHeight: '1' };

  return (
    <div className="mb-6 last:mb-0">
      <h2 className="text-xl font-bold mb-3 text-white" style={h2DebugStyle}>
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export function MarketDetail({ market, onBack, onEdit, isDebugMode = false, session, adminUserId }: MarketDetailProps) {
  // State to detect if user is on a mobile device
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // Direction URLs for different map services
  const [directionsUrls, setDirectionsUrls] = useState<{
    google: string | null;
    apple: string | null;
  }>({ google: null, apple: null });
  
  // State to store the next three market openings
  const [nextThreeOpenings, setNextThreeOpenings] = useState<MarketOpening[]>([]);

  // Guard clause: If market data is not available, don't render.
  if (!market) {
    console.error("MarketDetail rendered without a market object.");
    return null; 
  }

  // Log the received market object to check for postcode
  if (isDebugMode) {
    console.log('MarketDetail - Received Market:', JSON.parse(JSON.stringify(market)));
  }

  // Construct the display address
  let displayAddress = market.address || '';
  const marketPostcode = market.postcode; 

  if (isDebugMode) {
    console.log('MarketDetail - market.address:', market.address);
    console.log('MarketDetail - market.postcode (from market object):', marketPostcode);
  }

  if (marketPostcode && typeof marketPostcode === 'string' && marketPostcode.trim() !== '') {
    const trimmedMarketAddress = (market.address || '').trim().toLowerCase();
    const trimmedMarketPostcode = marketPostcode.trim().toLowerCase();

    // Check if the postcode is already at the end of the address
    if (!trimmedMarketAddress.endsWith(trimmedMarketPostcode)) {
      const addressParts = trimmedMarketAddress.split(/[\s,]+/);
      const postcodeParts = trimmedMarketPostcode.split(/[\s,]+/);
      let suffixMatches = false;
      if (addressParts.length >= postcodeParts.length) {
        suffixMatches = true;
        for (let i = 0; i < postcodeParts.length; i++) {
          if (addressParts[addressParts.length - postcodeParts.length + i] !== postcodeParts[i]) {
            suffixMatches = false;
            break;
          }
        }
      }

      if (!suffixMatches) {
        if (displayAddress.trim() === '') {
          displayAddress = marketPostcode; 
        } else if (displayAddress.trim().endsWith(',')) {
          displayAddress = `${displayAddress.trim()} ${marketPostcode}`;
        } else {
          displayAddress = `${displayAddress.trim()}, ${marketPostcode}`;
        }
      }
    }
  } else if (!market.address && marketPostcode && marketPostcode.trim() !== '') {
    // If address is empty but postcode exists (and is a non-empty string), use postcode
    displayAddress = marketPostcode;
  }
  
  if (isDebugMode) {
    console.log('MarketDetail - Final displayAddress:', displayAddress);
  }

  // Generate image URL
  const imageUrl = getMarketImageUrl(market.market_ref || null);
  
  // Detect mobile device and set up map links
  useEffect(() => {
    // Simple mobile detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobileDevice(isMobile);
    
    // Get coordinates from the market location
    let lat: number | undefined;
    let lng: number | undefined;
    
    if (market?.location && 
        typeof market.location === 'object' && 
        Array.isArray(market.location.coordinates) && 
        market.location.coordinates.length >= 2) {
      // Coordinates are stored as [longitude, latitude]
      [lng, lat] = market.location.coordinates as [number, number];
    }
    
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      // Create map URLs
      const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      const appleUrl = `https://maps.apple.com/?daddr=${lat},${lng}`;
      
      setDirectionsUrls({
        google: googleUrl,
        apple: appleUrl 
      });
    } else {
      // Fallback to address if coordinates aren't available
      const address = market.address ? encodeURIComponent(market.address) : null;
      const postcode = market.postcode ? encodeURIComponent(market.postcode) : null;
      let addressAndPostcode = address;
      
      if (postcode) {
        addressAndPostcode = address ? `${address}, ${postcode}` : postcode;
      }
      
      if (addressAndPostcode) {
        setDirectionsUrls({
          google: `https://www.google.com/maps/dir/?api=1&destination=${addressAndPostcode}`,
          apple: `https://maps.apple.com/?daddr=${addressAndPostcode}`
        });
      } else {
        setDirectionsUrls({ google: null, apple: null });
      }
    }
    
    // Fetch next three market openings
    const fetchNextOpenings = async () => {
      try {
        const today = new Date();
        const nextMonth = addDays(today, 90); // Look ahead 90 days
        
        // Get all upcoming openings for this specific market
        const openings = await marketOpeningsBetween(today, nextMonth);
        const filteredOpenings = openings.filter(o => o.marketId === market.market_id);
        
        // Take the first three openings
        setNextThreeOpenings(filteredOpenings.slice(0, 3));
      } catch (error) {
        if (isDebugMode) {
          console.error('Error fetching next openings:', error);
        }
      }
    };
    
    fetchNextOpenings();
  }, [market, isDebugMode]);
  

  const HEADER_HEIGHT = '60px';

  return (
    <div 
      className="market-detail-viewport bg-gray-900" 
      style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
        color: 'white'
      }}
    >
      {/* Header */}
      <div 
        className="market-detail-header bg-gray-900 border-b border-gray-700"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          zIndex: 10,
          paddingLeft: '16px',
          paddingRight: '16px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div className="flex items-center justify-between h-full">
          {/* Back button */}
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-300"
            aria-label="Back to list"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          {/* Title */}
          <h2 className="flex-grow text-center text-2xl font-semibold text-white truncate px-2">
            {market.name}
          </h2>

          {/* Edit button or spacer */}
          {session && adminUserId === session.user.id ? (
            <button
              onClick={() => onEdit && onEdit(market)}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-300 ml-4"
              aria-label="Edit market"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          ) : onEdit ? (
            <button 
              className="px-3 py-1 text-sm font-medium rounded-md bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed"
              aria-label="Edit market details (disabled)"
              disabled
              title={session ? "Editing restricted to admin users." : "Login required to edit."}
            >
              Edit
            </button>
          ) : (
            <div style={{ width: '3.15rem' }} />
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        className="market-detail-content overflow-y-auto"
        style={{
          position: 'absolute',
          top: HEADER_HEIGHT,
          left: 0,
          right: 0,
          bottom: 0,
          padding: '16px',
          paddingBottom: '24px',
          overflowY: 'auto'
        }}
      >
        <div className="flex-1 overflow-y-auto py-4 px-4">
          {/* Market Image */}
          {imageUrl && (
            <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden bg-gray-800">
              <img 
                src={imageUrl} 
                alt={market.name} 
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Where Section */}
          <SectionCard title="Where" isDebugMode={isDebugMode}>
            {displayAddress.trim() && (
              <SubsectionWrapper isDebugMode={isDebugMode}>
                <DetailItem title="Address" isDebugMode={isDebugMode}>
                  <DetailText isDebugMode={isDebugMode}>
                    {displayAddress}
                  </DetailText>
                </DetailItem>
              </SubsectionWrapper>
            )}
            
            {(directionsUrls.google || directionsUrls.apple) && (
              <SubsectionWrapper className="mt-2" isDebugMode={isDebugMode}>
                <DetailItem title="Directions" isDebugMode={isDebugMode}>
                  <div className="flex gap-2">
                    {directionsUrls.google && (
                      <button 
                        onClick={() => {
                          if (directionsUrls.google) {
                            window.open(directionsUrls.google, '_blank');
                          }
                        }}
                        disabled={!directionsUrls.google}
                        className={`flex-1 px-3 py-2 ${directionsUrls.google ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'} rounded transition-colors text-sm font-medium`}
                      >
                        Google Maps
                      </button>
                    )}
                    {directionsUrls.apple && isMobileDevice && (
                      <button 
                        onClick={() => {
                          if (directionsUrls.apple) {
                            window.open(directionsUrls.apple, '_blank');
                          }
                        }}
                        disabled={!directionsUrls.apple}
                        className={`flex-1 px-3 py-2 ${directionsUrls.apple ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'} rounded transition-colors text-sm font-medium`}
                      >
                        Apple Maps
                      </button>
                    )}
                  </div>
                </DetailItem>
              </SubsectionWrapper>
            )}
          </SectionCard>

          {/* When Section */}
          <SectionCard title="When" isDebugMode={isDebugMode}>
            {market.opening_hours && (
              <SubsectionWrapper isDebugMode={isDebugMode}>
                <DetailItem title="Opening Hours" isDebugMode={isDebugMode}>
                  {((): React.ReactNode => {
                    const hoursContent = humanizeOpeningHours(market.opening_hours);
                    if (Array.isArray(hoursContent)) {
                      return hoursContent.map((line: string, index: number) => (
                        <DetailText key={index} isDebugMode={isDebugMode}>
                          {line}
                        </DetailText>
                      ));
                    } else if (typeof hoursContent === 'string') {
                      return (
                        <DetailText isDebugMode={isDebugMode}>
                          {hoursContent}
                        </DetailText>
                      );
                    }
                    return null;
                  })()}
                </DetailItem>
              </SubsectionWrapper>
            )}
            
            {nextThreeOpenings.length > 0 && (
              <SubsectionWrapper className="mt-2" isDebugMode={isDebugMode}>
                <DetailItem title="Next Dates" isDebugMode={isDebugMode}>
                  <div className="space-y-2">
                    {nextThreeOpenings.map((opening, index) => (
                      <div 
                        key={index} 
                        className="bg-blue-50 dark:bg-blue-900/30 rounded-md p-2"
                      >
                        {opening.startTime && opening.endTime ? (
                          <DetailText isDebugMode={isDebugMode}>
                            {opening.date ? format(parseISO(opening.date), 'EEEE, MMMM d') : 'Date not available'} • {opening.startTime} - {opening.endTime}
                          </DetailText>
                        ) : (
                          <DetailText isDebugMode={isDebugMode}>
                            {opening.date ? format(parseISO(opening.date), 'EEEE, MMMM d') : 'Date not available'} (Times TBC)
                          </DetailText>
                        )}
                      </div>
                    ))}
                  </div>
                </DetailItem>
              </SubsectionWrapper>
            )}
          </SectionCard>

          {/* What Section */}
          <SectionCard title="What" isDebugMode={isDebugMode}>
            {/* Website */}
            {market.website_url && (
              <SubsectionWrapper isDebugMode={isDebugMode}>
                <DetailItem title="Website" isDebugMode={isDebugMode}>
                  <a 
                    href={market.website_url.startsWith('http') ? market.website_url : `https://${market.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {market.website_url.replace(/^https?:\/\//, '')}
                  </a>
                </DetailItem>
              </SubsectionWrapper>
            )}

            {/* Description */}
            {market.description && (
              <SubsectionWrapper className="mt-2" isDebugMode={isDebugMode}>
                <DetailItem title="About" isDebugMode={isDebugMode}>
                  <DetailText isDebugMode={isDebugMode}>
                    {market.description}
                  </DetailText>
                </DetailItem>
              </SubsectionWrapper>
            )}

            {/* Categories */}
            {market.categories && market.categories.length > 0 && (
              <SubsectionWrapper className="mt-2" isDebugMode={isDebugMode}>
                <DetailItem title="Categories" isDebugMode={isDebugMode}>
                  <div className="flex flex-wrap gap-2">
                    {market.categories.map((category, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </DetailItem>
              </SubsectionWrapper>
            )}
          </SectionCard>

          {/* Contact Section */}
          {(market.email || market.phone) && (
            <SectionCard title="Contact" isDebugMode={isDebugMode}>
              {market.email && (
                <SubsectionWrapper isDebugMode={isDebugMode}>
                  <DetailItem title="Email" isDebugMode={isDebugMode}>
                    <a 
                      href={`mailto:${market.email}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {market.email}
                    </a>
                  </DetailItem>
                </SubsectionWrapper>
              )}
              
              {market.phone && (
                <SubsectionWrapper className={market.email ? 'mt-2' : ''} isDebugMode={isDebugMode}>
                  <DetailItem title="Phone" isDebugMode={isDebugMode}>
                    <a 
                      href={`tel:${market.phone.replace(/\D/g, '')}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {market.phone}
                    </a>
                  </DetailItem>
                </SubsectionWrapper>
              )}
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
