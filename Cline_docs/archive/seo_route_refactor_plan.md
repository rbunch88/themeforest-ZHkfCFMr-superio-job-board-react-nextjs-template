# Plan: SEO Route Refactoring & 404 Fix

**Goal:** Refactor Next.js App Router routes to use user-friendly, SEO-optimized paths (using slugs where appropriate) instead of template version identifiers (e.g., `-v1`, `-v2`) and fix the 404 error on job single pages.

**Context:** This refactoring addresses the 404 error encountered when clicking job links from `/job-list-v2` (caused by the `[slug]-[short_id]` directory structure) and improves overall site structure and SEO. Database tables (`jobs`, `companies`, `profiles`, `blog_posts`) already contain the necessary `slug` columns.

## Proposed Route Changes

| Current Path (Example)                 | Proposed Path (Example)        | App Router Directory Structure (Example)                 | Notes                                                                 |
| :------------------------------------- | :----------------------------- | :------------------------------------------------------- | :-------------------------------------------------------------------- |
| `/job-list-v2`                         | `/jobs`                        | `app/(jobs)/jobs/page.jsx`                               | Standard list view.                                                   |
| `/job-single-v1/[slug]-[short_id]`     | `/job/[slug]/[short_id]`       | `app/(job)/job/[slug]/[short_id]/page.jsx`               | Uses slug for SEO, short_id for uniqueness. Requires directory rename. |
| `/employers-list-v1`                   | `/employers`                   | `app/(employers)/employers/page.jsx`                     | Standard list view.                                                   |
| `/employer-single-v1/[id]` (if exists) | `/employer/[slug]`             | `app/(employer)/employer/[slug]/page.jsx`                | Uses company slug.                                                    |
| `/candidates-list-v1`                  | `/candidates`                  | `app/(candidates)/candidates/page.jsx`                   | Standard list view.                                                   |
| `/candidate-single-v1/[id]` (if exists)| `/candidate/[slug]`            | `app/(candidate)/candidate/[slug]/page.jsx`              | Uses profile slug.                                                    |
| `/blog-list-v1`                        | `/blog`                        | `app/(blog)/blog/page.jsx`                               | Standard list view.                                                   |
| `/blog-single/[id]` (if exists)        | `/blog/[slug]`                 | `app/(blog)/blog/[slug]/page.jsx`                        | Uses blog post slug.                                                  |
| *(Add others as needed)*               | *(Propose simple path)*        | *(Define directory structure)*                           |                                                                       |

## Implementation Steps

1.  **Directory Renaming (User Task):**
    *   Manually rename the directories within `superio/app/` to match the new structure outlined above.
    *   **Crucially:** Rename `superio/app/(job-single)/job-single-v1/[slug]-[short_id]` to `superio/app/(job)/job/[slug]/[short_id]` (creating the nested `[short_id]` directory).
    *   Rename other versioned directories similarly (e.g., `(employers-list)/employers-list-v1` -> `(employers)/employers`).

2.  **Link Updates (Roo - Code Mode Task):**
    *   After directory renaming is complete, Roo will switch to Code mode.
    *   Use `search_files` to locate all instances of old paths (e.g., `/job-list-v2`, `/job-single-v1`, `/employer-single-v1`, `/blog-list-v1`) within `<Link href="...">` tags and potentially other navigation logic (e.g., `router.push`) in `.jsx` files under `superio/`.
    *   Use `apply_diff` or `search_and_replace` to update these links to the new path structure, ensuring dynamic segments are correctly interpolated (e.g., `` `/job/${item.slug}/${item.short_id}` ``, `` `/employer/${company.slug}` ``, `` `/blog/${post.slug}` ``).

3.  **Configuration Check (Roo - Code Mode Task):**
    *   Briefly review `superio/middleware.js` and `superio/next.config.cjs` for any hardcoded path dependencies that might need updating.

4.  **Testing (User Task):**
    *   Restart the Next.js development server (`npm run dev`).
    *   Thoroughly test all navigation links across the site, including:
        *   Links from list pages (jobs, employers, candidates, blog) to single pages.
        *   Links within headers, footers, sidebars, and breadcrumbs.
        *   Any programmatic navigation (`router.push`).
    *   Verify that pages load correctly with the new URLs and that dynamic data (slugs, IDs) is passed and used correctly.

## Mermaid Diagram (Job & Blog Routes Example)

```mermaid
graph TD
    subgraph App Router Structure
        A["app"] --> B["(jobs)"];
        B --> C["jobs/page.jsx (List)"];
        A --> D["(job)"];
        D --> E["job/[slug]/[short_id]/page.jsx (Single)"];
        A --> F["(blog)"];
        F --> G["blog/page.jsx (List)"];
        F --> H["blog/[slug]/page.jsx (Single)"];
    end

    subgraph URL Paths
        I["/jobs"] --> C;
        J["/job/{slug}/{short-id}"] --> E;
        K["/blog"] --> G;
        L["/blog/{slug}"] --> H;
    end

    style C fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#f9f,stroke:#333,stroke-width:2px
    style G fill:#ccf,stroke:#333,stroke-width:2px
    style H fill:#ccf,stroke:#333,stroke-width:2px