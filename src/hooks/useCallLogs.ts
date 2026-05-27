import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { CallLog } from '@/types'
import { useAuth } from './useAuth'

export function useCallLogs(caseId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['call-logs', caseId],
    queryFn: async () => {
      if (!caseId || !user) return []

      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('case_id', caseId)
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })

      if (error) throw error
      return data as CallLog[]
    },
    enabled: !!caseId && !!user,
  })
}

export function useLogCall() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ caseId, notes }: { caseId: string; notes?: string }) => {
      if (!user) throw new Error('Not authenticated')

      // Insert call log
      const { data: log, error: logError } = await supabase
        .from('call_logs')
        .insert({
          case_id: caseId,
          user_id: user.id,
          notes: notes || null,
        })
        .select()
        .single()

      if (logError) throw logError

      // Increment call count on the case
      const { error: updateError } = await supabase.rpc('increment_call_count', {
        case_id: caseId,
      })

      // If RPC doesn't exist, do it manually
      if (updateError) {
        const { data: caseData } = await supabase
          .from('cases')
          .select('call_count')
          .eq('id', caseId)
          .single()

        await supabase
          .from('cases')
          .update({
            call_count: (caseData?.call_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', caseId)
      }

      return log as CallLog
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['call-logs', variables.caseId] })
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] })
      queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
  })
}
