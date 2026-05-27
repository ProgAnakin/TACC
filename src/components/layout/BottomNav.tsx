import { NavLink, Link } from 'react-router-dom'
import { Home, Bell, Archive, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-1px_0_0_rgb(0,0,0,0.04)]">
      <div
        className="grid max-w-lg mx-auto"
        style={{ gridTemplateColumns: '1fr 1fr 72px 1fr 1fr', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-end gap-0.5 pt-2 pb-2 transition-colors',
              isActive ? 'text-blue-600' : 'text-gray-400',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Home className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">Casos</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/reminders"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-end gap-0.5 pt-2 pb-2 transition-colors',
              isActive ? 'text-blue-600' : 'text-gray-400',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Bell className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">Lembretes</span>
            </>
          )}
        </NavLink>

        {/* Central FAB */}
        <div className="flex items-center justify-center relative">
          <Link
            to="/cases/new"
            className="absolute -top-5 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white hover:bg-blue-700 active:scale-95 transition-all"
            aria-label="Novo caso"
          >
            <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
          </Link>
          <span className="absolute top-6 text-[10px] font-medium text-blue-600">Novo</span>
        </div>

        <NavLink
          to="/archive"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-end gap-0.5 pt-2 pb-2 transition-colors',
              isActive ? 'text-blue-600' : 'text-gray-400',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Archive className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">Arquivo</span>
            </>
          )}
        </NavLink>

        {/* Empty slot — keeps grid balanced */}
        <div />
      </div>
    </nav>
  )
}
