/**
 * Convert S3 URLs or relative paths to proxy URLs for secure, CORS-free image loading.
 * Handles:
 * - https://is3.cloudhost.id/parfume/uploads/products/file.webp -> /api/image?key=uploads%2Fproducts%2Ffile.webp
 * - /uploads/products/file.webp -> /api/image?key=uploads%2Fproducts%2Ffile.webp
 * - uploads/products/file.webp -> /api/image?key=uploads%2Fproducts%2Ffile.webp
 * - /api/image?key=... or local /img.png -> returned as-is
 */
export function toProxyUrl(url: string | null | undefined): string {
  if (!url) return ''

  // Already a proxy URL or local static asset
  if (url.startsWith('/api/image') || (url.startsWith('/') && !url.includes('/uploads/'))) {
    return url
  }

  // Handle IDCloudHost S3 URLs (regardless of bucket name: parfume, app-bucket, etc.)
  if (url.includes('is3.cloudhost.id/')) {
    const afterEndpoint = url.split('is3.cloudhost.id/')[1]
    const parts = afterEndpoint.split('/')
    // First part is the bucket name, the rest is the object key
    const key = parts.slice(1).join('/')
    return `/api/image?key=${encodeURIComponent(key)}`
  }

  // Handle any other absolute URL containing /uploads/
  if (url.includes('/uploads/')) {
    const key = 'uploads/' + url.split('/uploads/')[1]
    return `/api/image?key=${encodeURIComponent(key)}`
  }

  // Handle raw key without leading slash
  if (url.startsWith('uploads/')) {
    return `/api/image?key=${encodeURIComponent(url)}`
  }

  return url
}

/**
 * Get image src with proxy conversion.
 * Use this everywhere instead of raw S3 URLs.
 */
export function getImageSrc(url: string | null | undefined): string {
  return toProxyUrl(url)
}

