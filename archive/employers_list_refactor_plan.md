# Employers List Page Refactoring Plan

**Date:** April 6, 2025

**Goal:** Fix the `/employers` page load error by fetching data in the Server Component (`page.jsx`) and passing it down as props, removing client-side fetching logic from child components. This aligns the structure with the `/blog` page and leverages Next.js Server Components.

**Affected Files:**

1.  `superio/app/(employers)/employers/page.jsx` (Main Page Component)
2.  `superio/components/employers-listing-pages/employers-list-v1/index.jsx` (Layout Wrapper)
3.  `superio/components/employers-listing-pages/employers-list-v1/FilterTopBox.jsx` (Contains list rendering, sorting, pagination)
4.  `superio/components/employers-listing-pages/employers-list-v1/FilterSidebar.jsx` (Contains filter inputs)

**Confirmed Supabase Query Structure (for `page.jsx`):**

```javascript
// --- Helper function to get searchParams ---
const getSearchParam = (key) => searchParams[key] || null;

// --- Filters & Sorting ---
const searchTerm = getSearchParam('search');
const location = getSearchParam('location'); // Param from FilterSidebar input
const sortBy = getSearchParam('sort') || 'name_asc'; // Default sort

// --- Pagination ---
const itemsPerPage = 10; // Adjust as needed
const page = parseInt(getSearchParam('page') || '1', 10);
const currentPage = Math.max(page, 1);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage - 1;

// --- Base Query ---
let query = supabase
  .from('companies')
  .select(`
    name,
    headquarters_location, // Confirmed column name
    logo_url,             // Confirmed column name
    slug,
    short_id,
    jobs ( count )        // Count related jobs
  `, { count: 'exact' }); // Get total count for pagination

// --- Apply Filters ---
if (searchTerm) {
  query = query.ilike('name', `%${searchTerm}%`);
}
if (location) {
  // Use confirmed location column name for filtering
  query = query.ilike('headquarters_location', `%${location}%`);
}
// Category filter omitted as no clear schema support found

// --- Apply Sorting ---
const [sortField, sortOrder] = sortBy.split('_');
if (sortField === 'name') {
    query = query.order('name', { ascending: sortOrder === 'asc' });
} else if (sortField === 'created') {
    query = query.order('created_at', { ascending: sortOrder === 'asc' });
} else {
    // Default sort
    query = query.order('name', { ascending: true });
}
// Note: Sorting by job count might require a database function/view for efficiency.

// --- Apply Pagination ---
query = query.range(startIndex, endIndex);

// --- Execute Query ---
const { data: companies, error, count } = await query;

// --- Calculate Total Pages ---
const totalCompanies = count || 0;
const totalPages = Math.ceil(totalCompanies / itemsPerPage);

// --- Pass to Component ---
// Pass companies, totalCompanies, currentPage, totalPages as props
```

**Refactoring Steps:**

1.  **Implement Confirmed Query in `page.jsx`:**
    *   Convert `superio/app/(employers)/employers/page.jsx` to an `async` Server Component (`async function EmployersPage({ searchParams })`).
    *   Add imports: `cookies` from `next/headers`, `createServerComponentClient` from `@supabase/ssr`, `notFound` from `next/navigation`.
    *   Initialize the Supabase client using `createServerComponentClient`.
    *   Implement the confirmed data fetching logic using the query structure above.
    *   Handle potential errors (`console.error`, maybe `notFound()`).
    *   Calculate `totalPages`.
    *   Pass `companies`, `totalCompanies`, `currentPage`, `totalPages` as props to the `<EmployersList>` component.
    *   Remove the `dynamic` export; use `export default EmployersPage;`.
2.  **Modify `EmployersList/index.jsx`:**
    *   Update component signature to accept props (`{ companies, totalCompanies, currentPage, totalPages }`).
    *   Pass relevant props down to `<FilterTopBox>` and `<FilterSidebar>` (if needed).
3.  **Modify `FilterTopBox.jsx`:**
    *   Update component signature to accept props (`companies`, `totalCompanies`, `currentPage`, `totalPages`).
    *   Remove internal `useState`, `useEffect`, and Supabase fetching logic.
    *   Render the company list by mapping over the `companies` prop.
    *   Display the result count using `totalCompanies`.
    *   Configure the pagination component using `currentPage` and `totalPages`.
    *   Ensure sorting controls update URL `searchParams` (add `'use client'`, use `useRouter`, `useSearchParams`).
4.  **Modify `FilterSidebar.jsx`:**
    *   Accept props if needed for dynamic filter options.
    *   Remove internal fetching logic (unless essential).
    *   Ensure filter inputs update URL `searchParams` (add `'use client'`, use `useRouter`, `useSearchParams`).

**Visual Plan (Mermaid):**

```mermaid
graph TD
    AA[Define & Confirm Query] --> B(superio/app/(employers)/employers/page.jsx);
    B[page.jsx] -- Reads searchParams --> B;
    B -- Initializes Supabase (Server) --> B;
    B -- Fetches Companies (using confirmed query) --> B;
    B -- Calculates totalPages --> B;
    B -- Passes props (companies, totalPages, etc.) --> C(EmployersList Component);
    C -- Passes props --> D(FilterTopBox Component);
    C -- Passes props (optional) --> E(FilterSidebar Component);
    D -- Renders Company List from props --> F[HTML Output];
    D -- Renders Pagination from props --> F;
    E -- Renders Filters --> F;
    F --> G[User Sees Page];

    subgraph Client Interaction
        H(User clicks Sort/Filter) -- Updates URL searchParams --> I(Next.js Navigation);
        I -- Triggers new request --> B; // Re-runs server component fetch
    end

    style AA fill:#lightgrey,stroke:#333,stroke-width:2px
    style B fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:1px
    style D fill:#ccf,stroke:#333,stroke-width:1px
    style E fill:#ccf,stroke:#333,stroke-width:1px
    style F fill:#9cf,stroke:#333,stroke-width:1px