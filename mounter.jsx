import React from 'react'
import ReactDOM from 'react-dom/client'
import { SDKProvider } from '@mimictear/sdk'

/**
 * 开发/预览环境适配层
 * 
 * 动态导入 App 组件并挂载到指定容器
 * 使用动态导入方式,与宿主应用的加载方式保持一致
 */

// Mount function for development/preview
export function mount(container, appModulePath = './src/App.jsx') {
  // 模拟父应用提供的上下文
  const parentContext = {
    appId: import.meta.env.DEV ? 'dev-app' : 'preview-app',
    userId: import.meta.env.DEV ? 'dev-user' : 'preview-user',
    env: import.meta.env.DEV ? 'development' : 'preview'
  }
  
  import(appModulePath).then(module => {
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

// Auto-mount in development mode
if (typeof document !== 'undefined') {
  const rootElement = document.getElementById('root')
  if (rootElement && import.meta.env.DEV) {
    mount(rootElement)
  }
}
