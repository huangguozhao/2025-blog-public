import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string
	error?: string
	icon?: React.ReactNode
	leftIcon?: React.ReactNode
	rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, label, error, icon, leftIcon, rightIcon, type = 'text', id, ...props }, ref) => {
		const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

		return (
			<div className='w-full space-y-1.5'>
				{label && (
					<label htmlFor={inputId} className='text-secondary text-sm font-medium leading-none'>
						{label}
					</label>
				)}
				<div className='relative'>
					{(leftIcon || icon) && (
						<span className='text-secondary/70 absolute left-3.5 top-1/2 -translate-y-1/2 z-10'>
							{leftIcon || icon}
						</span>
					)}
					<motion.input
						ref={ref}
						type={type}
						id={inputId}
						className={cn(
							'w-full rounded-2xl border-2 px-4 py-2.5 text-base transition-all duration-200',
							'bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-sm',
							'focus:border-brand focus:shadow-lg focus:shadow-brand/10 focus:bg-white focus:outline-none',
							'hover:border-gray-300/50 hover:shadow-md',
							'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
							error && 'border-rose-400 focus:border-rose-500 focus:shadow-rose-500/10',
							(leftIcon || icon) && 'pl-10',
							rightIcon && 'pr-10',
							'placeholder:text-gray-400',
							className
						)}
						whileFocus={{ 
							scale: 1.005,
							transition: { duration: 0.2 }
						}}
						{...props}
					/>
					{rightIcon && (
						<span className='text-secondary/70 absolute right-3.5 top-1/2 -translate-y-1/2 z-10'>
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
