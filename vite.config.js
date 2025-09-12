import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'port-writer',
      configureServer(server) {
        // Write the actual port after server starts listening
        server.httpServer?.once('listening', () => {
          const actualPort = server.httpServer.address().port;
          const portFile = path.resolve(__dirname, '.vite-port');
          
          // Write actual port to file
          writeFileSync(portFile, actualPort.toString());
          console.log(`🚀 Vite dev server running on port ${actualPort}`);
          console.log(`📝 Actual port written to: ${portFile}`);
        });
        
        // Update port file if server restarts
        server.watcher.on('change', (filePath) => {
          if (filePath.includes('vite.config.js')) {
            setTimeout(() => {
              if (server.httpServer?.listening) {
                const actualPort = server.httpServer.address().port;
                const portFile = path.resolve(__dirname, '.vite-port');
                writeFileSync(portFile, actualPort.toString());
                console.log(`🔄 Port updated to: ${actualPort}`);
              }
            }, 100);
          }
        });
      }
    }
  ],
  server: {
    strictPort: false, // Allow Vite to find available port
    port: 0, // Let Vite choose any available port
    host: true,
    open: false // Don't open browser automatically
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
}); 