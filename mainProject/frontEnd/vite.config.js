import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Đổi thành địa chỉ BE
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // Tự động nhận diện các phần mở rộng
  },
});
