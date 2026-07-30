import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // 资源以 /public/ 为基址，与后端 factory.py 中 StaticFiles 挂载的 /public 对应
  base: '/public/',
  plugins: [
    vue(),
    vueJsx(),
    vuetify({
      styles: {
        configFile: 'src/styles/variables/_vuetify.scss',
      },
    }),
    Components({
      dirs: ['src/@core/components'],
      dts: true,
    }),
    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core', '@vueuse/math', 'vuex'],
      vueTemplate: true,
    }),
    VitePWA({
      injectRegister: 'script',
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css|html)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 缓存 30 天
              },
            },
          },
        ],
        navigateFallback: '/index.html', // 确保页面路由正确加载
        navigateFallbackDenylist: [/.*\/api\/v\d+\/system\/logging.*/],
      },
      injectManifest: {
        rollupFormat: 'iife',
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        'name': 'MoviePilot',
        'short_name': 'MoviePilot',
        'start_url': './',
        'display': 'standalone',
        'icons': [
          {
            'src': './android-chrome-192x192.png',
            'sizes': '192x192',
            'type': 'image/png',
            'purpose': 'any',
          },
          {
            'src': './android-chrome-192x192_maskable.png',
            'sizes': '192x192',
            'type': 'image/png',
            'purpose': 'maskable',
          },
          {
            'src': './android-chrome-512x512.png',
            'sizes': '512x512',
            'type': 'image/png',
            'purpose': 'any',
          },
          {
            'src': './android-chrome-512x512_maskable.png',
            'sizes': '512x512',
            'type': 'image/png',
            'purpose': 'maskable',
          },
        ],
        'theme_color': '#28243D',
        'background_color': '#28243D',
        'shortcuts': [
          {
            'name': '推荐',
            'url': './recommend',
            'icons': [
              {
                'src': './sparkles-icon-192x192.png',
                'sizes': '192x192',
                'type': 'image/png',
              },
            ],
          },
          {
            'name': '电影订阅',
            'url': './subscribe/movie',
            'icons': [
              {
                'src': './clock-icon-192x192.png',
                'sizes': '192x192',
                'type': 'image/png',
              },
            ],
          },
          {
            'name': '电视剧订阅',
            'url': './subscribe/tv',
            'icons': [
              {
                'src': './clock-icon-192x192.png',
                'sizes': '192x192',
                'type': 'image/png',
              },
            ],
          },
          {
            'name': '设置',
            'url': './setting',
            'icons': [
              {
                'src': './cog-icon-192x192.png',
                'sizes': '192x192',
                'type': 'image/png',
              },
            ],
          },
        ],
      },
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/@core', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/@layouts', import.meta.url)),
      '@images': fileURLToPath(new URL('./src/assets/images/', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles/', import.meta.url)),
      '@configured-variables': fileURLToPath(new URL('./src/styles/variables/_template.scss', import.meta.url)),
      'apexcharts': fileURLToPath(new URL('node_modules/apexcharts', import.meta.url)),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: false,
      },
    },
    chunkSizeWarningLimit: 5000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
      },
    },
  },
  optimizeDeps: {
    exclude: ['vuetify'],
    entries: ['./src/**/*.vue'],
  },
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
})
