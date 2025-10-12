// src/store/translationSlice/translationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const translationSlice = createSlice({
    name: "translation",
    initialState: {
        translatingCount: 0,
    },
    reducers: {
        startTranslating(state) {
            state.translatingCount += 1;
        },
        stopTranslating(state) {
            state.translatingCount = Math.max(0, state.translatingCount - 1);
        },
    },
});

export const { startTranslating, stopTranslating } = translationSlice.actions;
export default translationSlice.reducer;
