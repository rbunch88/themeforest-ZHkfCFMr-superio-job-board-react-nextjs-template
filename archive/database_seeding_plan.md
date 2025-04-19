# Database Seeding Plan (ABA Focused)

**1. Goal:**
Populate the Supabase database with a focused set of **ABA-relevant**, realistic-looking data to effectively test and demonstrate key application pages, primarily job listings (e.g., RBT, BCBA positions) and candidate profiles (e.g., behavior analysts).

**2. Key Tables & Dependencies:**

*   **Lookup Tables (Seed First):** `job_categories`, `job_types`, `experience_levels`, `certification_types`
*   **Core Entities:** `companies`, `users` (for linking employers/candidates), `candidates`, `profiles`
*   **Dependent Entities:** `jobs` (links to companies, categories, types, levels, users), `job_history` (links to profiles)
*   **Optional:** `applications`

```mermaid
graph TD
    subgraph "Lookup Data (Seed First)"
        JC(job_categories)
        JT(job_types)
        EL(experience_levels)
        CT(certification_types)
    end

    subgraph "Core Entities"
        CO(companies)
        U(users)
        CA(candidates)
        P(profiles)
    end

    subgraph "Dependent Data (Seed Last)"
        J(jobs)
        JH(job_history)
        A(applications) -- Optional
    end

    JC --> J
    JT --> J
    EL --> J
    CT --> J
    CO --> J
    U --> J
    U --> CO
    U --> CA
    U --> P
    U --> JH
    U --> A
    CA --> P
    CA --> JH
    CA --> A
    P --> JH
    J --> A
```

**3. Seeding Strategy:**

*   **Method:** JavaScript/TypeScript script using `@supabase/supabase-js`.
*   **Data Generation:**
    *   Utilize `faker-js/faker` for generic data like names, dates, locations.
    *   **Crucially, define and use custom lists/generators for ABA-specific data:**
        *   **Job Titles:** (e.g., "Registered Behavior Technician (RBT)", "Board Certified Behavior Analyst (BCBA)", "Clinical Supervisor", "ABA Therapist", "Special Education Teacher - ABA Focus")
        *   **Skills:** (e.g., "Functional Behavior Assessment (FBA)", "Discrete Trial Training (DTT)", "Verbal Behavior Milestones Assessment and Placement Program (VB-MAPP)", "Picture Exchange Communication System (PECS)", "Data Collection & Analysis", "Behavior Intervention Plan (BIP) Development")
        *   **Company Types/Names:** (e.g., "ABA Therapy Clinic", "Autism Center", "School District", "In-Home ABA Provider")
        *   **Lookup Data:** Ensure `job_categories` (e.g., "Clinical Services", "School-Based", "Early Intervention"), `certification_types` (e.g., "RBT", "BCBA", "BCaBA", "State Teaching License"), and `experience_levels` reflect relevant ABA career paths.
    *   Incorporate ABA terminology into generated job descriptions, responsibilities, requirements, and profile summaries.
*   **Location:** `superio/supabase/seed/`.
*   **Execution:** Manual run or `npm run seed`.
*   **Environment:** Development only, using environment variables for credentials.

**4. Data Volume & Structure (Reduced & ABA Focused):**

*   **Lookups:** 3-5 relevant `job_categories`, 2-3 `job_types`, 3-4 `experience_levels`, 2-3 `certification_types` (e.g., RBT, BCBA).
*   **Companies:** 5-10 ABA-related organizations (clinics, schools, providers).
*   **Users:** 10-15 users (mix of employers/candidates).
*   **Candidates:** 5-8 candidate records with ABA backgrounds.
*   **Profiles:** Corresponding profiles with relevant ABA skills, experience summaries.
*   **Job History:** 1-2 past ABA-related job entries per candidate profile.
*   **Jobs:** 10-20 ABA job postings (RBT, BCBA, etc.) with relevant details.

**5. Implementation Steps (High-Level):**

1.  **Setup:** Install dependencies (`@faker-js/faker`, `@supabase/supabase-js`), create `superio/supabase/seed/` directory.
2.  **Configuration:** Set up environment variables for Supabase URL and Service Role Key.
3.  **Script Creation (`seed.js` or `seed.ts`):** Initialize client, implement ABA-specific data generators using custom lists and Faker, insert data respecting dependencies, add clearing logic (with safety checks).
4.  **npm Script:** Add `"seed": "node ./supabase/seed/seed.js"` (or similar) to `superio/package.json`.

**6. Verification:**

*   Run script, check console for errors.
*   Verify data population in Supabase Studio.
*   Verify in the running application, ensuring job titles, skills, descriptions, etc., are ABA-specific.