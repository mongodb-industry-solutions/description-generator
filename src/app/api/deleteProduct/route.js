import { NextResponse } from "next/server";
import { connectToDatabase, closeDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request) {
  const dbName = process.env.DB_NAME;
  const collectionName = process.env.COLLECTION_NAME;

  try {
    let { _id, imageUrl } = await request.json();
    const collection = await connectToDatabase(dbName, collectionName);
    const filter = {
        '_id': ObjectId.createFromHexString(_id),
        'imageUrl': imageUrl
    };

    const result = await collection.deleteOne(filter)

    return NextResponse.json({...result, _id, imageUrl});
  } catch (error) {
    console.error("Error removing documents:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    //await closeDatabase();
  }
}
