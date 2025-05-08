import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure base path is correctly set for production
  server: {
    host: '0.0.0.0',  // Explicitly listen on all interfaces
    port: 5180,       // Default Vite port
    strictPort: true,  // Ensure we use the specified port
    hmr: {
      host: 'localhost'
    }
  }
  // Note: Vite automatically handles import.meta.env variables, no need to explicitly define them
})
