import store from "@/redux/store";

export const MODELS = store.getState().Form.models
export const LANGUAGES = store.getState().Form.languages
export const LENGTHS = store.getState().Form.lengths

export const getProductFromObjectId = (_id) => {
  const product = [...store.getState().Products.products].find(p => p._id === _id);
  return product || null
}
export const getProductImageFromObjectId = (_id) => {
  const product = [...store.getState().Products.products].find(p => p._id === _id);
  return product?.imageUrl || null
}
