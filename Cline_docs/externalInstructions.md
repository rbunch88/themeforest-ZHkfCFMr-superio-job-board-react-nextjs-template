# External Instructions for MyABAJobs Refresh

This document contains instructions for tasks that need to be performed outside the IDE/Cline environment.

## Supabase Setup

### 1. Set Environment Variables

*   Create a `.env.local` file in the `superio` directory.
*   Add the following variables, replacing the placeholder values with your actual Supabase project URL and Anon Key:
    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
    *(You can find these in your Supabase project settings under API)*

### 2. Enable `moddatetime` Extension (Required for `updated_at` triggers)

*   **Reason:** The `moddatetime()` function, used in triggers to automatically update `updated_at` timestamps, requires this extension to be enabled.
*   **Action:** In the Supabase SQL Editor, run the following query **ONCE** for your project:
    ```sql
    -- Enable the moddatetime extension if it's not already enabled
    CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;
    ```
*   Click **"Run"**.

### 3. Create `get_distinct_skills` Database Function (Required for Job Tag Filter)

*   **Reason:** The application needs an efficient way to fetch all unique skills listed in job postings for the "Tags" filter on the job list page. The Supabase MCP tool has read-only access and cannot create functions.
*   **Action:** Go to your Supabase project dashboard.
*   Navigate to the **SQL Editor** section (usually under "Database").
*   Click **"New query"**.
*   Paste the following SQL code into the editor:
    ```sql
    CREATE OR REPLACE FUNCTION public.get_distinct_skills() -- Specify schema explicitly
    RETURNS SETOF text -- Return a set of text values
    LANGUAGE sql
    STABLE -- Function doesn't modify the database
    AS $$
      SELECT DISTINCT unnest(skills)
      FROM public.jobs -- Specify schema
      WHERE skills IS NOT NULL AND skills <> '{}'; -- Ensure skills array is not null or empty
    $$;
    ```
*   Click **"Run"** to execute the query and create the function.

### 4. Add Columns to `profiles` Table

*   **Reason:** To store optional phone number, contact email, slug, and short ID for candidate/user profiles.
*   **Action:** In the Supabase SQL Editor, run the following query:
    ```sql
    -- Add phone, contact_email, slug, short_id to profiles table
    ALTER TABLE public.profiles
    ADD COLUMN phone text NULL,
    ADD COLUMN contact_email text NULL,
    ADD COLUMN slug text NULL, -- Will be generated from name
    ADD COLUMN short_id text NULL UNIQUE; -- Will be generated, must be unique

    -- Add index for faster lookups by short_id
    CREATE INDEX IF NOT EXISTS idx_profiles_short_id ON public.profiles(short_id);

    -- Optional: Add policy to allow users to update their own phone/contact_email
    -- Ensure RLS is enabled on profiles first if not already: ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    -- Make sure a policy exists allowing users SELECT access to their own profile.
    -- Then, add the UPDATE policy:
    -- CREATE POLICY "Users can update their own profile contact info" ON public.profiles
    -- FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    ```

### 5. Add Columns to `companies` Table

*   **Reason:** To store slug and short ID for company profiles.
*   **Action:** In the Supabase SQL Editor, run the following query:
    ```sql
    -- Add slug, short_id to companies table
    ALTER TABLE public.companies
    ADD COLUMN slug text NULL, -- Will be generated from name
    ADD COLUMN short_id text NULL UNIQUE; -- Will be generated, must be unique

    -- Add index for faster lookups by short_id
    CREATE INDEX IF NOT EXISTS idx_companies_short_id ON public.companies(short_id);
    ```

### 6. Add Columns to `jobs` Table

