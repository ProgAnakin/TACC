import { Link } from 'react-router-dom'
import { Phone, Mail, Clock, PhoneCall } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Case } from '@/types'
import { CategoryBadge } from './CategoryBadge'
import { UrgencyBadge } from './UrgencyBadge'

interface Props {
  case_: Case
  className?: string
}

export function CaseCard({ case_, className }: Props) {
  const timeOpen = formatDistanceToNow(new Date(case_.created_at), { addSuffix: false })

  return (
    <Link
      to={`/cases/${case_.id}`}
      className={cn(
        'block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-150 active:scale-[0.99]',
        className,
      )}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-[15px]">
              {case_.client_name}
            </h3>
            {case_.product_name && (
              <p className="text-xs text-gray-500 truncate mt-0.5">{case_.product_name}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <CategoryBadge category={case_.category} size="sm" />
            <UrgencyBadge urgency={case_.urgency} />
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeOpen}
          </span>
          {case_.call_count > 0 && (
            <span className="flex items-center gap-1 text-blue-500">
              <PhoneCall className="w-3 h-3" />
              {case_.call_count} {case_.call_count === 1 ? 'call' : 'calls'}
            </span>
          )}
          {case_.shopify_order && (
            <span className="text-gray-400 truncate">#{case_.shopify_order}</span>
          )}
        </div>

        {/* Contact row */}
        {(case_.client_phone || case_.client_email) && (
          <div className="flex items-center gap-3 mt-2">
            {case_.client_phone && (
              <a
                href={`tel:${case_.client_phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <Phone className="w-3 h-3" />
                {case_.client_phone}
              </a>
            )}
            {case_.client_email && (
              <a
                href={`mailto:${case_.client_email}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <Mail className="w-3 h-3" />
                <span className="truncate max-w-[140px]">{case_.client_email}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
