import { ComponentType, forwardRef } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface SwitchProps {
	checked?: boolean
	onChange?: (checked: boolean) => void
	disabled?: boolean
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	variant?: 'default' | 'gradient' | 'glass' | 'neon' | 'minimal' | 'solid'
	className?: string
	label?: string
	labelPosition?: 'left' | 'right' | 'top' | 'bottom'
	icon?: React.ReactNode
	loading?: boolean
	description?: string
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
	({ 
		checked = false, 
		onChange, 
		disabled = false, 
		size = 'md', 
		variant = 'default',
		className, 
		label, 
		labelPosition = 'right',
		icon,
		loading = false,
		description
	}, ref) => {
		const sizes = {
			xs: { width: 28, height: 16, thumb: 12 },
			sm: { width: 36, height: 20, thumb: 14 },
			md: { width: 44, height: 24, thumb: 18 },
			lg: { width: 52, height: 28, thumb: 22 },
			xl: { width: 60, height: 32, thumb: 26 }
		}

		const { width, height, thumb } = sizes[size]

		const variants = {
			default: {
				track: checked 
					? 'bg-gradient-to-r from-brand to-brand-secondary shadow-lg shadow-brand/25' 
					: 'bg-gray-200',
				thumb: 'bg-white shadow-md'
			},
			gradient: {
				track: checked
					? 'bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30'
					: 'bg-gradient-to-r from-gray-200 to-gray-300',
				thumb: checked 
					? 'bg-gradient-to-br from-white to-gray-50' 
					: 'bg-gradient-to-br from-gray-50 to-white'
			},
			glass: {
				track: checked
					? 'bg-gradient-to-br from-brand/30 to-brand-secondary/20 backdrop-blur-md border border-brand/30 shadow-lg shadow-brand/20'
					: 'bg-gradient-to-br from-gray-100/50 to-white/20 backdrop-blur-md border border-gray-200/30',
				thumb: checked
					? 'bg-gradient-to-br from-white/90 to-gray-50/70 backdrop-blur-md border border-white/50'
					: 'bg-gradient-to-br from-white/70 to-gray-50/50 backdrop-blur-md border border-gray-200/30'
			},
			neon: {
				track: checked
					? 'bg-gray-900 border-2 border-cyan-400 shadow-lg shadow-cyan-400/50'
					: 'bg-gray-800 border-2 border-gray-600',
				thumb: checked
					? 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-400/60'
					: 'bg-gradient-to-br from-gray-600 to-gray-700'
			},
			minimal: {
				track: checked 
					? 'bg-brand border-2 border-brand' 
					: 'bg-transparent border-2 border-gray-300',
				thumb: checked
					? 'bg-brand shadow-md'
					: 'bg-gray-400'
			},
			solid: {
				track: checked
					? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 shadow-lg shadow-orange-500/25'
					: 'bg-gradient-to-r from-gray-400 to-gray-500',
				thumb: checked
					? 'bg-gradient-to-br from-yellow-200 to-orange-300'
					: 'bg-gradient-to-br from-gray-200 to-gray-300'
			}
		}

		const currentVariant = variants[variant]

		const handleClick = () => {
			if (!disabled && !loading && onChange) {
				onChange(!checked)
			}
		}

		const renderLabel = () => {
			if (!label && !description) return null
			
			return (
				<div className={cn(
					'flex flex-col',
					labelPosition === 'left' && 'mr-3',
					labelPosition === 'right' && 'ml-3',
					(labelPosition === 'top' || labelPosition === 'bottom') && 'items-center'
				)}>
					{label && (
						<span className={cn(
							'text-sm font-medium transition-colors duration-200',
							disabled ? 'text-gray-400' : checked ? 'text-brand' : 'text-secondary'
						)}>
							{label}
						</span>
					)}
					{description && (
						<span className='text-xs text-gray-500 mt-0.5'>
							{description}
						</span>
					)}
				</div>
			)
		}

		const containerOrientation = labelPosition === 'top' || labelPosition === 'bottom' 
			? 'flex-col' 
			: 'flex-row'

		return (
			<div className={cn(
				'flex items-center',
				containerOrientation,
				labelPosition === 'left' && 'flex-row-reverse',
				labelPosition === 'top' && 'flex-col-reverse',
				labelPosition === 'bottom' && 'flex-col',
				labelPosition === 'right' && 'flex-row'
			)}>
				{renderLabel()}
				<motion.button
					ref={ref}
					type='button'
					onClick={handleClick}
					disabled={disabled || loading}
					className={cn(
						'relative inline-flex flex-shrink-0 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2',
						focus: disabled ? 'focus:ring-0' : 'focus:ring-brand/50',
						disabled && 'cursor-not-allowed opacity-50',
						!disabled && !loading && 'hover:scale-105 active:scale-95',
						currentVariant.track,
						className
					)}
					style={{ width, height }}
					whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
					whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
					transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
					
					{/* 背景光效 */}
					{checked && (
						<motion.div
							className='absolute inset-0 rounded-full opacity-0'
							initial={false}
							animate={{ opacity: [0, 0.3, 0] }}
							transition={{ 
								duration: 2, 
								repeat: Infinity,
								ease: 'easeInOut'
							}}
							style={{
								background: variant === 'neon' 
									? 'radial-gradient(circle at center, rgba(34, 211, 238, 0.3), transparent 70%)'
									: variant === 'gradient'
									? 'radial-gradient(circle at center, rgba(34, 197, 94, 0.3), transparent 70%)'
									: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.3), transparent 70%)'
							}}
						/>
					)}

					{/* 滑块 */}
					<motion.span
						className={cn(
							'pointer-events-none inline-block rounded-full transition-colors duration-300',
							currentVariant.thumb,
							disabled && 'opacity-60'
						)}
						animate={{ x: checked ? width - height - 2 : 2 }}
						transition={{ 
							type: 'spring', 
							stiffness: 500, 
							damping: 30,
							mass: 0.5
						}}
						style={{ width: thumb, height: thumb }}>
						
						{/* 加载状态 */}
						{loading && (
							<motion.svg
								className='absolute inset-0 m-auto h-2/3 w-2/3 text-white'
								animate={{ rotate: 360 }}
								transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
								fill='none'
								viewBox='0 0 24 24'>
								<circle 
									className='opacity-25' 
									cx='12' 
									cy='12' 
									r='10' 
									stroke='currentColor' 
									strokeWidth='4' 
								/>
								<path 
									className='opacity-75' 
									fill='currentColor' 
									d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' 
								/>
							</motion.svg>
						)}

						{/* 图标 */}
						{icon && !loading && (
							<span className='absolute inset-0 flex items-center justify-center text-white text-xs'>
								{icon}
							</span>
						)}
					</motion.span>

					{/* 边缘高光 */}
					{checked && variant !== 'neon' && (
						<div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60' />
					)}
				</motion.button>
			</div>
		)
	}
)

Switch.displayName = 'Switch'

export { Switch }
