import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({}); // Uses your SSO profile via env

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filename = file.name;
    const contentType = file.type;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_UPLOAD_BUCKET,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    });

    await s3.send(command);

    const fileUrl = `https://${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com/${filename}`;

    return new Response(JSON.stringify({ url: fileUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
