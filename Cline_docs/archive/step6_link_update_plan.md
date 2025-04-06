# Routing Strategy - Step 6: Update Internal Links Plan

**Date:** March 31, 2025

**Objective:** Update internal links within the application to use the new URL formats (`/[slug]-[short_id]` for jobs, candidates, employers; `/[slug]` for blog posts) instead of the old `/[id]` format.

**Dependency:**

*   This step is **BLOCKED** until the external database tasks are completed:
    *   **Step 1 (Schema Changes):** Adding `slug` and `short_id` columns to `jobs`, `profiles`, `companies` tables (as per `Cline_docs/externalInstructions.md`).
    *   **Step 5 (Backend Generation Logic):** Implementing database triggers to automatically generate `slug` and `short_id` values upon record creation/update (as per `Cline_docs/externalInstructions.md`).
*   The `slug` and `short_id` fields must be populated in the database for this step to be implemented correctly.

**Target Components & Paths:**

The following components contain links that need to be updated, based on the search for `href={`/(job-single-v1|candidates-single-v2|employers-single-v2|blog-details)/[^`]*\$\{.*id\}`}`:

*   **Jobs (`/job-single-v1/${item.id}` -> `/job-single-v1/${item.slug}-${item.short_id}`):**
    *   `superio/components/dashboard-pages/candidates-dashboard/dashboard/components/JobApplied.jsx`
    *   `superio/components/job-listing-pages/job-list-v14/FilterJobBox.jsx`
    *   `superio/components/job-listing-pages/job-list-v1/FilterJobsBox.jsx`
    *   `superio/components/job-listing-pages/job-list-v6/FilterJobBox.jsx`
    *   `superio/components/job-listing-pages/job-list-v12/FilterJobsBox.jsx`
    *   `superio/components/job-listing-pages/job-list-v4/FilterJobBox.jsx`
    *   `superio/components/job-featured/HeroJobFeatured.jsx`
    *   `superio/components/job-featured/JobFilterTab2.jsx`
    *   `superio/components/job-featured/JobFeatured2.jsx`
    *   `superio/components/job-featured/JobFeatured3.jsx`
    *   `superio/components/job-featured/JobFeatured1.jsx`
    *   `superio/components/job-featured/JobFeatured10.jsx`
    *   `superio/components/job-single-pages/related-jobs/RelatedJobs.jsx`
    *   `superio/components/employer-single-pages/related-jobs/RelatedJobs.jsx`
*   **Candidates (`/candidates-single-v2/${applicant.id}` -> `/candidates-single-v2/${applicant.slug}-${applicant.short_id}`):**
    *   `superio/components/candidates-listing-pages/candidates-list-v1/FilterTopBox.jsx`
*   **Employers (`/employers-single-v2/${company.id}` -> `/employers-single-v2/${company.slug}-${company.short_id}`):**
    *   `superio/components/top-company/TopCompany.jsx`
    *   `superio/components/employers-listing-pages/employers-list-v1/FilterTopBox.jsx`
    *   `superio/components/employers-listing-pages/employers-list-v3/FilterTopBox.jsx`
*   **Blog (`/blog-details/${item.id}` -> `/blog-details/${item.slug}`):**
    *   `superio/components/blog/Blog8.jsx`
    *   `superio/components/blog/Blog3.jsx`
    *   `superio/components/blog/Blog2.jsx`
    *   `superio/components/blog/Blog.jsx`
    *   `superio/components/blog/Blog5.jsx`
    *   `superio/components/blog/Blog7.jsx`
    *   `superio/components/blog/Blog4.jsx`

**Implementation Plan (To be executed AFTER external dependencies are met):**

1.  **Verify Data Availability:** Confirm that parent components rendering the target components above are fetching `slug` and `short_id` (or `slug` for blog) for each item. If not, update the `select()` statements in the parent components' data fetching logic.
2.  **Update Link Construction:** For each target component file:
    *   Locate the `<Link href={...}>` component using the old `id`-based path.
    *   Modify the `href` prop to use the `slug` and `short_id` (or just `slug`) fields from the item's data object (e.g., `item`, `applicant`, `company`, `post`).
    *   Include a check to ensure `slug` and `short_id` (where applicable) exist before constructing the URL, providing a fallback (e.g., `href="#"`) or logging an error if they are missing.
    *   Example Job: `` `<Link href={item.slug && item.short_id ? `/job-single-v1/${item.slug}-${item.short_id}` : '#'}>` ``
    *   Example Blog: `` `<Link href={item.slug ? `/blog-details/${item.slug}` : '#'}>` ``
3.  **Testing:** Thoroughly test all pages containing these links to ensure they point to the correct new URLs and that the detail pages load correctly.