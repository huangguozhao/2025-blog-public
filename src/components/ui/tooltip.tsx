'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

export interface TooltipProps {
	children: ReactNode
	content: ReactNode
	position?: 'top' | 'bottom' | 'left' | 'right'
	delay?: number
	className?: string
}

export function Tooltip({ children, content, position = 'top', delay = 200, className }: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false)
	let timeout: NodeJS.Timeout

	const handleMouseEnter = () => {
		timeout = setTimeout(() => {
			setIsVisible(true)
		}, delay)
	}

	const handleMouseLeave = () => {
		clearTimeout(timeout)
		setIsVisible(false)
	}

	const positions = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2'
	}

	const arrows = {
		top: 'top-full left-1/2 -translate-x-1/2 border-t-brand',
		bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-brand',
		left: 'left-full top-1/2 -translate-y-1/2 border-l-brand',
		right: 'right-full top-1/2 -translate-y-1/2 border-r-brand'
	}

	return (
		<div className='relative inline-block' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
			{children}
			<AnimatePresence>
				{isVisible && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: position === 'bottom' ? -5 : position === 'top' ? 5 : 0 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: position === 'bottom' ? -5 : position === 'top' ? 5 : 0 }}
						transition={{ duration: 0.15 }}
						className={cn(
							'absolute z-50 whitespace-nowrap rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white shadow-lg',
							positions[position],
							className
						)}>
						{content}
						{/* Arrow */}
						<div
							className={cn(
								'absolute w-0 h-0',
								'border-[6px] border-transparent',
								arrows[position]
							)}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
