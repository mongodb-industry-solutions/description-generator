import { NextResponse } from "next/server";
import { connectToDatabase, closeDatabase } from "@/lib/mongodb";
// Purpose: Push or Update descriptions for a specific priduct
// Request: the product's descriptions yo update or add, the model, length and imageUrl
// Return: The entire product document updated.

export async function POST(request) {
  const dbName = process.env.DB_NAME;
  const collectionName = process.env.COLLECTION_NAME;

  try {
    let { descriptions, model, length, imageUrl } = await request.json();
    console.log({ descriptions, model, length, imageUrl })
    const collection = await connectToDatabase(dbName, collectionName);
    const setDescriptionsPipeline = {}
    for (let index = 0; index < descriptions.length; index++) {
        const description = descriptions[index];
        const path = `descriptions.${description.language}.${length}_${model.replaceAll('.', '')}`
        setDescriptionsPipeline[path] = description.description
    }
    const filter = {'imageUrl': imageUrl};
    const pipeline = {
        $set: setDescriptionsPipeline
    }

    const result = await collection.findOneAndUpdate(filter, pipeline, {returnDocument: 'after'})
    console.log(`Modified ${result.modifiedCount} document(s).`);
    console.log(result)
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    //await closeDatabase();
  }
}
