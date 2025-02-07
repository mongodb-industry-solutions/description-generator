import { configureStore } from '@reduxjs/toolkit';
import ProductsReducer from './slices/ProductsSlice.js'
import FormReducer from './slices/FormSlice.js'
import AlertReducer from './slices/AlertSlice.js'

const store = configureStore({
    reducer: {
        "Products": ProductsReducer,
        "Form": FormReducer,
        "Alerts": AlertReducer,
    }
});

export default store;
