## Project Context & Status Summary (April 4, 2025)

**Project Approach:**
This project utilizes the Superio React/Next.js frontend template as a starting point. The backend (database, authentication, storage, APIs) is being built from scratch using Supabase.

**Backend Status Summary:**

* **Completed:**
  * Core DB schema defined (users, companies, jobs, candidates, lookups, blog, applications, etc.)
  * Supabase client setup (`@supabase/ssr`)
  * Auth flow (signup/login/roles, DB trigger for profile creation)
  * Storage buckets configured (`avatars`, `company_logos`, `resumes`, `blog_images`) with RLS policies
  * RLS policies implemented for core tables
  * Dynamic data fetching for core lists (Jobs, Employers, Applicants, Blog)
  * Dynamic data fetching for single item pages (Job, Employer, Candidate, Blog)
  * Backend logic for key forms (Post Job, Employer Profile Update, Candidate Profile Update, Certifications Management, File Uploads)
  * Routing strategy implemented (`slug-short_id` for Job/Candidate/Employer, `slug` for Blog) - Steps 1-6.
  * Database triggers for `slug`/`short_id` generation
  * Database seeding script fixed and successfully executed.
* **In Progress / Blocked:**
  * **Debugging Page Load Errors:** Investigating why `/employers-list-v1` and `/blog-list-v1` are failing to load correctly.
  * **Testing Routing Strategy Links (Step 7):** Blocked by page load errors. Puppeteer tool also consistently failing ("detached Frame" errors).
* **To Do:**
  * Resolve `/employers-list-v1` loading error (likely Supabase query issue).
  * Resolve `/blog-list-v1` loading error (`createServerClient` import issue).
  * Resolve `/job-single-v1/[slug]-[short_id]` loading error (`id is not defined`).
  * Test the `/job-list-v2` fix (pagination logic corrected).
  * Perform manual testing of public routing links.
  * Implement/Verify Authentication fully.
  * Test authenticated routing links (manually or via resolved Puppeteer).
  * Payment integration (Stripe/PayPal).
  * Content migration (from WordPress).
  * Comprehensive testing (beyond routing links).
  * Deployment (Vercel).

**Frontend Status Note:**
While the Superio template provides UI components, many require refactoring or further implementation to fully integrate with the custom Supabase backend. Examples include displaying work history, connecting all actions/buttons to backend logic, and ensuring filters dynamically reflect backend data. The current page load errors highlight potential remaining integration gaps or bugs introduced during development.

---

*(Original content follows)*
---

# MyABAJobs Refresh - Current Task

**Project Overview:** Develop and launch a modern job board website (MyABAJobs) using the Superio React Next.js template, Supabase backend, Stripe/PayPal payments, and Vercel hosting, replacing the existing WordPress site. (Complexity: Medium-High)

**Current Stage:** Phase 2: Backend Integration & Supabase Setup (Debugging Page Load Errors)

**Completed Tasks:**

* **Navigation Menu Cleanup:** Updated main/mobile menus and header components.
* **Footer Link Cleanup:** Updated footer links.
* **Homepage (`home-3`) Component Link Review:** Reviewed and updated links.
* **Homepage (`home-3`) Content Update (Partial):** Updated text content based on copy doc (excluding Pricing). Fixed HTML/ampersand issues.
* **Metadata & Component Review (Task 1):** Updated page titles/descriptions, fixed typos, implemented dynamic metadata, corrected component links/typos.
* **Supabase Integration Planning (Task 2 - Planning):** Finalized plan for DB schema, Auth flow, and Storage integration.
* **Supabase Backend Setup (Task 2 - Backend Impl.):** Created/Updated DB Tables, Auth Trigger, Storage Buckets, and RLS Policies. Added instructions for `applications` table, `get_distinct_skills` function, `candidate_certifications` table, `profiles` columns (phone, contact_email), and blog tables/bucket. Enabled `moddatetime` extension. Added instructions for `slug` and `short_id` columns on `profiles`, `companies`, `jobs`. Removed faulty/redundant triggers (`set_job_identifier`, `validate_job_posting`).
* **Supabase Client Setup:** Installed `@supabase/ssr` and created `utils/supabaseClient.js`. Created `.env.local` with placeholder keys.
* **Authentication UI & Logic:**
  * Modified Registration form (`Register2.jsx`, `FormContent2.jsx`) to handle role selection and call `supabase.auth.signUp` with role/name metadata.
  * Modified Login form (`FormContent2.jsx`) to handle state and call `supabase.auth.signInWithPassword`, fetch profile role, and redirect.
