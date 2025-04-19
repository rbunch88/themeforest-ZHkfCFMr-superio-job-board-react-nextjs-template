# Job List Flickering Issue - Resolution Plan (v4)

## Problem

The list of jobs displayed on the `/jobs` page flickers rapidly. This is accompanied by frequent console messages indicating data fetching from Supabase. Only the job list content itself flickers, not the surrounding page elements (filters, header, etc.).

## Root Cause Analysis

The investigation points to the `useEffect` hook within the `superio/components/job-listing-pages/job-list-v2/FilterJobsBox.jsx` component.

1.  This component reads filter parameters directly from the URL using the `useSearchParams` hook.
2.  It contains a `useEffect` hook responsible for fetching job data from Supabase whenever these URL parameters change.
3.  The parameters for multi-select filters (`jobType`, `experience`) are obtained using `searchParams.getAll()`, which returns an array.
4.  The `useEffect` hook's dependency list directly includes these array variables (`jobType`, `experience`).
5.  **Key Issue:** In JavaScript, arrays are compared by reference. Hooks like `useSearchParams` often return *new array instances* on each component render, even if the underlying values (the selected filter IDs) haven't changed.
6.  Because the array *reference* changes frequently, the `useEffect` hook incorrectly determines that its dependencies have changed and re-runs the `fetchJobs` function excessively.
7.  This leads to repeated, unnecessary calls to Supabase and causes the job list content within `FilterJobsBox.jsx` to rapidly update, resulting in the observed flickering.

## Solution

The most direct solution is to stabilize the array dependencies within the `useEffect` hook in `FilterJobsBox.jsx`. Instead of relying on the unstable array references, we will use derived, stable primitive values (strings) that only change when the *content* of the arrays changes.

## Implementation Plan

1.  **Modify `FilterJobsBox.jsx`:**
    *   Inside the component function, *before* the `useEffect` hook that fetches jobs:
        *   Retrieve the `jobType` and `experience` arrays using `searchParams.getAll()`.
        *   Create stable string representations by sorting the arrays and joining them with a delimiter (e.g., a comma).
        ```javascript
        // Example inside FilterJobsBox component
        const jobType = searchParams.getAll('job_type');
        const experience = searchParams.getAll('experience');
        const jobTypeString = jobType.sort().join(','); // Stable string dependency
        const experienceString = experience.sort().join(','); // Stable string dependency
        ```
    *   Update the dependency array of the `useEffect` hook (around line 124 in the current file) to use these new string variables instead of the original array variables.
        ```javascript
        // Example useEffect dependency array
        useEffect(() => {
          // ... fetchJobs logic ...
        }, [
            supabase, page, keyword, location, category,
            jobTypeString, // Use stable string
            experienceString, // Use stable string
            datePosted, salaryMin, salaryMax, tag, sort
            // Ensure all other necessary dependencies are still included
        ]);
        ```

2.  **Verification:** After implementation, test the jobs page by applying and removing filters (especially multi-select ones like Job Type and Experience Level). Verify that the job list updates correctly *without* flickering and that Supabase fetch calls only occur when filter criteria genuinely change.

## Visual Plan (Mermaid)

```mermaid
graph TD
    A[Component Renders] --> B{Read searchParams};
    B --> C[Get jobType/experience arrays (New Reference Each Time)];
    C --> D{useEffect Dependencies Check (Using Array References)};
    D -- Reference Changed (Even if Content Same) --> E[fetchJobs() Called];
    D -- Reference Same (Rare) --> F[No Fetch];
    E --> A; // Causes re-render loop -> Flicker in Job List

    subgraph Proposed Fix
        B --> G[Create Stable Strings (jobTypeString, experienceString) from Arrays];
        G --> H{useEffect Dependencies Check (Using Stable Strings)};
        H -- String Value Changed --> E;
        H -- String Value Same --> F; // Prevents unnecessary fetch
    end
```

## Next Steps

Proceed with implementing the code changes in `FilterJobsBox.jsx` via Code mode.