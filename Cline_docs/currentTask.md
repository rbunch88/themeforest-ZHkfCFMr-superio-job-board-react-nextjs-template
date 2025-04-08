## Project Context & Status Summary (April 6, 2025)

**Project Approach:**
This project utilizes the Superio React/Next.js frontend template as a starting point. The backend (database, authentication, storage, APIs) is being built from scratch using Supabase.

**Backend Status Summary:**

* **Completed:**
  * Core DB schema defined (users, companies, jobs, candidates, lookups, blog, applications, etc.)
  * Supabase client setup (`@supabase/ssr`) - *Refactored to align with latest docs*
  * Auth flow (signup/login/roles, DB trigger for profile creation)
  * Storage buckets configured (`avatars`, `company_logos`, `resumes`, `blog_images`) with RLS policies
  * RLS policies implemented for core tables
  * Dynamic data fetching for core lists (Jobs, Employers, Applicants, Blog) - *Load errors resolved*
  * Dynamic data fetching for single item pages (Job, Employer, Candidate, Blog)
  * Backend logic for key forms (Post Job, Employer Profile Update, Candidate Profile Update, Certifications Management, File Uploads)
  * Routing strategy implemented (`slug-short_id` for Job/Candidate/Employer, `slug` for Blog) - Steps 1-6.
  * Database triggers for `slug`/`short_id` generation
  * Database seeding script fixed and successfully executed.
  * **Dependency Conflict Resolution:** Replaced `react-input-range` with `react-range`.
  * **Supabase SSR Setup Refactor:** Updated `@supabase/ssr`, corrected middleware implementation (`middleware.js`, `utils/supabase/middleware.js`), corrected server/client utilities (`utils/supabase/server.js`, `utils/supabase/client.js`), added missing env vars, fixed component imports (`blog-sidebar/index.jsx`).
  * **Employer Page Client Errors Fixed:** Corrected Supabase query syntax, refactored filter components (`SearchBox`, `LocationBox`, `FoundationDate`) to use `useSearchParams`, fixed NaN display in `FoundationDate`.
* **In Progress / Blocked:**
  * **Debugging Remaining Page Load Errors:** Investigating why `/job/[slug]` fails to load.
  * **Testing Routing Strategy Links:** Partially unblocked, but full testing requires `/job/[slug]` fix. Puppeteer tool still consistently failing ("detached Frame" errors).
* **To Do:**
  * Resolve `/job/[slug]` loading error (`id is not defined` - likely needs code update to use `params.slug` instead of parsing `short_id`).
  * Test the `/jobs` fix (pagination logic corrected).
  * Perform manual testing of public routing links (Jobs, Employers, Blog, Single Pages).
  * Implement/Verify Authentication fully.
  * Test authenticated routing links (manually or via resolved Puppeteer).
  * Payment integration (Stripe/PayPal). // TODO
  * Content migration (from WordPress).
  * Comprehensive testing (beyond routing links).
  * Deployment (Vercel).

**Frontend Status Note:**
While the Superio template provides UI components, many require refactoring or further implementation to fully integrate with the custom Supabase backend. Examples include displaying work history, connecting all actions/buttons to backend logic, and ensuring filters dynamically reflect backend data. The remaining `/job/[slug]` error highlights potential remaining integration gaps or bugs introduced during development.

---

*(Original content follows)*
---

# MyABAJobs Refresh - Current Task

**Project Overview:** Develop and launch a modern job board website (MyABAJobs) using the Superio React Next.js template, Supabase backend, Stripe/PayPal payments, and Vercel hosting, replacing the existing WordPress site. (Complexity: Medium-High)

**Current Stage:** Phase 2: Backend Integration & Frontend Refinement

**Completed Tasks:**

