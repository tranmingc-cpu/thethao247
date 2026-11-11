import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-rss': {
        target: 'https://thethao247.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-rss/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
          'Referer': 'https://thethao247.vn/'
        }
      }
    }
  }
});

