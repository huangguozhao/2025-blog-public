'use client'

import { Button, Card, Input, Badge, Avatar, Switch, Tooltip, TagInput, Accordion } from '.'
import { useState } from 'react'
import { Heart, Star, User, Check, X, Info } from 'lucide-react'

export default function ComponentExamples() {
	const [inputValue, setInputValue] = useState('')
	const [tags, setTags] = useState(['React', 'TypeScript', 'Tailwind'])
	const [switchChecked, setSwitchChecked] = useState(true)

	const accordionItems = [
		{
			id: '1',
			title: '什么是可复用组件？',
			content: '可复用组件是指可以在多个项目中重复使用的 UI 组件，它们具有良好的封装性和独立性。'
		},
		{
			id: '2',
			title: '如何使用这些组件？',
			content: '直接复制组件文件到你的项目中，然后通过 import 语句引入即可使用。'
		},
		{
			id: '3',
			title: '需要哪些依赖？',
			content: '主要需要：clsx, tailwind-merge, motion (Framer Motion), lucide-react（可选）。'
		}
	]

	return (
		<div className='space-y-8'>
			{/* Button Examples */}
			<Card>
				<h2 className='text-primary mb-4 text-xl font-bold'>Button 组件示例</h2>
				<div className='flex flex-wrap items-center gap-4'>
					<Button variant='primary'>Primary</Button>
					<Button variant='secondary'>Secondary</Button>
					<Button variant='outline'>Outline</Button>
					<Button variant='ghost'>Ghost</Button>
				</div>
				<div className='text-secondary mt-4 text-sm'>
					<Button size='sm'>Small</Button>
					<Button size='md'>Medium</Button>
					<Button size='lg'>Large</Button>
					<Button loading>Loading...</Button>
					<Button disabled>Disabled</Button>
					<Button fullWidth>Full Width</Button>
				</div>
			</Card>

			{/* Card Examples */}
			<Card>
				<h2 className='text-primary mb-4 text-xl font-bold'>Card 组件示例</h2>
				<div className='grid gap-4 md:grid-cols-2'>
					<Card clickable>
						<h3 className='font-medium'>可点击卡片</h3>
						<p className='text-secondary text-sm'>点击这个卡片会有交互效果</p>
					</Card>
					<Card noPadding>
						<img src='/images/art/cat.png' alt='cat' className='h-32 w-full rounded-t-[40px] object-cover' />
						<div className='p-6'>
							<h3 className='font-medium'>无内边距卡片</h3>
						</div>
					</Card>
				</div>
			</Card>

			{/* Input Examples */}
			<Card>
				<h2 className='text-primary mb-4 text-xl font-bold'>Input 组件示例</h2>
				<div className='space-y-4'>
					<Input label='用户名' placeholder='请输入用户名' />
					<Input label='邮箱' type='email' placeholder='example@email.com' error='邮箱格式不正确' />
					<Input label='搜索' placeholder='搜索内容...' icon={<Search />} />
					<Input label='带图标的输入框' leftIcon={<User size={20} />} rightIcon={<Check size={20} />} />
				</div>
			</Card>

			{/* Badge Examples */}
			<Card>
				<h2 className='text-primary mb-4 text-xl font-bold'>Badge 组件示例</h2>
				<div className='flex flex-wrap gap-2'>
					<Badge variant='default'>Default</Badge>
					<Badge variant='primary'>Primary</Badge>
					<Badge variant='secondary'>Secondary</Badge>
					<Badge variant='success'>Success</Badge>
					<Badge variant='warning'>Warning</Badge>
					<Badge variant='danger'>Danger</Badge>
				</div>
				<div className='mt-4 flex flex-wrap gap-2'>
					<Badge size='sm'>Small</Badge>
					<Badge size='md'>Medium</Badge>
					<Badge size='lg'>Large</Badge>
				</div>
			</Card>

			{/* Avatar Examples */}
			<Card>
				<h2 className='text-primary mb-4 text-xl font-bold'>Avatar 组件示例</h2>
				<div className='flex items-center gap-4'>
					<Avatar src='/images/avatar.png' alt='Avatar' size='sm' />
					<Avatar src='/images/avatar.png' alt='Avatar' size='md' />
					<Avatar src='/images/avatar.png' alt='Avatar' size='lg' />
					<Avatar src='/images/avatar.png' alt='Avatar' size='xl' />
				</div>
			</Card>

			{/* Switch Examples */}
			<Card>
				<h2 className='text-primary mb-4 text-xl font-bold'>Switch 组件示例</h2>
				<div className='space-y-4'>
					<Switch checked={switchChecked} onChange={setSwitchChecked} label='启用通知' />
					<Switch checked={false} onChange={() => {}} label='禁用状态' disabled />
					<div className='flex items-center gap-4'>
						<Switch size='sm' label='Small' />
						<Switch size='md' label='Medium' />
						<Switch size='lg' label='Large' />
					</div>
				</div>
			</Card>

			{/* Tooltip Examples */}
			<Card>
				<h2 className='text-primary mb-4 text-xl font-bold'>Tooltip 组件示例</h2>
				<div className='flex flex-wrap gap-4'>
					<Tooltip content='这是顶部提示' position='top'>
						<Button variant='outline'>Top Tooltip</Button>
					</Tooltip>
					<Tooltip content='这是底部提示' position='bottom'>
						<Button variant='outline'>Bottom Tooltip</Button>
					</Tooltip>
					<Tooltip content='这是左侧提示' position='left'>
						<Button variant='outline'>Left Tooltip</Button>
					</Tooltip>
					<Tooltip content='这是右侧提示' position='right'>
						<Button variant='outline'>Right Tooltip</Button>
					</Tooltip>
					<Tooltip content={<Info size={16} className='inline mr-1' /> + '带图标的提示'}>
						<Button variant='outline'>With Icon</Button>
					</Tooltip>
				</div>
			</Card>

			{/* Tag Input Examples */}
			<Card>
				<h2 className='text-primary mb-4 text-xl font-bold'>TagInput 组件示例</h2>
				<div className='space-y-4'>
					<TagInput tags={tags} onTagsChange={setTags} placeholder='输入标签后按回车添加...' />
					<p className='text-secondary text-sm'>当前标签: {tags.join(', ')}</p>
					<TagInput tags={['React']} onTagsChange={() => {}} maxTags={3} placeholder='最多3个标签' />
				</div>
			</Card>

			{/* Accordion Examples */}
			<Card>
				<h2 className='text-primary mb-4 text-xl font-bold'>Accordion 组件示例</h2>
				<Accordion items={accordionItems} />
				<h3 className='text-primary mt-6 mb-4 font-bold'>允许多个展开</h3>
				<Accordion items={accordionItems} allowMultiple />
			</Card>

			{/* Combination Example */}
			<Card>
				<h2 className='text-primary mb-4 text-xl font-bold'>组合使用示例</h2>
				<div className='flex items-start gap-4'>
					<Avatar src='/images/avatar.png' alt='User' size='lg' />
					<div className='flex-1'>
						<div className='flex items-center gap-2'>
							<h3 className='font-bold'>用户名称</h3>
							<Badge variant='primary'>管理员</Badge>
						</div>
						<p className='text-secondary mb-3 text-sm'>这是一个组合多个组件的示例</p>
						<div className='flex flex-wrap gap-2'>
							<Button size='sm' variant='outline'>
								<Heart size={16} className='mr-1' />
								点赞
							</Button>
							<Button size='sm' variant='outline'>
								<Star size={16} className='mr-1' />
								收藏
							</Button>
							<Tooltip content='删除内容'>
								<Button size='sm' variant='ghost'>
									<X size={16} />
								</Button>
							</Tooltip>
						</div>
					</div>
				</div>
			</Card>
		</div>
	)
}

function Search() {
	return <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><path d='m21 21-4.3-4.3'/></svg>
}
