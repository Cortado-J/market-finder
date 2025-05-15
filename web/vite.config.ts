import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Tailwind CSS plugin first to ensure it processes styles before React
    tailwindcss(),
    react(),
  ],
  base: '/', // Ensure base path is correctly set for production
  server: {
    host: '0.0.0.0',  // Explicitly listen on all interfaces
    port: 5180,       // Default Vite port
    strictPort: true,  // Ensure we use the specified port
    hmr: {
      host: 'localhost'
    }
  },
  // Explicitly configure CSS processing
  css: {
    // Make sure CSS processing is properly handled
    devSourcemap: true,
    // Disable CSS modules by default
    modules: {
      scopeBehaviour: 'global'
    }
  },
  // Optimize build for better performance
  build: {
    // Ensure CSS is processed correctly
    cssCodeSplit: true,
    sourcemap: true
  }
})
