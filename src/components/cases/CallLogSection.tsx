import { useState } from 'react'
import { PhoneCall, Phone, Loader2, ChevronDown, ChevronUp, Pencil, Trash2, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useCallLogs, useLogCall, useUpdateCallLog, useDeleteCallLog } from '@/hooks/useCallLogs'

interface Props {
  caseId: string
}

export function CallLogSection({ caseId }: Props) {
  const { data: logs = [], isLoading } = useCallLogs(caseId)
  const logCall = useLogCall()
  const updateCallLog = useUpdateCallLog()
  const deleteCallLog = useDeleteCallLog()
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleLog = async () => {
    try {
      await logCall.mutateAsync({ caseId, notes: notes || undefined })
      setNotes('')
      setShowNotes(false)
      toast.success('Call logged!')
    } catch {
      toast.error('Error logging call')
    }
  }

  const handleStartEdit = (id: string, currentNotes: string | null) => {
    setEditingId(id)
    setEditNotes(currentNotes || '')
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    try {
      await updateCallLog.mutateAsync({ id: editingId, notes: editNotes.trim() || null, caseId })
      setEditingId(null)
      setEditNotes('')
      toast.success('Call updated')
    } catch {
      toast.error('Error updating call')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteCallLog.mutateAsync({ id: deleteId, caseId })
      setDeleteId(null)
      toast.success('Call deleted')
    } catch {
      toast.error('Error deleting call')
    }
  }

  const visibleLogs = expanded ? logs : logs.slice(0, 3)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-blue-500" />
          Call History
          {logs.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
              {logs.length}
            </span>
          )}
        </h3>
      </div>

      {/* Log call button */}
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNotes(!showNotes)}
          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
          disabled={logCall.isPending}
        >
          <Phone className="w-4 h-4 mr-2" />
          Log a Call
        </Button>

        {showNotes && (
          <div className="space-y-2">
            <Textarea
              placeholder="Optional note about this call..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleLog} disabled={logCall.isPending} className="flex-1">
                {logCall.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowNotes(false); setNotes('') }}>
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
        <p className="text-sm text-gray-400 text-center py-3">No calls logged yet.</p>
      ) : (
        <div className="space-y-2">
          {visibleLogs.map((log) => {
            const isEditing = editingId === log.id
            return (
              <div key={log.id} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg group">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
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
                    log.notes && <p className="text-xs text-gray-500 mt-0.5">{log.notes}</p>
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
            <AlertDialogTitle>Delete this call?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the call entry and decrement the case's call count. Cannot be undone.
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
