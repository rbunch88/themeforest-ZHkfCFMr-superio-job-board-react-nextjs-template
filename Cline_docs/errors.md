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