import { useEffect } from 'react'
import { Bell, BellOff, Trash2, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import { toast } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useReminders, useDeleteReminder, useMarkReminderSent } from '@/hooks/useReminders'
import { requestPermission, getPermission, scheduleReminderCheck, isNotificationSupported } from '@/lib/notifications'
import type { Reminder } from '@/types'

function getReminderLabel(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date))    return `Today at ${format(date, 'h:mm a')}`
  if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`
  return format(date, 'MMM d, yyyy — h:mm a')
}

export default function RemindersPage() {
  const { data: reminders = [], isLoading } = useReminders()
  const deleteReminder = useDeleteReminder()
  const markSent = useMarkReminderSent()

  const permission = getPermission()
  const notifSupported = isNotificationSupported()

  const handleEnableNotifications = async () => {
    const result = await requestPermission()
    if (result === 'granted') {
      toast.success('Notifications enabled!')
    } else if (result === 'denied') {
      toast.error('Permission denied. Enable notifications in your browser settings.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteReminder.mutateAsync(id)
      toast.success('Reminder deleted')
    } catch {
      toast.error('Error deleting reminder')
    }
  }

  useEffect(() => {
    if (!reminders.length) return
    const cleanup = scheduleReminderCheck(
      reminders.map((r) => ({ id: r.id, title: r.title, remind_at: r.remind_at, sent: r.sent })),
      async (reminderId) => {
        const reminder = reminders.find((r) => r.id === reminderId)
        if (reminder) {
          toast(reminder.title, { description: '⏰ Reminder fired', duration: 8000 })
          await markSent.mutateAsync(reminderId)
        }
      },
    )
    return cleanup
  }, [reminders])

  const upcoming = reminders.filter((r) => !r.sent && !isPast(new Date(r.remind_at)))
  const past     = reminders.filter((r) => r.sent  ||  isPast(new Date(r.remind_at)))

  type ReminderWithCase = Reminder & {
    case?: { client_name: string; product_name: string | null; category: string }
  }

  const renderReminder = (reminder: ReminderWithCase, dimmed = false) => (
    <div
      key={reminder.id}
      className={`flex items-start gap-3 p-3.5 rounded-xl border ${
        dimmed ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-amber-100 shadow-sm'
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${dimmed ? 'bg-gray-100' : 'bg-amber-100'}`}>
        <Bell className={`w-4 h-4 ${dimmed ? 'text-gray-400' : 'text-amber-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-tight ${dimmed ? 'text-gray-500' : 'text-gray-900'}`}>
          {reminder.title}
        </p>
        <p className={`text-xs mt-0.5 ${dimmed ? 'text-gray-400' : 'text-amber-600 font-medium'}`}>
          {getReminderLabel(reminder.remind_at)}
        </p>
        {reminder.case && (
          <Link
            to={`/cases/${reminder.case_id}`}
            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline mt-1"
          >
            {reminder.case.client_name}
            {reminder.case.product_name && ` — ${reminder.case.product_name}`}
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        )}
      </div>
      <button
        onClick={() => handleDelete(reminder.id)}
        className="shrink-0 p-1.5 text-gray-300 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <>
      <Header title="Reminders" />

      <div className="px-4 py-4 space-y-4 pb-28">
        {/* Notification status banner — honest about the iPhone reality */}
        {!notifSupported ? (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Reminders show here in the app</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Due reminders appear on your Home screen and the Reminders tab badge. For pop-up alerts on
                iPhone, add the app to your Home Screen (iOS 16.4 or later).
              </p>
            </div>
          </div>
        ) : permission !== 'granted' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Enable pop-up alerts</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Due reminders always show in-app. Enable notifications for pop-up alerts while the app is open.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleEnableNotifications}
              className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              Enable
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-16">
            <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No reminders yet</p>
            <p className="text-gray-400 text-sm mt-1">Create reminders from inside each case</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                  Upcoming ({upcoming.length})
                </p>
                {upcoming.map((r) => renderReminder(r as ReminderWithCase))}
              </div>
            )}
            {past.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                  Past ({past.length})
                </p>
                {past.map((r) => renderReminder(r as ReminderWithCase, true))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
