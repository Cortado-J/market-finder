import React from 'react';
import { Market } from '../types/Market'; // Corrected path
import { Map } from './Map';
import { MarketList } from './MarketList';
import { MapMarketPopup } from './MapMarketPopup'; // Assuming this component exists
import { WhenMode } from './WhenModeToggle';
import { MarketOpening } from './NextOpening'; // Added import

interface MainContentProps {
  viewMode: 'map' | 'list';
  filteredMarkets: Market[];
  selectedMarket: Market | null;
  defaultLocation: [number, number];
  handleMarketSelect: (market: Market | null) => void;
  selectedMarketNextOpening: MarketOpening | undefined; // Changed type
  currentWhenMode: WhenMode;
  selectedDayCode: string | undefined; // Changed type
  debugMode: boolean; // For MarketList
}

export function MainContent({
  viewMode,
  filteredMarkets,
  selectedMarket,
  defaultLocation,
  handleMarketSelect,
  selectedMarketNextOpening,
  currentWhenMode,
  selectedDayCode,
  debugMode,
}: MainContentProps) {
  return (
    // This main element will take the height from its parent div in App.tsx (which has flexGrow: 1)
    // Its children (Map or MarketList) are already styled for height: 100%
    <main className="flex-grow" style={{ height: '100%' }}>
      {viewMode === 'map' ? (
        <div className="map-container relative" style={{ height: '100%', flexGrow: 1 }}>
          <Map
            markets={filteredMarkets}
            selectedMarket={selectedMarket}
            userLocation={defaultLocation}
            onMarketSelect={handleMarketSelect}
          />
          {selectedMarket && (
            <div className="absolute bottom-4 left-4 right-4 market-item selected z-10">
              <MapMarketPopup
                selectedMarket={selectedMarket}
                selectedMarketNextOpening={selectedMarketNextOpening}
                currentWhenMode={currentWhenMode}
                defaultLocation={defaultLocation}
                onViewDetails={handleMarketSelect} // Or specific detail view handler
              />
            </div>
          )}
        </div>
      ) : (
        <MarketList 
          markets={filteredMarkets}
          selectedMarket={selectedMarket} // Pass selectedMarket to MarketList
          onMarketSelect={handleMarketSelect}
          userLocation={defaultLocation} 
          isWeekMode={currentWhenMode === 'week'}
          selectedDayCode={selectedDayCode}
          debugMode={debugMode} // Pass debugMode to MarketList
          style={{ height: '100%', overflowY: 'auto' }} // Ensure MarketList fills height and scrolls
        />
      )}
    </main>
  );
}
