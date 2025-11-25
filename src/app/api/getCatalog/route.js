import { NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";

export async function POST() {
  const collectionName = process.env.COLLECTION_NAME || "product";

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).sort({ _id: -1 }).toArray();

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
