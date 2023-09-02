import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: '443',
    https: {
      key: 'key.pem',
      cert: 'cert.pem',
    },
    proxy: {
      '/socket.io': {
        target: 'https://localhost:8081',
        ws: true,
      },
    },
  },
});
