import { Outlet } from 'react-router-dom'
import { WifiOff } from 'lucide-react'
import { BottomNav } from './BottomNav'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export default function Layout() {
  const isOnline = useOnlineStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky offline banner — above header (z-50) so it's always visible */}
      {!isOnline && (
        <div className="sticky top-0 z-50 bg-red-600 text-white text-xs text-center px-4 flex items-center justify-center gap-2"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.4rem)', paddingBottom: '0.4rem' }}
        >
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          No internet — changes may not save
        </div>
      )}
      {/* pb accounts for nav bar h-16 (64px) + iPhone safe-area-inset-bottom (~34px on 14/15 Pro) */}
      <main className="max-w-lg mx-auto" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
