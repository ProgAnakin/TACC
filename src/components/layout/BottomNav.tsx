import { NavLink } from 'react-router-dom'
import { Home, Bell, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: Home, label: 'Casos' },
  { to: '/reminders', icon: Bell, label: 'Lembretes' },
  { to: '/archive', icon: Archive, label: 'Arquivo' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-1 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-colors min-w-0',
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-5 h-5', isActive && 'fill-blue-100')} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
