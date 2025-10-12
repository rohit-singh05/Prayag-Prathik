import { configureStore } from "@reduxjs/toolkit";
import languageReducer from "./languageSlice/languageSlice";
import translationReducer from "./translationSlice/translationSlice"

export const store = configureStore({
  reducer: {
    language: languageReducer,
    translation: translationReducer,
  },
});