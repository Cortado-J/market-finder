import { Market } from '../../../types/Market';
import { DetailItem } from './shared/DetailItem';
import { DetailText } from './shared/DetailText';
import { SubsectionWrapper } from './shared/SubsectionWrapper';

interface MarketContactProps {
  market: Market;
  isDebugMode?: boolean;
}

export function MarketContact({ market, isDebugMode = false }: MarketContactProps) {
  if (!market.contact_phone && !market.contact_email && !market.website) {
    return null;
  }

  return (
    <SubsectionWrapper isDebugMode={isDebugMode}>
      <div className="space-y-4">
        {/* Phone */}
        {market.contact_phone && (
          <DetailItem title="Phone" isDebugMode={isDebugMode}>
            <a 
              href={`tel:${market.contact_phone.replace(/[^0-9+]/g, '')}`}
              className="text-blue-400 hover:underline"
            >
              {market.contact_phone}
            </a>
          </DetailItem>
        )}

        {/* Email */}
        {market.contact_email && (
          <DetailItem title="Email" isDebugMode={isDebugMode}>
            <a 
              href={`mailto:${market.contact_email}`}
              className="text-blue-400 hover:underline"
            >
              {market.contact_email}
            </a>
          </DetailItem>
        )}

        {/* Social Media */}
        {market.social_media && (
          <DetailItem title="Social Media" isDebugMode={isDebugMode}>
            <div className="flex space-x-4">
              {Object.entries(market.social_media).map(([platform, url]) => (
                <a 
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              ))}
            </div>
          </DetailItem>
        )}
      </div>
    </SubsectionWrapper>
  );
}
