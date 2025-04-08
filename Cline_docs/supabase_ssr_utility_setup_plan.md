# Supabase SSR Utility File Setup Plan

**Date:** April 6, 2025

**Goal:** Implement the standard Supabase client utility files as recommended by the `@supabase/ssr` documentation for Next.js App Router. This aims to ensure correct client initialization and cookie handling across different application contexts (Server Components, Client Components, Middleware) and potentially resolve the recurring `createServerComponentClient is not a function` error.

**Rationale:**
*   The current setup uses direct imports of `@supabase/ssr` functions, which, while possible, might be prone to subtle bundling or caching issues.
*   The existing `utils/supabaseClient.js` uses the older `@supabase/supabase-js` `createClient` and is not suitable for the SSR context with cookie handling.
*   Aligning with the official documentation promotes best practices and maintainability.

**Affected Files/Directories:**
*   `superio/utils/supabase/` (New directory)
*   `superio/utils/supabase/client.js` (New file)
*   `superio/utils/supabase/server.js` (New file)
*   `superio/utils/supabase/middleware.js` (New file)
*   `superio/middleware.js` (Existing middleware to be refactored)
*   `superio/app/(blog)/blog/page.jsx` (Server Component to be refactored)
*   `superio/app/(employers)/employers/page.jsx` (Server Component to be refactored)
*   Potentially other Client Components needing Supabase access.
*   `superio/utils/supabaseClient.js` (Old file to be deleted)

**Plan Steps:**

1.  **Create Directory:** Create the `superio/utils/supabase/` directory.
2.  **Create `client.js` Utility:** Create `superio/utils/supabase/client.js` exporting a `createClient` function that uses `createBrowserClient` from `@supabase/ssr`.
    ```javascript
    // utils/supabase/client.js
    import { createBrowserClient } from '@supabase/ssr'

    export function createClient() {
      return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    }
    ```
3.  **Create `server.js` Utility:** Create `superio/utils/supabase/server.js` exporting a `createClient` function that uses `createServerComponentClient` from `@supabase/ssr` and `cookies` from `next/headers`.
    ```javascript
    // utils/supabase/server.js
    import { createServerComponentClient } from '@supabase/ssr'
    import { cookies } from 'next/headers'

    export function createClient() {
      const cookieStore = cookies()
      return createServerComponentClient({
        cookies: () => cookieStore,
      })
    }
    ```
4.  **Create `middleware.js` Utility:** Create `superio/utils/supabase/middleware.js` exporting a `createClient` function that uses `createServerClient` from `@supabase/ssr` and handles request/response objects for cookie management.
    ```javascript
    // utils/supabase/middleware.js
    import { createServerClient } from '@supabase/ssr'
    import { NextResponse } from 'next/server'

    export async function createClient(request) {
      let response = NextResponse.next({ request: { headers: request.headers } })
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            get(name) { return request.cookies.get(name)?.value },
            set(name, value, options) {
              request.cookies.set({ name, value, ...options })
              response = NextResponse.next({ request: { headers: request.headers } })
              response.cookies.set({ name, value, ...options })
            },
            remove(name, options) {
              request.cookies.set({ name, value: '', ...options })
              response = NextResponse.next({ request: { headers: request.headers } })
              response.cookies.set({ name, value: '', ...options })
            },
          },
        }
      )
      return { supabase, response }
    }
    ```
5.  **Refactor Existing Middleware:** Update `superio/middleware.js` to:
    *   Import `createClient` from `../utils/supabase/middleware.js` (adjust path as needed).
    *   Call `const { supabase, response } = await createClient(request)` at the beginning.
    *   Use this `supabase` instance for session checks (`supabase.auth.getSession()` or `supabase.auth.getUser()`).
    *   Return the `response` object at the end.
6.  **Refactor Server Components:** Update `superio/app/(blog)/blog/page.jsx` and `superio/app/(employers)/employers/page.jsx`:
    *   Remove the direct import of `createServerComponentClient` from `@supabase/ssr`.
    *   Remove the import of `cookies` from `next/headers`.
    *   Import `createClient` from `@/utils/supabase/server` (adjust path).
    *   Replace the client initialization line with `const supabase = createClient()`.
7.  **Refactor Client Components (Audit):** Review components using `'use client'` that might need Supabase access (e.g., auth forms, profile updates). If found, update them to import `createClient` from `@/utils/supabase/client` and initialize with `const supabase = createClient()`.
8.  **Delete Old Utility:** Delete the outdated `superio/utils/supabaseClient.js` file.
9.  **Test:** Stop the development server, clear the Next.js cache (`rm -rf superio/.next`), restart the server (`npm run dev --prefix superio`), and verify:
    *   No compilation errors.
    *   `/blog` page loads correctly.
    *   `/employers` page loads correctly.
    *   Filtering/sorting on `/employers` works.
    *   Middleware-protected routes still function as expected.