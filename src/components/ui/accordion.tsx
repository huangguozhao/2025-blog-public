'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface AccordionItem {
	id: string
	title: string
	content: React.ReactNode
}

export interface AccordionProps {
	items: AccordionItem[]
	allowMultiple?: boolean
	defaultOpen?: string[]
	className?: string
}

export function Accordion({ items, allowMultiple = false, defaultOpen = [], className }: AccordionProps) {
	const [openItems, setOpenItems] = useState<string[]>(defaultOpen)

	const toggleItem = (id: string) => {
		setOpenItems(prev => {
			if (allowMultiple) {
				return prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
			} else {
				return prev.includes(id) ? [] : [id]
			}
		})
	}

	return (
		<div className={cn('space-y-2', className)}>
			{items.map(item => (
				<div key={item.id} className='card overflow-hidden'>
					<button
						onClick={() => toggleItem(item.id)}
						className='text-primary flex w-full items-center justify-between px-6 py-4 text-left font-medium transition-colors hover:bg-brand/5'>
						<span>{item.title}</span>
						<motion.div
							animate={{ rotate: openItems.includes(item.id) ? 180 : 0 }}
							transition={{ duration: 0.2 }}
							className='text-secondary'>
							<ChevronDown size={20} />
						</motion.div>
					</button>
					<AnimatePresence>
						{openItems.includes(item.id) && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: 'auto', opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.3, ease: 'easeInOut' }}
								className='overflow-hidden'>
								<div className='text-secondary px-6 pb-4 pt-0'>{item.content}</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			))}
		</div>
	)
}
