# 快速参考指南

## 🚀 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器 (http://localhost:5173)

# 构建
npm run build        # 构建生产版本到 dist/
npm run preview      # 预览构建结果

# 依赖管理
npm install          # 安装依赖
npm install <pkg>    # 安装新包
npm uninstall <pkg>  # 卸载包
```

## 📁 重要文件

### 开发相关
- **mounter.jsx** - 开发适配层(根目录)
- **src/App.jsx** - 主应用组件
- **src/App.css** - 应用样式
- **index.html** - HTML入口

### 构建相关
- **vite.config.js** - Vite配置
- **dist/index.js** - 构建产物(App组件)
- **dist/index.css** - 构建产物(CSS)

### 文档
- **README.md** - 项目说明
- **SHADOW_DOM_GUIDE.md** - Shadow DOM集成指南
- **PROJECT_SUMMARY.md** - 项目总结

## 🔧 核心概念

### 1. 子应用架构

```
开发时: mounter.jsx → src/App.jsx → #root
生产时: 宿主应用 → dist/index.js → Shadow DOM
```

### 2. App组件导出

```jsx
// src/App.jsx
function App() {
  return <div>...</div>
}

export default App  // ← 这个会被导出到 dist/index.js
```

### 3. 宿主应用使用

```javascript
// 动态导入
const module = await import('/path/to/dist/index.js')
const App = module.default

// 挂载到Shadow DOM
const shadowRoot = container.attachShadow({ mode: 'open' })
const root = ReactDOM.createRoot(appContainer)
root.render(React.createElement(App))
```

## 🎨 CSS处理方案

### 方案一: 组件内注入(推荐)

```jsx
import appCss from './App.css?inline'

useEffect(() => {
  const style = document.createElement('style')
  style.textContent = appCss
  document.head.appendChild(style)
  return () => style.remove()
}, [])
```

### 方案二: 宿主应用注入

```javascript
// 宿主应用中
const css = await fetch('/dist/index.css').then(r => r.text())
const style = document.createElement('style')
style.textContent = css
shadowRoot.appendChild(style)
```

### 方案三: CSS-in-JS

```bash
npm install styled-components
```

```jsx
import styled from 'styled-components'
const Title = styled.h1`color: blue;`
```

## 📦 构建输出

```
dist/
├── index.js      # App组件 (ES模块, 9.47KB)
├── index.css     # 样式 (0.48KB)
└── vite.svg      # 静态资源
```

## 🔍 调试技巧

### 查看Shadow DOM
1. Chrome DevTools → Settings
2. Preferences → Elements
3. 勾选 "Show user agent shadow DOM"

### 检查构建产物
```javascript
// 在控制台
import('/dist/index.js').then(m => console.log(m.default))
```

### 测试Shadow DOM环境
```jsx
// mounter.jsx 中取消注释
const container = document.getElementById('shadow-container')
// ... Shadow DOM代码
```

## ⚠️ 常见问题

### Q: 样式不生效?
A: 确保CSS注入到Shadow Root中,而不是document.head

### Q: 图片无法显示?
A: 使用 `import img from './img.png'` 而非相对路径

### Q: React Hooks报错?
A: 确保只有一个React实例,检查是否重复加载

### Q: 热更新不工作?
A: 开发时使用mounter.jsx引用src/App.jsx,不要用dist

## 📚 参考链接

- [Vite官方文档](https://vite.dev/)
- [React官方文档](https://react.dev/)
- [Shadow DOM MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [微前端架构](https://micro-frontends.org/)

## 🎯 下一步

1. ✅ 运行 `npm run dev` 查看效果
2. ✅ 修改 `src/App.jsx` 体验热更新
3. ✅ 运行 `npm run build` 查看构建产物
4. ✅ 阅读 `SHADOW_DOM_GUIDE.md` 了解详细集成方案
5. ✅ 根据需求添加路由、状态管理等

---

💡 **提示**: 大部分问题的答案都在 `SHADOW_DOM_GUIDE.md` 中!
