import { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import appCss from './src/App.css?inline'
import indexCss from './src/index.css?inline'
import reactLogo from './src/assets/react.svg?url'
import viteLogo from './src/assets/vite.svg?url'

// Simple inline SDK implementation for preview
const SDKContext = {
  appId: 'preview-app',
  userId: 'preview-user',
  env: 'preview'
}

const mockSDK = {
  getAppId: () => SDKContext.appId,
  callMain: (action, data) => {
    console.log(`[SDK] ${SDKContext.appId} 发起动作: ${action}`, data)
  },
  getContext: () => SDKContext
}

// 使用SDK的组件
function AppContent() {
  const sdk = mockSDK
  const [count, setCount] = useState(0)

  // 处理点击事件
  const handleGetAppId = () => {
    const appId = sdk.getAppId()
    console.log('当前子应用身份标识:', appId)
  }

  // 动态注入CSS到style标签
  useEffect(() => {
    // 合并所有CSS
    const allCss = `${indexCss}\n${appCss}`
    
    // 创建style标签
    const style = document.createElement('style')
    style.textContent = allCss
    style.setAttribute('data-app-styles', 'true')
    
    // 插入到document.head或shadow root
    const targetHead = document.head || document.querySelector('head')
    if (targetHead) {
      targetHead.appendChild(style)
    }
    
    // 清理函数
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      
      {/* SDK测试按钮 */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>SDK Test</h3>
        <p>Current App ID: {sdk.getAppId()}</p>
        <button onClick={handleGetAppId}>Get App ID</button>
      </div>
      
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

function App() {
  return <AppContent />
}

// Mount function for preview
export function mount(container) {
  const root = createRoot(container)
  root.render(<App />)
  return root
}

export default App
