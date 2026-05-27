import { useNavigate } from 'react-router-dom'
import { ChevronLeft, LogOut, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  title: string
  showBack?: boolean
  rightElement?: React.ReactNode
}

export function Header({ title, showBack = false, rightElement }: Props) {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Até logo!')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100 safe-area-pt">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
          <h1 className="font-semibold text-gray-900 text-[15px]">{title}</h1>
        </div>

        <div className="flex items-center gap-1">
          {rightElement}
          {!showBack && (
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
