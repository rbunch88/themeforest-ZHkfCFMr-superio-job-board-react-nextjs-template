# Plan: Geocode Existing Job Locations

**Objective:** Create a Node.js script that fetches job records from Supabase, uses the Google Geocoding API to parse the `location` text field, and updates the corresponding structured address fields (`street_address`, `address_locality`, `address_region`, `postal_code`, `address_country`) for records where these fields are currently NULL. This is intended as a one-time operation to backfill historical data.

**Assumptions & Decisions:**

*   **API Key:** Google Geocoding API key is available.
*   **Record Count:** Approximately 18 records need processing.
*   **Error Handling:** If Geocoding API fails or returns no results for a location, the script will log the error (including Job ID and original location text) and skip updating that specific record.
*   **Overwrite Behavior:** The script will only update records where `street_address` (and presumably other structured address fields) are currently NULL. It will not overwrite existing structured address data.
*   **Script Location:** The script and its configuration will reside in a new `scripts/` directory.
*   **Configuration:** A separate `.env` file within `scripts/` will be used for sensitive credentials (`SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_GEOCODING_API_KEY`) for security and isolation from the main application's environment.

**Plan Steps:**

1.  **Project Setup:**
    *   Create directory: `scripts/`
    *   Initialize Node.js project: `cd scripts/ && npm init -y`
    *   Install dependencies: `npm install @supabase/supabase-js axios dotenv` (within `scripts/`)

2.  **Configuration:**
    *   Create file: `scripts/.env`
    *   Add variables to `scripts/.env`:
        ```
        SUPABASE_URL=YOUR_SUPABASE_URL
        SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
        GOOGLE_GEOCODING_API_KEY=YOUR_GOOGLE_API_KEY
        ```
    *   Create file: `scripts/.gitignore`
    *   Add content to `scripts/.gitignore`:
        ```
        .env
        node_modules/
        geocode_errors.log
        ```

3.  **Script Implementation (`scripts/geocode_jobs.js`):**
    *   **Initialization:**
        *   Load environment variables (`dotenv`).
        *   Initialize Supabase client (using service role key).
        *   Configure HTTP client (`axios`).
    *   **Fetch Jobs:**
        *   Query `jobs` table.
        *   Select `id`, `location`.
        *   Filter: `WHERE street_address IS NULL`.
    *   **Process Jobs (Loop):**
        *   For each job:
            *   Check if `location` is valid text.
            *   Call Google Geocoding API with `location`.
            *   **Handle API Response:**
                *   **Success (`OK`):**
                    *   Parse `address_components` for `street_address`, `address_locality`, `address_region`, `postal_code`, `address_country`.
                    *   Prepare Supabase update payload.
                    *   Update job record via `id`.
                    *   Log success.
                *   **Failure (`ZERO_RESULTS` or other error):**
                    *   Log error details (Job ID, location, API status) potentially to `geocode_errors.log`.
                    *   Skip update.
            *   **Rate Limiting:** Add small delay (e.g., 100-200ms) between API calls.
    *   **Logging:** Implement clear console logging for progress and errors.

4.  **Execution:**
    *   Run script: `cd scripts/ && node geocode_jobs.js`
    *   Monitor console and `geocode_errors.log`.

**Process Flow Diagram (Mermaid):**

```mermaid
graph TD
    A[Start Script] --> B{Load Config (.env)};
    B --> C{Initialize Supabase Client};
    C --> D{Fetch Jobs from Supabase (where address is NULL)};
    D --> E{Iterate Through Jobs};
    E -- Job Record --> F{Has Location Text?};
    F -- Yes --> G{Call Google Geocoding API};
    F -- No --> E;
    G --> H{API Success?};
    H -- Yes --> I{Parse Address Components};
    I --> J{Prepare Supabase Update};
    J --> K{Update Job Record in Supabase};
    K --> L{Log Success};
    L --> M{Delay (Optional)};
    M --> E;
    H -- No --> N{Log Error/Skip};
    N --> M;
    E -- No More Jobs --> O[End Script];

    subgraph Error Handling
        N
    end

    subgraph Supabase Interaction
        C
        D
        K
    end

    subgraph Google API Interaction
        G
        H
        I
    end