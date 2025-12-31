'use client'

import { useState } from 'react'
import { Download, FileCode, Package, Search, X, Code, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Tooltip } from '@/components/ui/tooltip'
import { TagInput } from '@/components/ui/tag-input'
import { Accordion } from '@/components/ui/accordion'

export default function ComponentsDemoPage() {
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [tagInputTags, setTagInputTags] = useState(['React', 'TypeScript'])
	const [buttonClickCount, setButtonClickCount] = useState(0)
	const [inputValue, setInputValue] = useState('')
	const [switchChecked, setSwitchChecked] = useState(true)

	const componentPreviews: Record<string, React.ReactNode> = {
		button: (
			<div className='w-full max-w-xs space-y-3 overflow-visible'>
				{/* 主要变体 */}
				<div className='flex flex-wrap gap-2 justify-center'>
					<Button onClick={() => setButtonClickCount(count => count + 1)} variant='primary' size='md'>
						点击 ({buttonClickCount})
					</Button>
					<Button variant='secondary' size='md'>次要</Button>
					<Button variant='outline' size='md'>轮廓</Button>
					<Button variant='ghost' size='md'>幽灵</Button>
				</div>
				{/* 状态变体 */}
				<div className='flex flex-wrap gap-2 justify-center'>
					<Button variant='danger' size='md'>危险</Button>
					<Button variant='success' size='md'>成功</Button>
					<Button variant='warning' size='md'>警告</Button>
					<Button variant='glass' size='md'>玻璃态</Button>
				</div>
				{/* 尺寸和加载状态 */}
				<div className='flex flex-wrap items-center gap-2 justify-center'>
					<Button variant='primary' size='sm'>小号</Button>
					<Button variant='primary' size='md'>中号</Button>
					<Button variant='primary' size='lg'>大号</Button>
					<Button variant='outline' size='md' loading>加载中</Button>
				</div>
			</div>
		),
		card: (
			<div className='w-full max-w-[340px] space-y-3 overflow-auto max-h-[280px]'>
				{/* 样式变体展示 */}
				<div className='space-y-3'>
					<div className='text-xs font-medium text-secondary mb-2'>📦 Card 样式变体</div>
					
					{/* 第一行卡片 */}
					<div className='grid grid-cols-2 gap-2'>
						<Card variant='default' size='sm' className='h-24 flex items-center justify-center'>
							<span className='text-xs font-medium'>Default</span>
						</Card>
						<Card variant='elevated' size='sm' className='h-24 flex items-center justify-center'>
							<span className='text-xs font-medium'>Elevated</span>
						</Card>
					</div>
					
					{/* 第二行卡片 */}
					<div className='grid grid-cols-2 gap-2'>
						<Card variant='glass' size='sm' className='h-24 flex items-center justify-center'>
							<span className='text-xs font-medium'>Glass</span>
						</Card>
						<Card variant='gradient' size='sm' className='h-24 flex items-center justify-center'>
							<span className='text-xs font-medium'>Gradient</span>
						</Card>
					</div>
					
					{/* 第三行卡片 */}
					<div className='grid grid-cols-2 gap-2'>
						<Card variant='minimal' size='sm' className='h-24 flex items-center justify-center'>
							<span className='text-xs font-medium'>Minimal</span>
						</Card>
						<Card variant='bordered' size='sm' className='h-24 flex items-center justify-center'>
							<span className='text-xs font-medium'>Bordered</span>
						</Card>
					</div>
					
					{/* 第四行卡片 */}
					<div className='grid grid-cols-2 gap-2'>
						<Card variant='neon' size='sm' className='h-24 flex items-center justify-center text-cyan-400'>
							<span className='text-xs font-medium'>Neon</span>
						</Card>
						<Card variant='outlined' size='sm' className='h-24 flex items-center justify-center'>
							<span className='text-xs font-medium'>Outlined</span>
						</Card>
					</div>
				</div>
				
				{/* 实际内容示例 */}
				<div className='space-y-2 pt-2 border-t border-gray-100'>
					<div className='text-xs font-medium text-secondary mb-2'>🎯 实际应用</div>
					<Card variant='elevated' clickable className='w-full'>
						<div className='space-y-2'>
							<div className='flex items-center gap-2'>
								<Avatar src='/images/avatar.png' alt='User' size='sm' />
								<div>
									<h4 className='font-bold text-primary text-sm'>张三</h4>
									<p className='text-secondary text-[10px]'>前端工程师</p>
								</div>
							</div>
							<div className='flex items-center justify-between'>
								<Badge variant='primary' size='sm'>Pro</Badge>
								<span className='text-secondary text-[10px]'>2小时前</span>
							</div>
						</div>
					</Card>
				</div>
			</div>
		),
		input: (
			<div className='w-full max-w-[320px] space-y-4 p-3 overflow-auto max-h-[280px]'>
				{/* 样式变体展示 */}
				<div className='space-y-3'>
					<div className='text-xs font-medium text-secondary mb-2'>样式变体</div>
					<Input variant='default' label='默认' placeholder='Default input...' />
					<Input variant='filled' label='填充' placeholder='Filled input...' />
					<Input variant='outlined' label='轮廓' placeholder='Outlined input...' />
					<Input variant='underlined' label='下划线' placeholder='Underlined input...' />
					<Input variant='ghost' label='幽灵' placeholder='Ghost input...' />
					<Input variant='glass' label='玻璃态' placeholder='Glass input...' />
					<Input variant='success' label='成功' placeholder='Success state...' />
					<Input variant='warning' label='警告' placeholder='Warning state...' />
					<Input variant='error' label='错误' placeholder='Error state...' error='This field is required' />
				</div>
				
				{/* 尺寸展示 */}
				<div className='space-y-2 pt-2 border-t border-gray-100'>
					<div className='text-xs font-medium text-secondary mb-2'>尺寸大小</div>
					<div className='flex items-center gap-2'>
						<Input size='sm' placeholder='Small' className='flex-1' />
						<Input size='md' placeholder='Medium' className='flex-1' />
						<Input size='lg' placeholder='Large' className='flex-1' />
					</div>
				</div>

				{/* 图标展示 */}
				<div className='space-y-2 pt-2 border-t border-gray-100'>
					<div className='text-xs font-medium text-secondary mb-2'>图标输入框</div>
					<Input placeholder='搜索...' leftIcon={<Search size={16} />} />
					<Input placeholder='邮箱...' leftIcon={<Search size={16} />} rightIcon={<Search size={16} />} />
				</div>
			</div>
		),
		badge: (
			<div className='w-full max-w-[340px] space-y-4 p-3 overflow-auto max-h-[280px]'>
				{/* 样式变体展示 */}
				<div className='space-y-3'>
					<div className='text-xs font-medium text-secondary mb-2'>🏷️ Badge 样式变体</div>
					
					{/* 第一行：基础变体 */}
					<div className='flex flex-wrap gap-1.5 justify-center'>
						<Badge variant='default' size='sm'>默认</Badge>
						<Badge variant='primary' size='sm'>主要</Badge>
						<Badge variant='secondary' size='sm'>次要</Badge>
						<Badge variant='info' size='sm'>信息</Badge>
					</div>
					
					{/* 第二行：状态变体 */}
					<div className='flex flex-wrap gap-1.5 justify-center'>
						<Badge variant='success' size='sm'>成功</Badge>
						<Badge variant='warning' size='sm'>警告</Badge>
						<Badge variant='danger' size='sm'>危险</Badge>
						<Badge variant='ghost' size='sm'>幽灵</Badge>
					</div>
					
					{/* 第三行：特殊效果 */}
					<div className='flex flex-wrap gap-1.5 justify-center'>
						<Badge variant='gradient' size='sm'>渐变</Badge>
						<Badge variant='neon' size='sm'>霓虹</Badge>
						<Badge variant='outlined' size='sm'>轮廓</Badge>
					</div>
				</div>
				
				{/* 尺寸和形状展示 */}
				<div className='space-y-3 pt-3 border-t border-gray-100'>
					<div className='text-xs font-medium text-secondary mb-2'>📏 尺寸和形状</div>
					
					{/* 尺寸对比 */}
					<div className='space-y-2'>
						<div className='text-[11px] text-gray-500'>尺寸对比</div>
						<div className='flex items-center gap-2'>
							<Badge variant='primary' size='xs'>超小</Badge>
							<Badge variant='primary' size='sm'>小号</Badge>
							<Badge variant='primary' size='md'>中号</Badge>
							<Badge variant='primary' size='lg'>大号</Badge>
						</div>
					</div>
					
					{/* 形状对比 */}
					<div className='space-y-2'>
						<div className='text-[11px] text-gray-500'>形状对比</div>
						<div className='flex items-center gap-2'>
							<Badge variant='primary' size='sm' shape='square'>方形</Badge>
							<Badge variant='primary' size='sm' shape='rounded'>圆角</Badge>
							<Badge variant='primary' size='sm' shape='pill'>胶囊</Badge>
						</div>
					</div>
				</div>
				
				{/* 特殊功能展示 */}
				<div className='space-y-3 pt-3 border-t border-gray-100'>
					<div className='text-xs font-medium text-secondary mb-2'>✨ 特殊功能</div>
					
					{/* 带状态点的徽章 */}
					<div className='space-y-2'>
						<div className='text-[11px] text-gray-500'>状态指示点</div>
						<div className='flex items-center gap-2'>
							<Badge variant='success' size='sm' dot>新消息</Badge>
							<Badge variant='warning' size='sm' dot>待处理</Badge>
							<Badge variant='danger' size='sm' dot>紧急</Badge>
							<Badge variant='info' size='sm' dot>通知</Badge>
						</div>
					</div>
					
					{/* 动画徽章 */}
					<div className='space-y-2'>
						<div className='text-[11px] text-gray-500'>动画效果</div>
						<div className='flex items-center gap-2'>
							<Badge variant='gradient' size='sm' animated>动画</Badge>
							<Badge variant='neon' size='sm' animated>霓虹</Badge>
							<Badge variant='success' size='sm' dot animated>状态</Badge>
						</div>
					</div>
				</div>
			</div>
		),
		avatar: (
			<div className='w-full max-w-[340px] space-y-4 p-3 overflow-auto max-h-[280px]'>
				{/* 样式变体展示 */}
				<div className='space-y-3'>
					<div className='text-xs font-medium text-secondary mb-2'>👤 Avatar 样式变体</div>
					
					{/* 第一行：基础变体 */}
					<div className='flex items-center gap-3 justify-center'>
						<Avatar src='/images/avatar.png' alt='Default' variant='default' size='md' />
						<Avatar src='/images/avatar.png' alt='Square' variant='square' size='md' />
						<Avatar src='/images/avatar.png' alt='Rounded' variant='rounded' size='md' />
						<Avatar src='/images/avatar.png' alt='Circle' variant='circle' size='md' />
					</div>
					
					{/* 第二行：特效变体 */}
					<div className='flex items-center gap-3 justify-center'>
						<Avatar src='/images/avatar.png' alt='Bordered' variant='bordered' size='md' />
						<Avatar src='/images/avatar.png' alt='Shadow' variant='shadow' size='md' />
						<Avatar src='/images/avatar.png' alt='Glass' variant='glass' size='md' />
					</div>
					
					{/* 第三行：高级变体 */}
					<div className='flex items-center gap-3 justify-center'>
						<Avatar src='/images/avatar.png' alt='Gradient' variant='gradient' size='md' />
						<Avatar src='/images/avatar.png' alt='Neon' variant='neon' size='md' />
					</div>
				</div>
				
				{/* 尺寸展示 */}
				<div className='space-y-3 pt-3 border-t border-gray-100'>
					<div className='text-xs font-medium text-secondary mb-2'>📏 尺寸对比</div>
					<div className='flex items-center gap-2 justify-center'>
						<Avatar src='/images/avatar.png' alt='XS' size='xs' />
						<Avatar src='/images/avatar.png' alt='SM' size='sm' />
						<Avatar src='/images/avatar.png' alt='MD' size='md' />
						<Avatar src='/images/avatar.png' alt='LG' size='lg' />
						<Avatar src='/images/avatar.png' alt='XL' size='xl' />
						<Avatar src='/images/avatar.png' alt='2XL' size='2xl' />
					</div>
				</div>
				
				{/* 状态指示器 */}
				<div className='space-y-3 pt-3 border-t border-gray-100'>
					<div className='text-xs font-medium text-secondary mb-2'>🟢 状态指示</div>
					<div className='flex items-center gap-3 justify-center'>
						<Avatar src='/images/avatar.png' alt='Online' size='md' status='online' />
						<Avatar src='/images/avatar.png' alt='Offline' size='md' status='offline' />
						<Avatar src='/images/avatar.png' alt='Busy' size='md' status='busy' />
						<Avatar src='/images/avatar.png' alt='Away' size='md' status='away' />
					</div>
				</div>
				
				{/* 特殊功能展示 */}
				<div className='space-y-3 pt-3 border-t border-gray-100'>
					<div className='text-xs font-medium text-secondary mb-2'>✨ 特殊功能</div>
					
					{/* 占位符和回退 */}
					<div className='space-y-2'>
						<div className='text-[11px] text-gray-500'>占位符和回退</div>
						<div className='flex items-center gap-3 justify-center'>
							<Avatar placeholder alt='Placeholder' size='md' fallback='P' />
							<Avatar alt='Error Image' src='https://invalid-url.com/avatar.jpg' size='md' fallback='E' />
						</div>
					</div>
					
					{/* 可点击头像 */}
					<div className='space-y-2'>
						<div className='text-[11px] text-gray-500'>可点击头像</div>
						<div className='flex items-center gap-3 justify-center'>
							<Avatar 
								src='/images/avatar.png' 
								alt='Clickable' 
								size='md' 
								onClick={() => console.log('Avatar clicked!')}
								className='cursor-pointer hover:scale-105 transition-transform' 
							/>
						</div>
					</div>
				</div>
			</div>
		),
		switch: (
			<div className='space-y-3'>
				<Switch checked={switchChecked} onChange={setSwitchChecked} label='通知' size='sm' />
				<Switch checked={!switchChecked} onChange={val => setSwitchChecked(!val)} label='夜间模式' size='sm' />
				<Switch checked={true} label='自动保存' disabled size='sm' />
			</div>
		),
		tooltip: (
			<div className='flex flex-wrap gap-2 justify-center'>
				<Tooltip content='顶部提示' position='top'>
					<Button variant='outline' size='sm'>顶部</Button>
				</Tooltip>
				<Tooltip content='底部提示' position='bottom'>
					<Button variant='outline' size='sm'>底部</Button>
				</Tooltip>
				<Tooltip content='左侧提示' position='left'>
					<Button variant='outline' size='sm'>左侧</Button>
				</Tooltip>
			</div>
		),
		'tag-input': (
			<div className='w-full max-w-[280px]'>
				<TagInput tags={tagInputTags} onTagsChange={setTagInputTags} placeholder='标签...' maxTags={5} />
			</div>
		),
		accordion: (
			<Accordion
				items={[
					{ id: '1', title: '如何使用？', content: '复制组件文件到你的项目中，通过 import 语句引入即可使用。' },
					{ id: '2', title: '可以自定义吗？', content: '当然可以！组件支持通过 className prop 传入自定义样式。' }
				]}
			/>
		)
	}

	const components = [
		{
			id: 'button',
			name: 'Button',
			category: 'basic',
			description: '通用按钮组件，支持多种样式、尺寸和状态',
			icon: '🔘',
			props: [
				{ name: 'variant', type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'link' | 'glass'", default: "'primary'", description: '按钮变体' },
				{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '按钮尺寸' },
				{ name: 'disabled', type: 'boolean', default: 'false', description: '是否禁用' },
				{ name: 'loading', type: 'boolean', default: 'false', description: '是否加载中' },
				{ name: 'fullWidth', type: 'boolean', default: 'false', description: '是否全宽' }
			]
		},
		{
			id: 'card',
			name: 'Card',
			category: 'layout',
			description: '高级卡片组件，支持9种样式变体、3种尺寸、动画和交互效果',
			icon: '📦',
			props: [
				{ name: 'variant', type: "'default' | 'elevated' | 'glass' | 'gradient' | 'minimal' | 'bordered' | 'neon' | 'outlined' | 'solid'", default: "'default'", description: '卡片样式变体' },
				{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '卡片尺寸' },
				{ name: 'children', type: 'React.ReactNode', default: '-', description: '卡片内容' },
				{ name: 'clickable', type: 'boolean', default: 'false', description: '是否可点击' },
				{ name: 'noPadding', type: 'boolean', default: 'false', description: '是否无内边距' },
				{ name: 'hoverable', type: 'boolean', default: 'true', description: '是否有悬停效果' }
			]
		},
		{
			id: 'input',
			name: 'Input',
			category: 'form',
			description: '增强输入框组件，支持9种样式变体、3种尺寸、图标和验证',
			icon: '⌨️',
			props: [
				{ name: 'variant', type: "'default' | 'filled' | 'outlined' | 'underlined' | 'ghost' | 'glass' | 'success' | 'warning' | 'error'", default: "'default'", description: '输入框样式变体' },
				{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '输入框尺寸' },
				{ name: 'label', type: 'string', default: '-', description: '标签文本' },
				{ name: 'placeholder', type: 'string', default: '-', description: '占位文本' },
				{ name: 'icon', type: 'ReactNode', default: '-', description: '图标（左侧）' },
				{ name: 'leftIcon', type: 'ReactNode', default: '-', description: '左侧图标' },
				{ name: 'rightIcon', type: 'ReactNode', default: '-', description: '右侧图标' },
				{ name: 'error', type: 'string', default: '-', description: '错误提示' }
			]
		},
		{
			id: 'badge',
			name: 'Badge',
			category: 'basic',
			description: '高级标签组件，支持10种样式变体、4种尺寸、3种形状、动画和状态指示点',
			icon: '🏷️',
			props: [
				{ name: 'variant', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gradient' | 'neon' | 'outlined' | 'ghost'", default: "'default'", description: '标签样式变体' },
				{ name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: '标签尺寸' },
				{ name: 'shape', type: "'rounded' | 'pill' | 'square'", default: "'pill'", description: '标签形状' },
				{ name: 'dot', type: 'boolean', default: 'false', description: '是否显示状态指示点' },
				{ name: 'animated', type: 'boolean', default: 'false', description: '是否启用动画效果' }
			]
		},
		{
			id: 'avatar',
			name: 'Avatar',
			category: 'basic',
			description: '高级头像组件，支持8种样式变体、6种尺寸、状态指示、占位符和交互',
			icon: '👤',
			props: [
				{ name: 'variant', type: "'default' | 'square' | 'rounded' | 'circle' | 'bordered' | 'shadow' | 'gradient' | 'neon' | 'glass'", default: "'default'", description: '头像样式变体' },
				{ name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'", default: "'md'", description: '头像尺寸' },
				{ name: 'status', type: "'online' | 'offline' | 'busy' | 'away'", default: "-", description: '在线状态' },
				{ name: 'fallback', type: 'string', default: "'U'", description: '回退字符' },
				{ name: 'bordered', type: 'boolean', default: 'false', description: '是否显示边框' },
				{ name: 'shadow', type: 'boolean', default: 'false', description: '是否显示阴影' },
				{ name: 'placeholder', type: 'boolean', default: 'false', description: '是否显示占位符' },
				{ name: 'src', type: 'string', default: '-', description: '图片地址' },
				{ name: 'alt', type: 'string', default: '-', description: '替代文本' },
				{ name: 'onClick', type: '() => void', default: '-', description: '点击回调' }
			]
		},
		{
			id: 'switch',
			name: 'Switch',
			category: 'form',
			description: '开关组件，支持多种尺寸、状态和动画',
			icon: '🔀',
			props: [
				{ name: 'checked', type: 'boolean', default: 'false', description: '是否选中' },
				{ name: 'onChange', type: '(checked: boolean) => void', default: '-', description: '变化回调' },
				{ name: 'disabled', type: 'boolean', default: 'false', description: '是否禁用' },
				{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '开关尺寸' },
				{ name: 'label', type: 'string', default: '-', description: '标签文本' }
			]
		},
		{
			id: 'tooltip',
			name: 'Tooltip',
			category: 'basic',
			description: '提示框组件，支持四个方向和自定义延迟',
			icon: '💡',
			props: [
				{ name: 'content', type: 'ReactNode', default: 'required', description: '提示内容' },
				{ name: 'position', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: '显示位置' },
				{ name: 'delay', type: 'number', default: '200', description: '延迟时间(ms)' }
			]
		},
		{
			id: 'tag-input',
			name: 'TagInput',
			category: 'form',
			description: '标签输入框组件，支持添加、删除和数量限制',
			icon: '📝',
			props: [
				{ name: 'tags', type: 'string[]', default: 'required', description: '标签列表' },
				{ name: 'onTagsChange', type: '(tags: string[]) => void', default: 'required', description: '标签变化回调' },
				{ name: 'placeholder', type: 'string', default: '-', description: '占位文本' },
				{ name: 'maxTags', type: 'number', default: '-', description: '最大标签数' }
			]
		},
		{
			id: 'accordion',
			name: 'Accordion',
			category: 'layout',
			description: '手风琴组件，支持单选、多选和动画',
			icon: '📂',
			props: [
				{ name: 'items', type: 'AccordionItem[]', default: 'required', description: '手风琴项' },
				{ name: 'allowMultiple', type: 'boolean', default: 'false', description: '是否允许多选' },
				{ name: 'defaultOpen', type: 'string[]', default: '[]', description: '默认展开的项' }
			]
		}
	]

	const categories = [
		{ id: 'all', name: '全部组件', icon: <Package size={18} /> },
		{ id: 'basic', name: '基础组件', icon: <div className='text-lg'>🎨</div> },
		{ id: 'layout', name: '布局组件', icon: <div className='text-lg'>📐</div> },
		{ id: 'form', name: '表单组件', icon: <div className='text-lg'>📝</div> }
	]

	const filteredComponents = components
		.filter(c => selectedCategory === 'all' || c.category === selectedCategory)
		.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase()))

	return (
		<div className='min-h-screen bg-bg p-4 md:p-8'>
			<div className='mx-auto max-w-7xl'>
				{/* Header */}
				<div className='mb-6 text-center md:mb-8'>
					<div className='mb-3 inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand'>
						<FileCode size={14} />
						<span>开源免费 · 即用即走</span>
					</div>
					<h1 className='font-averia text-2xl font-bold md:text-4xl'>
						<span className='text-linear'>UI 组件库</span>
					</h1>
					<p className='text-secondary mx-auto mt-3 max-w-xl text-sm md:text-base'>精美的玻璃态设计，完整的 TypeScript 支持，直接复制使用</p>
				</div>

				{/* Search Bar */}
				<div className='relative bg-white/80 backdrop-blur mb-6 max-w-2xl mx-auto rounded-[40px] border p-2 shadow-lg'>
					<div className='relative flex items-center gap-3 px-4'>
						<Search className='text-secondary' size={18} />
						<input
							type='text'
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							placeholder='搜索组件名称或描述...'
							className='flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-secondary/50'
						/>
						{searchQuery && (
							<button onClick={() => setSearchQuery('')} className='text-secondary hover:text-primary transition-colors'>
								<X size={16} />
							</button>
						)}
					</div>
				</div>

				{/* Category Tabs */}
				<div className='mb-6 flex flex-wrap justify-center gap-2'>
					{categories.map(category => (
						<button
							key={category.id}
							onClick={() => {
								setSelectedCategory(category.id)
								setSearchQuery('')
							}}
							className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
								selectedCategory === category.id
									? 'bg-linear text-white shadow-md'
									: 'relative bg-card border shadow-sm bg-white/60 hover:bg-white/80 text-secondary'
							}`}>
							{category.icon}
							{category.name}
						</button>
					))}
				</div>

				{/* Components Grid */}
				{filteredComponents.length === 0 ? (
					<div className='relative bg-card border rounded-[40px] p-6 py-12 text-center shadow-md'>
						<p className='text-secondary text-base'>没有找到匹配的组件</p>
					</div>
				) : (
					<div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
						{filteredComponents.map((component, index) => (
							<motion.div
								key={component.id}
								initial={{ opacity: 0, y: 15 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.04, duration: 0.35 }}
								className='flex flex-col group'>
								{/* Artwork Frame */}
								<div className='relative bg-card border rounded-[40px] mb-3 overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-sm group-hover:shadow-md transition-shadow' style={{ 
									minHeight: component.id === 'button' ? '320px' : component.id === 'input' ? '320px' : component.id === 'card' ? '320px' : component.id === 'badge' ? '320px' : component.id === 'avatar' ? '320px' : '260px', 
									maxHeight: component.id === 'button' ? 'none' : component.id === 'input' ? '320px' : component.id === 'card' ? '320px' : component.id === 'badge' ? '320px' : component.id === 'avatar' ? '320px' : '260px' 
								}}>
									{/* Component Display Area */}
									<div className='flex items-start justify-center p-5 overflow-auto' style={{ height: component.id === 'button' ? 'auto' : component.id === 'input' ? '320px' : component.id === 'card' ? '320px' : component.id === 'badge' ? '320px' : component.id === 'avatar' ? '320px' : '260px' }}>
										<div className='w-full flex items-start justify-center'>
											{componentPreviews[component.id]}
										</div>
									</div>
								</div>

								{/* Exhibition Label */}
								<div className='space-y-1.5 px-0.5'>
									{/* Title Section */}
									<div className='flex items-center gap-1.5'>
										<span className='text-xl'>{component.icon}</span>
										<h3 className='font-averia text-lg font-bold text-primary'>{component.name}</h3>
									</div>

									{/* Description */}
									<p className='text-secondary text-xs leading-relaxed line-clamp-2'>{component.description}</p>

									{/* Category Badge */}
									<div className='flex items-center justify-between pt-0.5'>
										<span className='rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-medium text-brand'>
											{categories.find(c => c.id === component.category)?.name}
										</span>
										<span className='text-secondary text-[10px]'>{component.props.length} 属性</span>
									</div>

									{/* Action Buttons */}
									<div className='flex gap-1.5 pt-1.5'>
										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											onClick={() => setSelectedComponent(component.id)}
											className='flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-brand to-brand-secondary px-2.5 py-1.5 text-[11px] font-medium text-white transition-all shadow-sm hover:shadow'>
											<Info size={12} />
											详情
										</motion.button>
										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											className='relative bg-card border shadow-sm flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-primary transition-all hover:shadow'>
											<Code size={12} />
											代码
										</motion.button>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				)}

				{/* Component Detail Modal */}
				<AnimatePresence>
					{selectedComponent && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'
							onClick={() => setSelectedComponent(null)}>
							<motion.div
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.9, opacity: 0 }}
								transition={{ type: 'spring', damping: 25 }}
								className='relative bg-card border rounded-[40px] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg'
								onClick={e => e.stopPropagation()}>
								{(() => {
									const component = components.find(c => c.id === selectedComponent)
									if (!component) return null

									return (
										<>
											{/* Header */}
											<div className='sticky top-0 z-10 mb-6 border-b border-gray-200/50 bg-white/80 backdrop-blur p-6'>
												<div className='flex items-start justify-between'>
													<div className='flex items-start gap-4'>
														<span className='text-4xl'>{component.icon}</span>
														<div>
															<h2 className='font-averia text-3xl font-bold text-primary'>{component.name}</h2>
															<p className='text-secondary mt-1'>{component.description}</p>
														</div>
													</div>
													<button
														onClick={() => setSelectedComponent(null)}
														className='text-secondary hover:text-primary rounded-lg p-2 transition-colors'>
														<X size={24} />
													</button>
												</div>
											</div>

											{/* Content */}
											<div className='p-6 pt-0'>
												{/* Props Table */}
												<div className='mb-8'>
													<h3 className='text-primary mb-4 flex items-center gap-2 font-bold'>
														Props
														<span className='text-secondary text-sm font-normal'>（{component.props.length} 个）</span>
													</h3>
													<div className='overflow-hidden rounded-xl border'>
														<table className='w-full text-left text-sm'>
															<thead className='bg-brand-secondary/10'>
																<tr>
																	<th className='px-4 py-3 font-semibold text-primary'>属性名</th>
																	<th className='px-4 py-3 font-semibold text-primary'>类型</th>
																	<th className='px-4 py-3 font-semibold text-primary'>默认值</th>
																	<th className='px-4 py-3 font-semibold text-primary'>说明</th>
																</tr>
															</thead>
															<tbody>
																{component.props.map((prop, index) => (
																	<tr key={index} className='border-t border-gray-200'>
																		<td className='px-4 py-3 font-mono text-brand'>{prop.name}</td>
																		<td className='px-4 py-3 font-mono text-secondary'>{prop.type}</td>
																		<td className='px-4 py-3 font-mono text-secondary'>{prop.default}</td>
																		<td className='px-4 py-3 text-secondary'>{prop.description}</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												</div>

												{/* Usage Guide */}
												<div className='rounded-xl bg-brand/5 border border-brand/20 p-6'>
													<h3 className='text-primary mb-3 flex items-center gap-2 font-bold'>
														<Download size={20} />
														使用方法
													</h3>
													<div className='space-y-3 text-sm text-secondary'>
														<p>1. 复制组件文件：<code className='bg-brand/10 text-brand mx-1 rounded px-1.5 py-0.5'>src/components/ui/{component.id}.tsx</code></p>
														<p>2. 在你的项目中引入：</p>
														<code className='block bg-brand/10 text-brand rounded-lg p-3 text-xs'>import { '{' + component.name + '}' } from '@/components/ui/{component.id}'</code>
														<p className='mt-3'>3. 开始使用！</p>
													</div>
												</div>
											</div>
										</>
									)
								})()}
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	)
}
