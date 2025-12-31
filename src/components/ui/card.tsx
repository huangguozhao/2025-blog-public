import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	variant?: 'default' | 'elevated' | 'glass' | 'gradient' | 'minimal' | 'bordered' | 'neon' | 'outlined' | 'solid'
	size?: 'sm' | 'md' | 'lg'
	hoverable?: boolean
	clickable?: boolean
	noPadding?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ 
	className, 
	variant = 'default', 
	size = 'md',
	hoverable = true, 
	clickable = false, 
	noPadding = false, 
	children, 
	...props 
}, ref) => {
	const baseStyles = 'backdrop-blur-sm transition-all duration-300'

	const variants = {
		default: 'bg-white/80 border-gray-200/50 shadow-sm hover:shadow-md',
		elevated: 'bg-white/90 border-gray-200/70 shadow-xl hover:shadow-2xl',
		glass: 'bg-gradient-to-br from-white/40 to-white/10 border-white/30 shadow-lg hover:shadow-xl hover:from-white/50 hover:to-white/20',
		gradient: 'bg-gradient-to-br from-brand via-brand-secondary to-purple-600 border-transparent text-white shadow-lg hover:shadow-xl hover:shadow-brand/25',
		minimal: 'bg-transparent border-0 shadow-none hover:bg-gray-50/50',
		bordered: 'bg-white border-2 border-gray-300 shadow-none hover:border-brand hover:shadow-md',
		neon: 'bg-gray-900 border-cyan-400/50 shadow-lg shadow-cyan-400/20 hover:shadow-xl hover:shadow-cyan-400/40 hover:border-cyan-400',
		outlined: 'bg-transparent border-2 border-brand shadow-none hover:bg-brand/5',
		solid: 'bg-gray-100 border-gray-200 shadow-none hover:bg-gray-200 hover:shadow-sm'
	}

	const sizes = {
		sm: 'rounded-2xl',
		md: 'rounded-[32px]',
		lg: 'rounded-[40px]'
	}

	const padding = {
		sm: noPadding ? '' : 'p-4',
		md: noPadding ? '' : 'p-6',
		lg: noPadding ? '' : 'p-8'
	}

	const motionProps = hoverable
		? {
				whileHover: clickable ? { scale: 1.02, y: -2, cursor: 'pointer' } : { scale: 1.01, y: -1 },
				whileTap: clickable ? { scale: 0.98 } : undefined,
				transition: { duration: 0.2 }
			}
		: {
				transition: { duration: 0.2 }
			}

	return (
		<motion.div
			ref={ref}
			className={cn(
				baseStyles,
				variants[variant],
				sizes[size],
				padding[size],
				clickable && 'cursor-pointer',
				variant === 'gradient' && 'text-white',
				className
			)}
			{...motionProps}
			{...props}>
			{/* 光效层 */}
			{variant === 'gradient' && (
				<div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
			)}
			
			{/* 边缘高光 */}
			{variant === 'glass' && (
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
			)}
			
			{/* 内容 */}
			<div className="relative z-10">
				{children}
			</div>
		</motion.div>
	)
})

Card.displayName = 'Card'

export { Card }
