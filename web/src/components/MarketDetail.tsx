import { Market } from '../types/Market';
import { MarketOpening, marketOpeningsBetween } from '../utils/getMarketOpenings';
import { getMarketImageUrl, getCategoryIconUrl } from '../utils/imageUtils';
import { humanizeOpeningHours } from '../utils/scheduleUtils';
import { useEffect, useState, CSSProperties } from 'react';
import { OpenOn } from './NextOpening';
import { addDays, format, parseISO } from 'date-fns';

interface MarketDetailProps {
  market: Market;
  onBack: () => void;
  marketNextOpening?: MarketOpening;
  isDebugMode?: boolean; // Added for debug borders
}

export function MarketDetail({ market, onBack, marketNextOpening, isDebugMode = false }: MarketDetailProps) {
  // Guard clause: If market data is not available, don't render.
  if (!market) {
    console.error("MarketDetail rendered without a market object.");
    return null; 
  }

  // Log the received market object to check for postcode
  console.log('MarketDetail - Received Market:', JSON.parse(JSON.stringify(market)));

  // Construct the display address
  let displayAddress = market.address || '';
  const marketPostcode = market.postcode; // Now correctly typed from Market interface

  console.log('MarketDetail - market.address:', market.address);
  console.log('MarketDetail - market.postcode (from market object):', marketPostcode);

  if (marketPostcode && typeof marketPostcode === 'string' && marketPostcode.trim() !== '') {
    const trimmedMarketAddress = (market.address || '').trim().toLowerCase();
    const trimmedMarketPostcode = marketPostcode.trim().toLowerCase();

    // Check if the postcode (as a whole word/phrase) is already at the end of the address
    // This handles cases like "Street Name, City, POSTCODE" or "Street Name, City POSTCODE"
    if (!trimmedMarketAddress.endsWith(trimmedMarketPostcode)) {
      // Further check to avoid adding if address is just "POSTCODE" but marketPostcode is also "POSTCODE"
      // Or if address is "Some Road, POSTCODE" and marketPostcode is "POSTCODE"
      // A simple way is to check if postcode is a substring. If address is short, this might be too aggressive.
      // A more robust check: split address by comma or space and see if last part matches postcode.
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
  } else if (!market.address && marketPostcode && typeof marketPostcode === 'string' && marketPostcode.trim() !== '') {
    // If address is empty but postcode exists (and is a non-empty string), use postcode
    displayAddress = marketPostcode;
  }
  
  console.log('MarketDetail - Final displayAddress:', displayAddress);

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
        const nextMonth = addDays(today, 90); // Look ahead 90 days
        
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
  
  // Function to capitalize each word in a string
  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };
  
  // Section styling helper
  interface SectionCardProps {
    title: string;
    children: React.ReactNode;
    isDebugMode?: boolean;
  }

  const SectionCard: React.FC<SectionCardProps> = ({ title, children, isDebugMode = false }) => {
    // Debug style for the H2 title
    const h2DebugStyle: CSSProperties = isDebugMode 
      ? { border: '1px dashed cyan', boxSizing: 'border-box', margin: '0px', padding: '0px', lineHeight: '1' } 
      : { margin: '0px', padding: '0px', lineHeight: '1' };

    return (
      <div 
        className={`shadow-sm text-blue-900 ${isDebugMode ? 'debug-section' : ''} mb-[0.5rem]`}
        style={{ paddingTop: '8px', paddingLeft: '12px', paddingRight: '12px', paddingBottom: '2px', backgroundColor: '#dbeafe', borderRadius: '0.5rem' }} 
      >
        <div className="flex items-center mb-0"> 
          <h2 
            className="text-lg font-semibold text-blue-900 mt-0 mb-0" 
            style={h2DebugStyle} 
          >
            {title}
          </h2>
        </div>
        <div 
          className="m-0 p-0" 
          style={isDebugMode ? { border: '1px solid black', boxSizing: 'border-box'} : {}}
        >
          {children}
        </div>
      </div>
    );
  };

  // SubsectionWrapper component
  interface SubsectionWrapperProps {
    children: React.ReactNode;
    isDebugMode?: boolean;
    className?: string; // To allow passing existing margin classes etc.
  }

  const SubsectionWrapper: React.FC<SubsectionWrapperProps> = ({ children, isDebugMode, className }) => {
    const style: CSSProperties = {
      paddingTop: '8px',
      paddingBottom: '8px',
    };
    if (isDebugMode) {
      style.border = '1px dashed blue';
      style.boxSizing = 'border-box';
    }

    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  };

  // DetailItem component
  interface DetailItemProps {
    title: string;
    children: React.ReactNode;
    isDebugMode?: boolean;
  }

  const DetailItem: React.FC<DetailItemProps> = ({ title, children, isDebugMode }) => {
    const headingStyle: CSSProperties = {
      padding: '0px',
      fontWeight: 'bold',
      marginBottom: '4px', // Force a noticeable bottom margin via inline style
    };
    if (isDebugMode) {
      headingStyle.border = '1px dashed green';
      headingStyle.boxSizing = 'border-box';
    }

    return (
      <>
        <div
          role="heading"
          aria-level={3}
          className="text-sm font-bold leading-none mt-2 mb-0 p-0 text-blue-900" 
          style={headingStyle}
        >
          {title}
        </div>
        {children}
      </>
    );
  };

  // NEW DetailText component
  interface DetailTextProps {
    children: React.ReactNode;
    isDebugMode?: boolean;
    textColorClassName?: string;
    key?: string | number; // Allow key prop
  }

  const DetailText: React.FC<DetailTextProps> = ({ children, isDebugMode, textColorClassName = "text-blue-900", key }) => {
    const elementStyle: CSSProperties = {}; // Renamed for clarity, applies to div
    if (isDebugMode) {
      elementStyle.border = '1px dashed orange';
      elementStyle.boxSizing = 'border-box';
    }
    // mt-1 adds 4px top margin, p-0 ensures no extra padding from the div itself
    // Changed leading-none to leading-normal for better readability of wrapped text
    const classNames = `text-sm leading-normal mt-1 mb-0 p-0 ${textColorClassName}`;
    return (
      <div key={key} className={classNames} style={elementStyle}>
        {children}
      </div>
    );
  };

  const HEADER_HEIGHT = '60px'; // Define header height as a constant

  return (
    // Main viewport container: Relative positioning, 100vh, overflow hidden
    <div 
      className="market-detail-viewport bg-white" 
      style={{
        position: 'relative',
        height: '100vh', // Changed from 100% to 100vh to fill viewport
        overflow: 'hidden'
        // Removed backgroundColor: 'magenta'
      }}
    >
      {/* Absolutely Positioned Header */}
      <div 
        className="market-detail-header bg-white border-b border-gray-200"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          zIndex: 10,
          paddingLeft: '16px', // Apply side padding directly to header
          paddingRight: '16px'
        }}
      >
        <div 
          className="flex items-center justify-between h-full" // Ensure inner div takes full header height
        >
          {/* Back button */}
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-[3.15rem] h-[3.2rem] rounded-lg border border-gray-300 bg-blue-50 text-blue-900 shadow-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            aria-label="Back to list"
          >
            <span className="text-6xl font-bold">&lt;</span>
          </button>
          {/* Market name */}
          <h1 className="text-lg font-bold text-center text-blue-900 truncate" style={{ flexGrow: 1 }}>
            {market.name} 
          </h1>
          {/* Spacer to balance the back button */}
          <div style={{ width: '3.15rem' }} /> 
        </div>
      </div>

      {/* Absolutely Positioned Scrollable Content Area */}
      <div 
        className="market-detail-scroll-content hide-scrollbar"
        style={{
          position: 'absolute',
          top: HEADER_HEIGHT,
          bottom: 0,
          left: 0,
          right: 0,
          overflowY: 'auto',
          paddingTop: '8px', // Space below the header before content starts
          paddingBottom: '16px',
          paddingLeft: '16px', // Apply side padding to content area as well
          paddingRight: '16px'
        }}
      >
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
            <SubsectionWrapper className="mt-0.5" isDebugMode={isDebugMode}>
              <DetailItem title="Directions" isDebugMode={isDebugMode}>
                <div className="flex gap-2" style={isDebugMode ? { border: '1px dashed purple', boxSizing: 'border-box' } : {}}>
                  {directionsUrls.google && (
                    <button 
                      onClick={() => {
                        if (directionsUrls.google) {
                          window.open(directionsUrls.google, '_blank');
                        }
                      }}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-center flex-1"
                      style={isDebugMode ? { border: '1px dashed red', boxSizing: 'border-box' } : {}}
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
                      style={isDebugMode ? { border: '1px dashed red', boxSizing: 'border-box' } : {}}
                    >
                      Apple Maps
                    </button>
                  )}
                </div>
              </DetailItem>
            </SubsectionWrapper>
          )}
        </SectionCard>
        
        {/* WHEN section */}
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
                  return null; // Should not happen if humanizeOpeningHours is well-behaved
                })()}
              </DetailItem>
            </SubsectionWrapper>
          )}
          
          {nextThreeOpenings && nextThreeOpenings.length > 0 && (
            <SubsectionWrapper className="mt-1" isDebugMode={isDebugMode}>
              <DetailItem title="Next Dates" isDebugMode={isDebugMode}>
                {nextThreeOpenings.length > 0 ? (
                  <div className="space-y-1" style={isDebugMode ? { border: '1px dashed purple', boxSizing: 'border-box' } : {}}>
                    {nextThreeOpenings.map((opening, index) => (
                      <div key={index} className="rounded-md leading-tight py-0.5 px-1 text-sm text-blue-900" 
                          style={{ backgroundColor: '#edf5ff', ...(isDebugMode && { border: '1px dashed teal', boxSizing: 'border-box' }) }}>
                          {opening.startTime && opening.endTime ? (
                            <DetailText isDebugMode={isDebugMode}>
                              {format(parseISO(opening.date!), 'EEEE, MMMM d')} {opening.startTime} to {opening.endTime}
                            </DetailText>
                          ) : (
                            <DetailText isDebugMode={isDebugMode}>
                              {format(parseISO(opening.date!), 'EEEE, MMMM d')} (Times TBC)
                            </DetailText>
                          )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <DetailText isDebugMode={isDebugMode} textColorClassName="text-blue-900">
                    No upcoming dates available
                  </DetailText>
                )}
              </DetailItem>
            </SubsectionWrapper>
          )}
        </SectionCard>
        
        {/* WHAT section */}
        <SectionCard title="What" isDebugMode={isDebugMode}>
          {/* Website URL */}
          {market.website_url && (
            <SubsectionWrapper isDebugMode={isDebugMode}>
              <DetailItem title="Website URL" isDebugMode={isDebugMode}>
                <DetailText isDebugMode={isDebugMode} textColorClassName="text-blue-900 hover:underline">
                  <a href={market.website_url} target="_blank" rel="noopener noreferrer">
                    {market.website_url}
                  </a>
                </DetailText>
              </DetailItem>
            </SubsectionWrapper>
          )}
          
          {/* Description */}
          {market.description && (
            <SubsectionWrapper 
              isDebugMode={isDebugMode} 
              className={market.website_url ? 'mt-2' : ''} 
            >
              <DetailItem title="Description" isDebugMode={isDebugMode}>
                <DetailText isDebugMode={isDebugMode}>
                  {market.description}
                </DetailText>
              </DetailItem>
            </SubsectionWrapper>
          )}
          
          {/* Categories */}
          {market.categories && market.categories.length > 0 && (
            <SubsectionWrapper 
              isDebugMode={isDebugMode} 
              className={market.website_url || market.description ? "mt-2" : ""}
            >
              <DetailItem title="Categories" isDebugMode={isDebugMode}>
                <div className="flex flex-wrap gap-1 mt-0.5" style={isDebugMode ? { border: '1px dashed purple', boxSizing: 'border-box' } : {}}>
                  {market.categories.map((category, index) => (
                    <div key={index} className="flex items-center text-sm text-blue-900 leading-tight" style={isDebugMode ? { border: '1px dashed teal', boxSizing: 'border-box' } : {}}>
                      <img
                        src={getCategoryIconUrl(category)}
                        alt=""
                        className="w-[16px] h-[16px] mr-1"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <DetailText isDebugMode={isDebugMode}>
                        {capitalizeWords(category)}
                      </DetailText>
                    </div>
                  ))}
                </div>
              </DetailItem>
            </SubsectionWrapper>
          )}
        </SectionCard>
        
        {/* CONTACT section (conditionally rendered) */}
        {(market.contact_name || market.phone || market.email) && (
          <SectionCard title="CONTACT" isDebugMode={isDebugMode}>
            {market.contact_name && (
              <SubsectionWrapper className="mb-0.5" isDebugMode={isDebugMode}>
                <DetailItem title="Contact Name" isDebugMode={isDebugMode}>
                  <DetailText isDebugMode={isDebugMode}>
                    {market.contact_name}
                  </DetailText>
                </DetailItem>
              </SubsectionWrapper>
            )}
            {market.phone && (
              <SubsectionWrapper className="mb-0.5" isDebugMode={isDebugMode}>
                <DetailItem title="Phone" isDebugMode={isDebugMode}>
                  <DetailText isDebugMode={isDebugMode}>
                    {market.phone}
                  </DetailText>
                </DetailItem>
              </SubsectionWrapper>
            )}
            {market.email && (
              <SubsectionWrapper isDebugMode={isDebugMode}>
                <DetailItem title="Email" isDebugMode={isDebugMode}>
                  <DetailText isDebugMode={isDebugMode} textColorClassName="text-blue-900 hover:underline">
                    <a href={`mailto:${market.email}`}>
                      {market.email}
                    </a>
                  </DetailText>
                </DetailItem>
              </SubsectionWrapper>
            )}
          </SectionCard>
        )}
        
        {/* MORE INFO section (conditionally rendered) */}
        {market.more_info && (
          <SectionCard title="MORE INFO" isDebugMode={isDebugMode}>
            <SubsectionWrapper isDebugMode={isDebugMode}>
              <DetailItem title="More Info" isDebugMode={isDebugMode}>
                <DetailText isDebugMode={isDebugMode}>
                  {market.more_info}
                </DetailText>
              </DetailItem>
            </SubsectionWrapper>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
