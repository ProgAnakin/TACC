import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'

const supabaseConfigured =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabaseConfigured) {
      toast.error('Supabase não configurado — adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente da Vercel.')
      return
    }
    if (!email.trim() || !password.trim()) {
      toast.error('Preencha e-mail e senha')
      return
    }
    if (password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('E-mail ou senha incorretos')
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('E-mail não confirmado. Verifique sua caixa de entrada ou desative a confirmação no Supabase → Authentication → Settings.')
          } else {
            toast.error(error.message)
          }
        } else {
          navigate('/', { replace: true })
        }
      } else {
        const { data, error } = await signUp(email, password)
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Este e-mail já está cadastrado. Tente entrar.')
          } else {
            toast.error(error.message)
          }
        } else if (data.session) {
          // Email confirmation disabled — logged in immediately
          navigate('/', { replace: true })
        } else {
          toast.success('Conta criada! Verifique seu e-mail para ativar.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <BookOpen className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Caderninho Digital</h1>
        <p className="text-gray-500 text-sm mt-1">CRM pessoal para o dia a dia da loja</p>
      </div>

      {/* Supabase config warning */}
      {!supabaseConfigured && (
        <div className="w-full max-w-sm mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Supabase não configurado</p>
            <p className="mt-0.5">Adicione <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> e <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> nas variáveis de ambiente da Vercel e faça redeploy.</p>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        {/* Mode toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              'Entrar'
            ) : (
              'Criar conta'
            )}
          </Button>
        </form>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        Seus dados são privados e seguros na nuvem
      </p>
    </div>
  )
}
