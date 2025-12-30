import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	hoverable?: boolean
	clickable?: boolean
	noPadding?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, hoverable = true, clickable = false, noPadding = false, children, ...props }, ref) => {
	const baseStyles = 'rounded-[40px] border backdrop-blur-sm'

	const variants = {
		default: 'bg-card shadow-sm',
		elevated: 'bg-card shadow-lg'
	}

	const motionProps = hoverable
		? {
				whileHover: clickable ? { scale: 1.02, cursor: 'pointer' } : { scale: 1.01 },
				whileTap: clickable ? { scale: 0.98 } : undefined
			}
		: {}

	return (
		<motion.div
			ref={ref}
			className={cn(baseStyles, variants.default, noPadding ? '' : 'p-6', clickable && 'cursor-pointer', className)}
			{...motionProps}
			{...props}>
			{children}
		</motion.div>
	)
})

Card.displayName = 'Card'

export { Card }
