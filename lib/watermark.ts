import sharp from 'sharp'
import { readFile } from 'fs/promises'
import { join } from 'path'

/**
 * Apply tiled logo watermark — small, transparent, many.
 */
export async function applyWatermark(base64Data: string): Promise<Buffer> {
  const matches = base64Data.match(/^data:[A-Za-z-+/]+;base64,(.+)$/)
  const imageBuffer = Buffer.from(matches ? matches[1] : base64Data, 'base64')

  const metadata = await sharp(imageBuffer).metadata()
  const w = metadata.width || 800

  // Load logo — small tiles, many of them
  const logoPath = join(process.cwd(), 'public', 'img.png')
  let logoBuffer: Buffer
  try {
    logoBuffer = await readFile(logoPath)
  } catch {
    throw new Error('Watermark logo not found at public/img.png')
  }
  const tileSize = Math.round(w / 5) // smaller = more logos

  // Resize + 4% opacity
  const logoTile = await sharp(logoBuffer)
    .resize(tileSize)
    .png()
    .ensureAlpha()
    .composite([{
      input: Buffer.from([0, 0, 0, Math.round(255 * 0.04)]),
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
      blend: 'dest-in',
    }])
    .toBuffer()

  return sharp(imageBuffer)
    .jpeg({ quality: 90 })
    .composite([{ input: logoTile, tile: true, blend: 'over' }])
    .toBuffer()
}
