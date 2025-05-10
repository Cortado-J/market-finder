import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'

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
