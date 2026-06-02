import { useState, useEffect } from 'react'
import { isPushSupported, subscribeToPush, unsubscribeFromPush, getPushStatus } from '@/lib/push'
import { requestPermission, getPermission } from '@/lib/notifications'

export type PushStatus = 'loading' | 'subscribed' | 'unsubscribed' | 'unsupported'

export function usePushSubscription() {
  const [status, setStatus] = useState<PushStatus>('loading')

  useEffect(() => {
    if (!isPushSupported()) { setStatus('unsupported'); return }
    getPushStatus().then(setStatus)
  }, [])

  const enable = async (): Promise<'ok' | 'denied' | 'error'> => {
    // Request notification permission first
    const perm = getPermission() === 'granted'
      ? 'granted'
      : await requestPermission()
    if (perm !== 'granted') return 'denied'

    const ok = await subscribeToPush()
    if (ok) setStatus('subscribed')
    return ok ? 'ok' : 'error'
  }

  const disable = async () => {
    await unsubscribeFromPush()
    setStatus('unsubscribed')
  }

  return { status, enable, disable }
}
