import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'
import { resolve } from 'path'

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    vueJsx(),
    // vueDevTools(),
    vitePrerenderPlugin({
      prerenderScript: resolve(__dirname, 'src/prerender.ts'),
      renderTarget: '#app',
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
  },
  server: {
    host: '0.0.0.0',
    port: 1000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:1998',
        ws: true,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('API proxy error:', err);
          });
        }
      },
      '/static/home': {
        // target: 'http://127.0.0.1:2999',
        target: 'http://127.0.0.1:1000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/static\/home/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Static proxy error:', err);
          });
        }
      },
    }
  },
  build: {
    outDir: 'deployment',
    assetsDir: '',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router']
        }
      }
    }
  },
  base: command === 'build' ? '/static/home/' : '/'
}))
