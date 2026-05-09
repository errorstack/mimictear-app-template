# Shadow DOM 集成指南

本文档详细说明如何将子应用集成到宿主应用的Shadow DOM中。

## 架构概述

```
┌─────────────────────────────────────┐
│       宿主应用 (Host App)           │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Shadow DOM Container       │  │
│  │                              │  │
│  │  ┌────────────────────────┐  │  │
│  │  │   子应用 (Sub App)     │  │  │
│  │  │   - React Components   │  │  │
│  │  │   - Injected CSS       │  │  │
│  │  └────────────────────────┘  │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## 方案一: 在App组件中动态注入CSS(推荐)

### 1. 修改App.jsx

使用`?inline`导入CSS内容,并在组件挂载时动态创建style标签:

```jsx
import { useState, useEffect } from 'react'
import appCssContent from './App.css?inline'

function App() {
  useEffect(() => {
    // 检测是否在Shadow DOM中
    const isInShadowDOM = !document.head || 
                          document.head.parentElement === null

    if (isInShadowDOM) {
      // 创建style标签
      const style = document.createElement('style')
      style.textContent = appCssContent
      
      // 添加到Shadow Root的head(如果存在)或当前document
      const targetHead = document.head || document
      targetHead.appendChild(style)

      // 清理
      return () => {
        style.remove()
      }
    }
  }, [])

  return <div>...</div>
}

