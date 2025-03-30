# MyABAJobs Refresh - Supabase Integration Plan (Task 2)

This document outlines the plan for integrating Supabase as the backend for the MyABAJobs project, covering database schema, authentication, and storage.

## 1. Database Schema

The schema is designed to support the frontend template's features while aligning with Google for Jobs structured data requirements.

### Core Tables:

*   **`profiles` Table:** (Stores basic info for ALL users)
    *   `id` (uuid, primary key, references `auth.users.id` ON DELETE CASCADE)
    *   `created_at` (timestamptz, default now())
    *   `updated_at` (timestamptz, default now())
    *   `first_name` (text)
    *   `last_name` (text)
    *   `avatar_url` (text, nullable) - Link to Supabase Storage path
    *   `role` (text, not null, CHECK (role IN ('candidate', 'employer', 'admin'))) - *Crucial for differentiation.*

*   **`companies` Table:** (Stores employer-specific details)
    *   `id` (uuid, primary key, default gen_random_uuid())
    *   `created_at` (timestamptz, default now())
    *   `updated_at` (timestamptz, default now())
    *   `user_id` (uuid, not null, references `profiles(id)` ON DELETE CASCADE) - *Links company to the managing user profile.*
    *   `name` (text, not null)
    *   `description` (text, nullable)
    *   `logo_url` (text, nullable) - Link to Supabase Storage path
    *   `website` (text, nullable)
    *   `headquarters_location` (text, nullable)
    *   `industry` (text, nullable)
    *   `size` (text, nullable)
    *   `founded_year` (integer, nullable)
    *   *(Add social links, etc. as needed)*

*   **`candidates` Table:** (Stores candidate-specific details)
    *   `profile_id` (uuid, primary key, references `profiles(id)` ON DELETE CASCADE) - *Links to profile.*
    *   `created_at` (timestamptz, default now())
    *   `updated_at` (timestamptz, default now())
    *   `designation` (text, nullable) - (e.g., "BCBA Supervisor", "Registered Behavior Technician")
    *   `location` (text, nullable)
    *   `hourly_rate` (numeric, nullable)
    *   `skills` (text[], nullable)
    *   `bio` (text, nullable)
    *   `resume_url` (text, nullable) - Link to Supabase Storage path
    *   `experience_level_id` (uuid, nullable, references `experience_levels(id)`)
    *   `education_history` (jsonb, nullable) - *Store as array of objects: `[{ "degree": "...", "institution": "...", "year_start": ..., "year_end": ... }]`*
    *   `work_history` (jsonb, nullable) - *Store as array of objects: `[{ "title": "...", "company": "...", "duration": "...", "description": "..." }]`*
    *   *(Optional fields: video_url, portfolio_items (jsonb), gender, languages (text[]), social links)*

*   **`jobs` Table:** (Stores job posting details)
    *   `id` (uuid, primary key, default gen_random_uuid())
    *   `created_at` (timestamptz, default now())
    *   `updated_at` (timestamptz, default now())
    *   `company_id` (uuid, not null, references `companies(id)` ON DELETE CASCADE)
    *   `posted_by_user_id` (uuid, not null, references `profiles(id)` ON DELETE SET NULL) - *User who posted.*
    *   `title` (text, not null)
    *   `description` (text, not null)
    *   `location` (text, nullable) - *Keep as text for now.*
    *   `job_type_id` (uuid, nullable, references `job_types(id)`)
    *   `category_id` (uuid, nullable, references `job_categories(id)`)
    *   `experience_level_id` (uuid, nullable, references `experience_levels(id)`)
    *   `salary_min` (numeric, nullable)
    *   `salary_max` (numeric, nullable)
    *   `salary_currency` (text, nullable, default 'USD')
    *   `salary_unit` (text, nullable, CHECK (salary_unit IN ('HOUR', 'YEAR', 'MONTH')))
    *   `application_url` (text, nullable)
    *   `application_instructions` (text, nullable)
    *   `responsibilities` (text[], nullable)
    *   `requirements` (text[], nullable) - *Maps to Google's `qualifications`*
    *   `preferred_qualifications` (text[], nullable)
    *   `skills` (text[], nullable)
    *   `date_posted` (timestamptz, default now())
    *   `valid_through` (timestamptz, nullable)
    *   `status` (text, default 'active', CHECK (status IN ('active', 'expired', 'filled', 'draft')))
    *   `direct_apply` (boolean, default false)
    *   *(Consider: `certification_required` (uuid, FK), `supervision_provided` (boolean))*

### Taxonomy Tables (Examples):

*   **`job_types`**: `id` (uuid, pk), `name` (text, unique)
*   **`experience_levels`**: `id` (uuid, pk), `name` (text, unique)
*   **`job_categories`**: `id` (uuid, pk), `name` (text, unique)
*   *(Others: `skills`, `certifications` as needed)*

### Relationships & Triggers:

*   Establish foreign key relationships as defined above.
*   Implement database triggers (`trigger_set_timestamp`) for automatically updating `updated_at` columns on relevant tables (`profiles`, `companies`, `candidates`, `jobs`).

## 2. Authentication Flow

*   **Registration:** Single UI form with mandatory role selection ('candidate'/'employer'). Pass `role`, `first_name`, `last_name` in `options.data` during `supabase.auth.signUp()`.
*   **Profile Creation Trigger:** Implement a DB function/trigger `AFTER INSERT ON auth.users` to:
    *   Read `NEW.id`, `NEW.raw_user_meta_data`.
    *   Extract `role`, `first_name`, `last_name`.
    *   `INSERT` into `public.profiles` with `id = NEW.id` and extracted data.
    *   If `role` is 'candidate', `INSERT` into `public.candidates` with `profile_id = NEW.id`.
*   **Login:** Standard email/password login using `supabase.auth.signInWithPassword()`.
*   **Post-Login Routing:** Fetch `role` from `public.profiles` using `auth.uid()` and redirect to `/candidates-dashboard` or `/employers-dashboard`.
*   **Route Protection:** Use Middleware or Layout checks to verify session and user `role` against route requirements, redirecting unauthorized access to `/login`.

## 3. Storage Integration

*   **Buckets:** Create three public Supabase Storage buckets: `avatars`, `company_logos`, `resumes`.
*   **Paths:** Use user/company IDs:
    *   `avatars/{user_id}/avatar.ext`
    *   `company_logos/{company_id}/logo.ext`
    *   `resumes/{user_id}/{timestamp}_filename.ext`
*   **RLS Policies:**
    *   `avatars`, `company_logos`: Public read; Restricted write/delete based on ownership.
    *   `resumes`: Restricted read/write/delete based on candidate ownership. (Employer access TBD).
*   **Frontend Upload:** Use `supabase.storage.from(...).upload(path, file, { upsert: true/false })`.
*   **DB Storage:** Store only the file *path* (not full URL) in `avatar_url`, `logo_url`, `resume_url`.
*   **Retrieval:** Use `getPublicUrl(path)` for public files. Use `getPublicUrl(path, { transform: {...} })` for dynamic image resizing. Use signed URLs (`createSignedUrl`) for restricted files like resumes if needed.