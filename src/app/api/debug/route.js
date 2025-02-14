export async function GET(req) {
    return Response.json({
        key: process.env.S3_UPLOAD_KEY,
        secret: process.env.S3_UPLOAD_SECRET ? "EXISTS" : "MISSING",
        bucket: process.env.S3_UPLOAD_BUCKET,
        region: process.env.S3_UPLOAD_REGION
    });
}
