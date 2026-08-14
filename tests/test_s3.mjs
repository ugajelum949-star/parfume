import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
config();

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'https://is3.cloudhost.id',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

async function test() {
  try {
    const BUCKET = process.env.S3_BUCKET || 'app-bucket';
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: 'test-upload.txt',
      Body: 'hello world',
      ContentType: 'text/plain',
      ACL: 'public-read',
    });
    console.log('Sending test file to S3...');
    await s3Client.send(command);
    console.log('✅ S3 Upload Test Success!');
  } catch(e) {
    console.error('❌ S3 Upload Test Failed:', e.name, e.message);
  }
}

test().then(() => console.log('Done')).catch(console.error);
