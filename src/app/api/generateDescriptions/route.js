import Together from "together-ai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export async function POST(req) {
  try {
    // Check if API key is available at runtime
    if (!process.env.TOGETHER_API_KEY) {
      return Response.json(
        { 
          error: "API key configuration error",
          message: "TOGETHER_API_KEY environment variable is required",
          code: "MISSING_API_KEY"
        }, 
        { status: 500 }
      );
    }
    
    // Initialize Together client at runtime when environment variables are available
    const together = new Together({
      apiKey: process.env.TOGETHER_API_KEY
    });
  
  const json = await req.json();
  const result = z
    .object({
      imageUrl: z.string(),
      languages: z.array(z.string()),
      model: z.string(),
      length: z.string(),
    })
    .safeParse(json);

  if (result.error) {
    return Response.json(
      { 
        error: "Validation error",
        message: "Invalid request parameters",
        details: result.error.message,
        code: "VALIDATION_ERROR"
      }, 
      { status: 422 }
    );
  }

  const { languages, imageUrl, model, length } = result.data;

  // Handle different image sources for Together AI processing
  let aiImageData = null;
  
  if (imageUrl) {
    try {
      // Check if it's an Amazon image - pass directly as URL
      if (imageUrl.includes('m.media-amazon.com') || imageUrl.includes('amazon.com')) {
        aiImageData = imageUrl; // Use URL directly for Amazon images
      } else {
        // For S3 images, extract key and fetch as base64
        let imageKey = null;
        
        if (imageUrl.includes('/api/images?key=')) {
          const urlObj = new URL(imageUrl, 'http://localhost');
          imageKey = decodeURIComponent(urlObj.searchParams.get('key') || '');
        } else if (imageUrl.includes('.s3.') || imageUrl.includes('amazonaws.com')) {
          // Extract key from direct S3 URL - handle URL encoding properly
          const url = new URL(imageUrl);
          imageKey = decodeURIComponent(url.pathname.substring(1)); // Remove leading slash and decode
        }

        if (imageKey) {
          // Fetch image from S3 using your credentials
          const s3 = new S3Client({
            region: process.env.S3_UPLOAD_REGION,
            credentials: {
              accessKeyId: process.env.S3_UPLOAD_KEY,
              secretAccessKey: process.env.S3_UPLOAD_SECRET,
            },
          });

          const command = new GetObjectCommand({
            Bucket: process.env.S3_UPLOAD_BUCKET,
            Key: imageKey, // Use the properly decoded key
          });

          console.log('Fetching S3 object with key:', imageKey);
          const response = await s3.send(command);
          const imageBuffer = await response.Body.transformToByteArray();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          
          // Determine content type
          let contentType = response.ContentType || 'image/jpeg';
          if (contentType === 'application/octet-stream') {
            const extension = imageKey.toLowerCase().split('.').pop();
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
              default:
                contentType = 'image/jpeg';
            }
          }
          
          aiImageData = `data:${contentType};base64,${base64Image}`;
        }
      }
    } catch (error) {
      console.error('Error processing image:', error);
      return Response.json(
        { 
          error: "Image processing error",
          message: "Failed to process the provided image",
          details: error.message,
          code: "IMAGE_ERROR"
        }, 
        { status: 500 }
      );
    }
  }

  if (!aiImageData) {
    return Response.json(
      { 
        error: "Missing image data",
        message: "Image is required for description generation",
        code: "NO_IMAGE"
      }, 
      { status: 400 }
    );
  }

  let descriptions;
  let rawResponse;

  try {
    console.log("--------  API CALL START --------------");
    const CONTENT_TEXT = `
      Given an image of a product, generate a JSON array containing an Amazon-like sales product description in each of the following languages: ${languages.map((language) => `"${language}"`).join(", ")}.

      - The description should be generic and must not include any brand names or copyrighted terms.
      - The desription must be a maximum of ${length === 'short' ? '30' : length === 'medium' ? '50' : '85'} words.
      - Return a JSON array with ${languages.length} objects, each following this structure: { "language": string, "description": string }.
      - The response must contain only JSON, with no extra text or explanations.
      - It is very important that you follow these instructions exactly. PLEASE ONLY RETURN JSON FORMAT, NOTHING ELSE.
      `
    console.log("--------  CONTENT TEXT --------------\n", CONTENT_TEXT);
    const res = await together.chat.completions.create({
      model,
      temperature: 0.2,
      stream: false,
      messages: [
        {
          role: "system",
          content: `You are a helpful product description generator that ONLY respondes with JSON.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: CONTENT_TEXT,
            },
            {
              type: "image_url",
              image_url: {
                url: aiImageData,
              },
            },
          ],
        },
      ],
    });
    console.log("--------  API CALL RES --------------\n", res);

    rawResponse = res.choices[0].message?.content;
    
    // Clean up markdown code blocks if present
    let cleanedResponse = rawResponse || "[]";
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/\s*```$/, '');
    }
    
    descriptions = JSON.parse(cleanedResponse);
    console.log("--------  API CALL ENDED --------------");
    console.log({ rawResponse, descriptions });
  } catch (error) {
    console.error('------- API ERROR --------\n', error);
    
    // Check if we have a response to try parsing
    if (rawResponse && rawResponse.trim()) {
      try {
        const productDescriptionSchema = z.array(
          z.object({
            model: z.string().describe("the model specified"),
            language: z.string().describe("the language specified"),
            description: z
              .string()
              .describe("the description of the product in the language specified")
          }),
        );
        const jsonSchema = zodToJsonSchema(
          productDescriptionSchema,
          "productDescriptionSchema",
        );

        const extract = await together.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "Parse out the valid JSON from this text. Only answer in JSON.",
            },
            {
              role: "user",
              content: rawResponse,
            },
          ],
          model: model,
          response_format: { type: "json_object", schema: jsonSchema },
        });

        descriptions = JSON.parse(extract?.choices?.[0]?.message?.content || "[]");
        console.log('------- PARSED FROM FALLBACK --------\n', descriptions);
      } catch (fallbackError) {
        console.error('------- FALLBACK PARSING FAILED --------\n', fallbackError);
        // Return a user-friendly error message
        return Response.json(
          { 
            error: "Generation failed", 
            message: "Failed to generate descriptions. Please try again.",
            details: error.message,
            code: error.code || "GENERATION_ERROR"
          }, 
          { status: 500 }
        );
      }
    } else {
      // No response to parse, return error directly
      console.error('------- NO RESPONSE TO PARSE --------');
      return Response.json(
        { 
          error: "API service error",
          message: "Failed to generate descriptions. The AI service returned an error.", 
          details: error.message,
          code: error.code || "API_ERROR"
        }, 
        { status: 500 }
      );
    }
  }

  return Response.json({descriptions, model, length, imageUrl});
  } catch (unhandledError) {
    console.error('------- UNHANDLED ERROR --------\n', unhandledError);
    return Response.json(
      { 
        error: "Unexpected error",
        message: "An unexpected error occurred while processing your request",
        details: unhandledError.message,
        code: "UNEXPECTED_ERROR"
      }, 
      { status: 500 }
    );
  }
}

export const runtime = "edge";
