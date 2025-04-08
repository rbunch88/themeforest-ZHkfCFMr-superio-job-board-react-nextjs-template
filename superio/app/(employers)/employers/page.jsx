import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server'; // Import from server utility
import { notFound } from 'next/navigation';
import EmployersList from "@/components/employers-listing-pages/employers-list-v1"; // Keep existing import

export const metadata = {
  title: "ABA Employers & Practices | My ABA Jobs",
  description: "Discover ABA therapy practices and employers committed to quality care and staff support. Find your next partner on My ABA Jobs.",
};

// Optional: Enable ISR - Revalidate every hour, for example
export const revalidate = 3600;

async function EmployersPage({ searchParams }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore); // Use the utility function with cookieStore

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
    .select("name,headquarters_location,logo_url,slug,short_id,jobs(count)", { count: 'exact' }); // Get total count for pagination

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
      // Ensure created_at column exists if using this sort
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

  // --- Handle Errors ---
  if (error) {
    console.error("Error fetching companies:", error);
    // Optionally, render an error state or use notFound()
    // For now, we'll let it proceed and potentially show an empty list
    // notFound(); // Uncomment this to show a 404 page on error
  }

   if (!companies && !error) {
      console.log("No companies found matching criteria.");
   }

  // --- Calculate Total Pages ---
  const totalCompanies = count || 0;
  const totalPages = Math.ceil(totalCompanies / itemsPerPage);

  // Optional: Redirect if page number is out of bounds (can cause redirect loops if not careful)
  // if (currentPage > totalPages && totalPages > 0) {
  //    console.log(`Current page ${currentPage} exceeds total pages ${totalPages}`);
  //    // redirect(`/employers?page=${totalPages}`); // Example redirect
  // }


  return (
    <>
      {/* Pass fetched data and pagination info to the layout/display component */}
      <EmployersList
        companies={companies || []}
        totalCompanies={totalCompanies}
        currentPage={currentPage}
        totalPages={totalPages}
        // Pass searchParams down if child components need them for filter state
        searchParams={searchParams}
      />
    </>
  );
}

export default EmployersPage; // Remove dynamic export
