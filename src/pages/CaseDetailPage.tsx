import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Phone, Mail, Edit3, Trash2, CheckCircle2, Loader2,
  FileDown, RotateCcw, Calendar, Package, MessageCircle,
  Bell, CalendarClock, Copy, Pencil, X, Check, Euro,
} from 'lucide-react'
import { format, isPast } from 'date-fns'
import { toast } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/cases/CategoryBadge'
import { UrgencyBadge } from '@/components/cases/UrgencyBadge'
import { ServiceStatusBar } from '@/components/cases/ServiceStatusBar'
import { CallLogSection } from '@/components/cases/CallLogSection'
import { ReminderSection } from '@/components/cases/ReminderSection'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useCase, useDeleteCase, useResolveCase, useUpdateCase } from '@/hooks/useCases'
import { useCreateReminder } from '@/hooks/useReminders'
import { generateAssistancePDF, type PdfLocale } from '@/lib/pdf'
import { buildWhatsAppUrl, copyToClipboard, shortCaseId } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import type { ServiceStatus, LeadOutcome } from '@/types'
import { LEAD_OUTCOME_LABELS, LEAD_OUTCOME_COLORS } from '@/types'

/* Quick follow-up shortcuts for Lead cases */
function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(10, 0, 0, 0)
  return d.toISOString()
}

