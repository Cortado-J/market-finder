import React from 'react';
import { Market } from '../types/Market';
import { MarketOpening } from '../utils/getMarketOpenings';
import { OpenOn } from './NextOpening';
import { calculateDistance, getCoordinates } from '../utils/locationUtils';

interface MapMarketPopupProps {
  selectedMarket: Market;
  selectedMarketNextOpening?: MarketOpening;
  currentWhenMode: string;
  defaultLocation: [number, number];
  onViewDetails: (market: Market | null) => void;
}

export function MapMarketPopup({
  selectedMarket,
  selectedMarketNextOpening,
  currentWhenMode,
  defaultLocation,
  onViewDetails,
}: MapMarketPopupProps) {
  return (
    <div>
      {/* Market name only */}
      <div className="flex items-center">
        <h3 className="market-name">{selectedMarket.name}</h3>
      </div>
      {/* Next opening - hidden in Week mode */}
      {selectedMarketNextOpening && currentWhenMode !== 'week' && (
        <OpenOn 
          opening={selectedMarketNextOpening} 
          className="text-sm mt-1 text-green-600 font-bold" 
        />
      )}
      {/* Opening hours */}
      {selectedMarket.opening_hours && (
        <p className="text-sm mt-1 opacity-90">
          <span>Opening hours:</span> {selectedMarket.opening_hours}
        </p>
      )}
      {/* Address with distance - combined into one text element */}
      <p className="mt-2">
        {selectedMarket.address} {(() => {
          const coords = getCoordinates(selectedMarket);
          if (!coords) return null;
          const distance = calculateDistance(defaultLocation, coords);
          return `(${Math.round(distance * 0.621371)} miles)`;
        })()}
      </p>
      {/* View details button */}
      <button 
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={() => onViewDetails(selectedMarket)}
      >
        View Market Details
      </button>
    </div>
  );
}
