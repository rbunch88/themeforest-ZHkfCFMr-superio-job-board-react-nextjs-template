import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // Removed job list filter properties (keyword, location, category, jobType, etc.)
    // Kept destination as it might be used elsewhere (e.g., map)
    jobList: {
        destination: {
            min: 0,
            max: 100,
        },
        // category: "", // Example: Keep category if needed for something else
    },
    jobSort: {
        sort: "",
        perPage: {
            start: 0,
            end: 0,
        },
    },
};

export const filterSlice = createSlice({
    name: "filter",
    initialState,
    reducers: {
        // Removed reducers for keyword, location, category, jobType, datePosted, experience, salary, tag
        // Kept addDestination and potentially addCategory if needed elsewhere
        addDestination: (state, { payload }) => {
             state.jobList.destination.min = payload.min;
             state.jobList.destination.max = payload.max;
        },
        // addCategory: (state, { payload }) => {
        //     state.jobList.category = payload;
        // },
        addSort: (state, { payload }) => {
            state.jobSort.sort = payload;
        },
        // Removed addTag reducer
        addPerPage: (state, { payload }) => {
            state.jobSort.perPage.start = payload.start;
            state.jobSort.perPage.end = payload.end;
        },
    },
});

export const {
    // Removed exports for keyword, location, category, jobType, datePosted, experience, salary, tag actions
    addDestination,
    // addCategory, // Keep if reducer is kept
    addSort,
    addPerPage,
} = filterSlice.actions;
export default filterSlice.reducer;
