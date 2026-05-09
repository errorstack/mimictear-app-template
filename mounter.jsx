import React from 'react'
import ReactDOM from 'react-dom/client'
import { SDKProvider } from '@mimictear/sdk'

/**
 * 开发/预览环境适配层
 * 
 * 动态导入 App 组件并挂载到 #root 节点
 * 使用动态导入方式,与宿主应用的加载方式保持一致
 */

// 模式切换变量: 'dev' 或 'preview'
const MODE = 'dev' // 改为 'preview' 可测试构建产物

// Mount function
async function mount(container) {
  // 根据模式选择模块路径和上下文
  const isPreview = MODE === 'preview'
  const modulePath = isPreview ? './dist/index.js' : './src/App.jsx'
  
  // 模拟父应用提供的上下文
  const parentContext = {
    appId: isPreview ? 'preview-app' : 'dev-app',
    userId: isPreview ? 'preview-user' : 'dev-user',
    env: isPreview ? 'preview' : 'development'
  }
  
  import(modulePath).then(module => {
    const App = module.default
    if (App) {
      const root = ReactDOM.createRoot(container)
      root.render(
        <React.StrictMode>
          <SDKProvider context={parentContext}>
            <App />
          </SDKProvider>
        </React.StrictMode>
      )
      return root
    } else {
      console.error('App component not found in module')
    }
  }).catch(error => {
    console.error('Failed to load App component:', error)
  })
}

// Auto-mount
const rootElement = document.getElementById('root')
if (rootElement) {
  mount(rootElement)
}
