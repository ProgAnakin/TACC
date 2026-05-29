import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIOSDevice = /iphone|ipad|ipod/i.test(ua)
  // iPadOS 13+ reports as Mac but has touch
  const isIPadOS = /macintosh/i.test(ua) && 'ontouchend' in document
  return isIOSDevice || isIPadOS
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  // iOS uses navigator.standalone; others use the display-mode media query
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export function usePWAInstall() {
  const [prompt, setPrompt]       = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone)

  const isIOS = detectIOS()

  useEffect(() => {
    const capture = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', capture)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', capture)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async (): Promise<boolean> => {
    if (!prompt) return false
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setPrompt(null)
      setInstalled(true)
    }
    return outcome === 'accepted'
  }

  return {
    /** Chrome / Android: native install prompt available */
    canInstall: !!prompt && !installed,
    /** iOS Safari, not yet added to home screen → show manual instructions */
    showIOSInstructions: isIOS && !installed,
    isIOS,
    installed,
    install,
  }
}
