import { HTMLAttributes, forwardRef } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gradient' | 'neon' | 'outlined' | 'ghost'
	size?: 'xs' | 'sm' | 'md' | 'lg'
	shape?: 'rounded' | 'pill' | 'square'
	dot?: boolean
	animated?: boolean
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ 
	className, 
	variant = 'default', 
	size = 'md', 
	shape = 'pill', 
	dot = false, 
	animated = false,
	children, 
	...props 
}, ref) => {
	const variants = {
		default: 'bg-secondary/10 text-secondary border border-secondary/20',
		primary: 'bg-brand/10 text-brand border border-brand/20',
		secondary: 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20',
		success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
		warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
		danger: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
		info: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
		gradient: 'bg-gradient-to-r from-brand via-brand-secondary to-purple-600 text-white border-transparent',
		neon: 'bg-cyan-500 text-white border-2 border-cyan-400 shadow-lg shadow-cyan-400/50',
		outlined: 'bg-transparent border-2 border-brand text-brand',
		ghost: 'bg-transparent border border-gray-200 text-gray-600 hover:bg-gray-50'
	}

	const sizes = {
		xs: 'px-1.5 py-0.5 text-[10px]',
		sm: 'px-2 py-0.5 text-xs',
		md: 'px-3 py-1 text-sm',
		lg: 'px-4 py-1.5 text-base'
	}

	const shapes = {
		rounded: 'rounded-md',
		pill: 'rounded-full',
		square: 'rounded-none'
	}

	const MotionComponent = animated ? motion.span : 'span'
	const motionProps = animated ? {
		initial: { scale: 0, opacity: 0 },
		animate: { scale: 1, opacity: 1 },
		transition: { duration: 0.3, ease: 'easeOut' },
		whileHover: { scale: 1.05 },
		whileTap: { scale: 0.95 }
	} : {}

	return (
		<MotionComponent
			ref={ref}
			className={cn(
				'inline-flex items-center justify-center font-medium transition-all duration-200',
				variants[variant],
				sizes[size],
				shapes[shape],
				dot && 'relative',
				className
			)}
			{...motionProps}
			{...props}>
			{/* 状态指示点 */}
			{dot && (
				<span className={cn(
					'absolute -left-1.5 w-2 h-2 rounded-full',
					variant === 'success' && 'bg-emerald-500',
					variant === 'warning' && 'bg-amber-500',
					variant === 'danger' && 'bg-rose-500',
					variant === 'info' && 'bg-blue-500',
					variant === 'gradient' && 'bg-gradient-to-r from-brand to-purple-600',
					variant === 'neon' && 'bg-cyan-400',
					variant !== 'success' && variant !== 'warning' && variant !== 'danger' && variant !== 'info' && variant !== 'gradient' && variant !== 'neon' && 'bg-gray-400'
				)} />
			)}
			{children}
		</MotionComponent>
	)
})

Badge.displayName = 'Badge'

export { Badge }
