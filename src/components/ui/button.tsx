import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'link' | 'glass'
	size?: 'sm' | 'md' | 'lg'
	loading?: boolean
	fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = 'primary', size = 'md', loading = false, fullWidth = false, children, disabled, ...props }, ref) => {
		const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:cursor-not-allowed disabled:opacity-50'

		const variants = {
			primary: 'bg-linear text-white shadow-lg hover:shadow-xl',
			secondary: 'bg-brand-secondary text-white shadow-md hover:shadow-lg',
			outline: 'border-2 border-brand text-brand hover:bg-brand hover:text-white',
			ghost: 'text-secondary hover:text-primary hover:bg-secondary/10',
			danger: 'bg-red-500 text-white shadow-md hover:bg-red-600 hover:shadow-lg',
			success: 'bg-green-500 text-white shadow-md hover:bg-green-600 hover:shadow-lg',
			warning: 'bg-yellow-500 text-white shadow-md hover:bg-yellow-600 hover:shadow-lg',
			link: 'text-brand hover:text-brand-secondary hover:underline p-0 shadow-none bg-transparent',
			glass: 'bg-white/20 backdrop-blur border border-white/30 text-white shadow-lg hover:bg-white/30'
		}

		const sizes = {
			sm: 'px-3 py-1.5 text-sm',
			md: 'px-4 py-2',
			lg: 'px-6 py-3 text-lg'
		}

		return (
			<motion.button
				ref={ref}
				className={cn(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
				disabled={disabled || loading}
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				{...props}>
				{loading ? (
					<span className='flex items-center gap-2'>
						<svg className='animate-spin h-4 w-4' fill='none' viewBox='0 0 24 24'>
							<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
							<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
						</svg>
						加载中...
					</span>
				) : (
					children
				)}
			</motion.button>
		)
	}
)

Button.displayName = 'Button'

export { Button }
