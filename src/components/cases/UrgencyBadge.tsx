import { cn } from '@/lib/utils'
import { URGENCY_COLORS, URGENCY_LABELS } from '@/types'
import type { Urgency } from '@/types'

interface Props {
  urgency: Urgency
  className?: string
}

export function UrgencyBadge({ urgency, className }: Props) {
  if (urgency === 'normal' || urgency === 'low') return null
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        URGENCY_COLORS[urgency],
        className,
      )}
    >
      {urgency === 'critical' ? '🔴' : '🟠'} {URGENCY_LABELS[urgency]}
    </span>
  )
}
