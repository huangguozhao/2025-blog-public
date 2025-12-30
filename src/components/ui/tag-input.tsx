'use client'

import { useState, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'

export interface TagInputProps {
	tags: string[]
	onTagsChange: (tags: string[]) => void
	placeholder?: string
	className?: string
	maxTags?: number
}

export function TagInput({ tags, onTagsChange, placeholder = '输入后按回车添加标签...', className, maxTags }: TagInputProps) {
	const [input, setInput] = useState('')

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			const trimmed = input.trim()
			if (trimmed && !tags.includes(trimmed) && (!maxTags || tags.length < maxTags)) {
				onTagsChange([...tags, trimmed])
				setInput('')
			}
		} else if (e.key === 'Backspace' && !input && tags.length > 0) {
			onTagsChange(tags.slice(0, -1))
		}
	}

	const removeTag = (tagToRemove: string) => {
		onTagsChange(tags.filter(tag => tag !== tagToRemove))
	}

	return (
		<div
			className={cn(
				'card min-h-[48px] w-full flex-wrap gap-2 rounded-xl border-2 px-3 py-2 transition-all focus-within:border-brand focus-within:shadow-md',
				className
			)}>
			<AnimatePresence mode='popLayout'>
				{tags.map((tag, index) => (
					<motion.span
						key={tag}
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						transition={{ duration: 0.2 }}
						className='bg-brand/10 text-brand flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium'>
						{tag}
						<button
							type='button'
							onClick={() => removeTag(tag)}
							className='text-brand/60 hover:text-brand transition-colors'
							tabIndex={-1}>
							<X size={14} />
						</button>
					</motion.span>
				))}
			</AnimatePresence>
			<input
				type='text'
				value={input}
				onChange={e => setInput(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={tags.length === 0 ? placeholder : ''}
				className='flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-secondary/50'
			/>
		</div>
	)
}
