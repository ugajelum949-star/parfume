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
      console.error('Upload error:', err)
      toast.error('Gagal memproses gambar: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setUploading(false)
    }
  }, [folder])

  return { uploading, handleUpload }
}
