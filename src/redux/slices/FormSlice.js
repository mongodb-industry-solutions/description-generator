import { createSlice } from "@reduxjs/toolkit";

export const MODELS = [
    {
      value: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
      label: "Llama 3.2 11B",
      isSelected: true,
      isSelectedFilter: true

    },
    {
      value: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
      label: "Llama 3.2 90B",
      isSelected: false,
      isSelectedFilter: false
    },
  ];
  export const LANGUAGES = [
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
  export const LENGTHS = [
    { value: "short", label: "Short", isSelected: true, isSelectedFilter: true },
    { value: "medium", label: "Medium", isSelected: false, isSelectedFilter: false },
    { value: "long", label: "Long", isSelected: false, isSelectedFilter: false },
  ];
  
const FormSlice = createSlice({
    name: "Form",
    initialState: {
        descriptionIsLoading: false,
        error: null,         // null or {msg: ""}
        image: null, // null or image URL
        selectedModel: MODELS[0]?.value,
        models: MODELS,
        selectedLength: LENGTHS[0]?.value,
        lengths: LENGTHS,
        selectedLanguages: [LANGUAGES[0]?.value],
        languages: LANGUAGES,
        result: null, // null or [] ,
        generatingDescription: false
    },
    reducers: {
        setLoading: (state, action) => {
            return { ...state, searchIsLoading: action.payload }
        },
        setError: (state, action) => {
            if (error === null)
                return { ...state, error: null }
            else
                return { ...state, error: { ...action.payload } }
        },
        setImage: (state, action) => {
            return { ...state, image: action.payload }
        },
        setModel: (state, action) => {
            let newState = { ...state, selectedModel: action.payload }
            newState.models = newState.models.map(model => ({ ...model, isSelected: model.value === action.payload }))
            return { ...newState }
        },
        setLength: (state, action) => {
            let newState = { ...state, selectedLength: action.payload }
            newState.lengths = newState.lengths.map(length => ({ ...length, isSelected: length.value === action.payload }))
            return { ...newState }
        },
        setModelFilter: (state, action) => {
            let newState = { ...state }
            newState.models = newState.models.map(model => ({ ...model, isSelectedFilter: model.value === action.payload }))
            return { ...newState }
        },
        setLengthFilter: (state, action) => {
            console.log(state)
            let newState = { ...state }
            newState.lengths = newState.lengths.map(length => ({ ...length, isSelectedFilter: length.value === action.payload }))
            return { ...newState }
        },
        setLanguage: (state, action) => {
            let newState = { ...state }
            if (newState.selectedLanguages.includes(action.payload)) {
                //remove language from selection
                newState.selectedLanguages = newState.selectedLanguages.filter(l => l !== action.payload);
                newState.languages = newState.languages.map(option => {
                    return option.value === action.payload
                        ? { ...option, isSelected: false }
                        : { ...option }
                })
            } else {
                // add language to selection
                newState.selectedLanguages = [...newState.selectedLanguages, action.payload]
                newState.languages = newState.languages.map(option => {
                        return option.value === action.payload
                            ? { ...option, isSelected: true }
                            : { ...option }
                    }
                    )
            }
            console.log(newState)
            return {...newState}
        },
        setResult: (state, action) => {
            return { ...state, result: {...action.payload} }
        },
        setGeneratingDescription: (state, action) => {
            return { ...state, generatingDescription: action.payload }
        },
    }
})

export const {
    setLoading,
    setError,
    setImage,
    setModel,
    setLength,
    setLanguage,
    setResult,
    setGeneratingDescription,
    setModelFilter,
    setLengthFilter
} = FormSlice.actions

export default FormSlice.reducer
