import { NextResponse } from "next/server";
import { connectToDatabase, closeDatabase } from "@/lib/mongodb";

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

    const result = await collection.updateOne(filter, pipeline)
    console.log(`Modified ${result.modifiedCount} document(s).`);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    //await closeDatabase();
  }
}
// const de = {
//     "en": {
//         "sh_mod1": "The image shows a yellow leather purse ",
//         "md_mod2": "The image shows a yellow leather purse with a strap and a small metal tag that says \"EDEN & IVY\". The purse is made of yellow leather and has a flap closure with a strap that can be worn over the shoulder. The strap is made of the same yellow leather as the purse and has a gold buckle. The purse is sitting on a white surface, and its reflection can be seen below it."
//     },
//     "es": {
//         "sh_mod1": "La imagen muestra una bolsa de cuero amarillo con una corredera y una pequeña placa metálica que dice \"EDEN & IVY\". La bolsa está hecha de cuero amarillo y tiene una cerradura de tapa con una corredera que se puede llevar sobre los hombros. La corredera está hecha de cuero amarillo del mismo que la bolsa y tiene un broche dorado. La bolsa está sentada sobre una superficie blanca, y su reflejo se puede ver debajo de ella."
//     },
//     "fr": {
//         "sh_mod1": "L&#39;image montre un sac en cuir jaune avec une sangle et une petite plaque métallique qui dit \"EDEN & IVY\".",
//         "md_mod2": "L&#39;image montre un sac en cuir jaune avec une sangle et une petite plaque métallique qui dit \"EDEN & IVY\". Le sac est fait en cuir jaune et a une fermeture à clapet avec une sangle qui peut être portée sur l&#39;épaule. La sangle est faite en cuir jaune du même que le sac et a un boucle en or. Le sac est assis sur une surface blanche, et son reflet peut être vu en dessous de lui."
//     }
// }