import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { visualizer } from 'rollup-plugin-visualizer'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    visualizer({
      // 번틀 분석 보고서
      filename: 'stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],
  server: {
    port: 3000, // 3000번 포트 고정
  },
  build: {
    outDir: 'dist',
    // iOS 웹뷰 호환성 및 최신 문법 지원
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // manualChunks를 통한 라이브러리 분리
        manualChunks: id => {
          if (id.includes('node_modules')) {
            // React 관련 패키지
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom')
            ) {
              return 'vendor-react'
            }
            // Firebase 관련 패키지
            if (id.includes('firebase')) {
              return 'vendor-firebase'
            }
            return 'vendor-libs'
          }
        },
        // 빌드 파일 이름 구조화
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
  // 배포 시 불필요한 로그 제거
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
