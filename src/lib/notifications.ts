/** Whether the browser exposes the Notification API at all.
 *  iOS Safari in a normal tab does NOT — only installed PWAs on iOS 16.4+. */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied'
  return Notification.permission
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied'
  return Notification.requestPermission()
}

export function showNotification(title: string, body: string) {
  if (getPermission() !== 'granted') return
  new Notification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'caderninho-reminder',
  })
}

export function scheduleReminderCheck(
  reminders: Array<{ id: string; title: string; remind_at: string; sent: boolean }>,
  onFire: (reminderId: string) => void,
): () => void {
  const intervalId = setInterval(() => {
    const now = new Date()
    reminders.forEach((reminder) => {
      if (reminder.sent) return
      const remindAt = new Date(reminder.remind_at)
      if (remindAt <= now) {
        showNotification('⏰ Lembrete — Caderninho Digital', reminder.title)
        onFire(reminder.id)
      }
    })
  }, 30_000) // check every 30s

  return () => clearInterval(intervalId)
}
