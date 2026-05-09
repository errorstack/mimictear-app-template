import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// 导入CSS内容作为字符串(用于动态注入到Shadow DOM)
import appCssContent from './App.css?inline'

function App() {
  const [count, setCount] = useState(0)

  // 在Shadow DOM环境中动态注入CSS
  useEffect(() => {
    // 检测是否在Shadow DOM中运行
    const isInShadowDOM = document.head === null || 
                          (document.defaultView && document.defaultView.frameElement)

    if (isInShadowDOM) {
      // 创建style标签并注入CSS
      const style = document.createElement('style')
      style.textContent = appCssContent
      document.head.appendChild(style)

      // 清理函数
      return () => {
        if (style.parentNode) {
          style.parentNode.removeChild(style)
        }
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
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
