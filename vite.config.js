import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: '443',
    https: {
      key: '/root/certification/key.pem',
      cert: '/root/certification/cert.pem',
    },
    proxy: {
      '/socket.io': {
        target: 'https://66.42.104.128:8081',
        ws: true,
      },
    },
  },
});
