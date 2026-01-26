import { createSlice } from "@reduxjs/toolkit";

export const MODELS = [
    {
        value: "ServiceNow-AI/Apriel-1.5-15b-Thinker",
        label: "Apriel 1.5 15b Thinker",
        isSelected: false,
        isSelectedFilter: false
    },
    {
        value: "meta-llama/Llama-Vision-Free",
        label: "Llama 3.2 11B Free",
        isSelected: false,
        isSelectedFilter: false,
        isDisabled:true
    },
    {
        value: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
        label: "Llama 4 Maverick",
        isSelected: true,
        isSelectedFilter: true,
    },
];
export const LANGUAGES = [
    { value: "en", label: "English", isSelected: true},
    { value: "es", label: "Spanish", isSelected: false },
    { value: "fr", label: "French", isSelected: false },
    { value: "de", label: "German", isSelected: false },
    { value: "it", label: "Italian", isSelected: false },
    { value: "pt", label: "Portuguese", isSelected: false},
    { value: "ja", label: "Japanese", isSelected: false },
    { value: "ko", label: "Korean", isSelected: false },
    { value: "zh", label: "Chinese", isSelected: false},
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
        selectedModel: MODELS.find(model => model.isSelected === true)?.value,
        models: MODELS,
        selectedLength: LENGTHS[0]?.value,
        lengths: LENGTHS,
        selectedLanguages: [LANGUAGES[0]?.value],
        languages: LANGUAGES,
        disabledLanguages: ['ja', 'ko', 'zh'],
        result: null, // null or {} , This is what we show in the UI of the form page, where we have the results for a specific product after sending the form
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
            return { ...newState }
        },
        setResult: (state, action) => {
            console.log(action.payload)
            if(action.payload === null)
                return {
                    ...state,
                    result: null
                }
            return {
                ...state,
                result: {
                    ...action.payload,
                    descriptions: [...action.payload.descriptions],
                    model: action.payload.model,
                    length: action.payload.length,
                    imageUrl: action.payload.imageUrl
                }
            }
        },
        updateResult: (state, action) => {
            // called when we update one description from the form UI
            const languageToUpdate = action.payload.language
            const newDescription = action.payload.description
            for (let i = 0; i < state.result.descriptions?.length; i++) {
                if ( state.result.descriptions[i].language === languageToUpdate) {
                    state.result.descriptions[i].description = newDescription;
                    break; // Exit the loop once the object is found and updated
                }
            }
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
    updateResult,
    setGeneratingDescription,
    setModelFilter,
    setLengthFilter
} = FormSlice.actions

export default FormSlice.reducer
