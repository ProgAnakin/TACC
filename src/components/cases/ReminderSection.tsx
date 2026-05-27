import { useState } from 'react'
import { Bell, Plus, Trash2, Loader2, BellOff } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useReminders, useCreateReminder, useDeleteReminder } from '@/hooks/useReminders'
import { requestPermission, getPermission } from '@/lib/notifications'

interface Props {
  caseId: string
}

export function ReminderSection({ caseId }: Props) {
  const { data: reminders = [], isLoading } = useReminders(caseId)
  const createReminder = useCreateReminder()
  const deleteReminder = useDeleteReminder()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [remindAt, setRemindAt] = useState('')

  const handleCreate = async () => {
    if (!title.trim() || !remindAt) {
      toast.error('Preencha o título e a data/hora do lembrete')
      return
    }

    const permission = getPermission()
    if (permission === 'default') {
      await requestPermission()
    }

    try {
      await createReminder.mutateAsync({ caseId, title: title.trim(), remindAt })
      setTitle('')
      setRemindAt('')
      setOpen(false)
      toast.success('Lembrete criado!')
    } catch {
      toast.error('Erro ao criar lembrete')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteReminder.mutateAsync(id)
      toast.success('Lembrete removido')
    } catch {
      toast.error('Erro ao remover lembrete')
    }
  }

  const minDateTime = new Date()
  minDateTime.setMinutes(minDateTime.getMinutes() + 5)
  const minDateTimeStr = minDateTime.toISOString().slice(0, 16)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          Lembretes
          {reminders.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
              {reminders.length}
            </span>
          )}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
          className="h-7 px-2 text-amber-600 hover:bg-amber-50"
        >
          <Plus className="w-4 h-4 mr-1" />
          Novo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-2">Carregando...</p>
      ) : reminders.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-3 flex items-center justify-center gap-2">
          <BellOff className="w-4 h-4" />
          Nenhum lembrete criado
        </p>
      ) : (
        <div className="space-y-2">
          {reminders.map((reminder) => {
            const isPast = new Date(reminder.remind_at) < new Date()
            return (
              <div
                key={reminder.id}
                className={`flex items-start gap-2 p-2.5 rounded-lg ${
                  reminder.sent || isPast
                    ? 'bg-gray-50 opacity-60'
                    : 'bg-amber-50 border border-amber-100'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    reminder.sent || isPast ? 'bg-gray-200' : 'bg-amber-100'
                  }`}
                >
                  <Bell
                    className={`w-3.5 h-3.5 ${
                      reminder.sent || isPast ? 'text-gray-400' : 'text-amber-600'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 leading-tight">{reminder.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {format(new Date(reminder.remind_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  {(reminder.sent || isPast) && (
                    <p className="text-xs text-gray-400 mt-0.5">Enviado</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(reminder.id)}
                  disabled={deleteReminder.isPending}
                  className="shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Novo Lembrete
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reminder-title">Descrição</Label>
              <Input
                id="reminder-title"
                placeholder="Ex: Ligar para confirmar retirada"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reminder-datetime">Data e Hora</Label>
              <Input
                id="reminder-datetime"
                type="datetime-local"
                min={minDateTimeStr}
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createReminder.isPending}>
              {createReminder.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Criar Lembrete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
