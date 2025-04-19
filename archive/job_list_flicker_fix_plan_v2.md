# Job List Page Flicker and Error Resolution Plan (v2 - Add Slug)

## Problem Summary

The job listing page (`/jobs`) is experiencing errors and flickering. This is caused by components attempting to fetch and filter job categories using a `slug` column in the `job_categories` table, which does not exist in the database schema. This leads to failed Supabase queries and likely disrupts the React component lifecycle.

Additionally, there are minor warnings related to a React key prop being spread incorrectly and missing image/autocomplete attributes.

## Affected Components & Files

1.  `superio/components/job-listing-pages/components/Categories.jsx`
2.  `superio/components/job-listing-pages/job-list-v2/FilterJobsBox.jsx`
3.  `superio/components/job-listing-pages/components/SalaryRangeSlider.jsx`
4.  `superio/components/common/form/login/FormContent2.jsx`
5.  `superio/supabase/seed/seed.js`
6.  Database: `job_categories` table

## Database Schema Findings

*   `job_categories` table: Contains `id` (uuid) and `name` (text). **Missing `slug` column.**
*   `jobs` table: Contains `category_id` (uuid) as the foreign key to `job_categories`.

## Proposed Solution

Add a `slug` column to the `job_categories` table, populate it, update the seeding script, and fix the minor frontend warnings. This provides an SEO-friendly solution.

## Detailed Plan

1.  **Database Schema Modification (Requires external action or specific SQL execution):**
    *   **Add Column:** Add a new column named `slug` of type `text` to the `job_categories` table. It's recommended to add a `UNIQUE` constraint.
        *   *Example SQL:* `ALTER TABLE job_categories ADD COLUMN slug TEXT UNIQUE;`
    *   **Populate Slugs:** Generate and populate the `slug` column for all existing categories based on their `name`.
        *   *Example SQL:* `UPDATE job_categories SET slug = lower(regexp_replace(name, '[^a-z0-9]+', '-', 'g')) WHERE slug IS NULL;` (Adjust regex/logic as needed for desired slug format).

2.  **Update Seed Script (`superio/supabase/seed/seed.js`):**
    *   Modify line 222 within the `seedLookupTables` function to enable slug generation for `job_categories` by changing the third argument from `false` to `true`:
        ```javascript
        // Change this:
        await seedLookupTable('job_categories', abaJobCategories, false);
        // To this:
        await seedLookupTable('job_categories', abaJobCategories, true);
        ```

3.  **Frontend Code Verification:**
    *   Ensure `Categories.jsx` correctly fetches `id, name, slug` (lines 32-35) and uses `cat.slug` for the option value (line 83) and URL parameter (line 57). *No changes should be needed here if the database is fixed correctly.*
    *   Ensure `FilterJobsBox.jsx` correctly selects `category:job_categories!inner ( slug )` (line 63) and filters using `query.eq('category.slug', category)` (line 71). *No changes should be needed here if the database is fixed correctly.*

4.  **Fix React Warning in `SalaryRangeSlider.jsx`:**
    *   Modify the `renderThumb` function (lines 56-68) to destructure the `key` from `props` and apply it directly to the `div` (e.g., `<div key={props.key} {...otherProps}>`).

5.  **Fix Autocomplete Warnings in `FormContent2.jsx`:**
    *   Add `autoComplete="current-password"` to the password input element (within lines 98-106).

6.  **Fix Image Aspect Ratio Warning in `FilterJobsBox.jsx`:**
    *   Add `style={{ height: 'auto' }}` to the `Image` component (around line 178).