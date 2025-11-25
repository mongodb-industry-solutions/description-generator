import { NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request) {
  const collectionName = process.env.COLLECTION_NAME || "product";

  try {
    let { _id, imageUrl } = await request.json();
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    const filter = {
        '_id': ObjectId.createFromHexString(_id),
        'imageUrl': imageUrl
    };

    const result = await collection.deleteOne(filter)

    return NextResponse.json({...result, _id, imageUrl});
  } catch (error) {
    console.error("Error removing documents:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
