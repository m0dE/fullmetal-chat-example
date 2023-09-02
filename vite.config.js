import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mkcert(), basicSsl()],
  server: {
    port: '443',
    https: {
      key: '/root/certification/key.pem',
      cert: '/root/certification/cert.pem'
    },
    proxy: {
      
      '/socket.io': {
        target: 'https://66.42.104.128:8081',
        ws: true
      }
    }
  },
});
