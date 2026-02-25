import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    port: 3000, // 3000번 포트 고정
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: id => {
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'vendor-react'
            }
            if (id.includes('@capacitor')) {
              return 'vendor-capacitor'
            }
            if (id.includes('zustand')) {
              return 'vendor-store'
            }
            return 'vendor'
          }
        },
      },
    },
  },
})
