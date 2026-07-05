import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { COUNTRIES, findCountry, searchCountries, DEFAULT_COUNTRY } from '@/lib/countries'
import { cn } from '@/lib/utils'

interface Props {
  value: string | null | undefined
  onChange: (code: string) => void
  className?: string
}

/** Searchable, scrollable country picker. Tap to open, then scroll the list or
 *  type to filter by name or dial code. Dependency-free (no popover/cmdk). */
export function CountrySelect({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = findCountry(value) ?? findCountry(DEFAULT_COUNTRY)!
  const results = searchCountries(query)

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Focus the search box when the panel opens
  useEffect(() => {
    if (open) {
      setQuery('')
      // next tick so the input exists
      const t = setTimeout(() => inputRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [open])

  const pick = (code: string) => {
    onChange(code)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-10 px-3 rounded-lg border border-input bg-background text-sm min-w-[7.5rem] hover:bg-gray-50 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-lg leading-none">{selected.flag}</span>
        <span className="font-medium text-gray-700">+{selected.dial}</span>
        <ChevronDown className={cn('w-4 h-4 text-gray-400 ml-auto transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-72 max-w-[85vw] bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or code…"
                className="w-full h-9 pl-8 pr-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                inputMode="search"
              />
            </div>
          </div>
          <ul className="max-h-64 overflow-y-auto py-1" role="listbox">
            {results.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-gray-400">No country found</li>
            ) : (
              results.map((c) => {
                const isSel = c.code === selected.code
                return (
                  <li key={c.code} role="option" aria-selected={isSel}>
                    <button
                      type="button"
                      onClick={() => pick(c.code)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors',
                        isSel && 'bg-blue-50',
                      )}
                    >
                      <span className="text-lg leading-none">{c.flag}</span>
                      <span className="flex-1 truncate text-gray-700">{c.name}</span>
                      <span className="text-gray-400 tabular-nums">+{c.dial}</span>
                      {isSel && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
          <p className="sr-only">{COUNTRIES.length} countries available</p>
        </div>
      )}
    </div>
  )
}
