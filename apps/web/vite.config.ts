import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/', // GitHub Pages 若部署在子路径需更改
  publicDir: 'public', // 确保public目录内容被复制到dist
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
      },
      '/pv.gif': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    target: ['es2015', 'safari11'],
    polyfillModulePreload: false,
    cssTarget: ['chrome61', 'safari11', 'firefox60'],
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  css: {
    postcss: './postcss.config.js'
  },
  define: {
    // 确保环境变量在构建时正确替换
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      mode === 'production' 
        ? 'https://backend.diliinfo.com' 
        : 'http://localhost:8787'
    ),
    global: 'globalThis'
  }
})); 