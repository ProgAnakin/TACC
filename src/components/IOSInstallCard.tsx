import { useState } from 'react'
import { Share, X, Plus } from 'lucide-react'

const DISMISS_KEY = 'ios-install-dismissed'

export function IOSInstallCard() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === '1',
  )

  if (dismissed) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="relative bg-blue-50 border border-blue-100 rounded-xl p-3.5 pr-9">
      <button
        onClick={dismiss}
        className="absolute top-2.5 right-2.5 p-1 text-blue-400 hover:text-blue-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      <p className="text-sm font-semibold text-blue-900 mb-1.5">📲 Install on your iPhone</p>
      <p className="text-xs text-blue-700 leading-relaxed">
        Tap the{' '}
        <Share className="inline w-3.5 h-3.5 -mt-0.5 text-blue-600" />{' '}
        <span className="font-medium">Share</span> button in Safari, then{' '}
        <span className="font-medium inline-flex items-center gap-0.5">
          <Plus className="inline w-3 h-3" /> Add to Home Screen
        </span>{' '}
        for full-screen access and reminder alerts.
      </p>
    </div>
  )
}
