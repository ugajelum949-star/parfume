'use server'

import { uploadToS3 } from '@/lib/s3-storage'
import { verifyAdmin } from './auth'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export async function uploadImage(base64Data: string, folder: string) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    if (!base64Data || !folder) {
      throw new Error('Missing parameters')
    }

    // Validate MIME type
    const mimeMatch = base64Data.match(/^data:([^;]+);base64,/)
    if (mimeMatch) {
      const mimeType = mimeMatch[1].toLowerCase()
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new Error('Hanya format JPG, PNG, dan WebP yang diizinkan')
      }
    }

    // Validate estimated size
    const base64Payload = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data
    const estimatedSize = Math.ceil(base64Payload.length * 0.75)
    if (estimatedSize > MAX_FILE_SIZE) {
      throw new Error('Ukuran file melebihi batas 20MB')
    }

    // Upload directly to S3 preserving original format
    const publicUrl = await uploadToS3(base64Data, folder)

    return { success: true, url: publicUrl }
  } catch {
    console.error('[uploadImage] Upload failed')
    return { success: false, error: 'Gagal mengunggah gambar' }
  }
}
