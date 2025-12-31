import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	variant?: 'default' | 'filled' | 'outlined' | 'underlined' | 'ghost' | 'glass' | 'success' | 'warning' | 'error'
	size?: 'sm' | 'md' | 'lg'
	label?: string
	error?: string
	icon?: React.ReactNode
	leftIcon?: React.ReactNode
	rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, variant = 'default', size = 'md', label, error, icon, leftIcon, rightIcon, type = 'text', id, ...props }, ref) => {
		const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

		const variants = {
			default: 'bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-sm focus:border-brand focus:shadow-brand/10',
			filled: 'bg-gray-100 border-transparent focus:bg-white focus:border-brand focus:shadow-lg focus:shadow-brand/10',
			outlined: 'bg-transparent border-2 border-gray-300 focus:border-brand focus:shadow-md focus:shadow-brand/10',
			underlined: 'bg-transparent border-0 border-b-2 border-gray-300 rounded-none px-0 pb-2 focus:border-brand focus:ring-0',
			ghost: 'bg-transparent border-0 focus:bg-gray-50 focus:shadow-none',
			glass: 'bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md border border-white/30 focus:border-white/50 focus:shadow-lg focus:shadow-white/20',
			success: 'bg-emerald-50 border-emerald-200 focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/10',
			warning: 'bg-amber-50 border-amber-200 focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/10',
			error: 'bg-rose-50 border-rose-200 focus:border-rose-500 focus:shadow-lg focus:shadow-rose-500/10'
		}

		const sizes = {
			sm: 'px-3 py-1.5 text-sm',
			md: 'px-4 py-2.5 text-base',
			lg: 'px-5 py-3 text-lg'
		}

		const iconSizes = {
			sm: 'left-2.5 right-2.5',
			md: 'left-3.5 right-3.5',
			lg: 'left-4 right-4'
		}

		return (
			<div className='w-full space-y-1.5'>
				{label && (
					<label htmlFor={inputId} className='text-secondary text-sm font-medium leading-none'>
						{label}
					</label>
				)}
				<div className='relative'>
					{(leftIcon || icon) && (
						<span className={cn(
							'text-secondary/70 absolute top-1/2 -translate-y-1/2 z-10',
							iconSizes[size]?.split(' ')[0]
						)}>
							{leftIcon || icon}
						</span>
					)}
					<motion.input
						ref={ref}
						type={type}
						id={inputId}
						className={cn(
							'w-full rounded-2xl border-2 transition-all duration-200',
							'focus:outline-none focus:scale-100',
							'hover:border-gray-300/50 hover:shadow-md',
							'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
							'placeholder:text-gray-400',
							variants[variant],
							sizes[size],
							variant !== 'underlined' && 'rounded-2xl',
							variant === 'underlined' && 'rounded-none',
							(leftIcon || icon) && variant !== 'underlined' && 'pl-10',
							rightIcon && variant !== 'underlined' && 'pr-10',
							variant === 'underlined' && (leftIcon || icon) && 'pl-8',
							variant === 'underlined' && rightIcon && 'pr-8',
							error && 'border-rose-400 focus:border-rose-500 focus:shadow-rose-500/10',
							className
						)}
						whileFocus={{ 
							scale: variant === 'underlined' ? 1 : 1.005,
							transition: { duration: 0.2 }
						}}
						{...props}
					/>
					{rightIcon && (
						<span className={cn(
							'text-secondary/70 absolute top-1/2 -translate-y-1/2 z-10',
							iconSizes[size]?.split(' ')[1]
						)}>
							{rightIcon}
						</span>
					)}
				</div>
				{error && (
					<p className='text-rose-500 text-xs font-medium flex items-center gap-1 animate-pulse'>
						<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
						</svg>
						{error}
					</p>
				)}
			</div>
		)
	}
)

Input.displayName = 'Input'

export { Input }
