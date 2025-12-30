import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

export interface AvatarProps extends HTMLAttributes<HTMLImageElement> {
	src: string
	alt: string
	size?: 'sm' | 'md' | 'lg' | 'xl'
	className?: string
}

const Avatar = forwardRef<HTMLImageElement, AvatarProps>(({ src, alt, size = 'md', className, ...props }, ref) => {
	const sizes = {
		sm: 'w-8 h-8',
		md: 'w-10 h-10',
		lg: 'w-12 h-12',
		xl: 'w-16 h-16'
	}

	return (
		<motion.div
			className={cn('relative overflow-hidden rounded-full', sizes[size], className)}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}>
			<img ref={ref} src={src} alt={alt} className='h-full w-full object-cover' {...props} />
		</motion.div>
	)
})

Avatar.displayName = 'Avatar'

export { Avatar }
