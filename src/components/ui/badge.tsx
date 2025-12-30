import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
	size?: 'sm' | 'md' | 'lg'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
	const variants = {
		default: 'bg-secondary/10 text-secondary',
		primary: 'bg-brand/10 text-brand',
		secondary: 'bg-brand-secondary/10 text-brand-secondary',
		success: 'bg-emerald-500/10 text-emerald-500',
		warning: 'bg-amber-500/10 text-amber-500',
		danger: 'bg-rose-500/10 text-rose-500'
	}

	const sizes = {
		sm: 'px-2 py-0.5 text-xs',
		md: 'px-3 py-1 text-sm',
		lg: 'px-4 py-1.5 text-base'
	}

	return (
		<span ref={ref} className={cn('inline-flex items-center rounded-full font-medium', variants[variant], sizes[size], className)} {...props}>
			{children}
		</span>
	)
})

Badge.displayName = 'Badge'

export { Badge }
