import store from "@/redux/store";

export const getProductImageFromObjectId = (_id) => {
    const product = [...store.getState().Products.products].find(p => p._id === _id);
    return product?.imageUrl || null
}