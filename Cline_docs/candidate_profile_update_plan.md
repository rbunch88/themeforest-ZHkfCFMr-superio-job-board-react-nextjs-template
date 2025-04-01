# Final Plan: Candidate Profile Update (`/candidates-dashboard/my-profile`)

**Objective:** Refactor the candidate profile page to allow users to view and update their profile information, storing data in the Supabase `profiles` and `candidates` tables, and managing certifications via a join table.

**Phase 1: Preparation & Schema (External Task)**

1.  **Add Columns to `profiles` Table:**
    *   **Action:** Add the following SQL `ALTER TABLE` statements to `Cline_docs/externalInstructions.md`.
    *   **SQL:**
        ```sql
        -- Add phone and contact_email to profiles table
        ALTER TABLE public.profiles
        ADD COLUMN phone text NULL,
        ADD COLUMN contact_email text NULL;

        -- Optional: Add policy to allow users to update their own phone/contact_email
        -- Ensure RLS is enabled on profiles first: ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        -- CREATE POLICY "Users can update their own profile contact info" ON public.profiles
        -- FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
        ```
    *   **User Action:** Execute this SQL in the Supabase dashboard SQL Editor.

2.  **Create `candidate_certifications` Table:**
    *   **Action:** Ensure the following SQL is in `Cline_docs/externalInstructions.md`.
    *   **SQL:**
        ```sql
        -- Join table for candidate certifications (Many-to-Many)
        CREATE TABLE public.candidate_certifications (
          candidate_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          certification_type_id uuid NOT NULL REFERENCES public.certification_types(id) ON DELETE CASCADE,
          created_at timestamptz NOT NULL DEFAULT now(),
          PRIMARY KEY (candidate_profile_id, certification_type_id) -- Composite primary key
        );

        -- Enable RLS
        ALTER TABLE public.candidate_certifications ENABLE ROW LEVEL SECURITY;

        -- Policies:
        -- Candidates can view their own certifications
        CREATE POLICY "Candidates can view their own certifications" ON public.candidate_certifications
        FOR SELECT USING (auth.uid() = candidate_profile_id);

        -- Candidates can manage their own certifications
        CREATE POLICY "Candidates can manage their own certifications" ON public.candidate_certifications
        FOR ALL USING (auth.uid() = candidate_profile_id);

        -- Add indexes
        CREATE INDEX idx_candidate_cert_candidate_id ON public.candidate_certifications(candidate_profile_id);
        CREATE INDEX idx_candidate_cert_cert_type_id ON public.candidate_certifications(certification_type_id);
        ```
    *   **User Action:** Execute this SQL in the Supabase dashboard SQL Editor if not already done.

**Phase 2: Frontend Implementation**

3.  **Refactor `FormInfoBox.jsx` (`candidates-dashboard/.../my-profile/components/my-profile/`):**
    *   Add state management (`useState`) for: `firstName`, `lastName`, `designation`, `phone`, `contactEmail`, `experienceLevelId`, `skills` (array for multi-select), `bio`. Add UI states (loading, saving, error, success).
    *   Fetch initial profile & candidate data in `useEffect` (joining `profiles` and `candidates`, `experience_levels`). Populate state, including the new `phone` and `contact_email`.
    *   Update form inputs:
        *   Use separate inputs for First Name and Last Name.
        *   Add inputs for Phone and Contact Email.
        *   Bind inputs/textarea/selects to state variables.
        *   Populate Experience Level dropdown dynamically from `experience_levels` table (fetched in parent or here).
        *   Use `react-select` (multi-select, creatable) for Skills, binding to `skills` state.
        *   Remove fields: Current/Expected Salary, Age, Education Levels (simple text), Languages, Categories, Allow In Search.
    *   Implement `handleSubmit`:
        *   Get user ID.
        *   Construct `profileData` (`first_name`, `last_name`, `phone`, `contact_email`) and `candidateData` (`designation`, `experience_level_id`, `skills`, `bio`).
        *   Update `profiles` table with `profileData`.
        *   Update `candidates` table with `candidateData` (using `profile_id` which is the user ID). Use `upsert` if a candidate record might not exist yet.
        *   Handle success/error feedback.

4.  **Create `MyCertifications.jsx` (`candidates-dashboard/.../my-profile/components/`):**
    *   Add state management: `allCertTypes` (array), `selectedCertIds` (Set or array), loading, saving, error, success states.
    *   Fetch all `certification_types` in `useEffect` on mount, store in `allCertTypes`.
    *   Fetch the *current candidate's* existing `certification_type_id`s from `candidate_certifications` in `useEffect`, store in `selectedCertIds`.
    *   Render checkboxes based on `allCertTypes`, checking boxes whose IDs are in `selectedCertIds`.
    *   Handle checkbox changes to update `selectedCertIds` state.
    *   Implement `handleSaveCertifications`:
        *   Get user ID (`candidate_profile_id`).
        *   Delete existing entries for the candidate in `candidate_certifications`.
        *   Insert new entries based on the current `selectedCertIds`.
        *   Handle success/error feedback.

5.  **Update Candidate Profile Page (`candidates-dashboard/my-profile/index.jsx`):**
    *   Add the new `MyCertifications` component below the `MyProfile` component within a new `ls-widget` section.

**Mermaid Diagram:**

```mermaid
graph TD
    subgraph Candidate Profile Page (`/candidates-dashboard/my-profile`)
        A[page.jsx] --> B(MyProfile Index Component);
        B --> C{MyProfile Component};
        B --> D{MyCertifications Component};
        B --> E{ContactInfoBox}; %% Likely remove or merge fields into FormInfoBox
        B --> F{SocialNetworkBox}; %% Keep or remove based on schema decisions
    end

    subgraph MyProfile Component (`./components/my-profile/index.jsx`)
        C --> G(LogoUpload);
        C --> H(FormInfoBox);
    end

     subgraph FormInfoBox (`./components/my-profile/FormInfoBox.jsx`)
        H -- Fetches Profile/Candidate Data --> J[Supabase (profiles JOIN candidates)];
        J -- Returns Data --> H;
        H -- Reads Experience Levels --> K[Redux Store (candidateSlice)]; %% Or fetches directly
        H -- Updates Profile/Candidate Data --> J;
        H --> RenderForm[Renders Name, Designation, Phone, Email, Bio, Experience Dropdown, Skills MultiSelect];
     end

     subgraph MyCertifications Component (`./components/MyCertifications.jsx`)
        D -- Fetches All Cert Types --> L[Supabase (certification_types)];
        D -- Fetches Selected Certs --> M[Supabase (candidate_certifications)];
        L -- Returns Cert Types --> D;
        M -- Returns Selected IDs --> D;
        D --> RenderCheckboxes[Renders Checkboxes];
        RenderCheckboxes -- On Save --> UpdateSelectedCerts[Update candidate_certifications Table];
        UpdateSelectedCerts --> M;
     end

     subgraph Database (External Task)
        DB_Task1[User Adds phone, contact_email to profiles Table];
        DB_Task2[User Creates 'candidate_certifications' Table + RLS Policies];
     end


    style K fill:#f9f,stroke:#333,stroke-width:2px
    style J fill:#ccf,stroke:#333,stroke-width:2px
    style L fill:#ccf,stroke:#333,stroke-width:2px
    style M fill:#ccf,stroke:#333,stroke-width:2px