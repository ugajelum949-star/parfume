import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const ALLOWED_PREFIXES = ['uploads/']

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'https://is3.cloudhost.id',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true,
})

const BUCKET = process.env.S3_BUCKET || 'app-bucket'

export async function GET(request: NextRequest) {
  const rawKey = request.nextUrl.searchParams.get('key')
  if (!rawKey) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 })
  }

  const key = rawKey.replace(/^\/+/, '')
  if (!ALLOWED_PREFIXES.some(p => key.startsWith(p))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
    const response = await s3Client.send(command)

    if (!response.Body) return NextResponse.json({ error: 'Empty body' }, { status: 404 })

    let contentType = response.ContentType
    if (!contentType || contentType === 'application/octet-stream') {
      if (key.endsWith('.webp')) contentType = 'image/webp'
      else if (key.endsWith('.png')) contentType = 'image/png'
      else if (key.endsWith('.svg')) contentType = 'image/svg+xml'
      else if (key.endsWith('.gif')) contentType = 'image/gif'
      else contentType = 'image/jpeg'
    }

    const stream = response.Body.transformToWebStream()

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    console.error('[ImageProxy]', key, error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