* **Route Protection:** Created `middleware.js` using `@supabase/ssr` to protect dashboard routes based on session and role. Extended protection to `/candidates-list-v1` (Employer only).
* **Job List Fetching & Filtering (`/job-list-v2`):** Implemented dynamic data fetching, filtering, pagination, and dynamic filter options. Corrected component (`FilterJobsBox.jsx`) to fetch `slug`/`short_id` and use correct link format. Fixed salary/tag filter logic. Fixed pagination logic for "All" items.
* **Employer List Fetching (`/employers-list-v1`):** Implemented dynamic data fetching, filtering, sorting, and pagination. **(Currently failing to load - requires debugging)**.
* **Applicant List Fetching (`/candidates-list-v1` - Employer View):** Implemented dynamic data fetching via `applications` table, filtering, sorting, and pagination.
* **Single Item Page Fetching:** Implemented dynamic data fetching for Single Job, Single Employer, and Single Candidate pages (using `[id]` parameter initially).
* **Data Submission Forms:**
  * Implemented Post Job form submission.
  * Implemented Employer Profile update form submission (main details, contact info, social links - pending schema).
  * Implemented Candidate Profile update form submission (main details, contact info, skills).
  * Implemented Candidate Certifications management.
* **File Uploads:**
  * Implemented Employer Logo upload.
  * Implemented Candidate Avatar upload.
  * Implemented Candidate Resume upload.
* **Blog Implementation (Partial):**
  * Implemented blog list page (`/blog-list-v1`) fetching data from Supabase. **(Currently failing to load - requires debugging)**.
  * Implemented blog details page (`/blog-details/[slug]`) fetching data from Supabase.
  * Updated sidebar components (`Categories`, `RecentPost`, `TagList`) to use dynamic data.
  * Added blog schema setup to `externalInstructions.md`.
  * Created seed script `supabase/seed_blog_data.sql` and seeded data via Dashboard.
* **Routing Strategy:**
  * Identified routing conflict between `[id]` and `[slug]` dynamic parameters.
  * Approved plan to use `[slug]` for blog and `[slug]-[short_id]` for jobs, candidates, employers.
  * Documented plan in `Cline_docs/routing_strategy_plan.md`.
  * **Step 1 (Schema):** Updated `externalInstructions.md` with schema changes for `slug` and `short_id` columns. **(Confirmed Complete Externally)**
  * **Step 2 (Rename Dirs):** Renamed dynamic route directories via CLI.
  * **Step 3 (Update Pages):** Updated `page.jsx` files within renamed directories to parse `params['slug]-[short_id']` and fetch data using `short_id`.
  * **Step 4 (Blog Page):** Verified existing `app/(blog)/blog-details/[slug]/page.jsx` is functional. Removed old `app/(blog)/blog-details/[id]/` directory.
  * **Step 5 (Backend Generation):** Updated `externalInstructions.md` with instructions for creating Database Triggers to generate `slug` and `short_id`. **(Confirmed Complete Externally)**
  * **Step 6 (Update Links):** Updated internal links in components using dynamic data (`RelatedJobs` for job/employer singles, `FilterTopBox` for candidate/employer lists, `FilterJobsBox` for job list) to use the new `slug`/`short_id` format. **(Components using static data deferred)**
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

