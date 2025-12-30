# 组件库使用指南

## 快速开始

### 1. 查看组件
访问 `/components-demo` 页面查看所有可用组件的实时预览和代码示例。

### 2. 复制组件文件
所有组件都位于 `src/components/ui/` 目录下，将你需要的组件文件复制到你的项目中：

```bash
# 例如复制 Button 组件
cp src/components/ui/button.tsx your-project/components/ui/button.tsx
```

### 3. 安装依赖
确保你的项目安装了必要的依赖：

```bash
pnpm install clsx tailwind-merge motion lucide-react
```

### 4. 配置 Tailwind CSS
在你的 `tailwind.config.js` 中添加主题色：

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: '#de4331',           // 珊瑚红（主品牌色）
        'brand-secondary': '#FCC841', // 金色（辅助色）
        'brand-alt': '#1fc9e7',     // 青色（次要品牌色）
        primary: '#4E3F42',         // 深灰（主要文本）
        secondary: '#7b888e',       // 中灰（次要文本）
      },
      borderRadius: {
        '4xl': '40px',
      },
      boxShadow: {
        'glass': '0 40px 50px -32px rgba(0, 0, 0, 0.05)',
      }
    }
  }
}
```

### 5. 添加工具函数
创建 `lib/utils.ts` 文件：

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 6. 使用组件

```tsx
import { Button, Card, Input } from '@/components/ui'

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

## 组件列表

### 基础组件
- **Button** - 通用按钮，支持 9 种变体（primary, secondary, outline, ghost, danger, success, warning, link, glass）
- **Card** - 玻璃态卡片，支持动画和交互
- **Badge** - 标签徽章，支持多种颜色
- **Avatar** - 头像组件，支持多种尺寸
- **Tooltip** - 提示框，支持四个方向

### 表单组件
- **Input** - 输入框，支持图标和验证
- **Switch** - 开关组件，支持多种尺寸
- **TagInput** - 标签输入框，支持添加删除标签

### 布局组件
- **Accordion** - 手风琴，支持多选和单选

## 自定义主题

### 修改品牌色
在组件文件中找到颜色变量，修改为你的品牌色：

```tsx
// Button 组件示例
const variants = {
  primary: 'bg-[your-color] text-white', // 使用你的品牌色
  secondary: 'bg-[your-secondary-color] text-white',
  // ...
}
```

### 调整圆角
在组件中找到 `rounded-xl` 或 `rounded-[40px]`，修改为需要的圆角大小。

## 组件特性

### 动画交互
所有组件都使用 Framer Motion 提供流畅的动画效果：
- 悬停缩放效果
- 点击反馈动画
- 平滑的过渡动画

### 响应式设计
组件自动适配移动端和桌面端，确保在各种设备上都有良好的显示效果。

### 无障碍支持
组件包含必要的 ARIA 属性，确保无障碍访问。

## 开发规范

当你添加新组件时，请遵循以下规范：

1. **命名规范**：组件名使用 PascalCase
2. **TypeScript**：必须使用 TypeScript 定义 Props
3. **样式**：优先使用 Tailwind CSS
4. **动画**：使用 Framer Motion 添加微交互
5. **响应式**：支持移动端和桌面端
6. **文档**：为每个组件添加清晰的 Props 说明

## 示例代码

### 组合使用
```tsx
import { Button, Card, Badge, Avatar, Tooltip } from '@/components/ui'
import { Heart, Star, User } from 'lucide-react'

function UserCard() {
  return (
    <Card clickable>
      <div className="flex items-start gap-4">
        <Avatar src="/avatar.png" alt="User" size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold">用户名称</h3>
            <Badge variant="primary">管理员</Badge>
          </div>
          <p className="text-secondary mb-3 text-sm">用户简介</p>
          <div className="flex gap-2">
            <Tooltip content="点赞">
              <Button size="sm" variant="outline">
                <Heart size={16} className="mr-1" />
              </Button>
            </Tooltip>
            <Tooltip content="收藏">
              <Button size="sm" variant="outline">
                <Star size={16} className="mr-1" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </Card>
  )
}
```

### 表单示例
```tsx
import { Button, Input, Switch, TagInput } from '@/components/ui'
import { useState } from 'react'

function SettingsForm() {
  const [notifications, setNotifications] = useState(true)
  const [tags, setTags] = useState(['标签1', '标签2'])

  return (
    <div className="space-y-6">
      <Input label="用户名" placeholder="请输入用户名" />
      <Input label="邮箱" type="email" placeholder="example@email.com" />
      <Switch
        checked={notifications}
        onChange={setNotifications}
        label="启用通知"
      />
      <TagInput
        tags={tags}
        onTagsChange={setTags}
        placeholder="输入标签后按回车添加..."
      />
      <Button variant="primary" fullWidth>
        保存设置
      </Button>
    </div>
  )
}
```

## 常见问题

### Q: 如何修改组件的默认样式？
A: 可以通过 `className` prop 传入自定义类名，或者直接修改组件源代码。

### Q: 组件支持 SSR 吗？
A: 大部分组件支持 SSR，对于包含客户端交互的组件，请确保在 `'use client'` 组件中使用。

### Q: 可以自定义动画效果吗？
A: 可以，组件的动画是通过 Framer Motion 实现的，你可以通过修改组件中的 motion 组件属性来自定义。

### Q: 组件需要额外的配置吗？
A: 除了基本的 Tailwind CSS 配置和依赖安装外，不需要额外配置。确保项目中包含 `lib/utils.ts` 工具函数。

## 贡献

欢迎贡献新的组件！请遵循项目的设计规范和开发规范。

## 许可证

这些组件可自由使用、修改和分发。
