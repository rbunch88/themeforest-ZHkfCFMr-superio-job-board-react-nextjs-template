import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    latestJob: ["full-time"],
    category: [], // Keep category structure if needed elsewhere, but options are fetched in Categories.jsx
    jobTypeList: [], // Initialize as empty array
    datePost: [ // Keep datePost as its values are static and used in FilterJobsBox logic
        { id: 1, name: "All", value: "all", isChecked: false },
        { id: 2, name: "Last 24 Hour", value: "last-24-hours", isChecked: false }, // Corrected value based on FilterJobsBox
        { id: 3, name: "Last 7 Days", value: "last-7-days", isChecked: false },
        { id: 4, name: "Last 14 Days", value: "last-14-days", isChecked: false },
        { id: 5, name: "Last 30 Days", value: "last-30-days", isChecked: false },
        // Removed "Last Hour" as it wasn't in FilterJobsBox logic
    ],
    experienceLevel: [], // Initialize as empty array
    tags: [], // Initialize as empty array
};

export const jobSlice = createSlice({
    name: "job",
    initialState,
    reducers: {
        // Reducer to set job types fetched from DB
        setJobTypes: (state, { payload }) => {
            // Expecting payload to be an array like [{ id: uuid, name: 'Full Time' }, ...]
            state.jobTypeList = payload.map(jt => ({ ...jt, isChecked: false }));
        },
        // Reducer to set experience levels fetched from DB
        setExperienceLevels: (state, { payload }) => {
            // Expecting payload to be an array like [{ id: uuid, name: 'Entry Level' }, ...]
            state.experienceLevel = payload.map(el => ({ ...el, isChecked: false }));
        },
        // Reducer to set tags fetched from DB or distinct skills
        setTags: (state, { payload }) => {
            // Expecting payload to be an array like [{ id: 'tag1', name: 'Tag 1', value: 'tag1' }, ...]
            // Note: The structure might need adjustment based on how tags are fetched/stored
            state.tags = payload;
        },

        addLatestJob: (state, { payload }) => {
            const isExist = state.latestJob?.includes(payload);
            if (isExist) {
                state.latestJob = state.latestJob.filter(
                    (item) => item !== payload
                );
            } else {
                state.latestJob.push(payload);
            }
        },
        clearJobTypeToggle: (state) => {
            state.jobTypeList = state.jobTypeList.map((item) => ({
                ...item,
                isChecked: false,
            }));
        },
        jobTypeCheck: (state, { payload }) => {
            // payload should be the UUID (item.id)
            state.jobTypeList = state.jobTypeList.map((item) =>
                item.id === payload ? { ...item, isChecked: !item.isChecked } : item
            );
        },
        datePostCheck: (state, { payload }) => {
            // payload is the id (1, 2, 3, etc.) from the static datePost array
            state.datePost = state.datePost.map((item) => ({
                ...item,
                isChecked: item.id === payload, // Use radio button logic (only one checked)
            }));
        },
        clearDatePostToggle: (state) => {
            state.datePost = state.datePost.map((item) => ({
                ...item,
                isChecked: item.value === 'all', // Default to 'All' when clearing
            }));
        },
        experienceLevelCheck: (state, { payload }) => {
            // payload should be the UUID (item.id)
            state.experienceLevel = state.experienceLevel.map((item) =>
                item.id === payload ? { ...item, isChecked: !item.isChecked } : item
            );
        },
        clearExperienceToggle: (state) => {
            state.experienceLevel = state.experienceLevel.map((item) => ({
                ...item,
                isChecked: false,
            }));
        },
        // Note: No specific reducer needed for tags as addTag in filterSlice handles the single selected tag
    },
});

export const {
    setJobTypes, // Export new action
    setExperienceLevels, // Export new action
    setTags, // Export new action
    addLatestJob,
    clearJobTypeToggle,
    jobTypeCheck,
    datePostCheck,
    clearDatePostToggle,
    experienceLevelCheck,
    clearExperienceToggle,
} = jobSlice.actions;
export default jobSlice.reducer;
