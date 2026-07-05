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
    // Signed URLs live 1h; refresh a little before expiry so a case detail kept
    // open (or served from cache) doesn't end up showing broken images.
    staleTime: 55 * 60 * 1000,
    refetchInterval: 55 * 60 * 1000,
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
      // Delete the DB row first: if this fails, the file is still referenced and
      // reachable, so nothing is lost. Doing storage-first could leave a row
      // pointing at a missing file (permanent broken image) if the row delete fails.
      const { error } = await supabase.from('case_photos').delete().eq('id', photo.id)
      if (error) throw error
      // Row is gone; best-effort remove the file. A failure here only leaves an
      // orphaned blob, not a broken UI — surface it to the console, don't throw.
      const { error: storageError } = await supabase.storage.from(BUCKET).remove([photo.storage_path])
      if (storageError) console.warn('Photo file not removed from storage:', storageError.message)
    },
    onSuccess: (_data, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['photos', caseId] })
    },
  })
}
