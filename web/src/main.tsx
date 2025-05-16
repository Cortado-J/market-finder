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
    <div class="p-5 font-sans">
      <h1 class="text-2xl font-bold mb-4">Failed to load the application</h1>
      <p class="mb-4">There was an error initializing the app. Please check the console for details.</p>
      <pre class="bg-gray-100 p-2.5 rounded overflow-auto">${error}</pre>
    </div>
  `
}
