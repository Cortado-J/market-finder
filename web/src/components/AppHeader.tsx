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
    <header className="z-10 bg-gray-800 p-4 border-b border-gray-700">
      {/* Mode toggles */}
      <div className="flex justify-between items-center">
        {/* WHEN toggle: Soon vs Week */}
        <div 
          className="inline-flex bg-gray-700 rounded when-mode-toggle" 
          style={soonWeekToggleContainerStyle}
        >
          <button
            onClick={() => setCurrentWhenMode('soon')}
            className={`px-4 py-2 rounded-md transition-colors ${currentWhenMode === 'soon' 
            ? 'bg-gray-600 text-white' 
            : 'bg-transparent text-gray-300 hover:bg-gray-700'}`}
          >
            Soon Mode
          </button>
          <button
            onClick={() => setCurrentWhenMode('week')}
            className={`px-4 py-2 rounded-md transition-colors ${currentWhenMode === 'week' 
            ? 'bg-gray-600 text-white' 
            : 'bg-transparent text-gray-300 hover:bg-gray-700'}`}
          >
            Week Mode
          </button>
        </div>
        
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
        <div className="inline-flex bg-gray-700 rounded p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'list' 
              ? 'bg-gray-600 text-white' 
              : 'bg-transparent text-gray-300 hover:bg-gray-700'}`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'map' 
              ? 'bg-gray-600 text-white' 
              : 'bg-transparent text-gray-300 hover:bg-gray-700'}`}
          >
            Map View
          </button>
        </div>
      </div>
    </header>
  );
}
