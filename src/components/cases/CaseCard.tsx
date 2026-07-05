import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, Clock, PhoneCall, MessageCircle, CalendarClock, Copy, PhoneOff } from 'lucide-react'
import { formatDistanceToNow, isPast, format, differenceInDays } from 'date-fns'
import { toast } from 'sonner'
import { cn, buildWhatsAppUrl, caseAgeBorderClass, caseAgeLabel, copyToClipboard, shortCaseId, parseLocalDate } from '@/lib/utils'
import type { Case } from '@/types'
import { CategoryBadge } from './CategoryBadge'
import { UrgencyBadge } from './UrgencyBadge'
import { useLogCall } from '@/hooks/useCallLogs'

interface Props {
  case_: Case
  className?: string
}

export function CaseCard({ case_, className }: Props) {
  const logCall = useLogCall()
  const [logged, setLogged] = useState(false)

  const handleQuickLog = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (logged || logCall.isPending) return
    try {
      await logCall.mutateAsync({ caseId: case_.id })
      setLogged(true)
      setTimeout(() => setLogged(false), 3000)
    } catch {
      // silent fail — user can log from detail page
    }
  }

  const handleCopyPhone = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!case_.client_phone) return
    const ok = await copyToClipboard(case_.client_phone)
    if (ok) toast.success('Phone copied!')
  }

  const age            = caseAgeLabel(case_.created_at)
  const ageBorder      = caseAgeBorderClass(case_.created_at)
  const hasWhatsApp    = !!case_.client_phone
  const expectedPast   = case_.expected_date && isPast(parseLocalDate(case_.expected_date))
  const neverContacted = case_.call_count === 0 &&
    differenceInDays(new Date(), new Date(case_.created_at)) >= 1

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
            {format(parseLocalDate(case_.expected_date), 'MMM d')}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs mt-1">
          <span className={cn('flex items-center gap-1', age.color)}>
            <Clock className="w-3 h-3" />
            {age.text}
          </span>

          {case_.call_count > 0 ? (
            <span className="flex items-center gap-1 text-blue-500">
              <PhoneCall className="w-3 h-3" />
              {case_.call_count} {case_.call_count === 1 ? 'call' : 'calls'}
              {lastContact && <span className="text-gray-400">· {lastContact}</span>}
            </span>
          ) : neverContacted && (
            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md font-medium">
              <PhoneOff className="w-3 h-3" />
              No contact yet
            </span>
          )}

          {case_.shopify_order && (
            <span className="text-gray-400 truncate">#{case_.shopify_order}</span>
          )}
          <span className="text-gray-300 ml-auto">#{shortCaseId(case_.id)}</span>
        </div>

        {/* Contact quick actions — min 36px tall for comfortable mobile tapping */}
        {(case_.client_phone || case_.client_email) && (
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            {case_.client_phone && (
              <a
                href={`tel:${case_.client_phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-2 rounded-lg transition-colors active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
            )}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-100 px-3 py-2 rounded-lg transition-colors active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WA
              </a>
            )}
            {case_.client_phone && (
              <button
                onClick={handleCopyPhone}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-100 px-3 py-2 rounded-lg transition-colors active:scale-95"
                title="Copy phone"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}
            {case_.client_email && (
              <a
                href={`mailto:${case_.client_email}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-100 px-3 py-2 rounded-lg transition-colors active:scale-95"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={handleQuickLog}
              disabled={logCall.isPending}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors active:scale-95 ${
                logged
                  ? 'text-green-700 bg-green-50 border-green-100'
                  : 'text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-100'
              }`}
              title="Log contact"
            >
              {logged ? '✓ Logged' : '📋 Log'}
            </button>
          </div>
        )}
      </div>
    </Link>
  )
}