**Immediate Next Steps:**

* **Verify Employer List Fix:** Run dev server, navigate to `/employers-list-v1`, check if page loads without errors.
* **Debug Blog List Error:** Investigate and fix the `createServerClient` import error preventing `/blog-list-v1` from loading.
* **Debug Job Detail Error:** Investigate and fix the `id is not defined` error preventing `/job-single-v1/[slug]-[short_id]` from loading.
* **Manual Routing Test (Public):** Once pages load, proceed with manual testing of public route links (Jobs, Employers, Blog, Single Pages).
* **Address Authentication:** Fully implement and verify authentication flow.
* **Manual Routing Test (Auth):** Manually test authenticated route links (Applicants).

**Recent User Feedback:**

* Confirmed successful execution of all SQL commands from `externalInstructions.md` (Schema changes and Trigger implementation).
* Approved refined plan for Step 6 focusing on dynamic components.
* Confirmed successful execution of trigger cleanup SQL.
* Confirmed successful execution of the database seeding script after fixes.
* Requested documentation update to reflect project context and progress.
* Requested using Puppeteer for testing routing links (Blocked by tool errors).
* Confirmed "No jobs found" message persisted on `/job-list-v2` after code fixes and server restart.
* Confirmed `/employers-list-v1` failed with "parse select parameter" error.
* Confirmed `/employers-list-v1` failed with 400 Bad Request after first fix attempt.
* Confirmed `/employers-list-v1` still failed after second fix attempt (removing count).
* Confirmed `/employers-list-v1` still failed after removing comments from select string.
* Approved fixing typos before further debugging.

**Error Logs / Known Issues:**
* **Puppeteer Failures:** `puppeteer_navigate` and other tools consistently failing with "detached Frame" errors. Automated testing is blocked.
* **Employer List Load Error:** `/employers-list-v1` fails to load correctly, preventing testing. Root cause under investigation (previously query syntax, now potentially component lifecycle/SSR issue).
* **Blog List Load Error:** `/blog-list-v1` fails to load due to `Error: (0, _utils_supabaseClient__WEBPACK_IMPORTED_MODULE_2__.createServerClient) is not a function`.
* **Job Detail Load Error:** `/job-single-v1/[slug]-[short_id]` fails to load due to `Error: id is not defined`.
* Initial `npm install` failed due to peer dependency conflict (`react-input-range` vs React 18). Resolved using `--legacy-peer-deps`.
* Compilation errors occurred after updating menu data due to components expecting old data structure. Resolved by refactoring `HeaderNavContent.jsx` and `mobile-sidebar/index.jsx`.
* Syntax error introduced while adding comment in `TopCompany.jsx`, subsequently fixed.
* Initial attempt to fix HTML tag rendering with `dangerouslySetInnerHTML` was incorrect/unnecessary. Corrected by removing tags and `dangerouslySetInnerHTML`.
* **Missing Filter Components:** `FoundationDate.jsx` (Employer list), `CandidatesGender.jsx`, `Qualification.jsx` (Candidate list - removed). Need addressing if these filters are added back later.
* Supabase MCP tool has read-only access. Required DB functions/table creation moved to `externalInstructions.md`.
* Employer list category filter not fully implemented pending schema/decision.
* Social network fields not yet added to `companies` schema.
* Supabase CLI v2.12.1 did not recognize `sql` or `db uri` commands. Updated CLI via Homebrew, but `sql` command still failed. Seeding done via Supabase Dashboard SQL Editor.
* Error in initial trigger SQL for blog posts (using `TG_OP` in `WHEN` clause) identified and corrected in `externalInstructions.md`.
* `apply_diff` tool proved unreliable for recent modifications; switched to `write_to_file` and `search_and_replace`.
* `search_files` tool failed to reliably find static imports.
* **Work History Display:** Frontend components to display/manage candidate work history (stored in `candidates.work_history` JSONB field) are not yet implemented.
