import { cn } from '@/lib/utils'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/types'
import type { Category } from '@/types'

interface Props {
  category: Category
  className?: string
  size?: 'sm' | 'md'
}

export function CategoryBadge({ category, className, size = 'md' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs',
        CATEGORY_COLORS[category],
        className,
      )}
    >
      {CATEGORY_LABELS[category]}
    </span>
  )
}
