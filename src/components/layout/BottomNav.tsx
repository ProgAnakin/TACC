import { NavLink, Link } from 'react-router-dom'
import { Home, Bell, Archive, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/',          icon: Home,    label: 'Cases',     end: true  },
  { to: '/reminders', icon: Bell,    label: 'Reminders', end: false },
] as const

const NAV_ITEMS_RIGHT = [
  { to: '/archive', icon: Archive, label: 'Archive', end: false },
] as const

export function BottomNav() {
  return (
    <>
      {/* Floating Action Button — sits above the nav bar */}
      <Link
        to="/cases/new"
        aria-label="New case"
        className={cn(
          'fixed z-50 left-1/2 -translate-x-1/2',
          // bottom-14 = 56 px → FAB bottom aligns with nav top (h-16 = 64px),
          // then translate-y-2 shifts it 8px into the nav for a connected look
          'bottom-14 translate-y-2',
          'w-14 h-14 bg-blue-600 rounded-full',
          'flex items-center justify-center',
          'shadow-[0_4px_20px_rgba(37,99,235,0.45)] border-4 border-white',
          'hover:bg-blue-700 active:scale-95 transition-all duration-150',
        )}
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </Link>

      {/* Tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex h-16 max-w-lg mx-auto">

          {/* Left items */}
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                  isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Center spacer — reserved for FAB */}
          <div className="flex-1 flex flex-col items-center justify-end pb-2">
            <span className="text-[10px] font-semibold text-blue-500 tracking-wide">New</span>
          </div>

          {/* Right items */}
          {NAV_ITEMS_RIGHT.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                  isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Empty right slot to balance the 2-left / 1-center / 1-right layout */}
          <div className="flex-1" />
        </div>
      </nav>
    </>
  )
}
