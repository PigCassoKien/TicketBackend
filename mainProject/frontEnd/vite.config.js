import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ticketcinema-backend.onrender.com', // Cập nhật thành địa chỉ backend live
        changeOrigin: true,
        secure: true, // Đảm bảo sử dụng HTTPS vì backend trên Render chạy qua HTTPS
      },
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // Tự động nhận diện các phần mở rộng
  },
});