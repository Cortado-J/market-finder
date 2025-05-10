import React from 'react';
import { WhenMode } from './WhenModeToggle';

interface AppHeaderProps {
  debugMode: boolean;
  setDebugMode: (v: boolean) => void;
  currentWhenMode: WhenMode;
  setCurrentWhenMode: (mode: WhenMode) => void;
  viewMode: 'list' | 'map' | 'detail';
  setViewMode: (mode: 'list' | 'map') => void;
}

export function AppHeader({
  debugMode,
  setDebugMode,
  currentWhenMode,
  setCurrentWhenMode,
  viewMode,
  setViewMode
}: AppHeaderProps) {
  return (
    <header className="z-10 bg-white p-4 border-b border-gray-200">
      {/* Mode toggles */}
      <div className="flex justify-between items-center">
        {/* WHEN toggle: Soon vs Week */}
        <div className="inline-flex bg-gray-200 rounded p-1">
          <button
            onClick={() => setCurrentWhenMode('soon')}
            className={`date-button ${currentWhenMode === 'soon' ? 'active' : ''}`}
          >
            Soon Mode
          </button>
          <button
            onClick={() => setCurrentWhenMode('week')}
            className={`date-button ${currentWhenMode === 'week' ? 'active' : ''}`}
          >
            Week Mode
          </button>
        </div>
        <button
          onClick={() => setDebugMode(!debugMode)}
          className="text-xs px-2 py-1 bg-gray-200 rounded"
        >
          {debugMode ? 'Debug Mode On' : 'Debug Mode'}
        </button>
        {/* VIEW toggle: List vs Map */}
        <div className="inline-flex bg-gray-200 rounded p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`date-button ${viewMode === 'list' ? 'active' : ''}`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`date-button ${viewMode === 'map' ? 'active' : ''}`}
          >
            Map View
          </button>
        </div>
      </div>
    </header>
  );
}
