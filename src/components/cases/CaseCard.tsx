import { Link } from 'react-router-dom'
import { Phone, Mail, Clock, PhoneCall, MessageCircle, CalendarClock } from 'lucide-react'
import { formatDistanceToNow, isPast, format } from 'date-fns'
import { cn, buildWhatsAppUrl, caseAgeBorderClass, caseAgeLabel } from '@/lib/utils'
import type { Case } from '@/types'
import { CategoryBadge } from './CategoryBadge'
import { UrgencyBadge } from './UrgencyBadge'

interface Props {
  case_: Case
  className?: string
}

export function CaseCard({ case_, className }: Props) {
  const age            = caseAgeLabel(case_.created_at)
  const ageBorder      = caseAgeBorderClass(case_.created_at)
  const hasWhatsApp    = !!case_.client_phone
  const expectedPast   = case_.expected_date && isPast(new Date(case_.expected_date))

  const lastContact = case_.last_contact_at
    ? `${formatDistanceToNow(new Date(case_.last_contact_at))} ago`
    : case_.call_count > 0 ? 'contacted' : null

  const waUrl = hasWhatsApp
    ? buildWhatsAppUrl(case_.client_phone!, case_.category, case_.client_name, case_.product_name)
    : null

  return (
    <Link
      to={`/cases/${case_.id}`}
      className={cn(
        'block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.99] overflow-hidden',
        ageBorder,
        className,
      )}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-[15px]">{case_.client_name}</h3>
            {case_.product_name && (
              <p className="text-xs text-gray-500 truncate mt-0.5">{case_.product_name}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <CategoryBadge category={case_.category} size="sm" />
            <UrgencyBadge urgency={case_.urgency} />
          </div>
        </div>

        {/* Expected date warning (assistance) */}
        {case_.expected_date && (
          <div className={cn(
            'flex items-center gap-1.5 text-xs font-medium mb-2 px-2 py-1 rounded-md w-fit',
            expectedPast
              ? 'bg-red-50 text-red-600'
              : 'bg-amber-50 text-amber-700',
          )}>
            <CalendarClock className="w-3 h-3" />
            {expectedPast ? 'Overdue: ' : 'Due: '}
            {format(new Date(case_.expected_date), 'MMM d')}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs mt-1">
          <span className={cn('flex items-center gap-1', age.color)}>
            <Clock className="w-3 h-3" />
            {age.text}
          </span>

          {case_.call_count > 0 && (
            <span className="flex items-center gap-1 text-blue-500">
              <PhoneCall className="w-3 h-3" />
              {case_.call_count} {case_.call_count === 1 ? 'call' : 'calls'}
              {lastContact && <span className="text-gray-400">· {lastContact}</span>}
            </span>
          )}

          {case_.shopify_order && (
            <span className="text-gray-400 truncate">#{case_.shopify_order}</span>
          )}
        </div>

        {/* Contact quick actions */}
        {(case_.client_phone || case_.client_email) && (
          <div className="flex items-center gap-2 mt-2.5">
            {case_.client_phone && (
              <a
                href={`tel:${case_.client_phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md"
              >
                <Phone className="w-3 h-3" />
                Call
              </a>
            )}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-md"
              >
                <MessageCircle className="w-3 h-3" />
                WhatsApp
              </a>
            )}
            {case_.client_email && (
              <a
                href={`mailto:${case_.client_email}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 bg-gray-50 px-2 py-1 rounded-md"
              >
                <Mail className="w-3 h-3" />
                Email
              </a>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
