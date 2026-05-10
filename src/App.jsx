import { useState } from 'react'
import { useSDK } from '@mimictear/sdk'
import appCss from './App.css?inline'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import testImage from './assets/test.png'


// 使用SDK的组件
function AppContent() {
  const sdk = useSDK()
  const [count, setCount] = useState(0)

  // 处理点击事件
  const handleGetAppId = () => {
    const appId = sdk.getAppId();
    alert('当前子应用身份标识:' + appId);
  }

  return (
    <>
      {/* 动态注入CSS到Shadow DOM */}
      <style dangerouslySetInnerHTML={{ __html: appCss }} />
      
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
      
      {/* 测试图片 */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Test Image</h3>
        <img src={testImage} alt="Test" style={{ maxWidth: '100%', height: 'auto' }} />
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

export default App
