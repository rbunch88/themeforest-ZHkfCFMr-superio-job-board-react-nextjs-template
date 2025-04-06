# Routing Strategy Plan - MyABAJobs Refresh

**Date:** March 31, 2025

**Objective:** Resolve the Next.js App Router conflict caused by using different dynamic parameter names (`[id]` vs `[slug]`) at the same route level, while ensuring user-friendly and unique URLs for single item pages (jobs, candidates, employers, blog posts).

**Problem:**

Next.js requires dynamic route segments at the same hierarchical level to use the same parameter name. The initial structure had conflicts like:

*   `app/(job-single)/job-single-v1/[id]/`
*   `app/(candidates-single)/candidates-single-v2/[id]/`
*   `app/(employers-single)/employers-single-v2/[id]/`
*   `app/(blog)/blog-details/[slug]/` (Intended)

This resulted in the error: `Error: You cannot use different slug names for the same dynamic path ('id' !== 'slug').`

**Approved Solution:**

Implement a hybrid approach using slugs for readability and short IDs for uniqueness where needed:

1.  **Blog Posts:** Use `[slug]` only, as blog titles should ideally be unique.
    *   **URL:** `/blog-details/your-post-title-slug`
    *   **Route:** `app/(blog)/blog-details/[slug]/`
2.  **Jobs, Candidates, Employers:** Use `[slug]-[short_id]`, allowing readable slugs while guaranteeing uniqueness via a short ID, even if names/titles are duplicated.
    *   **Job URL:** `/job-single-v1/job-title-slug-abcdef12`
    *   **Job Route:** `app/(job-single)/job-single-v1/[slug]-[short_id]/`
    *   **Candidate URL:** `/candidates-single-v2/candidate-name-slug-abcdef12`
    *   **Candidate Route:** `app/(candidates-single)/candidates-single-v2/[slug]-[short_id]/`
    *   **Employer URL:** `/employers-single-v2/employer-name-slug-abcdef12`
    *   **Employer Route:** `app/(employers-single)/employers-single-v2/[slug]-[short_id]/`

**Implementation Plan:**

1.  **Schema Changes (External Task - Add to `externalInstructions.md`):**
    *   Add `slug` column (type `text`, nullable) to `jobs`, `profiles`, and `companies` tables.
    *   Add `short_id` column (type `text`, **UNIQUE**, nullable) to `jobs`, `profiles`, and `companies` tables. Add database indexes to these `short_id` columns for efficient lookups.
    *   Ensure `slug` column in `blog_posts` table has a `UNIQUE` constraint.

2.  **Directory Renaming (Code Task):**
    *   Rename `app/(job-single)/job-single-v1/[id]/` to `app/(job-single)/job-single-v1/[slug]-[short_id]/`.
    *   Rename `app/(candidates-single)/candidates-single-v2/[id]/` to `app/(candidates-single)/candidates-single-v2/[slug]-[short_id]/`.
    *   Rename `app/(employers-single)/employers-single-v2/[id]/` to `app/(employers-single)/employers-single-v2/[slug]-[short_id]/`.

3.  **Page Code Updates (Code Task):**
    *   Modify the `page.jsx` files within the renamed `[slug]-[short_id]` directories:
        *   Receive the combined parameter (e.g., `params['slug]-[short_id']`).
        *   Parse the parameter string to extract the `short_id` (the part after the last hyphen).
        *   Fetch data from Supabase by querying the unique `short_id` column (e.g., `.eq('short_id', extracted_short_id)`).

4.  **Blog Details Page Creation (Code Task):**
    *   Create the file `app/(blog)/blog-details/[slug]/page.jsx` using the previously prepared code, which fetches data based on `params.slug`.

5.  **Slug & Short ID Generation (Code Task - To be implemented later):**
    *   Implement logic during the creation/update process for jobs, candidates, and employers:
        *   Generate a user-friendly `slug` from the title/name (e.g., using `slugify`).
        *   Generate a unique `short_id` (e.g., using `nanoid(8)`). Ensure uniqueness via a database check or rely on the `UNIQUE` constraint and handle potential collisions.
        *   Store both `slug` and `short_id` in the respective tables.
    *   Implement similar slug generation for blog posts (ensuring uniqueness).

6.  **Update Internal Links (Code Task - To be implemented later):**
    *   Search the codebase for links pointing to the old `[id]` routes.
    *   Update these links to use the new `/[slug]-[short_id]` (or `/[slug]` for blog) format, dynamically constructing the URL using the stored `slug` and `short_id` (or just `slug`).

7.  **Testing (Manual/Automated):**
    *   Restart the development server after changes.
    *   Verify that all renamed routes work correctly.
    *   Verify that data is fetched correctly using the `short_id` or `slug`.
    *   Verify that the blog details page works.