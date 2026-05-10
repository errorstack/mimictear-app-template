import fs from 'fs'
import path from 'path'

// Vite插件：确保静态资源不被内联为base64
export function noInlineAssets() {
  let distDir = ''
  let base = '/'
  let isDev = false
  const copiedFiles = new Set()
  const appJsonResources = [] // 存储 app.json 中指定的资源文件
  let appId = 'mimictear.demo' // 默认值
  let configRoot = '' // 保存项目根目录
  
  return {
    name: 'no-inline-assets',
    enforce: 'pre',
    
    configResolved(config) {
      distDir = path.resolve(config.root, config.build.outDir || 'dist')
      base = config.base || '/'
      isDev = config.command === 'serve'
      configRoot = config.root
      // 确保base以/结尾
      if (!base.endsWith('/')) {
        base = base + '/'
      }
      
      // 读取 app.json 获取 appId 和资源文件
      try {
        const appJsonPath = path.resolve(config.root, 'app.json')
        if (fs.existsSync(appJsonPath)) {
          const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'))
          if (appJson.appId) {
            appId = appJson.appId
          }
          
          // 收集 app.json 中指定的资源文件路径
          const resourceFields = ['appIcon', 'appBanner', 'appScreenshot'] // 可能包含资源的字段
          resourceFields.forEach(field => {
            if (appJson[field] && typeof appJson[field] === 'string') {
              let resourcePath = path.resolve(config.root, appJson[field])
              
              // 如果文件不存在，尝试在 src 目录下查找
              if (!fs.existsSync(resourcePath)) {
                const srcResourcePath = path.resolve(config.root, 'src', appJson[field])
                if (fs.existsSync(srcResourcePath)) {
                  resourcePath = srcResourcePath
                }
              }
              
              if (fs.existsSync(resourcePath)) {
                appJsonResources.push({
                  src: resourcePath,
                  fileName: path.basename(appJson[field])
                })
              } else {
                console.warn(`Resource file not found: ${appJson[field]}`)
              }
            }
          })
        }
      } catch (error) {
        console.warn('Failed to read app.json:', error.message)
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
          assetPath = `http://apps.asset.localhost/${appId}/assets/${fileName}`
        }
        
        return {
          code: `export default "${assetPath}"`,
          map: null
        }
      }
    },
    
    closeBundle() {
      // 在构建完成后复制所有资源文件（仅生产模式）
      const assetsDir = path.join(distDir, 'assets')
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true })
      }
      
      // 复制代码中引用的资源文件
      if (copiedFiles.size > 0) {
        copiedFiles.forEach(({ src, fileName }) => {
          const destPath = path.join(assetsDir, fileName)
          if (!fs.existsSync(destPath)) {
            fs.copyFileSync(src, destPath)
          }
        })
      }
      
      // 复制 app.json 中指定的资源文件
      if (appJsonResources.length > 0) {
        appJsonResources.forEach(({ src, fileName }) => {
          const destPath = path.join(assetsDir, fileName)
          if (!fs.existsSync(destPath)) {
            fs.copyFileSync(src, destPath)
            console.log(`✓ Copied resource: ${fileName}`)
          }
        })
      }
      
      // 复制 app.json 到 dist 目录，并转换资源路径
      try {
        const appJsonSrc = path.resolve(configRoot, 'app.json')
        const appJsonDest = path.join(distDir, 'app.json')
        if (fs.existsSync(appJsonSrc)) {
          // 读取原始 app.json
          const appJsonContent = fs.readFileSync(appJsonSrc, 'utf-8')
          let appJson = JSON.parse(appJsonContent)
          
          // 转换资源字段的路径：将 src/assets/xxx 转换为 assets/xxx
          const resourceFields = ['appIcon', 'appBanner', 'appScreenshot']
          resourceFields.forEach(field => {
            if (appJson[field] && typeof appJson[field] === 'string') {
              // 如果路径以 src/ 开头，去掉 src/ 前缀
              if (appJson[field].startsWith('src/')) {
                appJson[field] = appJson[field].substring(4) // 去掉 'src/'
              }
            }
          })
          
          // 写入转换后的 app.json
          fs.writeFileSync(appJsonDest, JSON.stringify(appJson, null, 2), 'utf-8')
          console.log('✓ app.json copied to dist/ with updated paths')
        }
      } catch (error) {
        console.warn('Failed to copy app.json:', error.message)
      }
    }
  }
}
