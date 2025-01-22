import { configureStore } from '@reduxjs/toolkit';
import ProductsReducer from './slices/ProductsSlice.js'
import FormReducer from './slices/FormSlice.js'

const store = configureStore({
    reducer: {
        "Products": ProductsReducer,
        "Form": FormReducer
    }
});

export default store;
