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
  const digits  = phone.replace(/\D/g, '')
  const withCC  = digits.startsWith('55') ? digits : `55${digits}`
  const first   = clientName.split(' ')[0]
  const product = productName ? ` — ${productName}` : ''

  const messages: Record<Category, string> = {
    arrival:    `Olá ${first}! 📦 Seu produto${product} chegou à loja e está pronto para retirada. Quando podemos te esperar?`,
    assistance: `Olá ${first}! 🛠️ Entrando em contato para te dar um update sobre o seu produto${product} que está em assistência.`,
    lead:       `Olá ${first}! 🎯 Temos uma condição especial no produto${product} que você se interessou. Ainda tem interesse?`,
    problem:    `Olá ${first}! Entrando em contato para acompanhar o caso do seu produto${product}. Podemos conversar?`,
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
