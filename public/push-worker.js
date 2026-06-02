// Push handlers — imported by the workbox service worker via importScripts
// Runs in ServiceWorker scope; no DOM, no Audio API.

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data?.json() ?? {}
  } catch {
    data = { body: event.data?.text() ?? 'Você tem um lembrete!' }
  }

  event.waitUntil(
    self.registration.showNotification(data.title ?? '⏰ Caderninho Digital', {
      body: data.body ?? 'Você tem um lembrete!',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      tag: data.reminderId ?? 'caderninho-reminder',
      renotify: true,
      data: { url: data.url ?? '/reminders' },
      actions: [
        { action: 'open', title: '📖 Abrir' },
        { action: 'dismiss', title: '✕ Ignorar' },
      ],
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  const url = event.notification.data?.url ?? '/reminders'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('navigate' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    }),
  )
})
