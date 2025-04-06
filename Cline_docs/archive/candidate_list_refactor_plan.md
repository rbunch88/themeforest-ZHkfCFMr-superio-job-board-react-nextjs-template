# Refined Plan: Candidate/Applicant List Page (`/candidates-list-v1`)

**Objective:** Refactor the candidate list page to function as an "Applicants" page, visible only to logged-in employers, showing candidates who applied to their specific jobs.

**Phase 1: Preparation & Schema**

1.  **Define `applications` Table Schema (External Task):**
    *   **Action:** Add the following SQL `CREATE TABLE` statement to `Cline_docs/externalInstructions.md` (or ensure it's already added).
    *   **SQL:**
        ```sql
        -- Table to track job applications
        CREATE TABLE public.applications (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
          candidate_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          application_date timestamptz NOT NULL DEFAULT now(),
          status text NOT NULL DEFAULT 'new'::text CHECK (status IN ('new', 'viewed', 'shortlisted', 'rejected', 'hired')),
          -- Optional fields (can be added later)
          -- cover_letter text NULL,
          -- resume_snapshot_url text NULL, -- Link to resume used at time of application
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          CONSTRAINT unique_job_candidate_application UNIQUE (job_id, candidate_profile_id) -- Prevent duplicate applications
        );

        -- Enable RLS
        ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

        -- Policies:
        -- Candidates can see their own applications
        CREATE POLICY "Candidates can view their own applications" ON public.applications
        FOR SELECT USING (auth.uid() = candidate_profile_id);

        -- Employers can see applications for jobs at their company
        CREATE POLICY "Employers can view applications for their jobs" ON public.applications
        FOR SELECT USING (
          EXISTS (
            SELECT 1
            FROM public.jobs j
            JOIN public.companies c ON j.company_id = c.id
            WHERE j.id = applications.job_id AND c.user_id = auth.uid()
          )
        );
        -- Allow candidates to insert their own applications (assuming direct apply isn't implemented yet, this allows backend insertion)
        -- CREATE POLICY "Candidates can create applications for themselves" ON public.applications
        -- FOR INSERT WITH CHECK (auth.uid() = candidate_profile_id);

        -- Allow employers to update status for applications to their jobs
        CREATE POLICY "Employers can update status for their job applications" ON public.applications
        FOR UPDATE USING (
           EXISTS (
            SELECT 1
            FROM public.jobs j
            JOIN public.companies c ON j.company_id = c.id
            WHERE j.id = applications.job_id AND c.user_id = auth.uid()
          )
        ) WITH CHECK (
           EXISTS (
            SELECT 1
            FROM public.jobs j
            JOIN public.companies c ON j.company_id = c.id
            WHERE j.id = applications.job_id AND c.user_id = auth.uid()
          )
        );

        -- Trigger for updated_at timestamp
        CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.applications
          FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

        -- Add indexes for performance
        CREATE INDEX idx_applications_job_id ON public.applications(job_id);
        CREATE INDEX idx_applications_candidate_profile_id ON public.applications(candidate_profile_id);
        ```
    *   **User Action:** Execute this SQL in the Supabase dashboard SQL Editor.

**Phase 2: Frontend Implementation**

2.  **Update Middleware (`superio/middleware.js`):**
    *   Restrict access to `/candidates-list-v1/**` routes to authenticated users with the 'employer' role.

3.  **Update Candidate Filter Sidebar (`superio/components/candidates-listing-pages/candidates-list-v1/FilterSidebar.jsx`):**
    *   Remove `Categories`, `CandidatesGender`, `Qualification` filter sections.
    *   Replace `Experience` component with `ExperienceLevel`.
    *   Rename "Date Posted" heading to "Date Applied".

4.  **Update Redux State (`candidateSlice.js`):**
    *   Ensure `experiences` initial state is `[]`.
    *   Add/verify `setExperienceLevels` reducer/action.
    *   Rename `datePost` state/actions to `dateApplied` (or similar) for clarity.

5.  **Fetch Filter Options (`superio/components/candidates-listing-pages/candidates-list-v1/index.jsx`):**
    *   Fetch `experience_levels` data on mount and dispatch `setExperienceLevels`.

6.  **Refactor Applicant List Display (`superio/components/candidates-listing-pages/candidates-list-v1/FilterTopBox.jsx`):**
    *   **Setup:** Convert to client component, add state (`fetchedApplicants`, `loading`, etc.).
    *   **Data Fetching (`useEffect`):**
        *   Get logged-in employer's `company_id`.
        *   Query `applications` table, joining `jobs`, `profiles`, `candidates`, `experience_levels`.
        *   Filter applications based on the employer's `company_id`.
        *   Apply filters (Keyword on applicant name/designation/skills, Location on applicant location, Date Applied on `application_date`, Experience Level on `candidate.experience_level_id`).
        *   Apply sorting (e.g., by `application_date`).
        *   Apply pagination.
        *   Update component state.
    *   **Rendering:** Display list of applicants with relevant details (name, avatar, designation, location, skills, applied date, job applied for).
    *   **Pagination:** Add TODO for "Show More".
    *   **Clear Handler:** Update to clear relevant filters.

**Mermaid Diagram:**

```mermaid
graph TD
    subgraph Employer Applicant List Page (`/candidates-list-v1`)
        A[page.jsx] --> B(CandidatesList Component);
        B --> C{FilterSidebar (Applicant Filters)};
        B --> D{FilterTopBox (Applicant List)};
        B --> E[Fetch Experience Levels];
        E -- Dispatch setExperienceLevels --> F[Redux Store (candidateSlice)];
    end

    subgraph Middleware (`middleware.js`)
        MW[Request for /candidates-list-v1] --> MW_Check{Auth & Role Check};
        MW_Check -- Employer Role --> A;
        MW_Check -- Other/No Role --> MW_Redirect[Redirect to Login/Dashboard];
    end

    subgraph FilterSidebar (candidates-list-v1/FilterSidebar.jsx)
        C --> G[SearchBox (Keywords)];
        C --> H[LocationBox];
        C --> I[DateApplied];
        C --> J(ExperienceLevel Component);
        %% Removed Category, Gender, Qualification
    end

    subgraph FilterTopBox (candidates-list-v1/FilterTopBox.jsx)
        D -- Reads Filter State --> K[Redux Store (candidateFilterSlice)];
        D --> GetUser{Get Logged-in User};
        GetUser --> GetCompany{Fetch Employer Company ID};
        GetCompany --> FetchApps{Fetch Applications};
        FetchApps -- Filters Applied --> L[Supabase Query (applications JOIN jobs JOIN profiles JOIN candidates ...)];
        L -- Returns Applicants --> D;
        D --> M[Render Applicant Blocks];
        D --> N[ListingShowing (Pagination TODO)];
    end

    subgraph Filter Components
        J -- Reads Experience Levels --> F;
        J -- Dispatches addExperience --> K;
        I -- Reads Date Options --> F;
        I -- Dispatches addDateApplied --> K;
        G -- Dispatches addKeyword --> K;
        H -- Dispatches addLocation --> K;
    end

    subgraph Database (External Task)
        DB_Task[User Creates 'applications' Table + RLS Policies in Supabase];
    end

    style F fill:#f9f,stroke:#333,stroke-width:2px
    style K fill:#f9f,stroke:#333,stroke-width:2px
    style L fill:#ccf,stroke:#333,stroke-width:2px