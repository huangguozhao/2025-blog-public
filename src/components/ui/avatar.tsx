import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

export interface AvatarProps extends HTMLAttributes<HTMLImageElement> {
	src?: string
	alt?: string
	variant?: 'default' | 'square' | 'rounded' | 'circle' | 'bordered' | 'shadow' | 'gradient' | 'neon' | 'glass'
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
	status?: 'online' | 'offline' | 'busy' | 'away'
	fallback?: string
	bordered?: boolean
	shadow?: boolean
	placeholder?: boolean
	onClick?: () => void
}

const Avatar = forwardRef<HTMLImageElement, AvatarProps>(({ 
	src, 
	alt = '', 
	variant = 'default', 
	size = 'md', 
	status, 
	fallback = 'U', 
	bordered = false,
	shadow = false,
	placeholder = false,
	onClick,
	className, 
	...props 
}, ref) => {
	const sizes = {
		xs: 'w-6 h-6 text-xs',
		sm: 'w-8 h-8 text-sm',
		md: 'w-10 h-10 text-base',
		lg: 'w-12 h-12 text-lg',
		xl: 'w-16 h-16 text-xl',
		'2xl': 'w-20 h-20 text-2xl'
	}

	const variants = {
		default: 'rounded-full',
		square: 'rounded-none',
		rounded: 'rounded-lg',
		circle: 'rounded-full',
		bordered: 'rounded-full ring-2 ring-white ring-offset-2',
		shadow: 'rounded-full shadow-lg shadow-gray-200',
		gradient: 'rounded-full bg-gradient-to-br from-brand via-brand-secondary to-purple-600 p-0.5',
		neon: 'rounded-full bg-gray-900 ring-2 ring-cyan-400 shadow-lg shadow-cyan-400/50',
		glass: 'rounded-full bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-md border border-white/30'
	}

	const statusColors = {
		online: 'bg-emerald-500',
		offline: 'bg-gray-400',
		busy: 'bg-amber-500',
		away: 'bg-blue-500'
	}

	const MotionComponent = onClick ? motion.button : motion.div
	const motionProps = onClick ? {
		whileHover: { scale: 1.05 },
		whileTap: { scale: 0.95 },
		transition: { duration: 0.2 },
		onClick
	} : {
		whileHover: { scale: 1.05 },
		whileTap: { scale: 0.95 },
		transition: { duration: 0.2 }
	}

	return (
		<MotionComponent
			ref={ref}
			className={cn(
				'relative inline-flex items-center justify-center overflow-hidden transition-all duration-300',
				sizes[size],
				variants[variant],
				bordered && 'ring-2 ring-white ring-offset-2',
				shadow && 'shadow-lg shadow-gray-200',
				onClick && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/50',
				className
			)}
			{...motionProps}
			{...props}>
			
			{/* 状态指示器 */}
			{status && (
				<div className={cn(
					'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
					statusColors[status],
					size === 'xs' && 'w-2 h-2',
					size === 'sm' && 'w-2.5 h-2.5',
					size === 'lg' && 'w-4 h-4',
					size === 'xl' && 'w-4 h-4',
					size === '2xl' && 'w-5 h-5'
				)} />
			)}

			{/* 图片或占位符 */}
			{src ? (
				<img 
					src={src} 
					alt={alt} 
					className={cn(
						'h-full w-full object-cover',
						variant === 'gradient' && 'rounded-full',
						variant === 'neon' && 'rounded-full',
						variant === 'glass' && 'rounded-full'
					)} 
					onError={(e) => {
						const target = e.target as HTMLImageElement
						target.style.display = 'none'
						const parent = target.parentElement
						if (parent) {
							const fallbackEl = document.createElement('div')
							fallbackEl.className = 'flex items-center justify-center h-full w-full bg-gray-100 text-gray-600 font-medium'
							fallbackEl.textContent = fallback
							parent.appendChild(fallbackEl)
						}
					}}
				/>
			) : placeholder ? (
				<div className='flex items-center justify-center h-full w-full bg-gray-100 text-gray-400'>
					<svg className={cn('w-1/2 h-1/2', size === 'xs' && 'w-3 h-3', size === 'sm' && 'w-4 h-4', size === 'lg' && 'w-6 h-6', size === 'xl' && 'w-8 h-8', size === '2xl' && 'w-10 h-10')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				</div>
			) : (
				<div className='flex items-center justify-center h-full w-full bg-gray-100 text-gray-600 font-medium'>
					{fallback}
				</div>
			)}

			{/* 特殊效果覆盖层 */}
			{variant === 'gradient' && (
				<div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
			)}
			{variant === 'neon' && (
				<div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-cyan-400/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
			)}
			{variant === 'glass' && (
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
			)}
		</MotionComponent>
	)
})

Avatar.displayName = 'Avatar'

export { Avatar }
