import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { noInlineAssets } from './vite-plugin-no-inline.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), noInlineAssets()],
  resolve: {
    alias: {
      '@mimictear/sdk': path.resolve(__dirname, '../mimictear-sdk/src/index.jsx')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': {}
  },
  build: {
    lib: {
      entry: './src/App.jsx',
      name: 'App',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@mimictear/sdk'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@mimictear/sdk': 'MimicTearSDK'
        },
        // 资源文件输出到assets目录
        assetFileNames: (assetInfo) => {
          // 确保所有资源文件都输出到assets目录
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    // 使用相对路径
    assetsDir: 'assets',
    base: './',
    // 完全禁用base64内联，所有资源都作为独立文件处理
    assetsInlineLimit: 0,
    // 确保资源文件不被内联
    cssCodeSplit: false,
    // 确保所有资源都被正确处理
    copyPublicDir: true,
    sourcemap: false,
    minify: true
  }
})
