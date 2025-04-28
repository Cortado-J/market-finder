import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Explicitly listen on all interfaces
    port: 5180,       // Default Vite port
    strictPort: true,  // Ensure we use the specified port
    hmr: {
      host: 'localhost'
    }
  }
})
