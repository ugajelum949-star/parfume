'use client'

import { useState, useCallback } from 'react'
import { uploadImage } from '@/app/actions/upload'
import { compressImage } from '@/lib/compression'
import toast from 'react-hot-toast'

/**
 * Shared upload hook for admin pages.
 * Returns a single `handleUpload(file, onSuccess)` function.
 * Skips if no file, shows toast on success/error, manages uploading state.
 */
export function useImageUpload(folder: string) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = useCallback(async (
    file: File | undefined | null,
    onSuccess: (url: string) => void
  ) => {
    if (!file) return
    setUploading(true)
    try {
      const base64 = await compressImage(file, 0.85, 1920)
      const result = await uploadImage(base64, folder)
      if (result.success && result.url) {
        onSuccess(result.url)
        toast.success('Foto berhasil diunggah')
      } else {
        toast.error(result.error || 'Gagal mengunggah foto')
      }
    } catch (err) {
      console.error('[useImageUpload] Error type:', typeof err, 'Constructor:', err?.constructor?.name)
      console.error('[useImageUpload] Full error:', err)
      if (err instanceof Error) {
        console.error('[useImageUpload] Message:', err.message)
        console.error('[useImageUpload] Stack:', err.stack)
        // Check for React digest (error #441 etc)
        if ('digest' in err) {
          console.error('[useImageUpload] Digest:', (err as any).digest)
        }
      }
      const msg = err instanceof Error ? err.message : String(err)
      toast.error('Gagal memproses gambar: ' + msg)
    } finally {
      setUploading(false)
    }
  }, [folder])

  return { uploading, handleUpload }
}
