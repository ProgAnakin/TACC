import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { CaseCard } from '@/components/cases/CaseCard'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useCases, useCaseStats } from '@/hooks/useCases'
import type { Category } from '@/types'

type TabValue = 'all' | Category

const TABS: { value: TabValue; label: string; shortLabel: string }[] = [
  { value: 'all',        label: 'Todos',             shortLabel: 'Todos'    },
  { value: 'arrival',   label: '📦 Aviso de Chegada', shortLabel: '📦 Chegada' },
  { value: 'assistance',label: '🛠️ Assistência',      shortLabel: '🛠️ Assist.' },
  { value: 'lead',      label: '🎯 Lead / Interesse', shortLabel: '🎯 Lead'    },
  { value: 'problem',   label: '🚨 Perrengue',        shortLabel: '🚨 Perren.' },
]

const SORT_OPTIONS = [
  { value: 'newest',  label: '🕐 Mais recente' },
  { value: 'oldest',  label: '🕛 Mais antigo'  },
  { value: 'urgency', label: '🔴 Por urgência' },
  { value: 'name',    label: '🔤 Nome do cliente' },
] as const

type SortValue = typeof SORT_OPTIONS[number]['value']

const CATEGORY_LEGEND = [
  { emoji: '📦', label: 'Aviso de Chegada', desc: 'Cliente quer ser avisado quando produto chegar' },
  { emoji: '🛠️', label: 'Assistência',      desc: 'Produto em reparo, transferência ou ajuste'    },
  { emoji: '🎯', label: 'Lead / Interesse', desc: 'Cliente com interesse — alvo de follow-up'      },
  { emoji: '🚨', label: 'Perrengue',        desc: 'Problema herdado que você assumiu'              },
]

export default function HomePage() {
  const [activeTab, setActiveTab]   = useState<TabValue>('all')
  const [search, setSearch]         = useState('')
  const [sortBy, setSortBy]         = useState<SortValue>('newest')
  const [showSort, setShowSort]     = useState(false)
  const [showLegend, setShowLegend] = useState(false)

  const { data: cases = [], isLoading, error } = useCases({
    status: 'open',
    category: activeTab === 'all' ? undefined : activeTab,
    search:   search || undefined,
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

  const dbMissing =
    error instanceof Error &&
    (error.message.includes('relation') || error.message.includes('does not exist') || error.message.includes('42P01'))

  return (
    <>
      <Header
        title="Caderninho Digital"
        rightElement={
          <button
            onClick={() => setShowSort(!showSort)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Ordenar"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-3 pb-28">

        {/* DB not set up warning */}
        {dbMissing && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Tabelas não criadas no Supabase</p>
              <p className="mt-0.5 text-xs">Acesse o SQL Editor do Supabase e execute o arquivo <code className="bg-amber-100 px-1 rounded">supabase/migrations/001_initial.sql</code></p>
            </div>
          </div>
        )}

        {/* Stats */}
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
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Ordenar por</span>
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
            placeholder="Buscar por nome, telefone, pedido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category tabs + legend toggle */}
        <div>
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
                  {tab.shortLabel}
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
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
            className="mt-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            {showLegend ? '▲' : '▼'} O que significa cada categoria?
          </button>

          {showLegend && (
            <div className="mt-2 bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 shadow-sm">
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
          )}
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
              {search ? 'Nenhum caso encontrado' : 'Nenhum caso aberto'}
            </p>
            <p className="text-gray-400 text-sm mt-1 mb-6">
              {search ? 'Tente outro termo de busca' : 'Crie seu primeiro caso abaixo'}
            </p>
            {!search && (
              <Link
                to="/cases/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-full shadow-md active:scale-95 transition-all"
              >
                + Criar novo caso
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
