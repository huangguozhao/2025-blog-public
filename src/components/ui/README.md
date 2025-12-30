# 可复用 UI 组件库

这个文件夹包含了可以直接复制到其他项目中使用的精美 UI 组件。

## 设计理念

- **现代简约**：采用新拟态+线性的混合风格
- **玻璃态设计**：毛玻璃效果，轻盈通透
- **优雅配色**：使用项目统一的品牌色
- **完全独立**：不依赖项目特定逻辑，即插即用

## 组件列表

### Button
通用按钮组件，支持多种变体和状态。

**特性：**
- 9种变体：primary, secondary, outline, ghost, danger, success, warning, link, glass
- 3种尺寸：sm, md, lg
- 加载状态
- 全宽选项
- Framer Motion 动画效果

### Card
玻璃态卡片组件，支持动画和交互。

**特性：**
- 圆角设计（40px）
- 毛玻璃效果
- 悬停动画
- 点击交互

### Input
输入框组件，支持图标和验证。

**特性：**
- 左右图标支持
- 错误状态提示
- 标签支持
- 焦点动画

## 使用方法

### 1. 复制组件文件
直接将需要的组件文件复制到你的项目中：

```bash
# 例如复制 Button 组件
cp src/components/ui/button.tsx your-project/components/ui/button.tsx
```

### 2. 安装依赖
确保你的项目中安装了必要的依赖：

```bash
pnpm install clsx tailwind-merge motion
```

### 3. 配置 Tailwind CSS
确保你的项目中配置了 Tailwind CSS：

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: '#de4331',
        'brand-secondary': '#FCC841',
        primary: '#4E3F42',
        secondary: '#7b888e',
      },
      borderRadius: {
        '4xl': '40px',
      }
    }
  }
}
```

### 4. 添加工具函数
在项目中创建 `lib/utils.ts`：

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 5. 使用组件

```tsx
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function App() {
  return (
    <div className="p-8">
      <Card>
        <h1>欢迎使用组件库</h1>
        <Button variant="primary">点击我</Button>
        <Input placeholder="请输入内容" />
      </Card>
    </div>
  )
}
```

## 自定义配置

### 修改主题色
在组件中找到颜色变量，修改为你的品牌色：

```tsx
// 例如修改 Button 组件中的颜色
const variants = {
  primary: 'bg-[your-color] text-white', // 使用你的品牌色
  // ...
}
```

### 调整圆角
在组件中找到 `rounded-xl` 或 `rounded-[40px]`，修改为你需要的圆角大小。

## 组件开发规范

当你添加新组件时，请遵循以下规范：

1. **命名规范**：组件名使用 PascalCase
2. **TypeScript**：必须使用 TypeScript 定义 Props
3. **样式**：优先使用 Tailwind CSS
4. **动画**：使用 Framer Motion 添加微交互
5. **响应式**：支持移动端和桌面端
6. **无障碍**：添加必要的 ARIA 属性

## 许可证

这些组件可自由使用、修改和分发。
