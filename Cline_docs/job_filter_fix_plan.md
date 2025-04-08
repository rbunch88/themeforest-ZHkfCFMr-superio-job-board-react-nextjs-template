# Job Filter Functionality Fix Plan

**Date:** 2025-04-07

**Goal:** Make the job filters functional by using the URL as the single source of truth for filter state, ensuring automatic updates and supporting SEO goals.

**Core Problem:** Filter UI components currently update a Redux store, while the job list display component (`FilterJobsBox.jsx`) reads filters from the URL search parameters. This disconnect prevents filters from working.

**Solution Strategy:** Modify filter UI components to directly read from and update the URL search parameters instead of using the Redux store.

**Identified Filter Components to Modify:**

*   `superio/components/job-listing-pages/components/JobType.jsx`
*   `superio/components/job-listing-pages/components/SearchBox.jsx` (Keyword)
*   `superio/components/job-listing-pages/components/Tag.jsx`
*   `superio/components/job-listing-pages/components/SalaryRangeSlider.jsx`
*   `superio/components/job-listing-pages/components/ExperienceLevel.jsx`
*   `superio/components/job-listing-pages/components/LocationBox.jsx`
*   `superio/components/job-listing-pages/components/DatePosted.jsx`
*   `superio/components/job-listing-pages/components/JobSelect.jsx` (Handles multiple dropdowns: Job Type, Date Posted, Experience, Salary Estimate - needs careful refactoring)
*   *(Potentially others like Category if separate)*

**Detailed Plan:**

1.  **Modify Filter Components (Iteratively):**
    *   For *each* identified filter component:
        *   **Remove Redux:** Delete imports related to `react-redux` (`useDispatch`, `useSelector`) and `filterSlice` actions. Remove the corresponding Redux logic (dispatch calls, reading from the store).
        *   **Add Router Hooks:** Import `useRouter` and `useSearchParams` from `next/navigation`.
        *   **Implement URL Update Logic:**
            *   In the event handler (e.g., `onChange`, `onClick`, debounced handler), get the current `searchParams`.
            *   Create a mutable `URLSearchParams` object: `const params = new URLSearchParams(searchParams);`
            *   Update the relevant parameter(s) (e.g., `params.set('key', value);`, `params.delete('key');`, `params.append('key', value)`). Handle defaults and multi-select logic appropriately.
            *   **Reset Pagination:** Always set `params.set('page', '1');` when a filter changes.
            *   **Navigate:** Use `router.push(\`/jobs?\${params.toString()}\`, { scroll: false });`
        *   **Update UI State:** Ensure the component's visual state reads its value directly from the `searchParams` hook on re-render.

2.  **Refactor `FilterJobsBox.jsx`:**
    *   Verify it reads all necessary filter parameters from `searchParams` (it seems to do this already).
    *   Remove any remaining Redux dependencies related *only* to filters.
    *   Ensure utility functions like `updateSearchParams` and `clearAll` work correctly with the URL-driven approach.

3.  **Clean Up Redux (`filterSlice.js`):**
    *   Edit `superio/features/filter/filterSlice.js`.
    *   Remove state properties related *only* to job list filters from `initialState`.
    *   Remove the corresponding reducer functions and exports.

4.  **Testing:**
    *   Verify each filter updates the URL correctly.
    *   Confirm the job list automatically refreshes with filtered results.
    *   Test filter combinations.
    *   Test "Clear All".
    *   Test pagination with active filters.
    *   Test loading filtered URLs directly.

**Flow Diagram:**

```mermaid
graph LR
    subgraph Filter Sidebar/Controls
        direction LR
        FC1[Keyword Input] -->|onChange| UpdateURL
        FC2[Location Input] -->|onChange| UpdateURL
        FC3[Category Select] -->|onChange| UpdateURL
        FC4[Job Type Checkboxes] -->|onChange| UpdateURL
        FC5[Experience Checkboxes] -->|onChange| UpdateURL
        FC6[Date Posted Select] -->|onChange| UpdateURL
        FC7[Salary Slider] -->|onChange| UpdateURL
        FC8[Tag Input] -->|onChange| UpdateURL
    end

    subgraph Core Logic
        direction TB
        UpdateURL[Update URL Params + router.push] -->|Triggers Re-render| JobList[FilterJobsBox Component]
        JobList -->|Reads URL Params| FetchData[Fetch Data (useEffect)]
        FetchData -->|Sends Query| Supabase[Supabase DB]
        Supabase -->|Returns Results| FetchData
        FetchData -->|Updates State| JobList
        JobList -->|Renders UI| Display[Job List UI]
    end

    User -- Interacts --> Filter Sidebar/Controls
    Display -- Shows Results --> User

    style UpdateURL fill:#ccf,stroke:#333,stroke-width:2px
    style JobList fill:#f9f,stroke:#333,stroke-width:2px