/**
 * 宿主应用使用示例
 * 
 * 这个文件展示了如何在宿主应用中动态加载子应用并将App组件挂载到Shadow DOM中
 */

// 动态导入子应用
async function loadSubApp() {
  // 1. 创建Shadow DOM容器
  const container = document.getElementById('sub-app-container')
  if (!container) {
    console.error('Container element not found')
    return
  }

  // 2. 创建Shadow Root
  const shadowRoot = container.attachShadow({ mode: 'open' })

  // 3. 动态导入子应用的App组件
  const module = await import('./dist/index.js')
  const App = module.default

  if (!App) {
    console.error('App component not exported from sub-app')
    return
  }

  // 4. 在Shadow DOM中渲染App组件
  // 注意：这里需要确保React和ReactDOM已经在宿主应用中可用
  // 或者通过其他方式提供
  
  const rootElement = document.createElement('div')
  shadowRoot.appendChild(rootElement)

  // 5. 提取并注入CSS样式到Shadow DOM
  // 由于Vite构建时会将CSS打包，我们需要手动处理样式注入
  injectStyles(shadowRoot)

  // 6. 渲染React组件
  const React = window.React
  const ReactDOM = window.ReactDOM

  if (React && ReactDOM) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(React.createElement(App))
  } else {
    console.error('React and ReactDOM must be available in the host application')
  }
}

/**
 * 将样式注入到Shadow DOM中
 * 在实际使用中，你可能需要从构建产物中提取CSS并注入
 */
function injectStyles(shadowRoot) {
  // 方法1: 如果CSS已经打包在JS中，可以通过提取style标签的方式
  // 方法2: 如果CSS是单独的文件，可以动态加载
  
  // 示例：从全局样式表中提取样式并注入到Shadow DOM
  const styles = document.querySelectorAll('style')
  styles.forEach(style => {
    const clonedStyle = style.cloneNode(true)
    shadowRoot.appendChild(clonedStyle)
  })

  // 或者动态加载CSS文件
  // const link = document.createElement('link')
  // link.rel = 'stylesheet'
  // link.href = '/path/to/styles.css'
  // shadowRoot.appendChild(link)
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', loadSubApp)
