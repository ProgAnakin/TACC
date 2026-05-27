import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import LoginPage from '@/pages/LoginPage'
import HomePage from '@/pages/HomePage'
import CaseDetailPage from '@/pages/CaseDetailPage'
import CaseFormPage from '@/pages/CaseFormPage'
import RemindersPage from '@/pages/RemindersPage'
import ArchivePage from '@/pages/ArchivePage'
import Layout from '@/components/layout/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
        richColors
      />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="reminders" element={<RemindersPage />} />
          <Route path="archive" element={<ArchivePage />} />
          <Route path="cases/new" element={<CaseFormPage />} />
          <Route path="cases/:id" element={<CaseDetailPage />} />
          <Route path="cases/:id/edit" element={<CaseFormPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
