# Error Log

## 2025-03-31 19:02 UTC-5

**Issue:** MCP Server Connection Failure - Unsupported Node.js Version

**Error Message Snippet:**
`npm warn EBADENGINE Unsupported engine { package: '@gregnr/postgres-meta@0.82.0-dev.2', required: { node: '>=20', npm: '>=9' }, current: { node: 'v18.20.5', npm: '10.8.2' } }`

**Context:** Attempting to connect to an MCP server (`@gregnr/postgres-meta`) failed due to the current Node.js version (v18.20.5) being lower than the required version (>=v20).

**Resolution:** Update Node.js to version 20 or later. Recommended method is using nvm:
1. `nvm install 20`
2. `nvm use 20`
3. `nvm alias default 20` (Optional)
4. Verify with `node -v`

## 2025-04-04 17:00 UTC-5

**Issue:** Job List Page (`/job-list-v2`) Showing "No jobs found" Despite Available Data

**Error Description:**
The job list page (`/job-list-v2`) was displaying "No jobs found" message even though there were 18 active jobs in the Supabase database. The issue was occurring in the `FilterJobsBox.jsx` component.

**Root Causes:**
1. **Salary Filter Logic Issue:** The salary filter was using separate OR conditions for min and max salary filters, which could lead to incorrect results. The implementation was using `query.or()` for both conditions separately, potentially filtering out all jobs.
2. **Tag Filtering Issue:** The tag filtering was using the `contains` operator which might not work correctly with array columns in Supabase.

**Solution:**
1. **Fixed Salary Filter Logic:**
   - Replaced the separate OR conditions with a more logical approach that properly handles the overlap between job salary ranges and filter ranges.
   - Created a single filter condition that combines all cases (min+max, min only, max only) and includes jobs with null salary values.

2. **Fixed Tag Filtering:**
   - Updated the tag filtering to use the `filter` method with the `cs` (contains) operator instead of the `contains` method, which is more appropriate for array columns in Supabase.

3. **Added Debugging:**
   - Added comprehensive debugging logs to help identify any remaining issues:
     - Detailed logging of filter parameters
     - Logging of the final query structure
     - Logging of query results

**Documentation:**
- Created detailed documentation in `Cline_docs/job_list_error_fix_plan.md` with code examples and testing instructions.
- Updated `currentTask.md` and `progressTracker.md` to reflect the fix.

**Verification:**
- Run the development server and navigate to `/job-list-v2` to verify that jobs are now displayed correctly.
- Check the browser console for debugging logs to ensure the query is working as expected.

## 2025-04-06 (Approx. 11:57 AM - 3:20 PM UTC-5)

**Issue:** Multiple Errors Preventing `/employers` and `/blog` Pages from Loading

**Error Descriptions & Context:**
A cascade of issues prevented key pages from loading after migrating Supabase helpers and implementing dynamic routing. Troubleshooting involved several steps:

1.  **`react-input-range` Peer Dependency Conflict:** `npm install` failed due to `react-input-range` requiring an older React version.
2.  **Supabase SSR Errors:** After resolving the dependency conflict, pages failed with errors like `createServerComponentClient is not a function`, `createMiddlewareClient is not a function`, and `"Your project's URL and Key are required..."`. This indicated problems with the `@supabase/ssr` package setup, import resolution, middleware configuration, or environment variable access.
3.  **Supabase Query Syntax Error:** The `/employers` page query failed (PGRST100) due to comments (`//`) within the `.select()` string.
4.  **Client-Side `searchParams` Error:** The `/employers` page failed with `TypeError: searchParams.get is not a function` in multiple filter components (`SearchBox`, `LocationBox`, `FoundationDate`) because they expected `searchParams` as props instead of using the `useSearchParams` hook required by Next.js App Router client components.
5.  **Client-Side NaN Display Error:** After fixing the `searchParams` access, the `FoundationDate` component displayed "NaN NaN" due to incorrect parsing/handling of initial values from the URL.

**Resolution Steps:**

1.  **Dependency Conflict:** Replaced `react-input-range` with `react-range` in 5 components (`DestinationRangeSlider`, `SalaryRangeSlider`, `FoundationDate`) and uninstalled `react-input-range`.
2.  **Supabase SSR Setup:**
    *   Performed multiple cache clears (`node_modules`, `package-lock.json`, `.next`, `npm cache clean --force`) and dependency reinstalls (`npm install`).
    *   Updated `@supabase/ssr` package to the latest version.
    *   Investigated and corrected import syntax (tried namespace vs. named imports).
    *   Refactored `middleware.js` and created `utils/supabase/middleware.js` to align with the latest official documentation pattern (using the utility pattern with `createServerClient` internally).
    *   Refactored `utils/supabase/server.js` and `utils/supabase/client.js` to align with official documentation examples (using correct functions and passing env vars explicitly where required by examples).
    *   Added missing server-side environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) to `.env.local`.
    *   Corrected direct Supabase import in `blog-sidebar/index.jsx` to use the client utility function.
    *   Corrected `NEXT_PUBLIC_SUPABASE_ANON_KEY` typo (hyphen vs underscore) in `.env.local`.
3.  **Query Syntax:** Removed comments from the `.select()` string in `employers/page.jsx`.
4.  **`searchParams` Usage:** Refactored `SearchBox.jsx`, `LocationBox.jsx`, and `FoundationDate.jsx` to use the `useSearchParams` hook from `next/navigation`.
5.  **NaN Display:** Refactored `FoundationDate.jsx` to correctly parse initial values from `searchParams` and handle potential `NaN` results using default values.

**Verification:**
*   The `/employers` and `/blog` pages now load without the critical SSR or `searchParams` errors.
*   Filter components on `/employers` appear functional.

**Documentation:**
*   Updated `currentTask.md` and `progressTracker.md`.
*   Archived `dependency_ssr_fix_plan.md` and `supabase_ssr_fix_plan.md` (can be done manually).


## 2025-04-06 (Approx. 3:11 PM UTC-5)

**Issue:** Blog Page (`/blog`) Load Error - `useSearchParams` in Server Component

**Error Message Snippet:**
`Error: useSearchParams only works in Client Components. Add the "use client" directive at the top of the file to use it.`

**Context:** After resolving the Supabase SSR client initialization errors, testing revealed this new error on the `/blog` page.

**Root Cause:** The `BlogPagination.jsx` component, which is likely rendered as part of the server-rendered `/blog` page, incorrectly uses the `useSearchParams` hook without having the `'use client'` directive.

**Resolution:** Add `'use client'` directive to `BlogPagination.jsx` or refactor how pagination parameters are passed/handled.

**Status:** Identified, pending fix.