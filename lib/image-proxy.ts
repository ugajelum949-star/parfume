/**
 * Convert S3 URLs to proxy URLs for secure, CORS-free image loading.
 * Input:  https://is3.cloudhost.id/app-bucket/uploads/products/file.jpg
 * Output: /api/image?key=uploads/products/file.jpg
 *
 * Already-proxied or external URLs are returned unchanged.
 */
export function toProxyUrl(url: string | null | undefined): string {
  if (!url) return ''

  // Already a proxy URL or relative path
  if (url.startsWith('/api/image') || url.startsWith('/')) return url

  // External URLs (non-S3) — return as-is
  const s3Endpoint = process.env.NEXT_PUBLIC_S3_ENDPOINT || 'https://is3.cloudhost.id'
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || 'app-bucket'
  const prefix = `${s3Endpoint}/${bucket}/`

  if (url.startsWith(prefix)) {
    const key = url.slice(prefix.length)
    return `/api/image?key=${encodeURIComponent(key)}`
  }

  // Unknown format — return as-is
  return url
}

/**
 * Get image src with proxy conversion.
 * Use this everywhere instead of raw S3 URLs.
 */
export function getImageSrc(url: string | null | undefined): string {
  return toProxyUrl(url)
}
