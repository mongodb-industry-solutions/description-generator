import store from "@/redux/store";

export const getProductImageFromObjectId = (_id) => {
    const product = [...store.getState().Products.products].find(p => p._id === _id);
    return product?.imageUrl || null
}


export const MODELS = [
    {
      value: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
      label: "Llama 3.2 11B",
      isSelected: true
    },
    {
      value: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
      label: "Llama 3.2 90B",
      isSelected: false
    },
  ];
export  const LANGUAGES = [
    { value: "en", label: "English", isSelected: true },
    { value: "es", label: "Spanish", isSelected: false },
    { value: "fr", label: "French", isSelected: false },
    { value: "de", label: "German", isSelected: false },
    { value: "it", label: "Italian", isSelected: false },
    { value: "ja", label: "Japanese", isSelected: false },
    { value: "ko", label: "Korean", isSelected: false },
    { value: "zh", label: "Chinese", isSelected: false },
    { value: "pt", label: "Portuguese", isSelected: false },
  ];
export  const LENGTHS = [
    { value: "short", label: "Short", isSelected: true },
    { value: "medium", label: "Medium", isSelected: false },
    { value: "long", label: "Long", isSelected: false },
  ];
  