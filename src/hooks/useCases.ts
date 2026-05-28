import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Case, Category, Status, Urgency } from '@/types'
import { useAuth } from './useAuth'

export interface CaseFilters {
  category?: Category | 'all'
  status?: Status | 'all'
  urgency?: Urgency | 'all'
  search?: string
  sortBy?: 'newest' | 'oldest' | 'urgency' | 'name'
}

const URGENCY_ORDER: Record<Urgency, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
}

function applySorting(cases: Case[], sortBy?: string): Case[] {
  const sorted = [...cases]
  switch (sortBy) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    case 'urgency':
      return sorted.sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency])
    case 'name':
      return sorted.sort((a, b) => a.client_name.localeCompare(b.client_name, 'pt-BR'))
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
}

export function useCases(filters: CaseFilters = {}) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['cases', user?.id, filters],
    queryFn: async () => {
      if (!user) return []

      let query = supabase
        .from('cases')
        .select('*')
        .eq('user_id', user.id)

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }
      if (filters.urgency && filters.urgency !== 'all') {
        query = query.eq('urgency', filters.urgency)
      }
      if (filters.search) {
        const term = `%${filters.search}%`
        query = query.or(
          `client_name.ilike.${term},client_phone.ilike.${term},shopify_order.ilike.${term},product_name.ilike.${term}`,
        )
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      return applySorting(data as Case[], filters.sortBy)
    },
    enabled: !!user,
  })
}

export function useCase(id: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['case', id],
    queryFn: async () => {
      if (!id || !user) return null

      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data as Case
    },
    enabled: !!id && !!user,
  })
}

// Fields guaranteed to exist in the original schema
type CreateCaseInput = Pick<Case,
  'client_name' | 'client_phone' | 'client_email' | 'shopify_order' | 'product_name' |
  'category' | 'urgency' | 'cause' | 'notes' | 'status' | 'resolved_at'
> & Record<string, unknown>

export function useCreateCase() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (values: CreateCaseInput) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('cases')
        .insert({
          ...values,
          user_id: user.id,
          call_count: 0,
        })
        .select()
        .single()

      if (error) throw error
      return data as Case
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
  })
}

export function useUpdateCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Case> & { id: string }) => {
      const { data, error } = await supabase
        .from('cases')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Case
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      queryClient.invalidateQueries({ queryKey: ['case', data.id] })
    },
  })
}

export function useDeleteCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cases').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
  })
}

export function useResolveCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('cases')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Case
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      queryClient.invalidateQueries({ queryKey: ['case', data.id] })
    },
  })
}

export function useCaseStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['case-stats', user?.id],
    queryFn: async () => {
      if (!user) return { open: 0, resolvedToday: 0, totalResolved: 0, byCategory: {} }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: openCases } = await supabase
        .from('cases')
        .select('category')
        .eq('user_id', user.id)
        .eq('status', 'open')

      const { data: resolvedToday } = await supabase
        .from('cases')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'resolved')
        .gte('resolved_at', today.toISOString())

      const { data: totalResolved } = await supabase
        .from('cases')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'resolved')

      const byCategory: Record<string, number> = {}
      ;(openCases || []).forEach((c) => {
        byCategory[c.category] = (byCategory[c.category] || 0) + 1
      })

      return {
        open: openCases?.length || 0,
        resolvedToday: resolvedToday?.length || 0,
        totalResolved: totalResolved?.length || 0,
        byCategory,
      }
    },
    enabled: !!user,
  })
}
