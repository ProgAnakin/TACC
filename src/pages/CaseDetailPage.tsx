import { useNavigate, useParams } from 'react-router-dom'
import {
  Phone, Mail, Edit3, Trash2, CheckCircle2, Loader2,
  FileDown, RotateCcw, Calendar, Package
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/cases/CategoryBadge'
import { UrgencyBadge } from '@/components/cases/UrgencyBadge'
import { CallLogSection } from '@/components/cases/CallLogSection'
import { ReminderSection } from '@/components/cases/ReminderSection'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useCase, useDeleteCase, useResolveCase, useUpdateCase } from '@/hooks/useCases'
import { generateAssistancePDF } from '@/lib/pdf'

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: case_, isLoading } = useCase(id)
  const deleteCase = useDeleteCase()
  const resolveCase = useResolveCase()
  const updateCase = useUpdateCase()

  const handleDelete = async () => {
    try {
      await deleteCase.mutateAsync(id!)
      toast.success('Caso apagado')
      navigate('/', { replace: true })
    } catch {
      toast.error('Erro ao apagar caso')
    }
  }

  const handleResolve = async () => {
    try {
      await resolveCase.mutateAsync(id!)
      toast.success('Caso resolvido! ✅')
    } catch {
      toast.error('Erro ao resolver caso')
    }
  }

  const handleReopen = async () => {
    try {
      await updateCase.mutateAsync({ id: id!, status: 'open', resolved_at: null })
      toast.success('Caso reaberto')
    } catch {
      toast.error('Erro ao reabrir caso')
    }
  }

  const handlePDF = () => {
    if (!case_) return
    try {
      generateAssistancePDF(case_)
      toast.success('PDF baixado!')
    } catch {
      toast.error('Erro ao gerar PDF')
    }
  }

  if (isLoading) {
    return (
      <>
        <Header title="Carregando..." showBack />
        <div className="px-4 py-4 space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </>
    )
  }

  if (!case_) {
    return (
      <>
        <Header title="Caso não encontrado" showBack />
        <div className="text-center py-16">
          <p className="text-gray-500">Caso não encontrado ou foi apagado.</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>
            Voltar ao início
          </Button>
        </div>
      </>
    )
  }

  const isResolved = case_.status === 'resolved'

  return (
    <>
      <Header
        title={case_.client_name}
        showBack
        rightElement={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/cases/${id}/edit`)}
            className="h-8 px-2 text-gray-500"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        }
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Status + category badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={case_.category} />
          <UrgencyBadge urgency={case_.urgency} />
          {isResolved && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Resolvido
            </span>
          )}
        </div>

        {/* Main info card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {/* Client section */}
          <div className="p-4 space-y-2.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente</p>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900">{case_.client_name}</p>

              {case_.client_phone && (
                <a
                  href={`tel:${case_.client_phone}`}
                  className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                >
                  <Phone className="w-4 h-4" />
                  {case_.client_phone}
                </a>
              )}
              {case_.client_email && (
                <a
                  href={`mailto:${case_.client_email}`}
                  className="flex items-center gap-2 text-blue-600 hover:underline text-sm break-all"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  {case_.client_email}
                </a>
              )}
            </div>
          </div>

          {/* Product section */}
          {(case_.product_name || case_.shopify_order) && (
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Produto</p>
              {case_.product_name && (
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <Package className="w-4 h-4 text-gray-400" />
                  {case_.product_name}
                </p>
              )}
              {case_.shopify_order && (
                <p className="text-sm text-gray-600">Pedido: <span className="font-medium">#{case_.shopify_order}</span></p>
              )}
            </div>
          )}

          {/* Cause */}
          {case_.cause && (
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Motivo do Envio</p>
              <p className="text-sm text-gray-700 leading-relaxed">{case_.cause}</p>
            </div>
          )}

          {/* Notes */}
          {case_.notes && (
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notas</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{case_.notes}</p>
            </div>
          )}

          {/* Dates */}
          <div className="p-4 space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Datas</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              Criado em: {format(new Date(case_.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
            {case_.resolved_at && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolvido em: {format(new Date(case_.resolved_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            )}
          </div>
        </div>

        {/* PDF button for assistance */}
        {case_.category === 'assistance' && (
          <Button
            variant="outline"
            className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            onClick={handlePDF}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Baixar Comprovante PDF
          </Button>
        )}

        {/* Call log */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <CallLogSection caseId={id!} />
        </div>

        {/* Reminders */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <ReminderSection caseId={id!} />
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          {isResolved ? (
            <Button
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={handleReopen}
              disabled={updateCase.isPending}
            >
              {updateCase.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-2" />
              )}
              Reabrir Caso
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Resolver Caso
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-sm mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle>Resolver este caso?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O caso será movido para o arquivo. Você pode reabri-lo depois se precisar.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResolve}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={resolveCase.isPending}
                  >
                    {resolveCase.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Resolver'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Apagar Caso
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-sm mx-4">
              <AlertDialogHeader>
                <AlertDialogTitle>Apagar este caso?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O histórico de ligações e lembretes também será apagado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteCase.isPending}
                >
                  {deleteCase.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apagar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  )
}
