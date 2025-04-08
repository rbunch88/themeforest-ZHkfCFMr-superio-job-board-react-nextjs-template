'use client'

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation'; // Import hooks for URL manipulation

// Removed useState, useEffect, useMemo, useDispatch, useSelector, createBrowserClient

// Removed ListingShowing import - pagination handled differently now
// Removed Redux action imports
// Removed ITEMS_PER_PAGE constant

const FilterTopBox = ({ companies = [], totalCompanies = 0, currentPage = 1, totalPages = 1, searchParams }) => {
  console.log('[Debug Employer List] FilterTopBox rendering with props:', { companies, totalCompanies, currentPage, totalPages });

  const router = useRouter();
  const currentSearchParams = useSearchParams(); // Get current search params

  // --- Render companies passed via props ---
  let content;
  if (!companies || companies.length === 0) {
    content = <div className="text-center p-5 col-12">No companies found matching your criteria.</div>;
  } else {
    content = companies.map((company) => (
      <div className="company-block-three col-lg-6 col-md-6 col-sm-12" key={company.id}> {/* Added column classes */}
        <div className="inner-box">
          <div className="content">
            <div className="content-inner">
              <span className="company-logo">
                <Image
                  width={50}
                  height={50}
                  src={company.logo_url || "/images/resource/company-logo/company_logo_placeholder.png"} // Use fetched logo_url
                  alt={`${company.name} logo`}
                  onError={(e) => { e.currentTarget.src = "/images/resource/company-logo/company_logo_placeholder.png"; }} // Fallback for broken images
                />
              </span>
              <h4>
                {/* Link to the correct single employer page */}
                <Link href={company.slug && company.short_id ? `/employers-single-v2/${company.slug}-${company.short_id}` : '#'}>
                  {company.name}
                </Link>
              </h4>
              <ul className="job-info">
                {company.headquarters_location && (
                    <li>
                        <span className="icon flaticon-map-locator"></span>{" "}
                        {company.headquarters_location}
                    </li>
                )}
                 {/* Display job count */}
                 <li>
                    <span className="icon flaticon-briefcase"></span>{" "}
                    {company.jobs?.[0]?.count || 0} open positions {/* Access nested count */}
                 </li>
              </ul>
            </div>

            {/* Removed bookmark button and featured logic for simplicity */}
          </div>
           {/* Removed description display for brevity in list view */}
        </div>
      </div>
    ));
  }


  // --- Handlers for URL manipulation ---

  // sort handler
  const sortHandler = (e) => {
    const newSortValue = e.target.value;
    const params = new URLSearchParams(currentSearchParams);
    if (newSortValue) {
        params.set('sort', newSortValue);
    } else {
        params.delete('sort'); // Remove sort param if default is selected
    }
    params.set('page', '1'); // Reset to page 1 when sorting changes
    router.push(`/employers?${params.toString()}`);
  };

  // clear handler - Clears filters managed by URL params
  const clearAll = () => {
     // Navigate to base path, effectively clearing relevant search params
     router.push('/employers');
  };

  // Check if any filters are active based on searchParams
  const areFiltersActive = () => {
    return currentSearchParams.has('search') ||
           currentSearchParams.has('location') ||
           currentSearchParams.has('sort');
           // Add other filter params here if they are implemented in FilterSidebar
  };

  const currentSort = currentSearchParams.get('sort') || ""; // Get sort value from URL

  return (
    <>
      <div className="ls-switcher">
        <div className="showing-result">
          <div className="text">
            {/* Update count based on props */}
            Showing <strong>{companies.length}</strong> of {totalCompanies} companies
          </div>
        </div>
        {/* End showing-result */}

        <div className="sort-by">
          {areFiltersActive() && ( // Show clear button only if filters are active
            <button
              onClick={clearAll}
              className="btn btn-danger text-nowrap me-2"
              style={{
                minHeight: "45px",
                marginBottom: "15px",
              }}
            >
              Clear Filters
            </button>
          )}

          <select
            value={currentSort} // Control select value from URL param
            className="chosen-single form-select"
            onChange={sortHandler}
          >
            <option value="">Sort by (Default)</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="created_asc">Date Added (Oldest)</option>
            <option value="created_desc">Date Added (Newest)</option>
            {/* Add other sort options if needed */}
          </select>
          {/* End select */}

          {/* Removed Per Page dropdown */}
        </div>
      </div>
      {/* End top filter bar box */}

      <div className="row"> {content} </div>

      {/* --- Pagination Component Placeholder --- */}
      {/*
        A proper pagination component should be added here.
        It would read `currentPage` and `totalPages` props.
        Clicking page numbers would update the 'page' searchParam using router.push.
        Example: <Pagination currentPage={currentPage} totalPages={totalPages} />
        For now, the "Show More" logic is removed.
      */}
       <div className="ls-show-more text-center mt-4">
         { totalPages > 1 && (
            <p>Page {currentPage} of {totalPages}. Use browser back/forward or implement pagination controls.</p>
         )}
       </div>

    </>
  );
};

export default FilterTopBox;
