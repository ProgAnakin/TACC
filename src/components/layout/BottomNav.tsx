import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Bell, Archive, Plus, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDueReminders } from '@/hooks/useReminders'
import { QuickAddSheet } from '@/components/QuickAddSheet'

export function BottomNav() {
  const { data: dueReminders = [] } = useDueReminders()
  const dueCount = dueReminders.length
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <QuickAddSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      {/* FAB — positioned above nav accounting for safe-area-inset-bottom */}
      <button
        onClick={() => setSheetOpen(true)}
        aria-label="New case"
        className={cn(
          'fixed z-50 left-1/2 -translate-x-1/2',
          'w-14 h-14 bg-blue-600 rounded-full',
          'flex items-center justify-center',
          'shadow-[0_4px_20px_rgba(37,99,235,0.45)] border-4 border-white',
          'hover:bg-blue-700 active:scale-95 transition-all duration-150',
        )}
        /* bottom = nav h-16 (64px) + safe area - 8px overlap */
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom) - 8px)' }}
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      {/* Tab bar — 5 slots: Cases | Reminders | [FAB gap] | Stats | Archive */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex h-16 max-w-lg mx-auto">

          {/* Cases */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn('flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                 isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600')
            }
          >
            {({ isActive }) => (
              <>
                <Home className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">Cases</span>
              </>
            )}
          </NavLink>

          {/* Reminders — badge when due */}
          <NavLink
            to="/reminders"
            className={({ isActive }) =>
              cn('flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                 isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600')
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Bell className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                  {dueCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {dueCount > 9 ? '9+' : dueCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">Reminders</span>
              </>
            )}
          </NavLink>

          {/* Center gap for FAB + "New" label */}
          <div className="flex-1 flex flex-col items-center justify-end pb-2">
            <span className="text-[10px] font-semibold text-blue-500 tracking-wide">New</span>
          </div>

          {/* Stats */}
          <NavLink
            to="/stats"
            className={({ isActive }) =>
              cn('flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                 isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600')
            }
          >
            {({ isActive }) => (
              <>
                <BarChart3 className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">Stats</span>
              </>
            )}
          </NavLink>

          {/* Archive */}
          <NavLink
            to="/archive"
            className={({ isActive }) =>
              cn('flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                 isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600')
            }
          >
            {({ isActive }) => (
              <>
                <Archive className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">Archive</span>
              </>
            )}
          </NavLink>

        </div>
      </nav>
    </>
  )
}
