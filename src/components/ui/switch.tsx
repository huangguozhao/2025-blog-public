import { ComponentType, forwardRef } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface SwitchProps {
	checked?: boolean
	onChange?: (checked: boolean) => void
	disabled?: boolean
	size?: 'sm' | 'md' | 'lg'
	className?: string
	label?: string
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
	({ checked = false, onChange, disabled = false, size = 'md', className, label }, ref) => {
		const sizes = {
			sm: { width: 36, height: 20, thumb: 14 },
			md: { width: 44, height: 24, thumb: 18 },
			lg: { width: 52, height: 28, thumb: 22 }
		}

		const { width, height, thumb } = sizes[size]

		const handleClick = () => {
			if (!disabled && onChange) {
				onChange(!checked)
			}
		}

		return (
			<div className='flex items-center gap-2'>
				<button
					ref={ref}
					type='button'
					onClick={handleClick}
					disabled={disabled}
					className={cn(
						'relative inline-flex flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand/50',
						disabled && 'cursor-not-allowed opacity-50',
						checked ? 'bg-brand' : 'bg-gray-300',
						className
					)}
					style={{ width, height }}>
					<motion.span
						className='pointer-events-none inline-block rounded-full bg-white shadow-sm'
						animate={{ x: checked ? width - height - 2 : 2 }}
						transition={{ type: 'spring', stiffness: 500, damping: 30 }}
						style={{ width: thumb, height: thumb }}
					/>
				</button>
				{label && <span className='text-secondary text-sm'>{label}</span>}
			</div>
		)
	}
)

Switch.displayName = 'Switch'

export { Switch }
