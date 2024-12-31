import { createSlice } from "@reduxjs/toolkit";

const ProductsSlice = createSlice({
    name: "Products",
    initialState: {
        products: [], // [{...}, {...}, ...]
        searchIsLoading: false,
        initialLoad: false,
        error: null,         // null or {msg: ""}
        openedProductDetails: null // null or {...} este es el 
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
        setInitialLoad: (state, action) => {
            return { ...state, initialLoad: action.payload }
        },
        setSearchTypeValue: (state, action) => {
            return {
                ...state,
                searchType: action.payload
            }
        },
        setProducts: (state, action) => {
            return {
                ...state,
                products: [...action.payload],
                searchIsLoading: false,
                error: null,

            }
        },
        updateProductDescriptions: (state, action) => {
            console.log('updateProductDescriptions', action.payload)
            const {
                languages,
                imageUrl,
                model,
                length,
                descriptions
              } = action.payload        
            let prodIndex = [...state.products].findIndex(p =>  p.imageUrl === imageUrl)
            for (let index = 0; index < descriptions.length; index++) {
                const description = descriptions[index];
                const path = `${length}_${model.replaceAll('.', '')}`
                state.products[prodIndex].descriptions[description.language] = {...state.products[prodIndex].descriptions[description.language]}
                state.products[prodIndex].descriptions[description.language][path] = description.description
            }
        },
        setOpenedProductDetails: (state, action) => {
            let newOpenedProductDetails = action.payload == null ? null : {...action.payload}
            console.log('newOpenedProductDetails, ', newOpenedProductDetails)
            return {
                ...state,
                openedProductDetails: newOpenedProductDetails,
            }
        }

    }
})

export const {
    setLoading,
    setError,
    setSearchTypeValue,
    setProducts,
    setInitialLoad,
    setFilters,
    setQuery,
    updateProductPrice,
    setOpenedProductDetails,
    updateProductDescriptions
} = ProductsSlice.actions

export default ProductsSlice.reducer
