import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // 이미지 최적화 권장 사항:
  // 1. public/logo.png를 WebP 형식으로 변환하여 public/logo.webp 생성
  //    (온라인 도구: https://squoosh.app/ 또는 https://convertio.co/kr/png-webp/)
  // 2. 또는 빌드 시 자동 변환을 원하면 vite-plugin-imagemin 설치:
  //    npm install -D vite-plugin-imagemin imagemin-webp
  //    그 후 plugins에 imagemin() 추가
  plugins: [react()],
  server: {
    fs: {
      strict: false,
    },
  },
  build: {
    // 번들 크기 최적화를 위한 chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리를 별도 청크로 분리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 아이콘 라이브러리 분리
          icons: ['lucide-react'],
        },
      },
    },
    // 청크 크기 경고 임계값 설정 (500KB)
    chunkSizeWarningLimit: 500,
    // 소스맵은 프로덕션에서 비활성화 (성능 향상)
    sourcemap: false,
    // esbuild 미니파이 최적화 (terser보다 빠름)
    minify: 'esbuild',
  },
});
