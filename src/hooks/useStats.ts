import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Case, Category } from '@/types'

export type StatsPeriod = 'this_month' | 'last_month' | 'all'

export interface Stats {
  created: number
  resolved: number
  open: number
  byCategory: Record<Category, number>
  leadsTotal: number
  leadsConverted: number
  leadsLost: number
  conversionRate: number | null
  revenue: number
  avgRepairDays: number | null
  contactsLogged: number
  busiestCategory: Category | null
}

function periodRange(period: StatsPeriod): { start: Date; end: Date } | null {
  const now = new Date()
  if (period === 'this_month') {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end:   new Date(now.getFullYear(), now.getMonth() + 1, 1),
    }
  }
  if (period === 'last_month') {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end:   new Date(now.getFullYear(), now.getMonth(), 1),
    }
  }
  return null // all time
}

export function useStats(period: StatsPeriod) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['stats', user?.id, period],
    queryFn: async (): Promise<Stats> => {
      const empty: Stats = {
        created: 0, resolved: 0, open: 0,
        byCategory: { arrival: 0, assistance: 0, lead: 0, problem: 0 },
        leadsTotal: 0, leadsConverted: 0, leadsLost: 0,
        conversionRate: null, revenue: 0, avgRepairDays: null,
        contactsLogged: 0, busiestCategory: null,
      }
      if (!user) return empty

      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', user.id)
      if (error) throw error

      const all = (data ?? []) as Case[]
      const range = periodRange(period)
      const inRange = (iso: string | null) => {
        if (!range) return true
        if (!iso) return false
        const t = new Date(iso).getTime()
        return t >= range.start.getTime() && t < range.end.getTime()
      }

      // "created" cases scoped to the period by created_at
      const created = all.filter((c) => inRange(c.created_at))
      // "resolved" scoped by resolved_at
      const resolved = all.filter((c) => c.status === 'resolved' && inRange(c.resolved_at))

      const byCategory: Record<Category, number> = { arrival: 0, assistance: 0, lead: 0, problem: 0 }
      created.forEach((c) => { byCategory[c.category]++ })

      const leads = created.filter((c) => c.category === 'lead')
      const leadsConverted = leads.filter((c) => c.lead_outcome === 'converted').length
      const leadsLost = leads.filter((c) => c.lead_outcome === 'lost' || c.lead_outcome === 'no_interest').length

      // Revenue = sum of deal_value on leads converted within the period
      const revenue = all
        .filter((c) => c.lead_outcome === 'converted' && inRange(c.resolved_at) && c.deal_value)
        .reduce((sum, c) => sum + (c.deal_value ?? 0), 0)

      // Avg repair time for service cases resolved in the period
      const serviceResolved = resolved.filter((c) => c.category === 'assistance' && c.resolved_at)
      const avgRepairDays = serviceResolved.length
        ? Math.round(
            serviceResolved.reduce((sum, c) => {
              const days = (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()) / 86_400_000
              return sum + days
            }, 0) / serviceResolved.length,
          )
        : null

      const contactsLogged = created.reduce((sum, c) => sum + (c.call_count ?? 0), 0)

      let busiestCategory: Category | null = null
      let max = 0
      ;(Object.entries(byCategory) as [Category, number][]).forEach(([cat, n]) => {
        if (n > max) { max = n; busiestCategory = cat }
      })

      return {
        created: created.length,
        resolved: resolved.length,
        open: all.filter((c) => c.status === 'open').length,
        byCategory,
        leadsTotal: leads.length,
        leadsConverted,
        leadsLost,
        conversionRate: leads.length ? Math.round((leadsConverted / leads.length) * 100) : null,
        revenue,
        avgRepairDays,
        contactsLogged,
        busiestCategory,
      }
    },
    enabled: !!user,
  })
}
