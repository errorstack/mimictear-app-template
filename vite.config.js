import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import url from '@rollup/plugin-url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        // 资源文件输出到assets目录
        assetFileNames: 'assets/[name]-[hash][extname]'
      },
      plugins: [
        url({
          include: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp'],
          limit: 0, // 不内联任何文件
          emitFiles: true
        })
      ]
    },
    // 使用相对路径
    assetsDir: 'assets',
    base: './',
    // 完全禁用base64内联
    assetsInlineLimit: 0
  }
})
