// /app/api/delete-s3/route.js (if using App Router)

import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function POST(req) {
  try {
    const {key} = await req.json();
    // If the file is at the root of the bucket:
    // https://your-bucket-name.s3.amazonaws.com/my-product.jpg
    // Then the key is:
    // "my-product.jpg"

    if (!key) {
      return new Response(JSON.stringify({ error: 'Missing key' }), { status: 400 });
    }

    const s3 = new S3Client({
      region: process.env.S3_UPLOAD_REGION,
      credentials: {
        accessKeyId: process.env.S3_UPLOAD_KEY,
        secretAccessKey: process.env.S3_UPLOAD_SECRET,
      },
    });

    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_UPLOAD_BUCKET,
      Key: key,
    });

    await s3.send(command);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
