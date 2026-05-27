import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Reminder } from '@/types'
import { useAuth } from './useAuth'

export function useReminders(caseId?: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['reminders', user?.id, caseId],
    queryFn: async () => {
      if (!user) return []

      let query = supabase
        .from('reminders')
        .select('*, case:cases(client_name, product_name, category)')
        .eq('user_id', user.id)
        .order('remind_at', { ascending: true })

      if (caseId) {
        query = query.eq('case_id', caseId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as (Reminder & { case?: { client_name: string; product_name: string | null; category: string } })[]
    },
    enabled: !!user,
  })
}

export function useUpcomingReminders() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['reminders-upcoming', user?.id],
    queryFn: async () => {
      if (!user) return []

      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('reminders')
        .select('*, case:cases(client_name, product_name, category)')
        .eq('user_id', user.id)
        .eq('sent', false)
        .gte('remind_at', now)
        .order('remind_at', { ascending: true })

      if (error) throw error
      return data as Reminder[]
    },
    enabled: !!user,
    refetchInterval: 60 * 1000, // refetch every minute
  })
}

export function useCreateReminder() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      caseId,
      remindAt,
      title,
    }: {
      caseId: string
      remindAt: string
      title: string
    }) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          case_id: caseId,
          user_id: user.id,
          remind_at: remindAt,
          title,
          sent: false,
        })
        .select()
        .single()

      if (error) throw error
      return data as Reminder
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['reminders-upcoming'] })
    },
  })
}

export function useDeleteReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reminders').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['reminders-upcoming'] })
    },
  })
}

export function useMarkReminderSent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reminders').update({ sent: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['reminders-upcoming'] })
    },
  })
}
