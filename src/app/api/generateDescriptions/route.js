import Together from "together-ai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export async function POST(req) {
  // Check if API key is available at runtime
  if (!process.env.TOGETHER_API_KEY) {
    return new Response("TOGETHER_API_KEY environment variable is required", { status: 500 });
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
    return new Response(result.error.message, { status: 422 });
  }

  const { languages, imageUrl, model, length } = result.data;

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
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });
    console.log("--------  API CALL RES --------------\n", res);

    rawResponse = res.choices[0].message?.content;
    descriptions = JSON.parse(rawResponse || "[]");
    console.log("--------  API CALL ENDED --------------");
    console.log({ rawResponse, descriptions });
  } catch (error) {
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
          content: rawResponse || "",
        },
      ],
      model: model,// "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      response_format: { type: "json_object", schema: jsonSchema },
    });

    descriptions = JSON.parse(extract?.choices?.[0]?.message?.content || "[]");
    console.error('------- ERROR DESC --------\n', descriptions);
    console.error('------- ERROR ERR--------\n', error);
    return Response.json(error);

  }

  return Response.json({descriptions, model, length, imageUrl});
}

export const runtime = "edge";
