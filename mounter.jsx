import React from 'react'
import ReactDOM from 'react-dom/client'
import { SDKProvider } from '@mimictear/sdk'

/**
 * 开发环境适配层
 * 
 * 动态导入 src/App.jsx 并挂载到 #root 节点
 * 使用动态导入方式,与宿主应用的加载方式保持一致
 */

// Mount function (used by dev mode auto-mount)
function mount(container) {
  // 模拟父应用提供的上下文
  const parentContext = {
    appId: 'dev-app',
    userId: 'dev-user',
    env: 'development'
  }
  
  import('./src/App.jsx').then(module => {
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

// Auto-mount in development mode only
const rootElement = document.getElementById('root')
if (rootElement && import.meta.env.DEV) {
  mount(rootElement)
}
