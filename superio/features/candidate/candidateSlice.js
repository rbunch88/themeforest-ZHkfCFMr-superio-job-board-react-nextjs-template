import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // category: [...] // Removed - Filter removed from sidebar
    dateApplied: [ // Renamed from datePost - Static options seem okay for applied date ranges
        { id: 1, name: "All", value: "all", isChecked: true }, // Default to All
        { id: 2, name: "Last 24 Hour", value: "last-24-hours", isChecked: false },
        { id: 3, name: "Last 7 Days", value: "last-7-days", isChecked: false },
        { id: 4, name: "Last 14 Days", value: "last-14-days", isChecked: false },
        { id: 5, name: "Last 30 Days", value: "last-30-days", isChecked: false },
    ],
    experience: [], // Initialize as empty array - Will be populated from DB
    // qualification: [...] // Removed - Filter removed from sidebar
};

export const candidateSlice = createSlice({
    name: "candidate",
    initialState,
    reducers: {
        // Reducer to set experience levels fetched from DB
        setExperienceLevels: (state, { payload }) => {
            // Expecting payload to be an array like [{ id: uuid, name: 'Entry Level' }, ...]
            // Ensure the structure matches what ExperienceLevel component expects (id, name, isChecked)
            state.experience = payload.map(el => ({ ...el, isChecked: false }));
        },

        // Renamed from addDatePostCheck
        addDateAppliedCheck: (state, { payload }) => {
            state.dateApplied = state.dateApplied.map((item) => ({
                ...item,
                isChecked: item.id === payload, // Radio button logic
            }));
        },
        // Renamed from clearDatePost
        clearDateApplied: (state) => {
            state.dateApplied = state.dateApplied.map((item) => ({
                ...item,
                isChecked: item.value === 'all', // Default to All
            }));
        },
        addExperienceCheck: (state, { payload }) => {
             // payload should be the UUID (item.id)
            state.experience = state.experience.map((item) =>
                item.id === payload ? { ...item, isChecked: !item.isChecked } : item
            );
        },
        clearExperience: (state) => {
            state.experience = state.experience.map((item) => ({
                ...item,
                isChecked: false,
            }));
        },
        // Removed Qualification reducers
        // addQualificationCheck: ...
        // clearQualification: ...
    },
});

export const {
    setExperienceLevels, // Export new action
    addDateAppliedCheck, // Export renamed action
    clearDateApplied, // Export renamed action
    addExperienceCheck,
    clearExperience,
    // Removed Qualification actions
} = candidateSlice.actions;
export default candidateSlice.reducer;
