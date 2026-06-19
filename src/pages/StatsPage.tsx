import { useState } from 'react'
import { TrendingUp, Target, Euro, Clock, Package, PhoneCall, Trophy, TrendingDown } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Skeleton } from '@/components/ui/skeleton'
import { useStats, type StatsPeriod } from '@/hooks/useStats'
import { CATEGORY_SHORT, type Category } from '@/types'

const PERIODS: { value: StatsPeriod; label: string }[] = [
  { value: 'this_week',  label: 'This week'  },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'all',        label: 'All time'   },
]

const CATEGORY_BAR: Record<Category, string> = {
  arrival:    'bg-blue-500',
  assistance: 'bg-orange-500',
  lead:       'bg-purple-500',
  problem:    'bg-red-500',
}

function formatEuro(n: number): string {
  return n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function DeltaBadge({ value, isRevenue = false }: { value: number | null; isRevenue?: boolean }) {
  if (value === null || value === 0) return null
  const positive = value > 0
  const label = isRevenue ? formatEuro(Math.abs(value)) : String(Math.abs(value))
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
      positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
    }`}>
      {positive
        ? <TrendingUp className="w-2.5 h-2.5" />
        : <TrendingDown className="w-2.5 h-2.5" />}
      {positive ? '+' : '-'}{label}
    </span>
  )
}

export default function StatsPage() {
  const [period, setPeriod] = useState<StatsPeriod>('this_week')
  const { data: stats, isLoading } = useStats(period)

  const categoryTotal = stats
    ? Object.values(stats.byCategory).reduce((a, b) => a + b, 0)
    : 0

  const prevLabel = period === 'this_week'
    ? 'vs last week'
    : period === 'this_month'
    ? 'vs last month'
    : period === 'last_month'
    ? 'vs prev. month'
    : null

  return (
    <>
      <Header title="Statistics" subtitle="Your performance at a glance" />

      <div className="px-4 py-4 space-y-4 pb-28">
        {/* Period selector — scrollable pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                period === p.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {prevLabel && (
          <p className="text-[11px] text-gray-400 -mt-2 px-0.5">Deltas shown {prevLabel}</p>
        )}

        {isLoading || !stats ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Headline metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-1">
                  <Package className="w-3.5 h-3.5" /> New cases
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-gray-900">{stats.created}</p>
                  <div className="mb-1"><DeltaBadge value={stats.delta.created} /></div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Resolved
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                  <div className="mb-1"><DeltaBadge value={stats.delta.resolved} /></div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-1">
                  <Target className="w-3.5 h-3.5" /> Lead conversion
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.conversionRate !== null ? `${stats.conversionRate}%` : '—'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {stats.leadsConverted}/{stats.leadsTotal} leads
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-1">
                  <Euro className="w-3.5 h-3.5" /> Revenue
                </div>
                <div className="flex items-end gap-2 flex-wrap">
                  <p className="text-2xl font-bold text-green-700">{formatEuro(stats.revenue)}</p>
                  <div className="mb-0.5"><DeltaBadge value={stats.delta.revenue} isRevenue /></div>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">from converted leads</p>
              </div>
            </div>

            {/* Secondary metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.avgRepairDays !== null ? `${stats.avgRepairDays}d` : '—'}
                  </p>
                  <p className="text-[11px] text-gray-400">Avg repair time</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stats.contactsLogged}</p>
                  <p className="text-[11px] text-gray-400">Contacts logged</p>
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Cases by category</h3>
              {categoryTotal === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No cases in this period</p>
              ) : (
                <div className="space-y-2.5">
                  {(Object.entries(stats.byCategory) as [Category, number][])
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, n]) => {
                      const pct = categoryTotal ? Math.round((n / categoryTotal) * 100) : 0
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-gray-600">{CATEGORY_SHORT[cat]}</span>
                            <span className="text-gray-400">{n} · {pct}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${CATEGORY_BAR[cat]}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Highlight */}
            {stats.busiestCategory && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-indigo-500 shrink-0" />
                <p className="text-sm text-gray-700">
                  Most active category: <span className="font-semibold">{CATEGORY_SHORT[stats.busiestCategory]}</span>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
