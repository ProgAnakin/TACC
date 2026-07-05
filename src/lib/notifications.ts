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

export function showNotification(title: string, body: string, tag = 'caderninho-reminder') {
  if (getPermission() !== 'granted') return
  new Notification(title, {
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    // Unique tag per reminder so simultaneously-due reminders don't collapse
    // into a single notification (a shared tag makes each replace the last).
    tag,
  })
}

export function scheduleReminderCheck(
  reminders: Array<{ id: string; title: string; remind_at: string; sent: boolean }>,
  onFire: (reminderId: string) => void,
): () => void {
  // Track reminders we've already fired this session so a failed markSent
  // (e.g. offline — the exact scenario this in-app net covers) doesn't re-play
  // the sound and re-notify on every 30s tick.
  const fired = new Set<string>()

  const intervalId = setInterval(() => {
    const now = new Date()
    reminders.forEach((reminder) => {
      if (reminder.sent || fired.has(reminder.id)) return
      if (new Date(reminder.remind_at) <= now) {
        fired.add(reminder.id)
        // Play in-app sound (works while app is open regardless of OS permissions)
        playSound(getSoundPreference())
        showNotification('⏰ Lembrete — Caderninho Digital', reminder.title, `reminder-${reminder.id}`)
        onFire(reminder.id)
      }
    })
  }, 30_000)

  return () => clearInterval(intervalId)
}
