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

/** Human-readable age label with urgency color. */
export function caseAgeLabel(createdAt: string): { text: string; color: string } {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000)
  if (days === 0) return { text: 'Today',    color: 'text-gray-400' }
  if (days === 1) return { text: '1 day',    color: 'text-gray-400' }
  if (days < 7)   return { text: `${days}d`, color: 'text-amber-500' }
  return             { text: `${days}d ⚠`,  color: 'text-red-500 font-semibold' }
}
