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
			<div className='w-full'>
				{label && (
					<label htmlFor={inputId} className='text-secondary mb-2 block text-sm font-medium'>
						{label}
					</label>
				)}
				<div className='relative'>
					{(leftIcon || icon) && <span className='text-secondary absolute left-3 top-1/2 -translate-y-1/2'>{leftIcon || icon}</span>}
					<motion.input
						ref={ref}
						type={type}
						id={inputId}
						className={cn(
							'card w-full rounded-xl border-2 px-4 py-3 transition-all',
							'focus:border-brand focus:shadow-md focus:outline-none',
							'disabled:cursor-not-allowed disabled:opacity-50',
							error && 'border-rose-500 focus:border-rose-500',
							(leftIcon || icon) && 'pl-10',
							rightIcon && 'pr-10',
							className
						)}
						whileFocus={{ scale: 1.01 }}
						{...props}
					/>
					{rightIcon && <span className='text-secondary absolute right-3 top-1/2 -translate-y-1/2'>{rightIcon}</span>}
				</div>
				{error && <p className='text-rose-500 mt-1 text-sm'>{error}</p>}
			</div>
		)
	}
)

Input.displayName = 'Input'

export { Input }
