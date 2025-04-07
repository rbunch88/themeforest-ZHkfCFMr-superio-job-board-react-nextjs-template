# Plan: Fix Supabase Import Error and Refactor Server-Side Usage

## 1. Problem Description

A `Module not found` error occurs in `superio/app/(employers-single)/employers-single-v2/[slug]-[short_id]/page.jsx` because the import path for the Supabase client is incorrect, and the wrong type of client (browser vs. server) was being attempted for server-side data fetching.

## 2. Investigation Summary

*   **Initial Error:** `Module not found: Can't resolve '[@/utils/supabaseClient]'` (or similar) in `page.jsx`.
*   **File Structure:** Found `utils/supabase/client.js` (uses `createBrowserClient`) and `utils/supabase/server.js` (uses `createServerClient`).
*   **`server.js` Analysis:** The `createClient` function in `server.js` requires a `cookieStore` argument, obtainable via `cookies()` from `next/headers` within server contexts (Server Components, Route Handlers, etc.). This confirms a server-side client is needed and cannot be instantiated at the top (module) level.
*   **`jsconfig.json` Analysis:** Confirmed the path alias `@/*` maps to `./*` (the `superio` root directory), validating the use of `@/utils/supabase/server`.
*   **`page.jsx` Analysis:** The component `EmployersSingleV2` is a Server Component. Data fetching logic (`getEmployerData`) and metadata generation (`generateMetadata`) run on the server and require a server-side Supabase client instance created within their respective contexts.

## 3. Final Plan (Refactoring Required)

This plan uses the correct server-side client, instantiates it properly within server contexts using `cookies()`, and refactors the data fetching function to accept the client instance explicitly.

*   **Target File:** `superio/app/(employers-single)/employers-single-v2/[slug]-[short_id]/page.jsx`
*   **Actions:**
    1.  **Remove Incorrect Import:** Delete the original line importing from `@/utils/supabaseClient` (likely line 3).
    2.  **Add Correct Imports:** Add the following imports at the top of the file:
        ```javascript
        import { cookies } from 'next/headers';
        import { createClient } from '@/utils/supabase/server'; // Use the server client utility
        ```
    3.  **Refactor `getEmployerData` Function:**
        *   Change the function signature to accept the Supabase client instance:
            ```javascript
            async function getEmployerData(short_id, supabase)
            ```
        *   Remove the internal check for `supabase` availability (lines 19-22 in the original file).
    4.  **Modify `generateMetadata` Function:**
        *   Inside the function, *before* calling `getEmployerData`, instantiate the client:
            ```javascript
            const cookieStore = cookies();
            const supabase = createClient(cookieStore);
            ```
        *   Update the call to `getEmployerData` to pass the instantiated client:
            ```javascript
            const employer = await getEmployerData(short_id, supabase);
            ```
    5.  **Modify `EmployersSingleV2` Component Function:**
        *   Inside the component function, *before* calling `getEmployerData`, instantiate the client:
            ```javascript
            const cookieStore = cookies();
            const supabase = createClient(cookieStore);
            ```
        *   Update the call to `getEmployerData` to pass the instantiated client:
            ```javascript
            const employer = await getEmployerData(short_id, supabase);
            ```
*   **Rationale:** Addresses the root cause by using the correct server-side client (`createServerClient` via `utils/supabase/server.js`), instantiates it correctly within the necessary server context using `cookies()`, and makes the data fetching logic robust by explicitly passing dependencies.

## 4. Mermaid Diagram

```mermaid
graph TD
    A[Error: Module not found] --> B{Investigate};
    B --> C{Check utils/supabase/: Found client.js & server.js};
    C --> D{Analyze server.js: Uses createServerClient, needs cookieStore};
    D --> E{Check jsconfig.json: Confirmed @/ maps to ./};
    E --> F{Conclusion: Cannot instantiate at top level, must refactor};
    F --> G{Plan: Refactor - Instantiate client in server contexts, pass to helper};
    G --> H{Detailed Steps: Modify imports, signatures, calls in page.jsx};
    H --> I[Apply Fix using multiple tools];
    I --> J[Verify Resolution];