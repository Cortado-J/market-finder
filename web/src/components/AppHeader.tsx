import React from 'react';
import { WhenMode } from './WhenModeToggle';
import { Session } from '@supabase/supabase-js'; // Import Session type

interface AppHeaderProps {
  debugMode: boolean;
  setDebugMode: (v: boolean) => void;
  currentWhenMode: WhenMode;
  setCurrentWhenMode: (mode: WhenMode) => void;
  viewMode: 'list' | 'map' | 'detail' | 'login'; // Updated to include 'login'
  setViewMode: (mode: 'list' | 'map') => void;
  session: Session | null; // Add session prop
  onLogout: () => void; // Add onLogout prop
  onLogin: () => void; // Add onLogin prop
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
    <header className="z-10 bg-white p-4">
      {/* Mode toggles */}
      <div className="flex justify-between items-center">
        {/* WHEN toggle: Soon vs Week */}
        <div 
          className="inline-flex bg-gray-200 rounded when-mode-toggle" 
          style={soonWeekToggleContainerStyle}
        >
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
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="text-xs px-2 py-1 bg-gray-200 rounded"
          >
            {debugMode ? 'Debug Mode On' : 'Debug Mode'}
          </button>

          {/* Login/Logout Button */}
          {session ? (
            <button
              onClick={onLogout}
              className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Login
            </button>
          )}
        </div>

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
