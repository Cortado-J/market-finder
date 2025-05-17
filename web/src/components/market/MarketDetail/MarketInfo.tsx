import { Market } from '../../../types/Market';
import { DetailItem } from './shared/DetailItem';
import { DetailText } from './shared/DetailText';
import { format } from 'date-fns';

interface MarketInfoProps {
  market: Market;
  isDebugMode?: boolean;
}

export function MarketInfo({ market, isDebugMode = false }: MarketInfoProps) {
  // Format the address with proper postcode handling
  const formatAddress = () => {
    if (!market.address && !market.postcode) return 'Address not available';
    
    let displayAddress = market.address || '';
    const postcode = market.postcode?.trim();
    
    if (postcode) {
      // Check if postcode is already at the end of the address
      if (!displayAddress.toLowerCase().endsWith(postcode.toLowerCase())) {
        if (displayAddress.trim() === '') {
          return postcode;
        }
        return `${displayAddress.trim()}, ${postcode}`;
      }
    }
    
    return displayAddress || 'Address not available';
  };

  return (
    <div className="space-y-4">
      {/* Address */}
      <DetailItem title="Location" isDebugMode={isDebugMode}>
        <DetailText isDebugMode={isDebugMode}>
          {formatAddress()}
        </DetailText>
      </DetailItem>

      {/* Website */}
      {market.website && (
        <DetailItem title="Website" isDebugMode={isDebugMode}>
          <a 
            href={market.website.startsWith('http') ? market.website : `https://${market.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {market.website.replace(/^https?:\/\//, '')}
          </a>
        </DetailItem>
      )}

      {/* More Info */}
      {market.more_info && (
        <DetailItem title="Additional Information" isDebugMode={isDebugMode}>
          <DetailText isDebugMode={isDebugMode}>
            {market.more_info}
          </DetailText>
        </DetailItem>
      )}
    </div>
  );
}
