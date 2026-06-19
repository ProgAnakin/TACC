import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Case, Category } from '@/types'

export type StatsPeriod = 'this_week' | 'this_month' | 'last_month' | 'all'

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
  delta: { created: number | null; resolved: number | null; revenue: number | null }
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7))
  d.setHours(0, 0, 0, 0)
  return d
}

function periodRange(period: StatsPeriod): { start: Date; end: Date } | null {
  const now = new Date()
  if (period === 'this_week') {
    const start = startOfWeek(now)
    const end = new Date(start)
    end.setDate(start.getDate() + 7)
    return { start, end }
  }
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
  return null
}

function previousPeriodRange(period: StatsPeriod): { start: Date; end: Date } | null {
  const now = new Date()
  if (period === 'this_week') {
    const start = startOfWeek(now)
    start.setDate(start.getDate() - 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 7)
    return { start, end }
  }
  if (period === 'this_month') {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end:   new Date(now.getFullYear(), now.getMonth(), 1),
    }
  }
  if (period === 'last_month') {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      end:   new Date(now.getFullYear(), now.getMonth() - 1, 1),
    }
  }
  return null
}

function inRange(range: { start: Date; end: Date } | null, iso: string | null): boolean {
  if (!range) return true
  if (!iso) return false
  const t = new Date(iso).getTime()
  return t >= range.start.getTime() && t < range.end.getTime()
}

export function useStats(period: StatsPeriod) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['stats', user?.id, period],
    queryFn: async (): Promise<Stats> => {
      const noDelta: Stats['delta'] = { created: null, resolved: null, revenue: null }
      const empty: Stats = {
        created: 0, resolved: 0, open: 0,
        byCategory: { arrival: 0, assistance: 0, lead: 0, problem: 0 },
        leadsTotal: 0, leadsConverted: 0, leadsLost: 0,
        conversionRate: null, revenue: 0, avgRepairDays: null,
        contactsLogged: 0, busiestCategory: null,
        delta: noDelta,
      }
      if (!user) return empty

      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', user.id)
      if (error) throw error

      const all      = (data ?? []) as Case[]
      const range    = periodRange(period)
      const prevRange = previousPeriodRange(period)

      const created  = all.filter(c => inRange(range, c.created_at))
      const resolved = all.filter(c => c.status === 'resolved' && inRange(range, c.resolved_at))

      const byCategory: Record<Category, number> = { arrival: 0, assistance: 0, lead: 0, problem: 0 }
      created.forEach(c => { byCategory[c.category]++ })

      const leads          = created.filter(c => c.category === 'lead')
      const leadsConverted = leads.filter(c => c.lead_outcome === 'converted').length
      const leadsLost      = leads.filter(c => c.lead_outcome === 'lost' || c.lead_outcome === 'no_interest').length

      const revenue = all
        .filter(c => c.lead_outcome === 'converted' && inRange(range, c.resolved_at) && c.deal_value)
        .reduce((sum, c) => sum + (c.deal_value ?? 0), 0)

      const serviceResolved = resolved.filter(c => c.category === 'assistance' && c.resolved_at)
      const avgRepairDays   = serviceResolved.length
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

      let delta: Stats['delta'] = noDelta
      if (prevRange) {
        const prevCreated  = all.filter(c => inRange(prevRange, c.created_at))
        const prevResolved = all.filter(c => c.status === 'resolved' && inRange(prevRange, c.resolved_at))
        const prevRevenue  = all
          .filter(c => c.lead_outcome === 'converted' && inRange(prevRange, c.resolved_at) && c.deal_value)
          .reduce((sum, c) => sum + (c.deal_value ?? 0), 0)
        delta = {
          created:  created.length  - prevCreated.length,
          resolved: resolved.length - prevResolved.length,
          revenue:  revenue         - prevRevenue,
        }
      }

      return {
        created: created.length,
        resolved: resolved.length,
        open: all.filter(c => c.status === 'open').length,
        byCategory,
        leadsTotal: leads.length,
        leadsConverted,
        leadsLost,
        conversionRate: leads.length ? Math.round((leadsConverted / leads.length) * 100) : null,
        revenue,
        avgRepairDays,
        contactsLogged,
        busiestCategory,
        delta,
      }
    },
    enabled: !!user,
  })
}
