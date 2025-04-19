# Refactoring Plan: Authentication Flow (v2 - Confirmed Utilities)

**Date:** 2025-04-14

## 1. Goal

*   Fix broken server-side route protection in middleware.
*   Ensure consistent session handling using `@supabase/ssr`.
*   Verify client-side components use the correct Supabase client utilities.
*   Maintain role-based access control (Employer vs. Candidate).

## 2. Key Files Involved

*   `superio/middleware.js`
*   `superio/utils/supabase/middleware.js`
*   `superio/utils/supabase/client.js` (Verified OK)
*   `superio/utils/supabase/server.js` (Verified OK)
*   `superio/components/common/form/login/FormContent2.jsx`
*   `superio/components/common/form/register/Register2.jsx`
*   `superio/components/common/form/register/FormContent2.jsx`
*   Components using session/profile data (e.g., `HeaderNavContent.jsx`)
*   Supabase `profiles` table

## 3. Proposed Steps

*   **3.1: Modify Middleware Utility (`utils/supabase/middleware.js`):** Update `createClient` to fetch session and return `{ supabase, session, response }`.
*   **3.2: Fix Middleware Logic (`middleware.js`):** Update middleware to use data from the modified utility (`const { supabase, session, response } = await createClient(req);`).
*   **3.3: Verify Client-Side Utilities and Components:**
    *   Ensure `login/FormContent2.jsx` uses the client utility from `utils/supabase/client.js`.
    *   **Update `register/FormContent2.jsx` to import the Supabase client from the correct utility path (`@/utils/supabase/client` or equivalent) instead of `../../../../utils/supabaseClient`.**
    *   Review components like `HeaderNavContent.jsx` for correct client usage.
*   **3.4: Testing:** Thoroughly test login, registration, route protection (logged out, wrong role), logout, and UI updates.

## 4. Visualization (Mermaid Diagram)

```mermaid
sequenceDiagram
    participant Browser
    participant Middleware as Next.js Middleware (middleware.js)
    participant UtilsMiddleware as Supabase Util (utils/supabase/middleware.js)
    participant SupabaseAuth as Supabase Auth
    participant ProfilesTable as Supabase DB (profiles)

    Browser->>Middleware: Request protected route (e.g., /employers-dashboard)
    Middleware->>UtilsMiddleware: Call createClient(request)
    UtilsMiddleware->>SupabaseAuth: Initialize createServerClient (handles cookies)
    UtilsMiddleware->>SupabaseAuth: getSession()
    SupabaseAuth-->>UtilsMiddleware: Return session (or null)
    UtilsMiddleware-->>Middleware: Return { supabase, session, response }
    alt session exists
        Middleware->>ProfilesTable: Query profile role using supabase client (select role from profiles where id = session.user.id)
        ProfilesTable-->>Middleware: Return role ('employer'/'candidate')
        alt Role matches route
            Middleware-->>Browser: Allow request (return response)
        else Role mismatch
            Middleware-->>Browser: Redirect (e.g., to other dashboard or login)
        end
    else No session
        Middleware-->>Browser: Redirect to /login
    end
