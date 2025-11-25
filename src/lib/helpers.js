import { setImage } from "@/redux/slices/FormSlice";
import store from "@/redux/store";

export const MODELS = store.getState().Form.models
export const LANGUAGES = store.getState().Form.languages
export const LENGTHS = store.getState().Form.lengths

export const getProductFromObjectId = (_id) => {
  const product = [...store.getState().Products.products].find(p => p._id === _id);
  return product || null
}
export const setProductImageInFormFromObjectId = (_id) => {
  const product = [...store.getState().Products.products].find(p => p._id === _id);
  const imageUrl = product?.imageUrl || null
  store.dispatch(setImage(imageUrl));
  return imageUrl
}

export const getS3KeyFromUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    // Remove the first slash at the start of pathname
    return parsedUrl.pathname.replace(/^\/+/, '');
  } catch (err) {
    console.error('Invalid S3 URL:', url);
    return null;
  }
}

export const getDisplayImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Amazon images should be displayed directly
  if (imageUrl.includes('m.media-amazon.com') || imageUrl.includes('amazon.com')) {
    return imageUrl;
  }
  
  // S3 images should be served through our backend API
  const s3Key = getS3KeyFromUrl(imageUrl);
  if (s3Key) {
    return `/api/images?key=${encodeURIComponent(s3Key)}`;
  }
  
  // Fallback to original URL if we can't process it
  return imageUrl;
}