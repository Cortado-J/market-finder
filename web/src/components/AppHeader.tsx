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
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setDebugMode(!debugMode)}
          className="text-xs px-2 py-1 bg-gray-200 rounded"
        >
          {debugMode ? 'Debug Mode On' : 'Debug Mode'}
        </button>
      </div>
      {/* Mode toggles */}
      <div className="flex justify-between items-center">
        {/* WHEN toggle: Soon vs Week */}
        <div className="inline-flex bg-gray-200 rounded p-1">
          <button
            onClick={() => setCurrentWhenMode('soon')}
            className={`px-3 py-1 rounded ${currentWhenMode === 'soon' ? 'bg-white shadow-sm' : ''}`}
          >
            Soon Mode
          </button>
          <button
            onClick={() => setCurrentWhenMode('week')}
            className={`px-3 py-1 rounded ${currentWhenMode === 'week' ? 'bg-white shadow-sm' : ''}`}
          >
            Week Mode
          </button>
        </div>
        {/* VIEW toggle: List vs Map */}
        <div className="inline-flex bg-gray-200 rounded p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 rounded ${viewMode === 'map' ? 'bg-white shadow-sm' : ''}`}
          >
            Map View
          </button>
        </div>
      </div>
    </header>
  );
}
