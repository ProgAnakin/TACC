import { useState, useMemo } from 'react'
import { Search, X, Archive, RotateCcw, Loader2 } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryBadge } from '@/components/cases/CategoryBadge'
import { useCases, useUpdateCase } from '@/hooks/useCases'
import { LEAD_OUTCOME_LABELS, LEAD_OUTCOME_COLORS } from '@/types'

export default function ArchivePage() {
  const [search, setSearch] = useState('')
  const { data: cases = [], isLoading } = useCases({
    status: 'resolved',
    search: search || undefined,
    sortBy: 'newest',
  })
  const updateCase = useUpdateCase()

  const insights = useMemo(() => {
    if (!cases.length) return null

    const serviceCases = cases.filter(c => c.category === 'assistance' && c.resolved_at && c.created_at)
    const avgDays = serviceCases.length
      ? Math.round(serviceCases.reduce((sum, c) => {
          return sum + differenceInDays(new Date(c.resolved_at!), new Date(c.created_at))
        }, 0) / serviceCases.length)
      : null

    const leads = cases.filter(c => c.category === 'lead')
    const converted = leads.filter(c => c.lead_outcome === 'converted').length
    const convRate = leads.length ? Math.round((converted / leads.length) * 100) : null

    return { avgDays, convRate, leads: leads.length, converted }
  }, [cases])

  const handleReopen = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await updateCase.mutateAsync({ id, status: 'open', resolved_at: null })
      toast.success('Case reopened!')
    } catch {
      toast.error('Error reopening case')
    }
  }

  return (
    <>
      <Header title="Archive" />

      <div className="px-4 py-4 space-y-4 pb-28">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search resolved cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {insights && !search && cases.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
              <div className="text-xl font-bold text-gray-700">{cases.length}</div>
              <div className="text-xs text-gray-400 mt-0.5">Resolved</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
              <div className="text-xl font-bold text-blue-600">
                {insights.avgDays !== null ? `${insights.avgDays}d` : '—'}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">Avg repair time</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
              <div className="text-xl font-bold text-green-600">
                {insights.convRate !== null ? `${insights.convRate}%` : '—'}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">Lead conv.</div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-16">
            <Archive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {search ? 'No results found' : 'Archive is empty'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {search ? 'Try a different search term' : 'Resolved cases will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 px-1">
              {cases.length} {cases.length === 1 ? 'case' : 'cases'}
            </p>
            {cases.map((case_) => (
              <Link
                key={case_.id}
                to={`/cases/${case_.id}`}
                className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-gray-700 text-sm">{case_.client_name}</span>
                    <CategoryBadge category={case_.category} size="sm" />
                    {case_.lead_outcome && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${LEAD_OUTCOME_COLORS[case_.lead_outcome]}`}>
                        {LEAD_OUTCOME_LABELS[case_.lead_outcome]}
                      </span>
                    )}
                  </div>
                  {case_.product_name && (
                    <p className="text-xs text-gray-500 truncate">{case_.product_name}</p>
                  )}
                  {case_.resolved_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      Resolved on {format(new Date(case_.resolved_at), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => handleReopen(case_.id, e)}
                  disabled={updateCase.isPending}
                  className="shrink-0 p-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Reopen case"
                >
                  {updateCase.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
