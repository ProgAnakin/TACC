import { useState, useMemo } from 'react'
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { CaseCard } from '@/components/cases/CaseCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useCases, useCaseStats } from '@/hooks/useCases'
import type { Category } from '@/types'
import { CATEGORY_LABELS } from '@/types'

type TabValue = 'all' | Category

const TABS: { value: TabValue; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'arrival', label: '📦' },
  { value: 'assistance', label: '🛠️' },
  { value: 'lead', label: '🎯' },
  { value: 'problem', label: '🚨' },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'urgency' | 'name'>('newest')
  const [showSort, setShowSort] = useState(false)

  const { data: cases = [], isLoading } = useCases({
    status: 'open',
    category: activeTab === 'all' ? undefined : activeTab,
    search: search || undefined,
    sortBy,
  })

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

  const SORT_OPTIONS = [
    { value: 'newest', label: 'Mais recente' },
    { value: 'oldest', label: 'Mais antigo' },
    { value: 'urgency', label: 'Por urgência' },
    { value: 'name', label: 'Nome do cliente' },
  ] as const

  return (
    <>
      <Header
        title="Caderninho Digital"
        rightElement={
          <button
            onClick={() => setShowSort(!showSort)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-4">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats?.open ?? 0}</div>
            <div className="text-xs text-gray-500 mt-0.5">Abertos</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats?.resolvedToday ?? 0}</div>
            <div className="text-xs text-gray-500 mt-0.5">Resolvidos hoje</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-400">{stats?.totalResolved ?? 0}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total resolvidos</div>
          </div>
        </div>

        {/* Sort dropdown */}
        {showSort && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Ordenar por</span>
              <button onClick={() => setShowSort(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setSortBy(opt.value); setShowSort(false) }}
                className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between transition-colors ${
                  sortBy === opt.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.label}
                {sortBy === opt.value && <span className="text-blue-500">✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, telefone, pedido, produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
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

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
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
                {tab.label === 'Todos' ? tab.label : (
                  <span title={CATEGORY_LABELS[tab.value as Category]}>{tab.label}</span>
                )}
                {count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Case list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">{search ? '🔍' : '📋'}</div>
            <p className="text-gray-500 font-medium">
              {search ? 'Nenhum caso encontrado' : 'Nenhum caso aberto'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {search
                ? 'Tente outro termo de busca'
                : 'Toque em + para criar um novo caso'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 pb-4">
            {cases.map((case_) => (
              <CaseCard key={case_.id} case_={case_} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        to="/cases/new"
        className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"
      >
        <Plus className="w-7 h-7 text-white" />
      </Link>
    </>
  )
}
