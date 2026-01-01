'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

export interface TooltipProps {
	children: ReactNode
	content: ReactNode
	position?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'
	variant?: 'default' | 'dark' | 'glass' | 'neon' | 'gradient' | 'minimal' | 'success' | 'warning' | 'error'
	size?: 'sm' | 'md' | 'lg'
	delay?: number
	hideDelay?: number
	disabled?: boolean
	arrow?: boolean
	onClick?: () => void
	className?: string
}

export function Tooltip({ 
	children, 
	content, 
	position = 'top', 
	variant = 'default',
	size = 'md',
	delay = 200,
	hideDelay = 100,
	disabled = false,
	arrow = true,
	onClick,
	className 
}: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)
	const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const handleMouseEnter = () => {
		if (disabled) return
		
		if (hideTimeoutRef.current) {
			clearTimeout(hideTimeoutRef.current)
			hideTimeoutRef.current = null
		}
		
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}
		
		timeoutRef.current = setTimeout(() => {
			setIsVisible(true)
		}, delay)
	}

	const handleMouseLeave = () => {
		if (disabled) return
		
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
		
		hideTimeoutRef.current = setTimeout(() => {
			setIsVisible(false)
		}, hideDelay)
	}

	const handleClick = () => {
		if (onClick) {
			onClick()
		}
		// 点击后隐藏提示框
		setIsVisible(false)
	}

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
			if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
		}
	}, [])

	const positions = {
		// 基础位置
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2',
		// 扩展位置
		'top-start': 'bottom-full left-0 mb-2',
		'top-end': 'bottom-full right-0 mb-2',
		'bottom-start': 'top-full left-0 mt-2',
		'bottom-end': 'top-full right-0 mt-2',
		'left-start': 'right-full top-0 mr-2',
		'left-end': 'right-full bottom-0 mr-2',
		'right-start': 'left-full top-0 ml-2',
		'right-end': 'left-full bottom-0 ml-2'
	}

	const arrowPositions = {
		// 基础箭头位置
		top: 'top-full left-1/2 -translate-x-1/2',
		bottom: 'bottom-full left-1/2 -translate-x-1/2',
		left: 'left-full top-1/2 -translate-y-1/2',
		right: 'right-full top-1/2 -translate-y-1/2',
		// 扩展箭头位置
		'top-start': 'top-full left-2',
		'top-end': 'top-full right-2',
		'bottom-start': 'bottom-full left-2',
		'bottom-end': 'bottom-full right-2',
		'left-start': 'left-full top-2',
		'left-end': 'left-full bottom-2',
		'right-start': 'right-full top-2',
		'right-end': 'right-full bottom-2'
	}

	const variants = {
		default: 'bg-gray-900 text-white border border-gray-700 shadow-xl',
		dark: 'bg-black text-white border border-gray-800 shadow-2xl',
		glass: 'bg-gradient-to-br from-gray-800/90 to-gray-900/70 backdrop-blur-md text-white border border-gray-600/50 shadow-xl',
		neon: 'bg-gray-900 text-cyan-400 border-2 border-cyan-400 shadow-lg shadow-cyan-400/50',
		gradient: 'bg-gradient-to-r from-brand via-brand-secondary to-purple-600 text-white shadow-lg shadow-brand/30',
		minimal: 'bg-white text-gray-800 border border-gray-200 shadow-md',
		success: 'bg-emerald-600 text-white border border-emerald-500 shadow-lg shadow-emerald-500/30',
		warning: 'bg-amber-600 text-white border border-amber-500 shadow-lg shadow-amber-500/30',
		error: 'bg-rose-600 text-white border border-rose-500 shadow-lg shadow-rose-500/30'
	}

	const sizes = {
		sm: 'px-2 py-1 text-xs',
		md: 'px-3 py-1.5 text-sm',
		lg: 'px-4 py-2 text-base'
	}

	const arrowColors = {
		default: 'border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent',
		dark: 'border-t-black border-l-transparent border-r-transparent border-b-transparent',
		glass: 'border-t-gray-800/90 border-l-transparent border-r-transparent border-b-transparent',
		neon: 'border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent',
		gradient: 'border-t-brand border-l-transparent border-r-transparent border-b-transparent',
		minimal: 'border-t-white border-l-gray-200 border-r-gray-200 border-b-gray-200',
		success: 'border-t-emerald-600 border-l-transparent border-r-transparent border-b-transparent',
		warning: 'border-t-amber-600 border-l-transparent border-r-transparent border-b-transparent',
		error: 'border-t-rose-600 border-l-transparent border-r-transparent border-b-transparent'
	}

	// 箭头方向和颜色
	const getArrowClasses = (pos: string, variant: string) => {
		const isTop = pos.includes('top')
		const isBottom = pos.includes('bottom')
		const isLeft = pos.includes('left')
		const isRight = pos.includes('right')
		const color = arrowColors[variant as keyof typeof arrowColors]
		
		let baseClass = `absolute w-0 h-0 border-4 ${color}`
		
		if (isTop) baseClass += ' border-t-0'
		else if (isBottom) baseClass += ' border-b-0'
		else if (isLeft) baseClass += ' border-l-0'
		else if (isRight) baseClass += ' border-r-0'
		
		return baseClass
	}

	const getAnimationVariants = (pos: string) => {
		const isTop = pos.includes('top')
		const isBottom = pos.includes('bottom')
		const isLeft = pos.includes('left')
		const isRight = pos.includes('right')
		
		const axis = isTop ? -1 : isBottom ? 1 : 0
		const axisX = isLeft ? -1 : isRight ? 1 : 0
		
		return {
			initial: { opacity: 0, scale: 0.8, y: axis * 5, x: axisX * 5 },
			animate: { opacity: 1, scale: 1, y: 0, x: 0 },
			exit: { opacity: 0, scale: 0.8, y: axis * 5, x: axisX * 5 },
			transition: { 
				type: 'spring', 
				stiffness: 300, 
				damping: 25,
				mass: 0.5
			}
		}
	}

	return (
		<div 
			className={cn('relative inline-block', disabled && 'opacity-50 pointer-events-none')}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
		>
			{children}
			<AnimatePresence>
				{isVisible && (
					<motion.div
						{...getAnimationVariants(position)}
						className={cn(
							'absolute z-50 whitespace-nowrap rounded-lg font-medium max-w-xs',
							'pointer-events-none', // 防止提示框影响鼠标事件
							variants[variant],
							sizes[size],
							positions[position],
							className
						)}>
						{/* 背景光效 */}
						{variant === 'neon' && (
							<div className='absolute inset-0 rounded-lg bg-cyan-400/20 animate-pulse' />
						)}
						{variant === 'gradient' && (
							<div className='absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse' />
						)}
						
						{/* 内容 */}
						<div className='relative z-10'>
							{content}
						</div>
						
						{/* 箭头 */}
						{arrow && (
							<div
								className={cn(
									'absolute',
									arrowPositions[position],
									getArrowClasses(position, variant)
								)}
							/>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
