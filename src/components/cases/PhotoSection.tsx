import { useRef, useState } from 'react'
import { Camera, Loader2, Trash2, X, ImageIcon, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { usePhotos, useUploadPhoto, useDeletePhoto, type PhotoWithUrl } from '@/hooks/usePhotos'
import { MAX_PHOTOS_PER_CASE } from '@/types'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Props {
  caseId: string
}

export function PhotoSection({ caseId }: Props) {
  const { data: photos = [], isLoading } = usePhotos(caseId)
  const upload = useUploadPhoto()
  const remove = useDeletePhoto()
  const inputRef = useRef<HTMLInputElement>(null)

  const [viewer, setViewer]   = useState<PhotoWithUrl | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PhotoWithUrl | null>(null)

  const remaining = MAX_PHOTOS_PER_CASE - photos.length

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const slots = MAX_PHOTOS_PER_CASE - photos.length
    if (slots <= 0) {
      toast.error(`Maximum ${MAX_PHOTOS_PER_CASE} photos per case`)
      return
    }
    const toUpload = Array.from(files).slice(0, slots)
    if (files.length > slots) {
      toast.error(`Only ${slots} more photo${slots === 1 ? '' : 's'} allowed — extras skipped`)
    }
    for (const file of toUpload) {
      try {
        await upload.mutateAsync({ caseId, file })
      } catch (err: unknown) {
        const msg = (err as { message?: string })?.message || 'Upload failed'
        if (msg.toLowerCase().includes('bucket') || msg.toLowerCase().includes('not found')) {
          toast.error('Storage not set up — run migration 006_case_photos.sql', { duration: 7000 })
        } else {
          toast.error(`Upload error: ${msg}`)
        }
        break
      }
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    try {
      await remove.mutateAsync({ photo: pendingDelete, caseId })
      setPendingDelete(null)
      setViewer(null)
      toast.success('Photo deleted')
    } catch {
      toast.error('Error deleting photo')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-indigo-500" />
          Photos
          {photos.length > 0 && (
            <span className="bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
              {photos.length}/{MAX_PHOTOS_PER_CASE}
            </span>
          )}
        </h3>
        {remaining > 0 && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={upload.isPending}
            className="flex items-center gap-1 h-7 px-2.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors"
          >
            {upload.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Camera className="w-4 h-4 mr-0.5" /> Add</>}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-2">Loading...</p>
      ) : photos.length === 0 ? (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
        >
          {upload.isPending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Camera className="w-7 h-7" />
              <span className="text-sm font-medium">Take or add a photo</span>
              <span className="text-xs text-gray-400">Up to {MAX_PHOTOS_PER_CASE} — product, receipt, damage…</span>
            </>
          )}
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setViewer(photo)}
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100 active:scale-95 transition-transform"
            >
              <img
                src={photo.url}
                alt="Case attachment"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {remaining > 0 && (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={upload.isPending}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              {upload.isPending
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><Plus className="w-5 h-5" /><span className="text-[10px] font-medium">{remaining} left</span></>}
            </button>
          )}
        </div>
      )}

      {/* Fullscreen viewer */}
      {viewer && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
          onClick={() => setViewer(null)}
        >
          <button
            onClick={() => setViewer(null)}
            className="absolute top-4 right-4 touch-target rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={viewer.url}
            alt="Case attachment"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setPendingDelete(viewer) }}
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors active:scale-95"
            style={{ bottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
          >
            <Trash2 className="w-4 h-4" /> Delete photo
          </button>
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent className="max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={remove.isPending}>
              {remove.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
