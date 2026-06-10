import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Category } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return phone
}

/** Builds a wa.me link with a pre-filled message tailored to the case category. */
export function buildWhatsAppUrl(
  phone: string,
  category: Category,
  clientName: string,
  productName: string | null,
): string {
  const digits = phone.replace(/\D/g, '')

  // Italian phone number detection
  let withCC: string
  if (digits.startsWith('39') && digits.length === 12) {
    // Already has Italian country code
    withCC = digits
  } else if (digits.length === 10 && digits.startsWith('3')) {
    // Italian mobile (10 digits starting with 3) → prepend 39
    withCC = `39${digits}`
  } else if (digits.length === 11 && digits.startsWith('039')) {
    // 039... format → convert to 39...
    withCC = `39${digits.slice(2)}`
  } else {
    // User already included country code or unknown format
    withCC = digits
  }

  const firstName = clientName.split(' ')[0]
  const productText = productName ? ` "${productName}"` : ''

  const messages: Record<Category, string> = {
    arrival:    `Buongiorno ${firstName}! Ti contatto dal negozio per informarti che il prodotto${productText} è arrivato. Quando puoi passare a ritirarlo?`,
    assistance: `Buongiorno ${firstName}! Ti contatto riguardo al prodotto${productText} in assistenza. Ci sono aggiornamenti da comunicarti. Quando sei disponibile per parlare?`,
    lead:       `Buongiorno ${firstName}! Ti contatto perché avevi mostrato interesse per${productText}. Abbiamo delle novità che potrebbero interessarti. Quando possiamo sentirci?`,
    problem:    `Buongiorno ${firstName}! Ti contatto per aggiornarti sulla situazione${productText}. Siamo al lavoro per risolvere il prima possibile.`,
  }

  return `https://wa.me/${withCC}?text=${encodeURIComponent(messages[category])}`
}

/** Returns age-based Tailwind classes for the case card left border. */
export function caseAgeBorderClass(createdAt: string): string {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000)
  if (days >= 7) return 'border-l-4 border-l-red-400'
  if (days >= 3) return 'border-l-4 border-l-amber-400'
  return 'border-l-4 border-l-transparent'
}

/** Short 6-char reference ID derived from the case UUID. */
export function shortCaseId(id: string): string {
  return id.replace(/-/g, '').slice(-6).toUpperCase()
}

/** Copies text to clipboard, resolves true on success. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Downloads cases as a CSV file (Excel-compatible, UTF-8 BOM). */
export function downloadCasesCSV(cases: Array<Record<string, unknown>>, filename: string): void {
  const columns = [
    'client_name', 'client_phone', 'client_email', 'category', 'status',
    'urgency', 'product_name', 'shopify_order', 'cause', 'notes',
    'deal_value', 'lead_outcome', 'call_count', 'created_at', 'resolved_at',
  ]
  const escape = (v: unknown) => {
    if (v == null) return ''
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = [
    columns.join(','),
    ...cases.map((c) => columns.map((col) => escape(c[col])).join(',')),
  ]
  const blob = new Blob(['﻿' + rows.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Resize + compress an image file in the browser before upload.
 *  Phone photos are often 3-8MB; this shrinks them to ~100-300KB JPEGs. */
export async function compressImage(
  file: File,
  maxDimension = 1280,
  quality = 0.8,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap
  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height)
    width  = Math.round(width * scale)
    height = Math.round(height * scale)
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return file
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ?? file),
      'image/jpeg',
      quality,
    )
  })
}

/** Parse contact type prefix from notes string. */
export type ContactType = 'call' | 'visit' | 'message' | 'whatsapp'

export function parseContactLog(raw: string | null): { type: ContactType; notes: string | null } {
  if (!raw) return { type: 'call', notes: null }
  const m = raw.match(/^\[type:(call|visit|message|whatsapp)\]\s*([\s\S]*)$/)
  if (m) return { type: m[1] as ContactType, notes: m[2].trim() || null }
  return { type: 'call', notes: raw }
}

export function serializeContactLog(type: ContactType, notes: string): string | null {
  const n = notes.trim()
  if (type === 'call') return n || null
  return n ? `[type:${type}] ${n}` : `[type:${type}]`
}

/** Human-readable age label with urgency color. */
export function caseAgeLabel(createdAt: string): { text: string; color: string } {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000)
  if (days === 0) return { text: 'Today',    color: 'text-gray-400' }
  if (days === 1) return { text: '1 day',    color: 'text-gray-400' }
  if (days < 7)   return { text: `${days}d`, color: 'text-amber-500' }
  return             { text: `${days}d ⚠`,  color: 'text-red-500 font-semibold' }
}
