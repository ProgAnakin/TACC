import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateCase } from '@/hooks/useCases'
import type { Category } from '@/types'

const CATS: { value: Category; emoji: string; label: string; bg: string; active: string }[] = [
  { value: 'arrival',   emoji: '📦', label: 'Arrival',   bg: 'bg-blue-50 border-blue-200 text-blue-700',   active: 'bg-blue-600 border-blue-600 text-white' },
  { value: 'assistance',emoji: '🛠️', label: 'Service',   bg: 'bg-orange-50 border-orange-200 text-orange-700', active: 'bg-orange-500 border-orange-500 text-white' },
  { value: 'lead',      emoji: '🎯', label: 'Lead',      bg: 'bg-purple-50 border-purple-200 text-purple-700', active: 'bg-purple-600 border-purple-600 text-white' },
  { value: 'problem',   emoji: '⚠️', label: 'Complaint', bg: 'bg-red-50 border-red-200 text-red-700',     active: 'bg-red-600 border-red-600 text-white'   },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function QuickAddSheet({ open, onClose }: Props) {
  const navigate    = useNavigate()
  const createCase  = useCreateCase()
  const nameRef     = useRef<HTMLInputElement>(null)

  const [category, setCategory] = useState<Category>('arrival')
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [visible, setVisible]   = useState(false)

  // Two-phase open: mount → next frame → add .sheet-open so browser paints first
  useEffect(() => {
    if (open) {
      setVisible(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => nameRef.current?.focus())
      })
    }
  }, [open])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 240)
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      nameRef.current?.focus()
      return
    }
    try {
      const newCase = await createCase.mutateAsync({
        client_name:   name.trim(),
        client_phone:  phone.trim() || null,
        client_email:  null,
        shopify_order: null,
        product_name:  null,
        category,
        urgency:      'normal',
        cause:         null,
        notes:         null,
        status:        'open',
        resolved_at:   null,
      })
      setName('')
      setPhone('')
      setCategory('arrival')
      handleClose()
      toast.success('Case created ✅')
      navigate(`/cases/${newCase.id}`)
    } catch {
      toast.error('Error creating case')
    }
  }

  if (!open && !visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 ${
          open && visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl ${
          open && visible ? 'sheet-open' : 'sheet-close'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="px-4 pb-4 pt-2 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">New Case</h2>
            <button
              onClick={handleClose}
              className="touch-target rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category picker — 4 chips in a row */}
          <div className="grid grid-cols-4 gap-1.5">
            {CATS.map(({ value, emoji, label, bg, active }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setCategory(value); nameRef.current?.focus() }}
                className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                  category === value ? active : bg
                }`}
              >
                <span className="text-base leading-none">{emoji}</span>
                <span className="leading-tight">{label}</span>
              </button>
            ))}
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Client name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Full name"
              autoCapitalize="words"
              autoCorrect="off"
              className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Phone / WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="+39 333 1234567"
              inputMode="tel"
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="tel"
              className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleCreate}
            disabled={createCase.isPending || !name.trim()}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-blue-600/30"
          >
            {createCase.isPending
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : '+ Create Case'
            }
          </button>

          <p className="text-center text-xs text-gray-400">
            Add more details after creating
          </p>
        </div>
      </div>
    </>
  )
}
