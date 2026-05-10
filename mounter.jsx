import React from 'react'
import ReactDOM from 'react-dom/client'
import { SDKProvider } from '@mimictear/sdk'

/**
 * 开发环境入口
 * 
 * 动态导入 App 组件并挂载到 Shadow DOM 中
 * 使用动态导入方式,与宿主应用的加载方式保持一致
 */

// Mount function
async function mount(container) {
  // 模拟父应用提供的上下文
  const parentContext = {
    appId: 'dev-app',
    userId: 'dev-user',
    env: 'development'
  }
  
  // 创建 Shadow DOM
  const shadowHost = document.createElement('div')
  shadowHost.id = 'shadow-host'
  container.appendChild(shadowHost)
  
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' })
  
  // 创建一个容器用于 React 渲染
  const reactContainer = document.createElement('div')
  reactContainer.id = 'react-root'
  shadowRoot.appendChild(reactContainer)
  
  import('./src/App.jsx').then(module => {
//   import('./dist/index.js').then(module => {
    const App = module.default
    if (App) {
      const root = ReactDOM.createRoot(reactContainer)
      root.render(
        <SDKProvider context={parentContext}>
            <App />
        </SDKProvider>
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
