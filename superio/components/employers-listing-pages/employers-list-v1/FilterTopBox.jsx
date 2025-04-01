'use client'

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../utils/supabaseClient"; // Import supabase client
import ListingShowing from "../components/ListingShowing"; // Keep for pagination UI
// import companyData from "../../../data/topCompany"; // Removed static import
import {
  addCategory,
  addDestination,
  addFoundationDate,
  addKeyword,
  addLocation,
  addPerPage,
  addSort,
} from "../../../features/filter/employerFilterSlice";

const ITEMS_PER_PAGE = 10; // Or adjust as needed

const FilterTopBox = () => {
  const [fetchedCompanies, setFetchedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCompaniesCount, setTotalCompaniesCount] = useState(0);
  const [showMoreLoading, setShowMoreLoading] = useState(false); // State for pagination loading

  const dispatch = useDispatch();
  const {
    keyword,
    location,
    // destination, // Skipping destination filter for now
    category,
    foundationDate,
    sort,
    perPage,
  } = useSelector((state) => state.employerFilter) || {};

  // Effect hook to fetch data when filters change
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);

      if (!supabase) {
        setError('Supabase client not available');
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('companies')
          .select(`
            id,
            name,
            location,
            logo_url,
            founded_year,
            slug,       // Fetch slug
            short_id,   // Fetch short_id
            description,
            jobs!inner(count) // Fetch count of related active jobs
          `, { count: 'exact' }) // Request count for pagination
          .eq('jobs.status', 'active'); // Ensure we only count active jobs

        // --- Apply Filters ---
        if (keyword) {
          // Search in name and description
          query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
        }
        if (location) {
          query = query.ilike('location', `%${location}%`);
        }
        if (category) {
           // Assuming category filter relates to 'industry' or similar field if added
           // query = query.eq('industry', category); // Example if industry field exists
           console.warn("Category filter not implemented for companies yet.");
        }
        if (foundationDate?.min > 1900 || foundationDate?.max < 2028) { // Apply only if slider moved
            if (foundationDate.min > 1900) {
                query = query.gte('founded_year', foundationDate.min);
            }
            if (foundationDate.max < 2028) { // Assuming 2028 is max
                query = query.lte('founded_year', foundationDate.max);
            }
        }
        // --- Destination/Radius filter skipped ---

        // --- Apply Sorting ---
        // Sorting by name or job count might be more relevant here
        if (sort === 'asc') { // Example: Sort by name ascending
          query = query.order('name', { ascending: true });
        } else if (sort === 'des') { // Example: Sort by name descending
          query = query.order('name', { ascending: false });
        } else { // Default: maybe sort by creation date or job count?
          query = query.order('created_at', { ascending: false }); // Default sort
        }

        // --- Apply Pagination ---
        // Adjust pagination logic based on how ListingShowing component works
        // For now, basic range fetching like in FilterJobsBox
        const rangeStart = perPage.start || 0;
        // Use ITEMS_PER_PAGE if perPage.end is 0 or undefined
        const itemsToFetch = (perPage.end && perPage.end > rangeStart) ? perPage.end - rangeStart : ITEMS_PER_PAGE;
        const rangeEnd = rangeStart + itemsToFetch -1; // Calculate end based on items to fetch

        query = query.range(rangeStart, rangeEnd);

        const { data, error: fetchError, count } = await query;

        if (fetchError) {
          throw fetchError;
        }

        // Process data to get job count correctly and include slug/short_id
        const processedData = data?.map(company => ({
            ...company,
            slug: company.slug,
            short_id: company.short_id,
            openJobsCount: company.jobs[0]?.count || 0 // Extract count from the related jobs query
        })) || [];


        setFetchedCompanies(processedData);
        setTotalCompaniesCount(count || 0);

      } catch (err) {
        console.error("Error fetching companies:", err);
        setError(err.message || "Failed to fetch companies.");
        setFetchedCompanies([]);
        setTotalCompaniesCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [
      keyword, location, category, foundationDate, // employerFilter parts
      sort, perPage, // employerFilter parts
      supabase, dispatch
  ]);

  // Handler for the "Show More" button
  const handleShowMore = async () => {
    setShowMoreLoading(true);
    setError(null);

    if (!supabase) {
      setError('Supabase client not available');
      setShowMoreLoading(false);
      return;
    }

    try {
      const currentLength = fetchedCompanies.length;
      const rangeStart = currentLength;
      const rangeEnd = currentLength + ITEMS_PER_PAGE - 1;

      // Re-build the query with the same filters and sorting as in useEffect
      let query = supabase
        .from('companies')
        .select(`
          id,
          name,
          location,
          logo_url,
          founded_year,
          slug,       // Fetch slug
          short_id,   // Fetch short_id
          description,
          jobs!inner(count)
        `)
        .eq('jobs.status', 'active');

      // --- Apply Filters (Mirroring useEffect logic) ---
       if (keyword) {
          query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
        }
        if (location) {
          query = query.ilike('location', `%${location}%`);
        }
        if (category) {
           console.warn("Category filter not implemented for companies yet.");
        }
        if (foundationDate?.min > 1900 || foundationDate?.max < 2028) {
            if (foundationDate.min > 1900) {
                query = query.gte('founded_year', foundationDate.min);
            }
            if (foundationDate.max < 2028) {
                query = query.lte('founded_year', foundationDate.max);
            }
        }

      // --- Apply Sorting (Mirroring useEffect logic) ---
       if (sort === 'asc') {
          query = query.order('name', { ascending: true });
        } else if (sort === 'des') {
          query = query.order('name', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

      // --- Apply Range for the NEXT page ---
      query = query.range(rangeStart, rangeEnd);

      const { data: nextCompaniesData, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Process data
       const processedData = nextCompaniesData?.map(company => ({
            ...company,
            slug: company.slug,
            short_id: company.short_id,
            openJobsCount: company.jobs[0]?.count || 0
        })) || [];

      // Append new companies to the existing list
      if (processedData.length > 0) {
        setFetchedCompanies(prevCompanies => [...prevCompanies, ...processedData]);
      }

    } catch (err) {
      console.error("Error fetching more companies:", err);
      setError(err.message || "Failed to fetch more companies.");
    } finally {
      setShowMoreLoading(false);
    }
  };



  // --- Render fetched companies ---
  let content;
  if (loading) {
    content = <div className="text-center p-5">Loading companies...</div>;
  } else if (error) {
    content = <div className="alert alert-danger mx-3">Error loading companies: {error}</div>;
  } else if (fetchedCompanies.length === 0) {
    content = <div className="text-center p-5">No companies found matching your criteria.</div>;
  } else {
    content = fetchedCompanies.map((company) => (
      <div className="company-block-three" key={company.id}>
        <div className="inner-box">
          <div className="content">
            <div className="content-inner">
              <span className="company-logo">
                <Image
                  width={50}
                  height={50}
                  src={company.logo_url || "/images/resource/default-logo.png"} // Use fetched logo_url
                  alt={`${company.name} logo`}
                />
              </span>
              <h4>
                {/* Link to the correct single employer page (v2) */}
                <Link href={company.slug && company.short_id ? `/employers-single-v2/${company.slug}-${company.short_id}` : '#'}>
                  {company.name}
                </Link>
              </h4>
              <ul className="job-info">
                {company.location && (
                    <li>
                        <span className="icon flaticon-map-locator"></span>{" "}
                        {company.location}
                    </li>
                )}
                {/* Add other info like industry if available */}
                {/* <li>
                  <span className="icon flaticon-briefcase"></span>{" "}
                  {company.industry || 'N/A'}
                </li> */}
              </ul>
            </div>

            <ul className="job-other-info">
              {/* Add featured logic if applicable */}
              {/* {company.isFeatured ? <li className="privacy">Featured</li> : ""} */}
              <li className="time">Open Jobs – {company.openJobsCount}</li>
            </ul>
          </div>

          {/* Use fetched description */}
          {company.description && <div className="text">{company.description.substring(0, 100)}{company.description.length > 100 ? '...' : ''}</div>}

          {/* Bookmark functionality might need separate implementation */}
          {/* <button className="bookmark-btn">
            <span className="flaticon-bookmark"></span>
          </button> */}
        </div>
      </div>
    ));
  }


  // per page handler
  const perPageHandler = (e) => {
    const pageData = JSON.parse(e.target.value);
    dispatch(addPerPage(pageData));
  };

  // sort handler
  const sortHandler = (e) => {
    dispatch(addSort(e.target.value));
  };

  // clear handler
  const clearAll = () => {
    dispatch(addKeyword(""));
    dispatch(addLocation(""));
    // dispatch(addDestination({ min: 0, max: 100 })); // Destination skipped
    dispatch(addCategory(""));
    dispatch(addFoundationDate({ min: 1900, max: 2028 }));
    dispatch(addSort(""));
    dispatch(addPerPage({ start: 0, end: 0 })); // Reset to 'All' or default
  };

  return (
    <>
      <div className="ls-switcher">
        <div className="showing-result">
          <div className="text">
            {/* Update count based on fetched data */}
            Show <strong>{loading ? '...' : fetchedCompanies.length}</strong> of {totalCompaniesCount} companies
          </div>
        </div>
        {/* End showing-result */}

        <div className="sort-by">
          {keyword !== "" ||
          location !== "" ||
          // destination.min !== 0 || // Destination skipped
          // destination.max !== 100 || // Destination skipped
          category !== "" ||
          foundationDate?.min !== 1900 ||
          foundationDate?.max !== 2028 ||
          sort !== "" ||
          perPage.start !== 0 ||
          perPage.end !== 0 ? (
            <button
              onClick={clearAll}
              className="btn btn-danger text-nowrap me-2"
              style={{
                minHeight: "45px",
                marginBottom: "15px",
              }}
            >
              Clear All
            </button>
          ) : undefined}

          <select
            value={sort}
            className="chosen-single form-select"
            onChange={sortHandler}
          >
            <option value="">Sort by (default)</option>
            <option value="asc">Name (A-Z)</option>
            <option value="des">Name (Z-A)</option>
            {/* Add other sort options if needed, e.g., by job count */}
          </select>
          {/* End select */}

          <select
            onChange={perPageHandler}
            className="chosen-single form-select ms-3 "
            value={JSON.stringify(perPage)}
          >
            <option
              value={JSON.stringify({
                start: 0,
                end: 0, // Signifies default/load initial ITEMS_PER_PAGE
              })}
            >
              Default
            </option>
             <option
              value={JSON.stringify({
                start: 0,
                end: 10, // Fetch items 0-9
              })}
            >
              10 per page
            </option>
            <option
              value={JSON.stringify({
                start: 0,
                end: 20, // Fetch items 0-19
              })}
            >
              20 per page
            </option>
            <option
              value={JSON.stringify({
                start: 0,
                end: 30, // Fetch items 0-29
              })}
            >
              30 per page
            </option>
          </select>
          {/* End select */}
        </div>
      </div>
      {/* End top filter bar box */}

      <div className="row"> {content} </div>


      {/* <!-- Listing Show More --> */}
      <div className="ls-show-more">
         {/* Only show if there are more companies to load */}
         {!loading && fetchedCompanies.length < totalCompaniesCount && (
           <>
             <p>Showing {fetchedCompanies.length} of {totalCompaniesCount} Companies</p>
             <div className="bar">
               <span className="bar-inner" style={{ width: `${totalCompaniesCount > 0 ? (fetchedCompanies.length / totalCompaniesCount) * 100 : 0}%` }}></span>
             </div>
             <button
               className="show-more"
               onClick={handleShowMore}
               disabled={showMoreLoading}
             >
               {showMoreLoading ? 'Loading...' : 'Show More'}
             </button>
           </>
         )}
         {/* Optionally show a message when all companies are loaded */}
         {!loading && fetchedCompanies.length > 0 && fetchedCompanies.length >= totalCompaniesCount && (
            <p>All companies loaded.</p>
         )}
      </div>
    </>
  );
};

export default FilterTopBox;
