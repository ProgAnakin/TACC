import { Outlet } from 'react-router-dom'
import { WifiOff } from 'lucide-react'
import { BottomNav } from './BottomNav'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export default function Layout() {
  const isOnline = useOnlineStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      {!isOnline && (
        <div
          className="bg-red-600 text-white text-xs text-center py-2 px-4 flex items-center justify-center gap-2"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
        >
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          No internet connection — changes may not save
        </div>
      )}
      <main className="max-w-lg mx-auto pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
