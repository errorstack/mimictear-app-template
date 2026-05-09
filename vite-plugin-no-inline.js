import fs from 'fs'
import path from 'path'

// Vite插件：确保静态资源不被内联为base64
export function noInlineAssets() {
  let distDir = ''
  let base = '/'
  let isDev = false
  const copiedFiles = new Set()
  
  return {
    name: 'no-inline-assets',
    enforce: 'pre',
    
    configResolved(config) {
      distDir = path.resolve(config.root, config.build.outDir || 'dist')
      base = config.base || '/'
      isDev = config.command === 'serve'
      // 确保base以/结尾
      if (!base.endsWith('/')) {
        base = base + '/'
      }
    },
    
    transform(code, id) {
      // 匹配图片导入
      if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(id)) {
        // 获取文件名
        const fileName = path.basename(id)
        
        // 记录需要复制的文件（仅在生产模式）
        if (!isDev) {
          copiedFiles.add({ src: id, fileName })
        }
        
        // 根据环境生成不同的路径
        let assetPath
        if (isDev) {
          // 开发环境：使用 /src/assets/ 路径
          // 获取相对于src/assets的相对路径
          const assetsIndex = id.indexOf('/src/assets/')
          if (assetsIndex !== -1) {
            const relativePath = id.substring(assetsIndex + '/src/assets/'.length)
            assetPath = `/src/assets/${relativePath}`
          } else {
            assetPath = `/src/assets/${fileName}`
          }
        } else {
          // 生产环境：使用 /dist/assets/ 路径
          assetPath = `/dist/assets/${fileName}`
        }
        
        return {
          code: `export default "${assetPath}"`,
          map: null
        }
      }
    },
    
    closeBundle() {
      // 在构建完成后复制所有资源文件（仅生产模式）
      if (copiedFiles.size > 0) {
        const assetsDir = path.join(distDir, 'assets')
        if (!fs.existsSync(assetsDir)) {
          fs.mkdirSync(assetsDir, { recursive: true })
        }
        
        copiedFiles.forEach(({ src, fileName }) => {
          const destPath = path.join(assetsDir, fileName)
          if (!fs.existsSync(destPath)) {
            fs.copyFileSync(src, destPath)
          }
        })
      }
    }
  }
}