*   **Reason:** To store slug and short ID for job postings.
*   **Action:** In the Supabase SQL Editor, run the following query:
    ```sql
    -- Add slug, short_id to jobs table
    ALTER TABLE public.jobs
    ADD COLUMN slug text NULL, -- Will be generated from title
    ADD COLUMN short_id text NULL UNIQUE; -- Will be generated, must be unique

    -- Add index for faster lookups by short_id
    CREATE INDEX IF NOT EXISTS idx_jobs_short_id ON public.jobs(short_id);
    ```

### 7. Create `candidate_certifications` Table (For Candidate Profile)

*   **Reason:** To create a many-to-many relationship between candidates (`profiles` table) and the existing `certification_types` table.
*   **Action:** In the Supabase SQL Editor, run the following query:
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

    -- Candidates can insert/delete their own certifications
    CREATE POLICY "Candidates can manage their own certifications" ON public.candidate_certifications
    FOR ALL USING (auth.uid() = candidate_profile_id);

    -- Allow employers to view certifications of candidates who applied to their jobs (Optional - uncomment if needed)
    -- CREATE POLICY "Employers can view applicant certifications" ON public.candidate_certifications
    -- FOR SELECT USING (
    --   EXISTS (
    --     SELECT 1 FROM public.applications app
    --     JOIN public.jobs j ON app.job_id = j.id
    --     JOIN public.companies c ON j.company_id = c.id
    --     WHERE app.candidate_profile_id = candidate_certifications.candidate_profile_id
    --       AND c.user_id = auth.uid()
    --   )
    -- );

    -- Add indexes
    CREATE INDEX idx_candidate_cert_candidate_id ON public.candidate_certifications(candidate_profile_id);
    CREATE INDEX idx_candidate_cert_cert_type_id ON public.candidate_certifications(certification_type_id);
    ```

### 8. Create `applications` Table (For Employer Applicant List)

*   **Reason:** To track which candidates applied to which jobs, enabling the "Applicants" view for employers.
*   **Action:** In the Supabase SQL Editor, run the following query (ensure `moddatetime` extension is enabled first - see step 2):
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
    -- Allow candidates to insert their own applications (Needed for apply button functionality)
    CREATE POLICY "Candidates can create applications for themselves" ON public.applications
    FOR INSERT WITH CHECK (auth.uid() = candidate_profile_id);

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
      FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime (updated_at); -- Use function from extensions schema

    -- Add indexes for performance
    CREATE INDEX idx_applications_job_id ON public.applications(job_id);
    CREATE INDEX idx_applications_candidate_profile_id ON public.applications(candidate_profile_id);
    ```

### 9. Blog Functionality Setup

*   **Reason:** To create the necessary database tables and storage bucket for the blog feature.
*   **Action:** In the Supabase SQL Editor, run the following queries (ensure `moddatetime` extension is enabled first - see step 2):

    ```sql
    -- Create blog_categories table
    CREATE TABLE public.blog_categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL UNIQUE,
      slug text NOT NULL UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read blog categories" ON public.blog_categories FOR SELECT USING (true);
    -- Add admin write policy later

    -- Create blog_tags table
    CREATE TABLE public.blog_tags (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL UNIQUE,
      slug text NOT NULL UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read blog tags" ON public.blog_tags FOR SELECT USING (true);
    -- Add admin write policy later

    -- Create blog_posts table
    CREATE TABLE public.blog_posts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      slug text UNIQUE NOT NULL, -- Ensure blog slugs are unique
      content text NOT NULL,
      excerpt text NULL,
      featured_image_url text NULL,
      author_profile_id uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
      category_id uuid NULL REFERENCES public.blog_categories(id) ON DELETE SET NULL,
      status text NOT NULL DEFAULT 'draft'::text CHECK (status IN ('draft', 'published', 'archived')),
      published_at timestamptz NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read published blog posts" ON public.blog_posts FOR SELECT USING (status = 'published'::text);
    -- Add admin write policy later
    -- Add policy for authors to manage their own drafts?

    -- Trigger for updated_at on blog_posts
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.blog_posts
      FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime (updated_at); -- Use function from extensions schema

    -- Create blog_post_tags join table
    CREATE TABLE public.blog_post_tags (
      post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
      tag_id uuid NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (post_id, tag_id)
    );
    ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read blog post tags for published posts" ON public.blog_post_tags
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.blog_posts p
          WHERE p.id = blog_post_tags.post_id AND p.status = 'published'::text
        )
      );
    -- Add admin write policy later

    -- Add indexes
    CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
    CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
    CREATE INDEX idx_blog_posts_author ON public.blog_posts(author_profile_id);
    CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);
    CREATE INDEX idx_blog_post_tags_post_id ON public.blog_post_tags(post_id);
    CREATE INDEX idx_blog_post_tags_tag_id ON public.blog_post_tags(tag_id);
    ```

