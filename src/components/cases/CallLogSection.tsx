import { useState } from 'react'
import { PhoneCall, Phone, Loader2, ChevronDown, ChevronUp, Pencil, Trash2, Check, X, Store, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useCallLogs, useLogCall, useUpdateCallLog, useDeleteCallLog } from '@/hooks/useCallLogs'
import { parseContactLog, serializeContactLog, type ContactType } from '@/lib/utils'

const CONTACT_TYPES: {
  type: ContactType
  icon: React.ReactNode
  label: string
  color: string
  activeColor: string
}[] = [
  { type: 'call',     icon: <Phone className="w-3.5 h-3.5" />,         label: 'Called',   color: 'border-gray-200 text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200',     activeColor: 'border-blue-500 bg-blue-600 text-white'   },
  { type: 'visit',    icon: <Store className="w-3.5 h-3.5" />,         label: 'Visited',  color: 'border-gray-200 text-gray-600 bg-gray-50 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200', activeColor: 'border-orange-500 bg-orange-500 text-white' },
  { type: 'message',  icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Message',  color: 'border-gray-200 text-gray-600 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200', activeColor: 'border-purple-500 bg-purple-600 text-white' },
  { type: 'whatsapp', icon: <PhoneCall className="w-3.5 h-3.5" />,     label: 'WhatsApp', color: 'border-gray-200 text-gray-600 bg-gray-50 hover:bg-green-50 hover:text-green-700 hover:border-green-200',   activeColor: 'border-green-500 bg-green-600 text-white' },
]

const TYPE_ICON: Record<ContactType, React.ReactNode> = {
  call:     <Phone className="w-3.5 h-3.5 text-blue-600" />,
  visit:    <Store className="w-3.5 h-3.5 text-orange-600" />,
  message:  <MessageSquare className="w-3.5 h-3.5 text-purple-600" />,
  whatsapp: <PhoneCall className="w-3.5 h-3.5 text-green-600" />,
}

const TYPE_BG: Record<ContactType, string> = {
  call:     'bg-blue-100',
  visit:    'bg-orange-100',
  message:  'bg-purple-100',
  whatsapp: 'bg-green-100',
}

interface Props {
  caseId: string
}

export function CallLogSection({ caseId }: Props) {
  const { data: logs = [], isLoading } = useCallLogs(caseId)
  const logCall       = useLogCall()
  const updateCallLog = useUpdateCallLog()
  const deleteCallLog = useDeleteCallLog()

  const [selectedType, setSelectedType] = useState<ContactType | null>(null)
  const [notes, setNotes]               = useState('')
  const [expanded, setExpanded]         = useState(false)
  const [editingId, setEditingId]       = useState<string | null>(null)
  const [editNotes, setEditNotes]       = useState('')
  const [deleteId, setDeleteId]         = useState<string | null>(null)

  const handleTypeSelect = (type: ContactType) => {
    if (selectedType === type) {
      setSelectedType(null)
      setNotes('')
    } else {
      setSelectedType(type)
    }
  }

  const handleLog = async () => {
    if (!selectedType) return
    try {
      const rawNotes = serializeContactLog(selectedType, notes)
      await logCall.mutateAsync({ caseId, notes: rawNotes ?? undefined })
      setNotes('')
      setSelectedType(null)
      toast.success('Contact logged!')
    } catch {
      toast.error('Error logging contact')
    }
  }

  const handleStartEdit = (id: string, currentNotes: string | null) => {
    const { notes: parsed } = parseContactLog(currentNotes)
    setEditingId(id)
    setEditNotes(parsed || '')
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    const log = logs.find(l => l.id === editingId)
    const { type } = parseContactLog(log?.notes ?? null)
    const rawNotes = serializeContactLog(type, editNotes)
    try {
      await updateCallLog.mutateAsync({ id: editingId, notes: rawNotes, caseId })
      setEditingId(null)
      setEditNotes('')
      toast.success('Contact updated')
    } catch (err: unknown) {
      const msg = (err as any)?.message || String(err)
      if (msg.toLowerCase().includes('policy') || msg.toLowerCase().includes('row-level')) {
        toast.error('DB needs migration — run 002_service_fields.sql in Supabase', { duration: 8000 })
      } else {
        toast.error(`Error updating: ${msg}`)
      }
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteCallLog.mutateAsync({ id: deleteId, caseId })
      setDeleteId(null)
      toast.success('Contact deleted')
    } catch {
      toast.error('Error deleting')
    }
  }

  const visibleLogs = expanded ? logs : logs.slice(0, 3)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-blue-500" />
          Contact History
          {logs.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
              {logs.length}
            </span>
          )}
        </h3>
      </div>

      {/* Contact type quick-log */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">Log contact:</p>
        <div className="grid grid-cols-4 gap-1.5">
          {CONTACT_TYPES.map(({ type, icon, label, color, activeColor }) => (
            <button
              key={type}
              onClick={() => handleTypeSelect(type)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${
                selectedType === type ? activeColor : color
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>

        {selectedType && (
          <div className="space-y-2">
            <Textarea
              placeholder="Optional note about this contact..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleLog} disabled={logCall.isPending} className="flex-1">
                {logCall.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setSelectedType(null); setNotes('') }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Log list */}
      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-2">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-3">No contacts logged yet.</p>
      ) : (
        <div className="space-y-2">
          {visibleLogs.map((log) => {
            const { type, notes: parsedNotes } = parseContactLog(log.notes)
            const isEditing = editingId === log.id
            return (
              <div key={log.id} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg group">
                <div className={`w-7 h-7 ${TYPE_BG[type]} rounded-full flex items-center justify-center shrink-0 mt-0.5`}>
                  {TYPE_ICON[type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700">
                    {format(new Date(log.logged_at), 'MMM d, yyyy — h:mm a')}
                  </p>
                  {isEditing ? (
                    <div className="mt-1.5 space-y-1.5">
                      <Textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={2}
                        className="text-xs resize-none"
                        placeholder="Note..."
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={updateCallLog.isPending}
                          className="h-7 px-2 text-xs"
                        >
                          {updateCallLog.isPending
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <><Check className="w-3 h-3 mr-1" /> Save</>}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setEditingId(null); setEditNotes('') }}
                          className="h-7 px-2 text-xs"
                        >
                          <X className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    parsedNotes && <p className="text-xs text-gray-500 mt-0.5">{parsedNotes}</p>
                  )}
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => handleStartEdit(log.id, log.notes)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(log.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {logs.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-xs text-blue-600 hover:underline flex items-center justify-center gap-1 py-1"
            >
              {expanded ? (
                <><ChevronUp className="w-3 h-3" /> Show less</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> Show {logs.length - 3} more</>
              )}
            </button>
          )}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the contact entry and decrement the case's contact count. Cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteCallLog.isPending}
            >
              {deleteCallLog.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
