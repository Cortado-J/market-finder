import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'

// A simple component to display build time and other debug info
// It will now be conditionally rendered by App.tsx (or similar) based on its isDebugMode state.
interface BuildInfoProps {
  isDebugMode: boolean;
}

const BuildInfo: React.FC<BuildInfoProps> = ({ isDebugMode }) => {
  if (!isDebugMode) {
    return null; // Don't render anything if not in debug mode
  }

  // Styles for the build info box
  const style: React.CSSProperties = {
    position: 'fixed', 
    bottom: 0, 
    right: 0, 
    background: 'rgba(0,0,0,0.7)', 
    color: 'white', 
    padding: '8px', 
    fontSize: '12px',
    zIndex: 9999,
    maxWidth: '300px',
    overflowWrap: 'break-word'
  };

  return (
    <div id="debug-info" style={style}>
      <div>Env vars loaded: {Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')).length}</div>
      <div>Build time: {new Date().toISOString()}</div>
    </div>
  );
};

// Export BuildInfo so it can be imported by App.tsx or other components
export { BuildInfo };

// Initialize the app with error handling
try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }
  
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
        {/* <BuildInfo /> BuildInfo will now be rendered by App.tsx conditionally */}
      </ErrorBoundary>
    </StrictMode>,
  )
  console.log('App rendered successfully')
} catch (error) {
  console.error('Failed to initialize app:', error)
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Failed to load the application</h1>
      <p>There was an error initializing the app. Please check the console for details.</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">${error}</pre>
    </div>
  `
}
