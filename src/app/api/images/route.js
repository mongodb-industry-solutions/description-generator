import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key'); // the S3 object key from MongoDB

  if (!key) {
    return new Response('Missing key parameter', { status: 400 });
  }

  try {
    const s3 = new S3Client({
      region: process.env.S3_UPLOAD_REGION,
      credentials: {
        accessKeyId: process.env.S3_UPLOAD_KEY,
        secretAccessKey: process.env.S3_UPLOAD_SECRET,
      },
    });

    const command = new GetObjectCommand({
      Bucket: process.env.S3_UPLOAD_BUCKET,
      Key: key,
    });

    const response = await s3.send(command);

    // Get content type from S3 metadata or detect from file extension
    let contentType = response.ContentType || 'application/octet-stream';
    
    // Fallback content type detection from file extension if not available
    if (contentType === 'application/octet-stream') {
      const extension = key.toLowerCase().split('.').pop();
      switch (extension) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'svg':
          contentType = 'image/svg+xml';
          break;
        default:
          contentType = 'image/jpeg'; // default fallback
      }
    }

    // Convert the readable stream to a web stream for Next.js response
    const stream = response.Body;

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Length': response.ContentLength?.toString() || '',
      },
    });

  } catch (error) {
    console.error('Error fetching image from S3:', error);
    
    if (error.name === 'NoSuchKey') {
      return new Response('Image not found', { status: 404 });
    }
    
    return new Response('Error fetching image', { status: 500 });
  }
}
