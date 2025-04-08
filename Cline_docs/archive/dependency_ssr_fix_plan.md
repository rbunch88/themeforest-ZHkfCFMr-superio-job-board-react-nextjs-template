# Plan: Resolve Dependency Conflict & Supabase SSR Error

**Goal:** Resolve the `react-input-range` peer dependency conflict and the Supabase SSR `createServerComponentClient is not a function` error to make the application runnable for testing.

**Strategy:** Address the known dependency conflict first, as it likely blocks further package management needed to resolve the SSR error.

**Steps:**

1.  **Address `react-input-range` Conflict:**
    *   **Install `react-range`:** Run `npm install react-range` in the `superio` directory.
    *   **Refactor Components:** Modify the following five components to use `react-range` instead of `react-input-range`, adapting the implementation to the `react-range` API:
        *   `superio/components/job-listing-pages/components/DestinationRangeSlider.jsx`
        *   `superio/components/job-listing-pages/components/SalaryRangeSlider.jsx`
        *   `superio/components/employers-listing-pages/components/DestinationRangeSlider.jsx`
        *   `superio/components/employers-listing-pages/components/FoundationDate.jsx`
        *   `superio/components/candidates-listing-pages/components/DestinationRangeSlider.jsx`
    *   **Uninstall `react-input-range`:** Run `npm uninstall react-input-range` in the `superio` directory.
2.  **Verify Dependency Resolution:**
    *   Run `npm install` in the `superio` directory to confirm the peer dependency conflict is resolved. Check the terminal output for errors.
3.  **Re-evaluate Supabase SSR Error:**
    *   **Restart Server:** Stop the current development server (Ctrl+C in the terminal) and restart it using `npm run dev` in the `superio` directory.
    *   **Test:** Attempt to load pages previously affected by the SSR error (e.g., `/employers`, `/blog`). Check the browser and terminal for the `createServerComponentClient is not a function` error.
    *   **If Error Persists:**
        *   **Update `@supabase/ssr`:** Run `npm install @supabase/ssr@latest` in the `superio` directory.
        *   **Restart & Test:** Restart the development server and test the affected pages again.
        *   **If Error Still Persists:** Further investigation is needed. Re-examine `superio/utils/supabase/server.js` implementation against the documentation for the *newly installed* `@supabase/ssr` version.
4.  **Final Testing:**
    *   Once both the dependency conflict and the SSR error are resolved, perform basic browser testing (homepage load, navigation, core features) to confirm the application is running without major errors.

**Diagram:**

```mermaid
graph TD
    A[Start: Dependency Conflict & SSR Error] --> B{Replace react-input-range};
    B --> C[Install react-range];
    B --> D[Refactor 5 Components];
    B --> E[Uninstall react-input-range];
    C & D & E --> F{Verify Dependency Resolution};
    F -- Conflict Resolved --> G{Re-evaluate Supabase SSR Error};
    F -- Conflict Persists --> H[Re-investigate Conflict];
    G --> I[Restart Dev Server];
    I --> J{Test Failing Pages};
    J -- Error Gone --> K{Final Testing};
    J -- Error Persists --> L{Update @supabase/ssr};
    L --> M[Restart Dev Server];
    M --> N{Test Failing Pages};
    N -- Error Gone --> K;
    N -- Error Persists --> O[Further Investigation Needed];
    K --> Z[End: Application Functional];
    H --> Z;
    O --> Z;