export default App
```

### 2. 构建配置

确保vite.config.js正确配置:

```javascript
export default defineConfig({
  build: {
    lib: {
      entry: './src/App.jsx',
      name: 'App',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
```

### 3. 宿主应用集成

```javascript
// host-app.js
async function loadSubApp() {
  // 1. 创建Shadow DOM容器
  const container = document.getElementById('sub-app-container')
  const shadowRoot = container.attachShadow({ mode: 'open' })
  
  // 2. 创建应用容器
  const appContainer = document.createElement('div')
  shadowRoot.appendChild(appContainer)
  
  // 3. 动态导入子应用
  const module = await import('/path/to/sub-app/dist/index.js')
  const App = module.default
  
  // 4. 渲染到Shadow DOM
  const root = ReactDOM.createRoot(appContainer)
  root.render(React.createElement(App))
}
```

## 方案二: 宿主应用负责样式注入

### 1. 子应用保持简单

App.jsx不需要特殊处理,正常导入CSS即可:

```jsx
import './App.css'

function App() {
  return <div>...</div>
}

export default App
```

### 2. 宿主应用提取并注入样式

```javascript
async function loadSubAppWithStyles() {
  const container = document.getElementById('sub-app-container')
  const shadowRoot = container.attachShadow({ mode: 'open' })
  
  // 加载CSS文件
  const cssResponse = await fetch('/path/to/sub-app/dist/index.css')
  const cssText = await cssResponse.text()
  
  // 注入样式到Shadow DOM
  const style = document.createElement('style')
  style.textContent = cssText
  shadowRoot.appendChild(style)
  
  // 加载并渲染App
  const module = await import('/path/to/sub-app/dist/index.js')
  const App = module.default
  
  const appContainer = document.createElement('div')
  shadowRoot.appendChild(appContainer)
  
  const root = ReactDOM.createRoot(appContainer)
  root.render(React.createElement(App))
}
```

## 方案三: 使用CSS-in-JS库

使用styled-components或emotion等CSS-in-JS库,自动处理样式隔离:

```bash
npm install styled-components
```

```jsx
import styled from 'styled-components'

const Title = styled.h1`
  color: #646cff;
  font-size: 3.2em;
`

function App() {
  return <Title>Hello Shadow DOM</Title>
}

export default App
```

## 注意事项

### 1. 样式作用域

- Shadow DOM提供了天然的样式隔离
- 确保所有样式都注入到Shadow Root中
- 避免使用全局选择器如`body`, `html`

### 2. 资源路径

静态资源(图片、字体等)的路径需要特别注意:

```jsx
// ❌ 错误: 相对路径可能不正确
<img src="./logo.png" />

// ✅ 正确: 使用绝对路径或base64
<img src="/assets/logo.png" />

// ✅ 更好: 使用import,让Vite处理
import logo from './assets/logo.png'
<img src={logo} />
```

### 3. React依赖

确保宿主应用提供React和ReactDOM:

```html
<!-- 宿主应用的HTML -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
```

或者将React打包进子应用(不推荐,会增加包体积):

```javascript
// vite.config.js
{
  build: {
    rollupOptions: {
      // 移除external配置,将React打包进去
      // external: ['react', 'react-dom']
    }
  }
}
```

### 4. 事件冒泡

Shadow DOM中的事件默认不会冒泡到外部:

```jsx
// 如果需要向宿主应用传递事件
useEffect(() => {
  const handleClick = (e) => {
    // 使用composed: true让事件穿过Shadow边界
    const event = new CustomEvent('sub-app-click', {
      detail: { message: 'Hello from sub-app' },
      bubbles: true,
      composed: true
    })
    e.target.dispatchEvent(event)
  }
  
  document.addEventListener('click', handleClick)
  return () => document.removeEventListener('click', handleClick)
}, [])
```

### 5. 全局API访问

Shadow DOM中仍然可以访问window对象:

```jsx
// 访问宿主应用的全局变量
const hostConfig = window.HOST_APP_CONFIG

// 调用宿主应用的方法
if (window.HOST_API) {
  window.HOST_API.doSomething()
}
```

## 调试技巧

### 1. 开发环境测试Shadow DOM

在mounter.jsx中启用Shadow DOM模式:

```jsx
// mounter.jsx
const container = document.getElementById('shadow-container')
if (container) {
  const shadowRoot = container.attachShadow({ mode: 'open' })
  const appContainer = document.createElement('div')
  shadowRoot.appendChild(appContainer)
  
  const root = ReactDOM.createRoot(appContainer)
  root.render(<App />)
}
```

在index.html中添加测试容器:

```html
<div id="shadow-container"></div>
```

### 2. Chrome DevTools

- 打开DevTools → Elements
- 点击设置图标 → Preferences
- 勾选 "Show user agent shadow DOM"
- 现在可以看到Shadow DOM结构

### 3. 样式调试

```javascript
// 在控制台检查Shadow Root
document.querySelector('#sub-app-container').shadowRoot

// 查看注入的样式
document.querySelector('#sub-app-container').shadowRoot.querySelectorAll('style')
```

## 完整示例

参考项目中的以下文件:
- `src/AppWithShadowDOM.jsx` - 支持Shadow DOM的App组件示例
- `HOST_APP_EXAMPLE.js` - 宿主应用集成示例
- `mounter.jsx` - 开发适配层

## 常见问题

### Q: CSS没有生效?

A: 检查以下几点:
1. CSS是否正确注入到Shadow Root中
2. 样式选择器是否正确
3. 是否有样式优先级问题

### Q: 图片无法显示?

A: 确保使用正确的路径:
- 使用import导入图片
- 或使用绝对路径
- 或将图片转换为base64

### Q: React Hooks报错?

A: 确保只有一个React实例:
- 检查是否重复加载了React
- 确保版本兼容

### Q: 热更新不工作?

A: 开发时使用mounter.jsx直接引用src/App.jsx,不要引用dist文件。

## 最佳实践

1. ✅ 使用方案一(组件内注入CSS),最灵活
2. ✅ 静态资源使用import导入
3. ✅ 提供清晰的API文档给宿主应用
4. ✅ 在开发环境中测试Shadow DOM场景
5. ✅ 使用TypeScript提供更好的类型支持
6. ❌ 避免依赖全局样式
7. ❌ 避免直接操作DOM
8. ❌ 不要在Shadow DOM中使用position: fixed

## 性能优化

1. **代码分割**: 使用React.lazy进行懒加载
2. **样式优化**: 只注入必要的CSS
3. **缓存策略**: 合理设置HTTP缓存头
4. **Tree Shaking**: 确保未使用的代码被移除

```jsx
// 懒加载示例
const LazyComponent = React.lazy(() => import('./LazyComponent'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  )
}
```
