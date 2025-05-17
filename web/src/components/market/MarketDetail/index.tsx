import { Market, hasCoordinates } from '../../../types/Market';
import { Session } from '@supabase/supabase-js';
import { MarketHeader } from './MarketHeader';
import { MarketInfo } from './MarketInfo';
import { MarketOpeningTimes } from './MarketOpeningTimes';
import { MarketContact } from './MarketContact';
import { MarketMap } from './MarketMap';
import { SectionCard } from './shared/SectionCard';

interface MarketDetailProps {
  market: Market;
  onBack: () => void;
  onEdit?: (market: Market) => void;
  isDebugMode?: boolean;
  session: Session | null;
  adminUserId?: string;
}

export function MarketDetail({ 
  market, 
  onBack, 
  onEdit, 
  isDebugMode = false, 
  session,
  adminUserId 
}: MarketDetailProps) {
  // MarketOpeningTimes now handles its own data fetching

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 min-h-screen">
      {/* Header with image and back button */}
      <MarketHeader 
        market={market} 
        onBack={onBack} 
        onEdit={onEdit}
        isDebugMode={isDebugMode}
        session={session}
        adminUserId={adminUserId}
      />

      {/* Main content */}
      <div className="p-4 space-y-6">
        {/* Market Info Section */}
        <SectionCard title="Market Information" isDebugMode={isDebugMode}>
          <MarketInfo 
            market={market} 
            isDebugMode={isDebugMode} 
          />
        </SectionCard>

        {/* Opening Times Section */}
        <SectionCard title="Opening Times" isDebugMode={isDebugMode}>
          <MarketOpeningTimes 
            market={market}
            schedule={market.schedule}
            isDebugMode={isDebugMode}
          />
        </SectionCard>

        {/* Contact Section */}
        {(market.contact_phone || market.contact_email || market.social_media) && (
          <SectionCard title="Contact Information" isDebugMode={isDebugMode}>
            <MarketContact 
              market={market} 
              isDebugMode={isDebugMode} 
            />
          </SectionCard>
        )}

        {/* Map Section */}
        {hasCoordinates(market) && (
          <SectionCard title="Location" isDebugMode={isDebugMode}>
            <MarketMap 
              market={market} 
              isDebugMode={isDebugMode} 
            />
          </SectionCard>
        )}
      </div>
    </div>
  );
}
