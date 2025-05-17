import { Market } from '../../../types/Market';
import { getMarketImageUrl } from '../../../utils/imageUtils';
import { Session } from '@supabase/supabase-js';
import { DetailText } from './shared/DetailText';

interface MarketHeaderProps {
  market: Market;
  onBack: () => void;
  onEdit?: (market: Market) => void;
  isDebugMode?: boolean;
  session: Session | null;
  adminUserId?: string;
}

export function MarketHeader({ 
  market, 
  onBack, 
  onEdit, 
  isDebugMode = false, 
  session,
  adminUserId 
}: MarketHeaderProps) {
  const imageUrl = getMarketImageUrl(market.market_ref || null);
  const isAdmin = session?.user?.id === adminUserId;

  return (
    <div className="relative bg-gray-800 rounded-t-lg overflow-hidden">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full z-10 hover:bg-black/70 transition-colors"
        aria-label="Back to list"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Edit button (conditionally rendered) */}
      {onEdit && isAdmin && (
        <button
          onClick={() => onEdit(market)}
          className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors z-10"
          aria-label="Edit market"
        >
          Edit
        </button>
      )}

      {/* Market image */}
      <div className="aspect-w-16 aspect-h-9 w-full bg-gray-700 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${market.name} market`}
            className="w-full h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center">
            <svg
              className="h-20 w-20 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Market name */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-1">{market.name}</h1>
        {market.description && (
          <DetailText isDebugMode={isDebugMode} className="text-gray-300">
            {market.description}
          </DetailText>
        )}
      </div>
    </div>
  );
}
