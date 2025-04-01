# MyABAJobs Refresh - Current Task

**Project Overview:** Develop and launch a modern job board website (MyABAJobs) using the Superio React Next.js template, Supabase backend, Stripe/PayPal payments, and Vercel hosting, replacing the existing WordPress site. (Complexity: Medium-High)

**Current Stage:** Phase 2: Backend Integration & Supabase Setup (Completed Routing Strategy - Step 6 / Starting Step 7)

**Completed Tasks:**
*   **Navigation Menu Cleanup:** Updated main/mobile menus and header components.
*   **Footer Link Cleanup:** Updated footer links.
*   **Homepage (`home-3`) Component Link Review:** Reviewed and updated links.
*   **Homepage (`home-3`) Content Update (Partial):** Updated text content based on copy doc (excluding Pricing). Fixed HTML/ampersand issues.
*   **Metadata & Component Review (Task 1):** Updated page titles/descriptions, fixed typos, implemented dynamic metadata, corrected component links/typos.
*   **Supabase Integration Planning (Task 2 - Planning):** Finalized plan for DB schema, Auth flow, and Storage integration.
*   **Supabase Backend Setup (Task 2 - Backend Impl.):** Created/Updated DB Tables, Auth Trigger, Storage Buckets, and RLS Policies. Added instructions for `applications` table, `get_distinct_skills` function, `candidate_certifications` table, `profiles` columns (phone, contact_email), and blog tables/bucket. Enabled `moddatetime` extension. Added instructions for `slug` and `short_id` columns on `profiles`, `companies`, `jobs`.
*   **Supabase Client Setup:** Installed `@supabase/ssr` and created `utils/supabaseClient.js`. Created `.env.local` with placeholder keys.
*   **Authentication UI & Logic:**
    *   Modified Registration form (`Register2.jsx`, `FormContent2.jsx`) to handle role selection and call `supabase.auth.signUp` with role/name metadata.
    *   Modified Login form (`FormContent2.jsx`) to handle state and call `supabase.auth.signInWithPassword`, fetch profile role, and redirect.
*   **Route Protection:** Created `middleware.js` using `@supabase/ssr` to protect dashboard routes based on session and role. Extended protection to `/candidates-list-v1` (Employer only).
*   **Job List Fetching & Filtering (`/job-list-v2`):** Implemented dynamic data fetching, filtering, pagination, and dynamic filter options.
*   **Employer List Fetching (`/employers-list-v1`):** Implemented dynamic data fetching, filtering, sorting, and pagination.
*   **Applicant List Fetching (`/candidates-list-v1` - Employer View):** Implemented dynamic data fetching via `applications` table, filtering, sorting, and pagination.
*   **Single Item Page Fetching:** Implemented dynamic data fetching for Single Job, Single Employer, and Single Candidate pages (using `[id]` parameter initially).
*   **Data Submission Forms:**
    *   Implemented Post Job form submission.
    *   Implemented Employer Profile update form submission (main details, contact info, social links - pending schema).
    *   Implemented Candidate Profile update form submission (main details, contact info, skills).
    *   Implemented Candidate Certifications management.
*   **File Uploads:**
    *   Implemented Employer Logo upload.
    *   Implemented Candidate Avatar upload.
    *   Implemented Candidate Resume upload.
*   **Blog Implementation (Partial):**
    *   Implemented blog list page (`/blog-list-v1`) fetching data from Supabase.
    *   Implemented blog details page (`/blog-details/[slug]`) fetching data from Supabase.
    *   Updated sidebar components (`Categories`, `RecentPost`, `TagList`) to use dynamic data.
    *   Added blog schema setup to `externalInstructions.md`.
    *   Created seed script `supabase/seed_blog_data.sql` and seeded data via Dashboard.
*   **Routing Strategy:**
    *   Identified routing conflict between `[id]` and `[slug]` dynamic parameters.
    *   Approved plan to use `[slug]` for blog and `[slug]-[short_id]` for jobs, candidates, employers.
    *   Documented plan in `Cline_docs/routing_strategy_plan.md`.
    *   **Step 1 (Schema):** Updated `externalInstructions.md` with schema changes for `slug` and `short_id` columns. **(Confirmed Complete Externally)**
    *   **Step 2 (Rename Dirs):** Renamed dynamic route directories via CLI.
    *   **Step 3 (Update Pages):** Updated `page.jsx` files within renamed directories to parse `params['slug]-[short_id']` and fetch data using `short_id`.
    *   **Step 4 (Blog Page):** Verified existing `app/(blog)/blog-details/[slug]/page.jsx` is functional. Removed old `app/(blog)/blog-details/[id]/` directory.
    *   **Step 5 (Backend Generation):** Updated `externalInstructions.md` with instructions for creating Database Triggers to generate `slug` and `short_id`. **(Confirmed Complete Externally)**
    *   **Step 6 (Update Links):** Updated internal links in components using dynamic data (`RelatedJobs` for job/employer singles, `FilterTopBox` for candidate/employer lists) to use the new `slug`/`short_id` format. **(Components using static data deferred)**

**Immediate Next Steps (Routing Strategy Implementation - Step 7):**
*   **Code Task (Step 7):** Testing. Verify that all updated links work correctly and navigate to the appropriate pages. Test navigation from:
    *   Job Single -> Related Job Single
    *   Employer Single -> Related Job Single
    *   Candidate List -> Candidate Single
    *   Employer List -> Employer Single
*   **Deferred Task:** Refactor components currently using static data (Group B from Step 6 plan) to fetch dynamic data and update their internal links.

**Recent User Feedback:**
*   Confirmed successful execution of all SQL commands from `externalInstructions.md` (Schema changes and Trigger implementation).
*   Approved refined plan for Step 6 focusing on dynamic components.

**Error Logs / Known Issues:**
*   Initial `npm install` failed due to peer dependency conflict (`react-input-range` vs React 18). Resolved using `--legacy-peer-deps`.
*   Compilation errors occurred after updating menu data due to components expecting old data structure. Resolved by refactoring `HeaderNavContent.jsx` and `mobile-sidebar/index.jsx`.
*   Syntax error introduced while adding comment in `TopCompany.jsx`, subsequently fixed.
*   Initial attempt to fix HTML tag rendering with `dangerouslySetInnerHTML` was incorrect/unnecessary. Corrected by removing tags and `dangerouslySetInnerHTML`.
*   **Missing Filter Components:** `FoundationDate.jsx` (Employer list), `CandidatesGender.jsx`, `Qualification.jsx` (Candidate list - removed). Need addressing if these filters are added back later.
*   Supabase MCP tool has read-only access. Required DB functions/table creation moved to `externalInstructions.md`.
*   Employer list category filter not fully implemented pending schema/decision.
*   Social network fields not yet added to `companies` schema.
*   Supabase CLI v2.12.1 did not recognize `sql` or `db uri` commands. Updated CLI via Homebrew, but `sql` command still failed. Seeding done via Supabase Dashboard SQL Editor.
*   Error in initial trigger SQL for blog posts (using `TG_OP` in `WHEN` clause) identified and corrected in `externalInstructions.md`.
*   `apply_diff` tool proved unreliable for recent modifications; switched to `write_to_file`.
*   `search_files` tool failed to reliably find static imports.
