import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { compressImage } from '@/lib/utils'
import { useAuth } from './useAuth'
import type { CasePhoto } from '@/types'

const BUCKET = 'case-photos'

export interface PhotoWithUrl extends CasePhoto {
  url: string
}

export function usePhotos(caseId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['photos', caseId],
    queryFn: async (): Promise<PhotoWithUrl[]> => {
      if (!caseId || !user) return []

      const { data: rows, error } = await supabase
        .from('case_photos')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: true })

      if (error) throw error
      const photos = (rows ?? []) as CasePhoto[]

      // Signed URLs (bucket is private) valid for 1 hour
      const withUrls = await Promise.all(
        photos.map(async (p) => {
          const { data } = await supabase
            .storage
            .from(BUCKET)
            .createSignedUrl(p.storage_path, 60 * 60)
          return { ...p, url: data?.signedUrl ?? '' }
        }),
      )
      return withUrls
    },
    enabled: !!caseId && !!user,
  })
}

export function useUploadPhoto() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ caseId, file }: { caseId: string; file: File }) => {
      if (!user) throw new Error('Not authenticated')

      const blob = await compressImage(file)
      const path = `${user.id}/${caseId}/${crypto.randomUUID()}.jpg`

      const { error: uploadError } = await supabase
        .storage
        .from(BUCKET)
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false })

      if (uploadError) throw uploadError

      const { error: insertError } = await supabase
        .from('case_photos')
        .insert({ case_id: caseId, user_id: user.id, storage_path: path })

      if (insertError) {
        // Roll back the orphaned file if the DB row failed
        await supabase.storage.from(BUCKET).remove([path])
        throw insertError
      }
    },
    onSuccess: (_data, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['photos', caseId] })
    },
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ photo }: { photo: CasePhoto; caseId: string }) => {
      await supabase.storage.from(BUCKET).remove([photo.storage_path])
      const { error } = await supabase.from('case_photos').delete().eq('id', photo.id)
      if (error) throw error
    },
    onSuccess: (_data, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['photos', caseId] })
    },
  })
}
