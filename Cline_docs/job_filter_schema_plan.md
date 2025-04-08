# Job Filter & Google Schema Compliance Plan

This plan addresses issues with the job salary filter and ensures compliance with Google's `JobPosting` structured data schema.

## Problem Summary

*   The current salary filter (`SalaryRangeSlider.jsx`, `FilterJobsBox.jsx`) ignores salary units (e.g., HOUR, YEAR), leading to incorrect filtering when jobs have different units.
*   The job detail page (`/app/(job)/job/[slug]/[short_id]/page.jsx`) does not generate the required `JobPosting` JSON-LD structured data, particularly for `baseSalary` and `jobLocation`, and lacks necessary data fields (structured address, currency, remote work details, employment type enums).

## Approved 6-Step Plan

```mermaid
graph TD
    A[Start: Filter Issue & Schema Goal] --> B{DB Check: Required Fields Missing?};
    B -- Yes: Address, Remote, Emp. Type... --> C[Step 0: Update DB Schema & Data<br/>(Incl. employment_type TEXT[])];
    C --> D[Step 1: Modify Salary Slider UI];
    D --> E[Step 2: Modify Filtering Logic];
    E --> F[Step 3: Implement Job Detail Page JSON-LD];
    F --> G[Step 4: Update Job Posting Form(s)];
    G --> H[Step 5: (Optional) Data Migration Script]
    H --> I{Review Plan with User};
    I -- Approved --> J{Optional: Write Plan to MD};
    J --> K{Switch to Code Mode};
    I -- Changes Needed --> C;
    K --> L[End];
```

**Step 0: Update Database Schema & Data (`public.jobs`)**
*   **Add Structured Address Columns:**
    *   `street_address` (TEXT, nullable)
    *   `address_locality` (TEXT, nullable)
    *   `address_region` (TEXT, nullable)
    *   `postal_code` (TEXT, nullable)
    *   `address_country` (TEXT, nullable) - *Required by Google Schema*
*   **Add Remote Work Columns:**
    *   `job_location_type` (TEXT, nullable) - Stores "TELECOMMUTE".
    *   `applicant_location_requirements` (JSONB, nullable) - Stores structured requirements (e.g., `[{"@type": "Country", "name": "USA"}]`).
*   **Add Employment Type Column:**
    *   `employment_type` (TEXT[], nullable) - Stores array of Google's exact enum values (e.g., `{"FULL_TIME", "CONTRACTOR"}`).
*   **Confirm Existing Columns:**
    *   `salary_currency` (TEXT, nullable) - Ensure populated (e.g., "USD").
    *   `valid_through` (TIMESTAMPTZ, nullable) - Use if jobs expire.
*   **Deprecate Old Column:**
    *   `location` (TEXT, nullable) - Mark for removal after data migration.

**Step 1: Modify Salary Filter Component (`SalaryRangeSlider.jsx`)**
*   Add UI elements (radio buttons/dropdown) for selecting salary unit (Year/Hour/etc.).
*   Dynamically adjust the slider's min/max/step based on the selected unit.
*   Include the selected `salary_unit` in the URL parameters upon change.

**Step 2: Modify Filtering Logic (`FilterJobsBox.jsx`)**
*   Read `salary_unit` from URL parameters.
*   Update the Supabase query to filter first by matching `salary_unit`, then by the numeric `salary_min`/`salary_max` range.
*   Consider updating location filtering to use new address fields if needed.
*   Consider updating filters to account for `job_location_type` (remote jobs).

**Step 3: Implement Structured Data Generation (`/app/(job)/job/[slug]/[short_id]/page.jsx`)**
*   Modify `getJobData` to fetch all new/required columns (structured address, remote work fields, `employment_type`, `salary_currency`, `valid_through`).
*   Add a `<script type="application/ld+json">` block.
*   Construct the full `JobPosting` JSON-LD object using fetched data, ensuring strict adherence to Google's schema:
    *   Format dates (`datePosted`, `validThrough`) as ISO 8601.
    *   Structure `hiringOrganization`.
    *   Structure `jobLocation` using new address fields (conditionally omit if remote).
    *   Structure `baseSalary` using `salary_min`, `salary_max`, `salary_currency`, `salary_unit`.
    *   Include `title`, `description`.
    *   Include `employmentType` array.
    *   Include `jobLocationType` and `applicantLocationRequirements` if applicable.

**Step 4: Update Job Posting Form(s)**
*   Modify relevant job creation/editing forms (e.g., in employers-dashboard).
*   Add input fields for all new data points: structured address, `job_location_type`, `applicant_location_requirements`, `employment_type` (multi-select/checkboxes mapping to Google enums), `salary_currency`, `salary_unit`.
*   Implement necessary validation.

**Step 5: (Optional) Data Migration Script**
*   Create a script to:
    *   Attempt to parse the old `location` text field into new structured address columns for existing jobs.
    *   Set a default `salary_currency` (e.g., "USD") for existing jobs if null.
    *   Map existing `job_type_id` values to the new `employment_type` array based on Google's enums.
    *   Populate `job_location_type` and `applicant_location_requirements` for known remote jobs if possible.