import React from 'react';
import { WhenMode } from './WhenModeToggle';
import { Session } from '@supabase/supabase-js'; // Import Session type
import { ToggleButton } from './ui/ToggleButton';
import { DateButton } from './ui/DateButton';

// Define the view modes that the header can handle
type HeaderViewMode = 'list' | 'map';

interface AppHeaderProps {
  debugMode: boolean;
  setDebugMode: (v: boolean) => void;
  currentWhenMode: WhenMode;
  setCurrentWhenMode: (mode: WhenMode) => void;
  viewMode: HeaderViewMode;
  setViewMode: (mode: HeaderViewMode) => void;
  session: Session | null;
  onLogout: () => void;
  onLogin: () => void;
}

export function AppHeader({ 
  debugMode,
  setDebugMode,
  currentWhenMode,
  setCurrentWhenMode,
  viewMode,
  setViewMode,
  session,
  onLogout,
  onLogin
}: AppHeaderProps) {
  const soonWeekToggleContainerStyle: React.CSSProperties = {
    paddingLeft: '0.5rem',
    boxSizing: 'border-box',
  };
  if (debugMode) {
    soonWeekToggleContainerStyle.border = '2px solid orange';
  }

  return (
    <header className="z-10 bg-gray-800 p-2 border-b border-gray-700">
      {/* Mode toggles */}
      <div className="flex justify-between items-center space-x-4">
        {/* WHEN toggle: Soon vs Week */}
        <div className="inline-flex bg-gray-700 rounded-lg p-1.5">
          <DateButton
            isActive={currentWhenMode === 'soon'}
            onClick={() => setCurrentWhenMode('soon')}
            className="px-2"
          >
            Soon
          </DateButton>
          <DateButton
            isActive={currentWhenMode === 'week'}
            onClick={() => setCurrentWhenMode('week')}
            className="px-2"
          >
            Week
          </DateButton>
        </div>
        
        <div className="flex-1" /> {/* Spacer to push other elements to the right */}
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="text-xs px-2 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600"
          >
            {debugMode ? 'Debug Mode On' : 'Debug Mode'}
          </button>

          {/* Login/Logout Button */}
          {session ? (
            <button
              onClick={onLogout}
              className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Login
            </button>
          )}
        </div>

        {/* VIEW toggle: List vs Map */}
        <div className="inline-flex bg-gray-700 rounded-lg p-1">
          <DateButton
            isActive={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            className="px-2"
          >
            List
          </DateButton>
          <DateButton
            isActive={viewMode === 'map'}
            onClick={() => setViewMode('map')}
            className="px-2"
          >
            Map
          </DateButton>
        </div>
      </div>
    </header>
  );
}
