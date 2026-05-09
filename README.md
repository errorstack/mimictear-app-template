# React 子应用模板

这是一个React子应用模板,设计用于作为微前端架构中的子应用,可以动态加载并挂载到宿主应用的Shadow DOM中。

## 项目结构

```
├── src/
│   ├── App.jsx          # 主应用组件(会被export)
│   ├── App.css          # 应用样式
│   └── index.css        # 全局样式
├── public/              # 静态资源
├── mounter.jsx          # 开发环境适配层
├── vite.config.js       # Vite配置
├── index.html           # HTML入口
└── package.json         # 项目配置
```

## 特性

- ✅ **子应用架构**: 构建时导出App组件,供宿主应用动态导入
- ✅ **Shadow DOM支持**: 设计用于挂载到Shadow DOM中
- ✅ **CSS隔离**: 所有样式通过App组件加载,支持样式隔离
- ✅ **开发友好**: mounter.jsx提供开发环境的便捷调试

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

开发服务器会运行 `mounter.jsx`,将App组件挂载到 `#root` 节点,方便调试。

## 构建

```bash
# 构建生产版本
npm run build
```

构建后会在 `dist/` 目录生成:
- `index.js` - 包含导出的App组件(ES模块格式)

## 在宿主应用中使用

### 1. 动态导入子应用

```javascript
// 宿主应用中
async function loadSubApp() {
  const container = document.getElementById('sub-app-container')
  const shadowRoot = container.attachShadow({ mode: 'open' })
  
  // 动态导入
  const module = await import('/path/to/sub-app/dist/index.js')
  const App = module.default
  
  // 创建容器
  const rootElement = document.createElement('div')
  shadowRoot.appendChild(rootElement)
  
  // 注入样式
  injectStyles(shadowRoot)
  
  // 渲染React组件
  const root = ReactDOM.createRoot(rootElement)
  root.render(React.createElement(App))
}
```

### 2. CSS样式处理

由于子应用在Shadow DOM中运行,需要确保样式正确注入:

**方法1**: 在App组件中通过style标签动态插入样式
```jsx
function App() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = cssContent
    document.head.appendChild(style)
    return () => style.remove()
  }, [])
  
  return <div>...</div>
}
```

**方法2**: 宿主应用提取并注入样式到Shadow DOM
```javascript
function injectStyles(shadowRoot) {
  const styles = document.querySelectorAll('style')
  styles.forEach(style => {
    shadowRoot.appendChild(style.cloneNode(true))
  })
}
```

## 配置说明

### vite.config.js

```javascript
{
  build: {
    lib: {
      entry: './src/App.jsx',  // 入口文件
      name: 'App',              // 库名称
      fileName: 'index',        // 输出文件名
      formats: ['es']           // ES模块格式
    },
    rollupOptions: {
      external: ['react', 'react-dom'],  // 外部化React依赖
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
}
```

### mounter.jsx

开发环境适配层,直接引用 `src/App.jsx` 而非构建产物,便于热更新和调试:

```jsx
import App from './src/App.jsx'

const rootElement = document.getElementById('root')
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />)
}
```

## 注意事项

1. **React依赖**: 宿主应用需要提供React和ReactDOM,或者将它们打包进子应用
2. **样式隔离**: 确保CSS正确注入到Shadow DOM中
3. **路由**: 如果使用路由,需要考虑在Shadow DOM中的路由前缀
4. **资源路径**: 注意静态资源的路径问题,可能需要配置base路径

## 技术栈

- React 19
- Vite 8
- @vitejs/plugin-react

## License

ISC