* **Navigation Menu Cleanup:** Updated main/mobile menus and header components.
* **Footer Link Cleanup:** Updated footer links.
* **Homepage (`home-3`) Component Link Review:** Reviewed and updated links.
* **Homepage (`home-3`) Content Update (Partial):** Updated text content based on copy doc (excluding Pricing). Fixed HTML/ampersand issues.
* **Metadata & Component Review (Task 1):** Updated page titles/descriptions, fixed typos, implemented dynamic metadata, corrected component links/typos.
* **Supabase Integration Planning (Task 2 - Planning):** Finalized plan for DB schema, Auth flow, and Storage integration.
* **Supabase Backend Setup (Task 2 - Backend Impl.):** Created/Updated DB Tables, Auth Trigger, Storage Buckets, and RLS Policies. Added instructions for `applications` table, `get_distinct_skills` function, `candidate_certifications` table, `profiles` columns (phone, contact_email), and blog tables/bucket. Enabled `moddatetime` extension. Added instructions for `slug` and `short_id` columns on `profiles`, `companies`, `jobs`. Removed faulty/redundant triggers (`set_job_identifier`, `validate_job_posting`).
* **Supabase Client Setup & Refactor:** Installed `@supabase/ssr`, created initial client, later refactored utility files (`client.js`, `server.js`, `middleware.js`) and main `middleware.js` to align with latest `@supabase/ssr` documentation and examples. Added missing server-side env vars.
* **Authentication UI & Logic:**
  * Modified Registration form (`Register2.jsx`, `FormContent2.jsx`) to handle role selection and call `supabase.auth.signUp` with role/name metadata.
  * Modified Login form (`FormContent2.jsx`) to handle state and call `supabase.auth.signInWithPassword`, fetch profile role, and redirect.
* **Route Protection:** Created and refactored `middleware.js` using `@supabase/ssr` utility pattern to protect dashboard routes based on session and role. Extended protection to `/candidates` (Employer only).
* **Job List Fetching & Filtering (`/jobs`):** Implemented dynamic data fetching, filtering, pagination, and dynamic filter options. Corrected component (`FilterJobsBox.jsx`) to fetch `slug`/`short_id` and use correct link format (`/job/[slug]`). Fixed salary/tag filter logic. Fixed pagination logic for "All" items.
* **Employer List Fetching (`/employers`):** Implemented dynamic data fetching, filtering, sorting, and pagination. **(Load errors & client errors resolved)**.
* **Applicant List Fetching (`/candidates` - Employer View):** Implemented dynamic data fetching via `applications` table, filtering, sorting, and pagination.
* **Single Item Page Fetching:** Implemented dynamic data fetching for Single Job (`/job/[slug]`), Employer (`/employers-single-v2/[slug]-[short_id]`), Candidate (`/candidates-single-v2/[slug]-[short_id]`), and Blog (`/blog-details/[slug]`) pages.
* **Data Submission Forms:**
  * Implemented Post Job form submission.
  * Implemented Employer Profile update form submission (main details, contact info, social links - pending schema). // TODO: Add social links schema
  * Implemented Candidate Profile update form submission (main details, contact info, skills).
  * Implemented Candidate Certifications management.
* **File Uploads:**
  * Implemented Employer Logo upload.
  * Implemented Candidate Avatar upload.
  * Implemented Candidate Resume upload.
* **Blog Implementation (Partial):**
  * Implemented blog list page (`/blog`) fetching data from Supabase. **(Load errors resolved, new client component error identified)**.
  * Implemented blog details page (`/blog-details/[slug]`) fetching data from Supabase. // TODO: Verify this works
  * Updated sidebar components (`Categories`, `RecentPost`, `TagList`) to use dynamic data. Corrected direct Supabase import in `blog-sidebar/index.jsx`.
  * Added blog schema setup to `externalInstructions.md`.
  * Created seed script `supabase/seed_blog_data.sql` and seeded data via Dashboard.
