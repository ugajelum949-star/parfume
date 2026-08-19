import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'https://is3.cloudhost.id',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

const BUCKET = process.env.S3_BUCKET || 'app-bucket';

/**
 * Upload image buffer or base64 string to S3 Storage with resilient ACL fallback.
 */
export async function uploadToS3(fileData: string | Buffer, folder: string): Promise<string> {
  let buffer: Buffer
  let ext = 'jpg'
  let mimeType = 'image/jpeg'

  if (Buffer.isBuffer(fileData)) {
    buffer = fileData
    if (fileData[0] === 0x89 && fileData[1] === 0x50) { mimeType = 'image/png'; ext = 'png' }
    else if (fileData[0] === 0x52 && fileData[1] === 0x49) { mimeType = 'image/webp'; ext = 'webp' }
    else if (fileData[0] === 0x47 && fileData[1] === 0x49) { mimeType = 'image/gif'; ext = 'gif' }
  } else {
    const matches = fileData.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      throw new Error('Format gambar base64 tidak valid')
    }
    mimeType = matches[1].toLowerCase()
    buffer = Buffer.from(matches[2], 'base64')
    if (mimeType.includes('png')) ext = 'png'
    else if (mimeType.includes('webp')) ext = 'webp'
    else if (mimeType.includes('gif')) ext = 'gif'
    else if (mimeType.includes('svg')) ext = 'svg'
  }

  const fileName = `uploads/${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileName,
    Body: buffer,
    ContentType: mimeType,
  }));

  const endpoint = process.env.S3_ENDPOINT || 'https://is3.cloudhost.id';
  return `${endpoint}/${BUCKET}/${fileName}`;
}

/**
 * Delete image from S3 based on URL.
 */
export async function deleteFromS3(fileUrl: string | null | undefined): Promise<void> {
  if (!fileUrl) return;
  try {
    const endpoint = process.env.S3_ENDPOINT || 'https://is3.cloudhost.id';
    const prefix = `${endpoint}/${BUCKET}/`;

    if (!fileUrl.startsWith(prefix)) {
      return;
    }

    const key = fileUrl.replace(prefix, '');
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }));
  } catch (err) {
    console.error(`[S3] Failed to delete ${fileUrl}:`, err);
  }
}
