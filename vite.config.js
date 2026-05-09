import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    // 使用相对路径
    assetsDir: 'assets',
    base: './',
    // 完全禁用base64内联
    assetsInlineLimit: 0
  }
})
