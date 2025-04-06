# Plan: Routing Link Testing using Puppeteer

**Objective:** Verify that internal links updated in Step 6 of the Routing Strategy correctly use the new URL formats (`/[slug]-[short_id]` or `/[slug]`) and successfully navigate to the corresponding detail pages, loading the expected data.

**Tool:** Puppeteer MCP Server

**Status Note (April 1, 2025):** Authentication is not yet fully configured. Tests requiring user login (specifically the Applicant List flow) are **DEFERRED** until authentication is functional. Testing will focus on publicly accessible routes first.

**Steps:**

1.  **Identify Target Pages & Links:**
    *   Based on `Cline_docs/step6_link_update_plan.md` and general site structure, the key pages/components containing links to test are:
        *   Job List (`/job-list-v2`): Job title links. **(Public - To Test)**
        *   Employer List (`/employers-list-v1`): Employer name/logo links. **(Public - To Test)**
        *   Applicant List (`/candidates-list-v1` - requires employer login): Candidate name links. **(Requires Login - DEFERRED)**
        *   Blog List (`/blog-list-v1`): Post title links, potentially "Recent Posts" in sidebar. **(Public - To Test)**
        *   Single Job Page (`/job-single-v1/...`): Links in "Related Jobs". **(Public - To Test)**
        *   Single Employer Page (`/employers-single-v2/...`): Links in "Related Jobs". **(Public - To Test)**
    *   We will need appropriate CSS selectors to target these links.

2.  **Testing Workflow (Example for Job List - Public):**
    *   **(Navigate):** Use `puppeteer_navigate` to go to `http://localhost:3000/job-list-v2`. (Assuming default port).
    *   **(Verify Link Format):** Use `puppeteer_evaluate` to get the `href` attribute of the first few job title links. Check if they match the pattern `/job-single-v1/[a-z0-9-]+-[a-z0-9]{8}`.
    *   **(Click Link):** Use `puppeteer_click` with the CSS selector for a specific job title link.
    *   **(Verify Navigation & Content):**
        *   Use `puppeteer_evaluate` to get the current URL (`window.location.href`) and verify it matches the clicked link's `href`.
        *   Use `puppeteer_evaluate` to check for the presence of key elements on the job detail page (e.g., job title `h1`, company name).
        *   *(Optional)* Use `puppeteer_screenshot` to capture the loaded page for visual confirmation.
    *   **(Navigate Back):** Use `puppeteer_evaluate` with `window.history.back()` or `puppeteer_navigate` back to the list page if needed for further tests.

3.  **Testing Workflow (Example for Applicant List - Requires Login - DEFERRED):**
    *   **(Navigate Login):** `puppeteer_navigate` to `http://localhost:3000/login`.
    *   **(Fill Login Form):** Use `puppeteer_fill` for email/password fields (using seeded employer credentials).
    *   **(Click Login):** Use `puppeteer_click` on the login button.
    *   **(Wait/Verify Redirect):** Wait for navigation to employer dashboard (or use `puppeteer_evaluate` to check URL).
    *   **(Navigate Applicants):** `puppeteer_navigate` to `http://localhost:3000/candidates-list-v1`.
    *   **(Verify Link Format):** Use `puppeteer_evaluate` to check candidate name link `href` attributes (e.g., `/candidates-single-v2/[a-z0-9-]+-[a-z0-9]{8}`).
    *   **(Click Link):** `puppeteer_click` on a candidate name link.
    *   **(Verify Navigation & Content):** Check URL and presence of candidate name/details on the single candidate page.

4.  **Repeat & Adapt:** Repeat similar workflows for Employer List, Blog List, and links within single pages (publicly accessible ones), adapting selectors and verification checks as needed.

**Mermaid Diagram:**

```mermaid
graph TD
    subgraph Testing Setup
        A[Start Dev Server - User] --> B(Connect Puppeteer);
    end

    subgraph Job List Test Flow (Public)
        C[Navigate to /job-list-v2] --> D{Verify Job Link Formats};
        D --> E[Click Sample Job Link];
        E --> F{Verify Navigation to /job-single-v1/...};
        F --> G[Verify Job Title/Content Loaded];
    end

    subgraph Applicant List Test Flow (Employer - DEFERRED)
        H[Navigate to /login] --> I[Fill Employer Credentials];
        I --> J[Click Login Button];
        J --> K[Wait/Verify Redirect to Dashboard];
        K --> L[Navigate to /candidates-list-v1];
        L --> M{Verify Candidate Link Formats};
        M --> N[Click Sample Candidate Link];
        N --> O{Verify Navigation to /candidates-single-v2/...};
        O --> P[Verify Candidate Name/Content Loaded];
    end

    subgraph Other Public Flows
        Q[Test Employer List Links]
        R[Test Blog List Links]
        S[Test Related Links on Single Pages]
    end

    B --> C;
    B --> H; %% Link still shown, but flow marked as deferred
    B --> Q;
    B --> R;
    B --> S;

    style H fill:#eee,stroke:#999,stroke-width:1px,stroke-dasharray: 5 5
    style I fill:#eee,stroke:#999,stroke-width:1px,stroke-dasharray: 5 5
    style J fill:#eee,stroke:#999,stroke-width:1px,stroke-dasharray: 5 5
    style K fill:#eee,stroke:#999,stroke-width:1px,stroke-dasharray: 5 5
    style L fill:#eee,stroke:#999,stroke-width:1px,stroke-dasharray: 5 5
    style M fill:#eee,stroke:#999,stroke-width:1px,stroke-dasharray: 5 5
    style N fill:#eee,stroke:#999,stroke-width:1px,stroke-dasharray: 5 5
    style O fill:#eee,stroke:#999,stroke-width:1px,stroke-dasharray: 5 5
    style P fill:#eee,stroke:#999,stroke-width:1px,stroke-dasharray: 5 5

    style B fill:#ccf,stroke:#333,stroke-width:2px