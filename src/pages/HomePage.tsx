import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X, AlertTriangle, ChevronDown, AlertCircle } from 'lucide-react'
import { differenceInDays, isPast } from 'date-fns'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { CaseCard } from '@/components/cases/CaseCard'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useCases, useCaseStats } from '@/hooks/useCases'
import type { Category } from '@/types'
import { CATEGORY_SHORT } from '@/types'

type TabValue = 'all' | Category

const TABS: { value: TabValue; label: string }[] = [
  { value: 'all',        label: 'All'      },
  { value: 'arrival',   label: CATEGORY_SHORT.arrival    },
  { value: 'assistance',label: CATEGORY_SHORT.assistance },
  { value: 'lead',      label: CATEGORY_SHORT.lead       },
  { value: 'problem',   label: CATEGORY_SHORT.problem    },
]

const SORT_OPTIONS = [
  { value: 'newest',  label: '🕐 Newest first'  },
  { value: 'oldest',  label: '🕛 Oldest first'  },
  { value: 'urgency', label: '🔴 By urgency'    },
  { value: 'name',    label: '🔤 Client name'   },
] as const

type SortValue = typeof SORT_OPTIONS[number]['value']

const CATEGORY_LEGEND = [
  { emoji: '📦', label: 'Arrival Alert',      desc: 'Client asked to be notified when product arrives'     },
  { emoji: '🛠️', label: 'Service / Repair',   desc: 'Product in repair, transfer between locations, or adjustment' },
  { emoji: '🎯', label: 'Lead / Interest',    desc: 'Interested client — target for follow-up with deals'  },
  { emoji: '⚠️', label: 'Complaint / Return',  desc: 'Returned item, complaint, or dispute that needs resolution' },
]

export default function HomePage() {
  const [activeTab, setActiveTab]   = useState<TabValue>('all')
  const [search, setSearch]         = useState('')
  const [sortBy, setSortBy]         = useState<SortValue>('newest')
  const [showSort, setShowSort]     = useState(false)
  const [showLegend, setShowLegend] = useState(false)

  const { data: cases = [], isLoading, error } = useCases({
    status:   'open',
    category: activeTab === 'all' ? undefined : activeTab,
    search:   search || undefined,
    sortBy,
  })

  const { data: allOpenCases = [] } = useCases({ status: 'open' })

  const { data: stats } = useCaseStats()

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: stats?.open || 0 }
    if (stats?.byCategory) {
      Object.entries(stats.byCategory).forEach(([cat, count]) => {
        counts[cat] = count
      })
    }
    return counts
  }, [stats])

  const attentionCases = useMemo(() => {
    const now = new Date()
    return allOpenCases.filter(c => {
      // Overdue service item (expected_date in the past)
      if (c.expected_date && isPast(new Date(c.expected_date))) return true
      // Calculate days since last touch (last_contact_at or created_at)
      const lastTouch = c.last_contact_at ? new Date(c.last_contact_at) : new Date(c.created_at)
      const days = differenceInDays(now, lastTouch)
      // Lead with no follow-up in 3+ days
      if (c.category === 'lead' && days >= 3) return true
      // Any case with no contact in 7+ days
      if (days >= 7) return true
      return false
    })
  }, [allOpenCases])

  const dbMissing =
    error instanceof Error &&
    (error.message.includes('relation') ||
      error.message.includes('does not exist') ||
      error.message.includes('42P01'))

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Sort'

  return (
    <>
      <Header
        title="Caderninho Digital"
        rightElement={
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-colors"
            title="Sort"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{currentSortLabel.split(' ').slice(1).join(' ')}</span>
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-3 pb-32">

        {/* DB not set up warning */}
        {dbMissing && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Database tables missing</p>
              <p className="mt-0.5 text-xs">
                Open the Supabase SQL Editor and run{' '}
                <code className="bg-amber-100 px-1 rounded">supabase/migrations/001_initial.sql</code>
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats?.open ?? 0}</div>
            <div className="text-xs text-gray-500 mt-0.5">Open</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats?.resolvedToday ?? 0}</div>
            <div className="text-xs text-gray-500 mt-0.5">Resolved today</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-400">{stats?.totalResolved ?? 0}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total resolved</div>
          </div>
        </div>

        {/* Needs Attention */}
        {!isLoading && attentionCases.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-gray-800">Needs Attention</span>
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {attentionCases.length}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {attentionCases.map(c => {
                const isOverdue = c.expected_date && isPast(new Date(c.expected_date))
                const lastTouch = c.last_contact_at ? new Date(c.last_contact_at) : new Date(c.created_at)
                const days = differenceInDays(new Date(), lastTouch)
                const reason = isOverdue ? '⏰ Overdue return' : c.category === 'lead' ? '🎯 Follow-up due' : `📅 ${days}d no contact`
                return (
                  <Link
                    key={c.id}
                    to={`/cases/${c.id}`}
                    className="shrink-0 w-44 bg-red-50 border border-red-100 rounded-xl p-3 hover:bg-red-100 transition-colors active:scale-[0.98]"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.client_name}</p>
                    {c.product_name && <p className="text-xs text-gray-500 truncate mt-0.5">{c.product_name}</p>}
                    <p className="text-xs text-red-600 font-medium mt-1.5">{reason}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Sort panel — always in DOM, animated with max-height */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showSort ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sort by</span>
              <button
                onClick={() => setShowSort(false)}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors border-b border-gray-50 last:border-0 ${
                  sortBy === opt.value
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.label}
                {sortBy === opt.value && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px]">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, phone, order, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {TABS.map((tab) => {
              const count = tabCounts[tab.value] || 0
              const isActive = activeTab === tab.value
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend toggle */}
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="mt-1.5 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${showLegend ? 'rotate-180' : ''}`}
            />
            What does each category mean?
          </button>

          {/* Legend panel */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showLegend ? 'max-h-72 opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 shadow-sm">
              {CATEGORY_LEGEND.map((c) => (
                <div key={c.label} className="px-3 py-2.5 flex items-start gap-2.5">
                  <span className="text-lg mt-0.5">{c.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{c.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Case list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-5xl mb-3">{search ? '🔍' : '📋'}</div>
            <p className="text-gray-600 font-semibold text-base">
              {search ? 'No cases found' : 'No open cases'}
            </p>
            <p className="text-gray-400 text-sm mt-1 mb-6">
              {search ? 'Try a different search term' : 'Create your first case below'}
            </p>
            {!search && (
              <Link
                to="/cases/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-full shadow-md active:scale-95 transition-all"
              >
                + New Case
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {cases.map((c) => (
              <CaseCard key={c.id} case_={c} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
