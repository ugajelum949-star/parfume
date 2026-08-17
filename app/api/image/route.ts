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
  const key = request.nextUrl.searchParams.get('key')
  if (!key || !ALLOWED_PREFIXES.some(p => key.startsWith(p))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
    const response = await s3Client.send(command)

    if (!response.Body) return NextResponse.json({ error: 'Empty body' }, { status: 404 })

    const contentType = response.ContentType || 'application/octet-stream'
    const stream = response.Body.transformToWebStream()

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch (error) {
    console.error('[ImageProxy]', key, error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
