/**
 * Convert S3 URLs, JSON array strings, or relative paths to proxy URLs for secure, CORS-free image loading.
 * Handles:
 * - https://is3.cloudhost.id/parfume/uploads/products/file.webp -> /api/image?key=uploads%2Fproducts%2Ffile.webp
 * - ["https://is3.cloudhost.id/..."] -> /api/image?key=uploads%2Fproducts%2Ffile.webp
 * - /uploads/products/file.webp -> /api/image?key=uploads%2Fproducts%2Ffile.webp
 * - uploads/products/file.webp -> /api/image?key=uploads%2Fproducts%2Ffile.webp
 * - /api/image?key=... or local /img.png -> returned as-is
 */
export function toProxyUrl(url: string | null | undefined): string {
  if (!url) return ''

  let target = url.trim()

  // Handle JSON array string e.g. ["https://..."] or ["uploads/..."]
  if (target.startsWith('[')) {
    try {
      const parsed = JSON.parse(target)
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
        target = parsed[0].trim()
      }
    } catch {}
  }

  // Handle comma-separated list
  if (target.includes(',') && !target.startsWith('data:')) {
    target = target.split(',')[0].trim()
  }

  // Already a proxy URL or local static asset
  if (target.startsWith('/api/image') || (target.startsWith('/') && !target.includes('/uploads/'))) {
    return target
  }

  // Handle IDCloudHost S3 URLs (regardless of bucket name: parfume, app-bucket, etc.)
  if (target.includes('is3.cloudhost.id/')) {
    const afterEndpoint = target.split('is3.cloudhost.id/')[1]
    const parts = afterEndpoint.split('/')
    // First part is the bucket name, the rest is the object key
    const key = parts.slice(1).join('/')
    return `/api/image?key=${encodeURIComponent(key)}`
  }

  // Handle any other absolute URL containing /uploads/
  if (target.includes('/uploads/')) {
    const key = 'uploads/' + target.split('/uploads/')[1]
    return `/api/image?key=${encodeURIComponent(key)}`
  }

  // Handle raw key without leading slash
  if (target.startsWith('uploads/')) {
    return `/api/image?key=${encodeURIComponent(target)}`
  }

  return target
}

/**
 * Get image src with proxy conversion.
 * Use this everywhere instead of raw S3 URLs.
 */
export function getImageSrc(url: string | null | undefined): string {
  return toProxyUrl(url)
}


