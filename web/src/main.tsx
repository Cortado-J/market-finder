import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'

// Add a debug element to help identify if the app is loading at all
const DebugInfo = () => {
  return (
    <div id="debug-info" style={{ 
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
    }}>
      <div>Env vars loaded: {Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')).length}</div>
      <div>Build time: {new Date().toISOString()}</div>
    </div>
  )
}

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
        <DebugInfo />
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