* **Routing Strategy:**
  * Identified routing conflict between `[id]` and `[slug]` dynamic parameters.
  * Approved plan to use `[slug]` for blog and `[slug]-[short_id]` for jobs, candidates, employers.
  * Documented plan in `Cline_docs/routing_strategy_plan.md`.
  * **Step 1 (Schema):** Updated `externalInstructions.md` with schema changes for `slug` and `short_id` columns. **(Confirmed Complete Externally)**
  * **Step 2 (Rename Dirs):** Renamed dynamic route directories via CLI (e.g., `[id]` -> `[slug]-[short_id]` or `[slug]`).
  * **Step 3 (Update Pages):** Updated `page.jsx` files within renamed directories to parse `params.slug` (for jobs/blog) or `params['slug]-[short_id']` (for employers/candidates) and fetch data using the appropriate identifier (slug or short_id). **(Job page likely needs fix here)**
  * **Step 4 (Blog Page):** Verified `app/(blog)/blog-details/[slug]/page.jsx` exists. Removed old `app/(blog)/blog-details/[id]/` directory.
  * **Step 5 (Backend Generation):** Updated `externalInstructions.md` with instructions for creating Database Triggers to generate `slug` and `short_id`. **(Confirmed Complete Externally)**
  * **Step 6 (Update Links):** Updated internal links in components using dynamic data (`RelatedJobs` for job/employer singles, `FilterTopBox` for candidate/employer lists, `FilterJobsBox` for job list) to use the correct format (`/job/[slug]`, `/blog-details/[slug]`, `/employers-single-v2/[slug]-[short_id]`, `/candidates-single-v2/[slug]-[short_id]`). **(Components using static data deferred)**
* **Database Seeding Script:**
  * Created plan (`Cline_docs/database_seeding_plan.md`).
  * Created script `superio/supabase/seed/seed.js`.
  * Added `dotenv` dependency and configuration.
  * Added `npm run seed` script to `package.json`.
  * Implemented seeding for lookups, users/roles, companies, candidates/profiles (with work history), jobs.
  * Implemented robust table clearing (`clearTables`), including auth users.
  * Fixed various syntax errors and database constraint issues.
  * **Successfully executed seeding script.**
* **Minor Bug Fixes:**
  * Fixed `dispath` typos in `LocationBox.jsx`, `FoundationDate.jsx`, `SearchBox.jsx`.
* **Documentation Cleanup:** Archived completed planning documents from `Cline_docs/` into `Cline_docs/archive/`.
* **Dependency & SSR Debugging:**
    * Replaced `react-input-range` with `react-range` to resolve peer dependency conflict.
    * Updated `@supabase/ssr` package.
    * Refactored Supabase client utilities (`client.js`, `server.js`, `middleware.js`) and `middleware.js` usage to align with latest documentation.
    * Added missing server-side environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).
    * Corrected direct Supabase import in `blog-sidebar/index.jsx`.
    * Corrected Supabase query syntax (removed comments) in `employers/page.jsx`.
    * Refactored `SearchBox.jsx`, `LocationBox.jsx`, `FoundationDate.jsx` to use `useSearchParams` hook and fixed resulting NaN issue in `FoundationDate.jsx`.
* **Job Filter Refactor:** Refactored job list filter components (`SalaryRangeSlider`, `JobType`, `SearchBox`, `Tag`, `ExperienceLevel`, `LocationBox`, `DatePosted`, `JobSelect`) to use URL search parameters instead of Redux, enabling automatic updates and improving SEO potential. Cleaned up unused filter state/actions from `filterSlice.js`.

**Immediate Next Steps:**

* **Test Job Filters:** Thoroughly test the newly refactored job filters on the `/jobs` page (individual filters, combinations, clear all, pagination, direct URL loading).
* **Plan Next Tasks:** Create plans for:
    * Conditional Menu Items (based on auth state/role).
    * Google Maps Integration Fix.
    * Blog Page Error Fix (`useSearchParams` in `BlogPagination.jsx`).
