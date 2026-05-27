import { useNavigate, useParams } from 'react-router-dom'
import {
  Phone, Mail, Edit3, Trash2, CheckCircle2, Loader2,
  FileDown, RotateCcw, Calendar, Package
} from 'lucide-react'
import { format } from 'date-fns'
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
  const deleteCase  = useDeleteCase()
  const resolveCase = useResolveCase()
  const updateCase  = useUpdateCase()

  const handleDelete = async () => {
    try {
      await deleteCase.mutateAsync(id!)
      toast.success('Case deleted')
      navigate('/', { replace: true })
    } catch {
      toast.error('Error deleting case')
    }
  }

  const handleResolve = async () => {
    try {
      await resolveCase.mutateAsync(id!)
      toast.success('Case resolved! ✅')
    } catch {
      toast.error('Error resolving case')
    }
  }

  const handleReopen = async () => {
    try {
      await updateCase.mutateAsync({ id: id!, status: 'open', resolved_at: null })
      toast.success('Case reopened')
    } catch {
      toast.error('Error reopening case')
    }
  }

  const handlePDF = () => {
    if (!case_) return
    try {
      generateAssistancePDF(case_)
      toast.success('PDF downloaded!')
    } catch {
      toast.error('Error generating PDF')
    }
  }

  if (isLoading) {
    return (
      <>
        <Header title="Loading..." showBack />
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
        <Header title="Case not found" showBack />
        <div className="text-center py-16">
          <p className="text-gray-500">This case was not found or has been deleted.</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>
            Back to home
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

      <div className="px-4 py-4 space-y-4 pb-10">
        {/* Status + category badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={case_.category} />
          <UrgencyBadge urgency={case_.urgency} />
          {isResolved && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Resolved
            </span>
          )}
        </div>

        {/* Main info card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {/* Client */}
          <div className="p-4 space-y-2.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</p>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900">{case_.client_name}</p>
              {case_.client_phone && (
                <a href={`tel:${case_.client_phone}`} className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                  <Phone className="w-4 h-4" />
                  {case_.client_phone}
                </a>
              )}
              {case_.client_email && (
                <a href={`mailto:${case_.client_email}`} className="flex items-center gap-2 text-blue-600 hover:underline text-sm break-all">
                  <Mail className="w-4 h-4 shrink-0" />
                  {case_.client_email}
                </a>
              )}
            </div>
          </div>

          {/* Product */}
          {(case_.product_name || case_.shopify_order) && (
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</p>
              {case_.product_name && (
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <Package className="w-4 h-4 text-gray-400" />
                  {case_.product_name}
                </p>
              )}
              {case_.shopify_order && (
                <p className="text-sm text-gray-600">
                  Order: <span className="font-medium">#{case_.shopify_order}</span>
                </p>
              )}
            </div>
          )}

          {/* Cause */}
          {case_.cause && (
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason for Service</p>
              <p className="text-sm text-gray-700 leading-relaxed">{case_.cause}</p>
            </div>
          )}

          {/* Notes */}
          {case_.notes && (
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{case_.notes}</p>
            </div>
          )}

          {/* Dates */}
          <div className="p-4 space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dates</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              Created: {format(new Date(case_.created_at), 'MMM d, yyyy — h:mm a')}
            </div>
            {case_.resolved_at && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolved: {format(new Date(case_.resolved_at), 'MMM d, yyyy — h:mm a')}
              </div>
            )}
          </div>
        </div>

        {/* PDF button — service cases only */}
        {case_.category === 'assistance' && (
          <Button
            variant="outline"
            className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            onClick={handlePDF}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Download Service Receipt (PDF)
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

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {isResolved ? (
            <Button
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={handleReopen}
              disabled={updateCase.isPending}
            >
              {updateCase.isPending
                ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                : <RotateCcw className="w-4 h-4 mr-2" />}
              Reopen Case
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Resolved
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-sm mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle>Resolve this case?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The case will be moved to the archive. You can reopen it anytime if needed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResolve}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={resolveCase.isPending}
                  >
                    {resolveCase.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resolve'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Case
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-sm mx-4">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this case?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All call logs and reminders will also be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteCase.isPending}
                >
                  {deleteCase.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  )
}
