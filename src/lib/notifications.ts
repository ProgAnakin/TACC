import { playSound, getSoundPreference } from './sounds'

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
  if (!isNotificationSupported()) return 'denied'
  return Notification.requestPermission()
}

export function showNotification(title: string, body: string) {
  if (getPermission() !== 'granted') return
  new Notification(title, {
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
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
      if (new Date(reminder.remind_at) <= now) {
        // Play in-app sound (works while app is open regardless of OS permissions)
        playSound(getSoundPreference())
        showNotification('⏰ Lembrete — Caderninho Digital', reminder.title)
        onFire(reminder.id)
      }
    })
  }, 30_000)

  return () => clearInterval(intervalId)
}