export default function CaseDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()

  const { data: case_, isLoading } = useCase(id)
  const deleteCase      = useDeleteCase()
  const resolveCase     = useResolveCase()
  const updateCase      = useUpdateCase()
  const createReminder  = useCreateReminder()
  const [pdfDialogOpen, setPdfDialogOpen]     = useState(false)
  const [outcomeLoading, setOutcomeLoading]   = useState<LeadOutcome | null>(null)
  const [editingNotes, setEditingNotes]       = useState(false)
  const [notesValue, setNotesValue]           = useState('')

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

  const handleServiceStatus = async (status: ServiceStatus) => {
    try {
      await updateCase.mutateAsync({ id: id!, service_status: status })
      toast.success(`Status updated → ${status.replace('_', ' ')}`)
    } catch (err: any) {
      const msg = err?.message || String(err)
      if (msg.toLowerCase().includes('service_status') || msg.toLowerCase().includes('column')) {
        toast.error('Database not migrated — run supabase/migrations/002_service_fields.sql', { duration: 6000 })
      } else {
        toast.error(`Error updating status: ${msg}`)
      }
      console.error('Service status update failed:', err)
    }
  }

  const handleQuickReminder = async (days: number) => {
    if (!case_) return
    const label = days === 1 ? 'tomorrow' : `in ${days} days`
    try {
      await createReminder.mutateAsync({
        caseId:   id!,
        title:    `Follow up with ${case_.client_name}`,
        remindAt: addDays(days),
      })
      toast.success(`Reminder set for ${label}`)
    } catch {
      toast.error('Error creating reminder')
    }
  }

  const handleLeadOutcome = async (outcome: LeadOutcome) => {
    setOutcomeLoading(outcome)
    try {
      await updateCase.mutateAsync({ id: id!, lead_outcome: outcome, status: 'resolved', resolved_at: new Date().toISOString() })
      toast.success(LEAD_OUTCOME_LABELS[outcome])
    } catch {
      toast.error('Error updating outcome')
    } finally {
      setOutcomeLoading(null)
    }
  }

  const handleCopyPhone = async () => {
    if (!case_?.client_phone) return
    const ok = await copyToClipboard(case_.client_phone)
    if (ok) toast.success('Phone copied!')
    else    toast.error('Copy failed')
  }

  const startEditNotes = () => {
    setNotesValue(case_?.notes || '')
    setEditingNotes(true)
  }

  const handleSaveNotes = async () => {
    try {
      await updateCase.mutateAsync({ id: id!, notes: notesValue.trim() || null })
      setEditingNotes(false)
      toast.success('Notes saved')
    } catch {
      toast.error('Error saving notes')
    }
  }

  const handlePDF = (locale: PdfLocale) => {
    if (!case_) return
    try {
      generateAssistancePDF(case_, locale)
      setPdfDialogOpen(false)
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
          <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>Back to home</Button>
        </div>
      </>
    )
  }

  const isResolved     = case_.status === 'resolved'
  const waUrl          = case_.client_phone
    ? buildWhatsAppUrl(case_.client_phone, case_.category, case_.client_name, case_.product_name)
    : null
  const expectedPast   = case_.expected_date && isPast(new Date(case_.expected_date))
  const causeLabel     = case_.category === 'problem' ? 'Complaint Details'
                       : case_.category === 'arrival' ? 'Details'
                       : 'Reason for Service'

  return (
    <>
      <Header
        title={case_.client_name}
        showBack
        subtitle={`#${shortCaseId(case_.id)}`}
        rightElement={
          <Button variant="ghost" size="sm" onClick={() => navigate(`/cases/${id}/edit`)} className="h-8 px-2 text-gray-500">
            <Edit3 className="w-4 h-4" />
          </Button>
        }
      />

      <div className="px-4 py-4 space-y-4 pb-10">

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={case_.category} />
          <UrgencyBadge urgency={case_.urgency} />
          {isResolved && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
              <CheckCircle2 className="w-3 h-3" /> Resolved
            </span>
          )}
          {expectedPast && (
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
              <CalendarClock className="w-3 h-3" /> Overdue
            </span>
          )}
          {case_.lead_outcome && (
            <span className={`inline-flex items-center gap-1 border text-xs px-2.5 py-0.5 rounded-full font-medium ${LEAD_OUTCOME_COLORS[case_.lead_outcome]}`}>
              {LEAD_OUTCOME_LABELS[case_.lead_outcome]}
            </span>
          )}
        </div>

        {/* Primary contact actions */}
        {(case_.client_phone || case_.client_email) && (
          <div className="space-y-2">
            <div className="flex gap-2">
              {case_.client_phone && (
                <a
                  href={`tel:${case_.client_phone}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors active:scale-95"
                >
                  <Phone className="w-4 h-4" /> Call
                </a>
              )}
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {case_.client_email && (
                <a
                  href={`mailto:${case_.client_email}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-3 rounded-xl transition-colors active:scale-95"
                >
                  <Mail className="w-4 h-4" /> Email
                </a>
              )}
            </div>
            {case_.client_phone && (
              <button
                onClick={handleCopyPhone}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium py-2 rounded-xl transition-colors active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy phone number
              </button>
            )}
          </div>
        )}

        {/* Service progress bar */}
        {case_.category === 'assistance' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <ServiceStatusBar
              current={case_.service_status}
              onChange={isResolved ? undefined : handleServiceStatus}
              readonly={isResolved}
            />
          </div>
        )}

        {/* Overdue service banner */}
        {case_.category === 'assistance' && expectedPast && !isResolved && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
            <CalendarClock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">Expected date has passed</p>
              <p className="text-xs text-red-500 mt-0.5">The item hasn't returned yet. Follow up with service.</p>
            </div>
            <button
              onClick={() => handleQuickReminder(1)}
              disabled={createReminder.isPending}
              className="shrink-0 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-700 active:scale-95 transition-all"
            >
              Remind tomorrow
            </button>
          </div>
        )}

        {/* Quick lead follow-up */}
        {case_.category === 'lead' && !isResolved && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" /> Quick Follow-up Reminder
            </p>
            <div className="flex gap-2">
              {[
                { days: 1,  label: 'Tomorrow'  },
                { days: 3,  label: '3 days'    },
                { days: 7,  label: '1 week'    },
              ].map(({ days, label }) => (
                <button
                  key={days}
                  onClick={() => handleQuickReminder(days)}
                  disabled={createReminder.isPending}
                  className="flex-1 bg-white hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold py-2 rounded-lg transition-colors active:scale-95"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main info card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">

          {/* Client */}
          <div className="p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</p>
            <p className="font-semibold text-gray-900">{case_.client_name}</p>
            {case_.client_phone && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> {case_.client_phone}
              </p>
            )}
            {case_.client_email && (
              <p className="text-sm text-gray-600 flex items-center gap-2 break-all">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {case_.client_email}
              </p>
            )}
          </div>

          {/* Product */}
          {(case_.product_name || case_.shopify_order) && (
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</p>
              {case_.product_name && (
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <Package className="w-4 h-4 text-gray-400" /> {case_.product_name}
                </p>
              )}
              {case_.shopify_order && (
                <p className="text-sm text-gray-600">Order: <span className="font-medium">#{case_.shopify_order}</span></p>
              )}
            </div>
          )}

          {/* Expected date */}
          {case_.expected_date && (
            <div className="p-4 space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Expected Date</p>
              <p className={`flex items-center gap-2 text-sm font-medium ${expectedPast ? 'text-red-600' : 'text-gray-700'}`}>
                <CalendarClock className="w-4 h-4" />
                {format(new Date(case_.expected_date), 'MMMM d, yyyy')}
                {expectedPast && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Overdue</span>}
              </p>
            </div>
          )}

          {/* Deal value — leads only */}
          {case_.category === 'lead' && case_.deal_value != null && (
            <div className="p-4 space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimated Value</p>
              <p className="flex items-center gap-1.5 text-base font-bold text-purple-700">
                <Euro className="w-4 h-4" />
                {case_.deal_value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Cause */}
          {case_.cause && (
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{causeLabel}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{case_.cause}</p>
            </div>
          )}

          {/* Notes — always visible, inline editable */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</p>
              {!editingNotes && (
                <button
                  onClick={startEditNotes}
                  className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Edit notes"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <Textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  rows={3}
                  className="text-sm resize-none"
                  placeholder="Add notes, context, next steps..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={updateCase.isPending}
                    className="flex-1 h-8"
                  >
                    {updateCase.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-3.5 h-3.5 mr-1" /> Save</>}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingNotes(false)}
                    className="h-8"
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : case_.notes ? (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{case_.notes}</p>
            ) : (
              <button
                onClick={startEditNotes}
                className="text-sm text-gray-400 hover:text-blue-600 italic transition-colors"
              >
                + Add a note...
              </button>
            )}
          </div>

          {/* Dates */}
          <div className="p-4 space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dates</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              Created: {format(new Date(case_.created_at), 'MMM d, yyyy — h:mm a')}
            </div>
            {case_.last_contact_at && (
              <div className="flex items-center gap-2 text-xs text-blue-500">
                <Phone className="w-3.5 h-3.5" />
                Last contact: {format(new Date(case_.last_contact_at), 'MMM d, yyyy — h:mm a')}
              </div>
            )}
            {case_.resolved_at && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolved: {format(new Date(case_.resolved_at), 'MMM d, yyyy — h:mm a')}
              </div>
            )}
          </div>
        </div>

        {/* PDF — service cases only */}
        {case_.category === 'assistance' && (
          <>
            <Button
              variant="outline"
              className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={() => setPdfDialogOpen(true)}
            >
              <FileDown className="w-4 h-4 mr-2" /> Download Service Receipt (PDF)
            </Button>

            <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
              <DialogContent className="max-w-sm mx-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileDown className="w-4 h-4 text-indigo-600" />
                    Choose PDF Language
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-2 py-2">
                  <button
                    onClick={() => handlePDF('en')}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-left"
                  >
                    <span className="text-2xl">🇬🇧</span>
                    <div>
                      <p className="font-semibold text-sm">English</p>
                      <p className="text-xs text-gray-500">Technical Service Receipt</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePDF('it')}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-left"
                  >
                    <span className="text-2xl">🇮🇹</span>
                    <div>
                      <p className="font-semibold text-sm">Italiano</p>
                      <p className="text-xs text-gray-500">Ricevuta di Assistenza Tecnica</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePDF('pt')}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-left"
                  >
                    <span className="text-2xl">🇧🇷</span>
                    <div>
                      <p className="font-semibold text-sm">Português</p>
                      <p className="text-xs text-gray-500">Comprovante de Assistência Técnica</p>
                    </div>
                  </button>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setPdfDialogOpen(false)}>Cancel</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Call log */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <CallLogSection caseId={id!} />
        </div>

        {/* Reminders */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <ReminderSection caseId={id!} />
        </div>

        {/* Resolve / Delete */}
        <div className="space-y-2 pt-2">
          {isResolved ? (
            <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" onClick={handleReopen} disabled={updateCase.isPending}>
              {updateCase.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
              Reopen Case
            </Button>
          ) : case_.category === 'lead' ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Close this lead as:</p>
              <div className="grid grid-cols-3 gap-2">
                {(['converted', 'lost', 'no_interest'] as LeadOutcome[]).map(outcome => {
                  const colorMap: Record<LeadOutcome, string> = {
                    converted:   'bg-green-600 hover:bg-green-700 text-white',
                    lost:        'bg-red-500 hover:bg-red-600 text-white',
                    no_interest: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
                  }
                  return (
                    <button
                      key={outcome}
                      onClick={() => handleLeadOutcome(outcome)}
                      disabled={!!outcomeLoading}
                      className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${colorMap[outcome]}`}
                    >
                      {outcomeLoading === outcome ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : LEAD_OUTCOME_LABELS[outcome]}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Resolved
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-sm mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle>Resolve this case?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The case will be moved to archive. You can reopen it anytime.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResolve} className="bg-green-600 hover:bg-green-700" disabled={resolveCase.isPending}>
                    {resolveCase.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resolve'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Case
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-sm mx-4">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this case?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cannot be undone. All call logs and reminders will also be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={deleteCase.isPending}>
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