*   **Action:** Go to the **Storage** section in your Supabase dashboard.
*   Click **"Create a new bucket"**.
*   Enter `blog_images` as the bucket name.
*   Ensure **"Public bucket"** is checked (or configure appropriate read policies later if needed).
*   Click **"Create bucket"**.
*   *(Optional but recommended)* Go to the Policies section for the `blog_images` bucket and add policies to restrict INSERT/UPDATE/DELETE operations to authenticated users or specific admin roles. A basic policy allowing any authenticated user to upload could be:
    ```sql
    -- Policy: Allow authenticated users to upload to blog_images
    CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog_images');

    -- Policy: Allow owner to update/delete their blog images
    -- (Requires storing user_id in object metadata or using path conventions)
    -- Example assuming path like 'user_id/filename.jpg':
    -- CREATE POLICY "Allow owner update/delete" ON storage.objects
    -- FOR UPDATE, DELETE TO authenticated USING (auth.uid() = (storage.foldername(name))[1]::uuid);
    ```

### 10. Implement Slug and Short ID Generation (Database Triggers)

*   **Reason:** To automatically generate user-friendly slugs and unique short IDs when jobs, candidates (profiles), or companies are created or updated, as required by the routing strategy. Using Database Triggers ensures this logic runs automatically and securely on the backend before data is saved.
*   **Action:** Run the following SQL commands in your Supabase SQL Editor. These create helper functions and then attach triggers to the relevant tables.

    **A. Enable `unaccent` Extension (Optional but Recommended for Slugs):**
    *   This helps create better slugs by removing accents from characters (e.g., `é` becomes `e`).
    ```sql
    -- Run once for your project if not already enabled
    CREATE EXTENSION IF NOT EXISTS unaccent;
    ```

    **B. Create Slug Generation Function:**
    *   This reusable function takes text input and converts it into a URL-friendly slug.
    ```sql
    CREATE OR REPLACE FUNCTION public.slugify(text)
    RETURNS text
    LANGUAGE sql
    IMMUTABLE -- Function result depends only on input
    STRICT -- Returns NULL if input is NULL
    AS $$
      SELECT lower(
        regexp_replace(
          regexp_replace(
            unaccent($1), -- Use unaccent if enabled
            -- If unaccent is not enabled, use just $1 instead of unaccent($1)
            '[^a-zA-Z0-9\s-]+', '', 'g' -- Remove invalid characters except space and hyphen
          ),
          '[\s-]+', '-', 'g' -- Replace spaces/multiple hyphens with single hyphen
        )
      );
    $$;
    ```

    **C. Create Short ID Generation Function:**
    *   This reusable function generates a short (8-character), likely unique alphanumeric ID.
    ```sql
    CREATE OR REPLACE FUNCTION public.generate_short_id()
    RETURNS text
    LANGUAGE sql
    VOLATILE -- Function result changes on every call
    AS $$
      SELECT substring(replace(gen_random_uuid()::text, '-', ''), 1, 8);
      -- Uses built-in UUID generation, removes hyphens, takes first 8 chars.
      -- Collision chance is very low for moderate table sizes, especially with UNIQUE constraint.
    $$;
    ```

    **D. Create Trigger Function for `jobs` Table:**
    *   This function will be called by triggers on the `jobs` table.
    ```sql
    CREATE OR REPLACE FUNCTION public.handle_job_slug_and_short_id()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    DECLARE
      generated_short_id text;
      is_unique boolean;
      max_attempts integer := 5;
      attempts integer := 0;
    BEGIN
      -- Generate/Update Slug on INSERT or UPDATE (if title changes)
      IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.title IS DISTINCT FROM OLD.title) THEN
        NEW.slug := public.slugify(NEW.title);
      END IF;

      -- Generate Unique Short ID only on INSERT
      IF TG_OP = 'INSERT' THEN
        LOOP
          generated_short_id := public.generate_short_id();
          SELECT NOT EXISTS (
            SELECT 1 FROM public.jobs WHERE short_id = generated_short_id
          ) INTO is_unique;
          EXIT WHEN is_unique OR attempts >= max_attempts;
          attempts := attempts + 1;
        END LOOP;

        IF NOT is_unique THEN
          RAISE EXCEPTION 'Could not generate a unique short_id for job after % attempts', max_attempts;
        END IF;
        NEW.short_id := generated_short_id;
      END IF;

      RETURN NEW; -- Return the (potentially modified) row
    END;
    $$;
    ```

    **E. Create Triggers for `jobs` Table:**
    ```sql
    -- Trigger for INSERT
    CREATE TRIGGER trigger_jobs_generate_ids_insert
    BEFORE INSERT ON public.jobs -- Run before inserting a row
    FOR EACH ROW -- Run for every row being inserted
    EXECUTE FUNCTION public.handle_job_slug_and_short_id(); -- Call our function

    -- Trigger for UPDATE (only updates slug if title changes)
    CREATE TRIGGER trigger_jobs_generate_ids_update
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    WHEN (NEW.title IS DISTINCT FROM OLD.title) -- Condition to run trigger
    EXECUTE FUNCTION public.handle_job_slug_and_short_id(); -- Call our function
    ```

    **F. Create Trigger Function for `profiles` Table:**
    *   Generates slug from first/last name. Assumes `profiles` are created via a trigger from `auth.users` or similar, so this mainly handles `short_id`.
    ```sql
    CREATE OR REPLACE FUNCTION public.handle_profile_slug_and_short_id()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    DECLARE
      generated_short_id text;
      is_unique boolean;
      max_attempts integer := 5;
      attempts integer := 0;
      profile_name text;
    BEGIN
      -- Generate/Update Slug (if name changes)
      profile_name := COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, '');
      IF (TG_OP = 'INSERT' AND profile_name <> ' ') OR
         (TG_OP = 'UPDATE' AND (NEW.first_name IS DISTINCT FROM OLD.first_name OR NEW.last_name IS DISTINCT FROM OLD.last_name))
      THEN
        NEW.slug := public.slugify(trim(profile_name));
      END IF;

      -- Generate Unique Short ID only on INSERT
      IF TG_OP = 'INSERT' THEN
         LOOP
          generated_short_id := public.generate_short_id();
          SELECT NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE short_id = generated_short_id
          ) INTO is_unique;
          EXIT WHEN is_unique OR attempts >= max_attempts;
          attempts := attempts + 1;
        END LOOP;

        IF NOT is_unique THEN
          RAISE EXCEPTION 'Could not generate a unique short_id for profile after % attempts', max_attempts;
        END IF;
        NEW.short_id := generated_short_id;
      END IF;

      RETURN NEW;
    END;
    $$;
    ```

    **G. Create Triggers for `profiles` Table:**
    ```sql
    -- Trigger for INSERT
    CREATE TRIGGER trigger_profiles_generate_ids_insert
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_profile_slug_and_short_id();

    -- Trigger for UPDATE (only updates slug if name changes)
    CREATE TRIGGER trigger_profiles_generate_ids_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    WHEN (NEW.first_name IS DISTINCT FROM OLD.first_name OR NEW.last_name IS DISTINCT FROM OLD.last_name)
    EXECUTE FUNCTION public.handle_profile_slug_and_short_id();
    ```
    *   **Important Note:** If your `profiles` table is populated by a trigger from `auth.users`, ensure *that* trigger runs *before* these `BEFORE INSERT` triggers, or modify the auth trigger itself to include this logic.

    **H. Create Trigger Function for `companies` Table:**
    ```sql
    CREATE OR REPLACE FUNCTION public.handle_company_slug_and_short_id()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    DECLARE
      generated_short_id text;
      is_unique boolean;
      max_attempts integer := 5;
      attempts integer := 0;
    BEGIN
      -- Generate/Update Slug on INSERT or UPDATE (if name changes)
      IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.name IS DISTINCT FROM OLD.name) THEN
        NEW.slug := public.slugify(NEW.name);
      END IF;

      -- Generate Unique Short ID only on INSERT
      IF TG_OP = 'INSERT' THEN
         LOOP
          generated_short_id := public.generate_short_id();
          SELECT NOT EXISTS (
            SELECT 1 FROM public.companies WHERE short_id = generated_short_id
          ) INTO is_unique;
          EXIT WHEN is_unique OR attempts >= max_attempts;
          attempts := attempts + 1;
        END LOOP;

        IF NOT is_unique THEN
          RAISE EXCEPTION 'Could not generate a unique short_id for company after % attempts', max_attempts;
        END IF;
        NEW.short_id := generated_short_id;
      END IF;

      RETURN NEW;
    END;
    $$;
    ```

    **I. Create Triggers for `companies` Table:**
    ```sql
    -- Trigger for INSERT
    CREATE TRIGGER trigger_companies_generate_ids_insert
    BEFORE INSERT ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_company_slug_and_short_id();

    -- Trigger for UPDATE (only updates slug if name changes)
    CREATE TRIGGER trigger_companies_generate_ids_update
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    WHEN (NEW.name IS DISTINCT FROM OLD.name)
    EXECUTE FUNCTION public.handle_company_slug_and_short_id();
    ```

    **J. Create Trigger Function & Trigger for `blog_posts` Table (Slug Only - CORRECTED):**
    *   Blog posts only need slug generation according to the plan.
    ```sql
    -- Function for blog post slug (Corrected)
    CREATE OR REPLACE FUNCTION public.handle_blog_post_slug()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    BEGIN
      -- Generate/Update Slug on INSERT or UPDATE (if title changes)
      -- Check TG_OP *inside* the function
      IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.title IS DISTINCT FROM OLD.title) THEN
        -- Check if title is not null or empty before slugifying
        IF NEW.title IS NOT NULL AND NEW.title <> '' THEN
          NEW.slug := public.slugify(NEW.title);
          -- NOTE: Does NOT handle slug uniqueness collisions automatically here.
          -- The UNIQUE constraint on the table will raise an error if a duplicate slug is generated.
          -- Consider adding collision handling logic here if needed (e.g., appending -1, -2).
        ELSE
           -- Handle cases where title might be null or empty if necessary
           -- Maybe set slug to null or raise an error depending on requirements
           NEW.slug := NULL; -- Example: set slug to null if title is empty
        END IF;
      END IF;
      RETURN NEW;
    END;
    $$;

    -- Trigger for INSERT/UPDATE on blog_posts (Corrected - No WHEN clause)
    CREATE TRIGGER trigger_blog_posts_generate_slug
    BEFORE INSERT OR UPDATE ON public.blog_posts
    FOR EACH ROW
    -- REMOVED WHEN clause here
    EXECUTE FUNCTION public.handle_blog_post_slug();
    ```

*(Add other external setup steps here as needed, e.g., Stripe/PayPal setup, Vercel configuration)*