* **Debug Job Detail Error:** Investigate and fix the `id is not defined` error preventing `/job/[slug]` from loading (likely needs code update to use `params.slug` instead of parsing `short_id`).
* **Manual Routing Test (Public):** Proceed with manual testing of public route links (Jobs, Employers, Blog, Single Pages).
* **Address Authentication:** Fully implement and verify authentication flow.
* **Manual Routing Test (Auth):** Manually test authenticated route links (`/candidates`).
**Recent User Feedback:**

* Confirmed successful execution of all SQL commands from `externalInstructions.md` (Schema changes and Trigger implementation).
* Approved refined plan for Step 6 focusing on dynamic components.
* Confirmed successful execution of trigger cleanup SQL.
* Confirmed successful execution of the database seeding script after fixes.
* Requested documentation update to reflect project context and progress.
* Requested using Puppeteer for testing routing links (Blocked by tool errors).
* Confirmed "No jobs found" message persisted on `/jobs` after code fixes and server restart.
* Confirmed `/employers` failed with "parse select parameter" error.
* Confirmed `/employers` failed with 400 Bad Request after first fix attempt.
* Confirmed `/employers` still failed after second fix attempt (removing count).
* Confirmed `/employers` still failed after removing comments from select string.
* Approved fixing typos before further debugging.
* Provided specific Supabase examples leading to successful SSR fix.
* Requested documentation update after fixes.

**Error Logs / Known Issues:**
* **Puppeteer Failures:** `puppeteer_navigate` and other tools consistently failing with "detached Frame" errors. Automated testing is blocked in debug mode. try with "Browser Tester" mode
* ~~**Employer List Load Error:** `/employers` fails to load correctly.~~ **(Resolved)**
* ~~**Blog List Load Error:** `/blog` fails to load due to Supabase SSR client creation errors.~~ **(Resolved)**
* **Job Detail Load Error:** `/job/[slug]` fails to load due to `Error: id is not defined` (likely incorrect parsing in page component).
* ~~Initial `npm install` failed due to peer dependency conflict (`react-input-range` vs React 18).~~ **(Resolved)**
* Compilation errors occurred after updating menu data due to components expecting old data structure. Resolved by refactoring `HeaderNavContent.jsx` and `mobile-sidebar/index.jsx`.
* Syntax error introduced while adding comment in `TopCompany.jsx`, subsequently fixed.
* Initial attempt to fix HTML tag rendering with `dangerouslySetInnerHTML` was incorrect/unnecessary. Corrected by removing tags and `dangerouslySetInnerHTML`.
* **Missing Filter Components:** `CandidatesGender.jsx`, `Qualification.jsx` (Candidate list - removed). Need addressing if these filters are added back later.
* Supabase MCP tool has read-only access. Required DB functions/table creation moved to `externalInstructions.md`.
* Employer list category filter not fully implemented pending schema/decision.
* Social network fields not yet added to `companies` schema.
* Supabase CLI v2.12.1 did not recognize `sql` or `db uri` commands. Updated CLI via Homebrew, but `sql` command still failed. Seeding done via Supabase Dashboard SQL Editor.
* Error in initial trigger SQL for blog posts (using `TG_OP` in `WHEN` clause) identified and corrected in `externalInstructions.md`.
* `apply_diff` tool proved unreliable for recent modifications; switched to `write_to_file` and `search_and_replace`.
* `search_files` tool failed to reliably find static imports.
* **Work History Display:** Frontend components to display/manage candidate work history (stored in `candidates.work_history` JSONB field) are not yet implemented.
* ~~`searchParams.get is not a function` error in `/employers` page components (`SearchBox`, `LocationBox`, `FoundationDate`).~~ **(Resolved)**
* ~~`FoundationDate.jsx` displaying "NaN NaN".~~ **(Resolved)**
* **Blog Page Error:** `useSearchParams` used in Server Component (`BlogPagination.jsx`).
