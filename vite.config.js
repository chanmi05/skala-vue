import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      // 자동 검색할 컴포넌트 폴더 경로 (기본값: 'src/components')
      dirs: ['src/components'],
      // 검색할 파일 확장자
      extensions: ['vue'],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    // iTunes Search API는 브라우저의 교차 출처 요청(CORS)을 허용하지 않을 수 있다.
    // Vue -> Vite(같은 출처) -> iTunes 순서로 전달해서 Axios 실습이 로컬에서 동작하게 한다.
    // 배포 환경에서는 vercel.json이 같은 /itunes-api 경로를 Apple로 전달한다.
    proxy: {
      '/itunes-api': {
        target: 'https://itunes.apple.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/itunes-api/, ''),
      },
    },
  },
})
