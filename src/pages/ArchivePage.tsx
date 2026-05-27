import { useState } from 'react'
import { Search, X, Archive, RotateCcw, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryBadge } from '@/components/cases/CategoryBadge'
import { useCases, useUpdateCase } from '@/hooks/useCases'

export default function ArchivePage() {
  const [search, setSearch] = useState('')
  const { data: cases = [], isLoading } = useCases({
    status: 'resolved',
    search: search || undefined,
    sortBy: 'newest',
  })
  const updateCase = useUpdateCase()

  const handleReopen = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await updateCase.mutateAsync({ id, status: 'open', resolved_at: null })
      toast.success('Caso reaberto!')
    } catch {
      toast.error('Erro ao reabrir caso')
    }
  }

  return (
    <>
      <Header title="Arquivo" />

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar casos resolvidos..."
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

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-16">
            <Archive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {search ? 'Nenhum resultado encontrado' : 'Arquivo vazio'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {search
                ? 'Tente outro termo de busca'
                : 'Casos resolvidos aparecerão aqui'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 px-1">{cases.length} {cases.length === 1 ? 'caso' : 'casos'}</p>
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
                  </div>
                  {case_.product_name && (
                    <p className="text-xs text-gray-500 truncate">{case_.product_name}</p>
                  )}
                  {case_.resolved_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      Resolvido em {format(new Date(case_.resolved_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => handleReopen(case_.id, e)}
                  disabled={updateCase.isPending}
                  className="shrink-0 p-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Reabrir caso"
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
