# Homepage Content Update Plan (Excluding Pricing)

**Date:** March 29, 2025

**Objective:** Update the content of the `home-3` homepage components based on the copy provided in `Cline_docs/MyABAJobs Website Copy.md`, excluding the pricing section for now.

*(References are to item numbers in `Cline_docs/MyABAJobs Website Copy.md`)*

1.  **Logo (Item 1) &amp; Contact Info (Item 32):**
    *   **File:** `superio/components/header/DefaulHeader2.jsx`
        *   **Action:** Use `apply_diff` to update logo `src` (line 41) to `/images/logos/myabajobslogo-square-white.svg`.
    *   **File:** `superio/components/footer/common-footer/index.jsx`
        *   **Action:** Use `apply_diff` to update logo `src` (line 19) to `/images/logos/myabajobslogo-square-white.svg`.
        *   **Action:** Use `apply_diff` to remove the phone number paragraph (lines 24-27).
        *   **Action:** Use `apply_diff` to remove the address lines (lines 29-30).
        *   **Action:** Use `apply_diff` to update the email link (lines 31-33) to use `info@myabajobs.com`.
2.  **Headline (Item 3 - Option A) &amp; Sub-headline (Item 4):**
    *   **File:** `superio/components/hero/hero-3/index.jsx`
    *   **Action:** Use `apply_diff` to replace `h3` content (lines 13-15) with `Feeling Stuck? Stop Searching, Start Growing. <strong>My ABA Jobs</strong> Connects You to Roles Where Your ABA Expertise Thrives.`
    *   **Action:** Use `apply_diff` to replace `div.text` content (lines 16-18) with `Skip the noise of generic boards. Find rewarding BCBA, RBT, and leadership roles in supportive, ethical environments.`
3.  **Search Bar Placeholders (Item 7):**
    *   **File:** `superio/components/common/job-search/SearchForm2.jsx`
    *   **Action:** Use `apply_diff` to update `placeholder` for "What" input (line 23) to `"BCBA Supervisor", "RBT School Setting", "Remote Clinical Director"`.
    *   **Action:** Use `apply_diff` to update `placeholder` for "Where" input (line 31) to `"City, State, or 'Remote'"`.
4.  **Footer Links (Item 9):**
    *   **File:** `superio/data/footerContent.js`
    *   **Action:** Use `write_to_file` to replace content with a structure reflecting Item 9 suggestions (e.g., "Find ABA Jobs", "Career Resources", "Post Job", "Pricing", "Our Commitment", "Contact"). *(Note: Some links like "Career Resources" may initially point to placeholder pages)*.
5.  **Popular Job Categories Section (Items 10-12):**
    *   **File:** `superio/components/home-3/index.jsx`
        *   **Action:** Use `apply_diff` to update `h2` (line 44) to `Focus Your Impact: Explore Roles by Specialty &amp; Setting`.
        *   **Action:** Use `apply_diff` to update `div.text` (line 45) to `Find opportunities where your unique skills in assessment, intervention, and data analysis will make a real difference.`
    *   **File:** `superio/data/job-catergories.js`
        *   **Action:** Use `write_to_file` to replace content with ABA categories from Item 12 (BCBA Roles, RBT Positions, etc.), assigning appropriate `flaticon-` icons and placeholder `jobNumber`.
6.  **Featured Jobs Section (Items 16-17):**
    *   **File:** `superio/components/home-3/index.jsx`
        *   **Action:** Use `apply_diff` to update `h2` (line 58) to `Advance Your Career: Featured Roles Offering Growth &amp; Impact`.
        *   **Action:** Use `apply_diff` to update `div.text` (lines 59-61) to an empty string or remove it.
    *   **File:** `superio/data/job-featured.js`
        *   **Action:** *No code change now.* Data needs manual update later.
7.  **Top Company Section (Items 18-20):**
    *   **File:** `superio/components/home-3/index.jsx`
        *   **Action:** Use `apply_diff` to update `h2` (line 124) to `Connect with ABA Practices Committed to Quality Care &amp; Staff Support`.
        *   **Action:** Use `apply_diff` to update `div.text` (lines 125-128) to `Discover employers who invest in their teams, value ethical practices, and provide environments where you can do your best work.`
    *   **File:** `superio/data/topCompany.js`
        *   **Action:** *No code change now.* Data needs manual update later.
8.  **Testimonials Section (Items 21-23):**
    *   **File:** `superio/components/home-3/index.jsx`
        *   **Action:** Use `apply_diff` to update `h2` (line 104) to `Tired of Hitting a Wall? See How Others Leveled Up with <strong>My ABA Jobs</strong>.`
        *   **Action:** Use `apply_diff` to update `div.text` (lines 105-107) to `Real stories from ABA pros who found supportive roles and reignited their passion:`.
    *   **File:** `superio/data/testimonial.js`
        *   **Action:** Use `apply_diff` to update entries with `id` 4, 5, and 6 using placeholder quotes/names from Item 23.
9.  **Pricing Packages Section (Items 24-27):**
    *   **Action:** **SKIP FOR NOW.**
10. **Employer Promo Section / About2 (Items 28-30):**
    *   **File:** `superio/components/about/About2.jsx`
        *   **Action:** Use `apply_diff` to update `h2` (lines 12-15) to `Reach ABA Professionals Who Think Like You Do.`
        *   **Action:** Use `apply_diff` to update `div.text` (lines 16-20) with content from Item 29.
        *   **Action:** Use `apply_diff` to update button text (line 31) to `Post Your Job &amp; Connect with ABA Experts Today`.
11. **Images (Item 31):**
    *   **Action:** *No code change now.* Requires manual update or user-provided paths.