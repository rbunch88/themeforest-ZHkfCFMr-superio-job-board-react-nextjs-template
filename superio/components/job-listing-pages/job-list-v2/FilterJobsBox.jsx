'use client'

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "@/utils/supabase/client"; // Import from new client utility
import Image from "next/image";
import Pagination from "../components/Pagination"; // Import the correct Pagination component

// Removed Redux imports

const ITEMS_PER_PAGE = 10; // Default items per page

const FilterJobsBox = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [fetchedJobs, setFetchedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalJobsCount, setTotalJobsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- Read filters and pagination from URL ---
  const keyword = searchParams.get('keyword') || '';
  const location = searchParams.get('location') || '';
  const category = searchParams.get('category') || ''; // Expecting category slug
  const jobType = searchParams.getAll('job_type'); // Can have multiple
  const experience = searchParams.getAll('experience'); // Can have multiple
  const datePosted = searchParams.get('date_posted') || 'all';
  // Removed salaryMin, salaryMax, salaryUnit
  const tag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'created_desc'; // Default sort
  const page = parseInt(searchParams.get('page') || '1', 10);
  // Create stable string representations for array dependencies
  const jobTypeString = [...jobType].sort().join(',');
  const experienceString = [...experience].sort().join(',');

  // Effect hook to fetch data when relevant searchParams change
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      setCurrentPage(page); // Update current page based on URL

      if (!supabase) {
        setError('Supabase client not available');
        setLoading(false);
        return;
      }

      try {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE - 1;

        let query = supabase
          .from('jobs')
          .select(`
            id, title, slug, short_id, location, created_at,
            salary_min, salary_max, salary_unit, skills,
            company:companies ( name, logo_url ),
            job_type:job_types ( name ),
            category:job_categories!inner ( slug ),
            experience_level:experience_levels ( name )
          `, { count: 'exact' })
          .eq('status', 'active');

        // --- Apply Filters ---
        if (keyword) query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
        if (location) query = query.ilike('location', `%${location}%`);
        if (category) query = query.eq('category.slug', category); // Filter by category slug
        if (jobType && jobType.length > 0) query = query.in('job_type_id', jobType); // Assuming jobType param holds IDs
        if (experience && experience.length > 0) query = query.in('experience_level_id', experience); // Assuming experience param holds IDs

        if (datePosted && datePosted !== 'all') {
          const dateFilter = new Date();
          let isValidDateFilter = true;
          if (datePosted === 'last-24-hours') dateFilter.setDate(dateFilter.getDate() - 1);
          else if (datePosted === 'last-7-days') dateFilter.setDate(dateFilter.getDate() - 7);
          else if (datePosted === 'last-14-days') dateFilter.setDate(dateFilter.getDate() - 14);
          else if (datePosted === 'last-30-days') dateFilter.setDate(dateFilter.getDate() - 30);
          else isValidDateFilter = false;
          if (isValidDateFilter) query = query.gte('created_at', dateFilter.toISOString());
        }

        // --- Salary Filter Removed ---
        if (tag) query = query.filter('skills', 'cs', `{${tag}}`); // Use array contains for skills/tags

        // --- Apply Sorting ---
        if (sort === 'created_asc') query = query.order('created_at', { ascending: true });
        else query = query.order('created_at', { ascending: false }); // Default 'created_desc'

        // --- Apply Pagination ---
        query = query.range(startIndex, endIndex);

        const { data, error: fetchError, count } = await query;

        if (fetchError) throw fetchError;

        setFetchedJobs(data || []);
        setTotalJobsCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));

      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(err.message || "Failed to fetch jobs.");
        setFetchedJobs([]);
        setTotalJobsCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [
      supabase, page, keyword, location, category, jobTypeString, experienceString,
      datePosted, tag, sort // Removed salaryMin, salaryMax, salaryUnit dependencies
  ]);

  // --- Handlers to update URL ---
  const updateSearchParams = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset page on filter change
    router.push(`/jobs?${params.toString()}`, { scroll: false });
  };

  const sortHandler = (e) => {
    updateSearchParams('sort', e.target.value);
  };

  // Clear handler - updates URL
  const clearAll = () => {
    router.push('/jobs'); // Navigate to base path, clearing params
  };
  // Handler for page changes from Pagination component
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/jobs?${params.toString()}`, { scroll: false }); // Update URL without full page reload
  };

  // Check if any filters are active
   const areFiltersActive = () => {
    return searchParams.has('keyword') ||
           searchParams.has('location') ||
           searchParams.has('category') ||
           searchParams.has('job_type') ||
           searchParams.has('experience') ||
           searchParams.has('date_posted') ||
           // Removed salary checks
           searchParams.has('tag') ||
           searchParams.has('sort');
  };


  // --- Render fetched jobs ---
  let content;
  if (loading && page === 1) { // Show initial loading only on first page load
    content = <div className="text-center p-5 col-12">Loading jobs...</div>;
  } else if (error) {
    content = <div className="alert alert-danger mx-3 col-12">Error loading jobs: {error}</div>;
  } else if (fetchedJobs.length === 0) {
    content = <div className="text-center p-5 col-12">No jobs found matching your criteria.</div>;
  } else {
    content = fetchedJobs?.map((item) => (
       <div className="job-block col-lg-6 col-md-12 col-sm-12" key={item.id}> {/* Added column classes */}
         <div className="inner-box">
           <div className="content">
             <span className="company-logo">
               <Image
                 width={50}
                 height={49}
                 style={{ height: 'auto' }} // Added style for aspect ratio
                 src={item.company?.logo_url || "/images/resource/company-logo/company_logo_placeholder.png"} // Use company logo
                 alt="Company Logo"
                 onError={(e) => { e.currentTarget.src = "/images/resource/company-logo/company_logo_placeholder.png"; }}
               />
             </span>
             <h4>
               <Link href={item.slug && item.short_id ? `/job/${item.slug}/${item.short_id}` : '#'}>{item.title}</Link>
             </h4>
             <ul className="job-info">
               <li><span className="icon flaticon-briefcase"></span>{item.company?.name || "N/A"}</li>
               <li><span className="icon flaticon-map-locator"></span>{item.location || "N/A"}</li>
               <li><span className="icon flaticon-clock-3"></span>{new Date(item.created_at).toLocaleDateString()}</li>
               <li>
                  <span className="icon flaticon-money"></span>
                  {item.salary_min && item.salary_max
                      ? `$${item.salary_min.toLocaleString()} - $${item.salary_max.toLocaleString()}`
                      : "Salary not specified"}
                  {item.salary_unit ? ` (${item.salary_unit})` : ''}
               </li>
            </ul>
             <ul className="job-other-info">
               {item.job_type?.name && (<li className="time">{item.job_type.name}</li>)}
               {/* Add other info like experience level if needed */}
               {/* {item.experience_level?.name && (<li className="privacy">{item.experience_level.name}</li>)} */}
             </ul>
           </div>
         </div>
       </div>
     ));
  }

  return (
    <>
      <div className="ls-switcher">
        <div className="show-result">
          <div className="show-1023">
            <button
              type="button"
              className="theme-btn toggle-filters "
              data-bs-toggle="offcanvas"
              data-bs-target="#filter-sidebar"
            >
              <span className="icon icon-filter"></span> Filter
            </button>
          </div>
          <div className="text">
            Showing <strong>{loading ? '...' : fetchedJobs.length}</strong> jobs. (Total: {totalJobsCount})
          </div>
        </div>

        <div className="sort-by">
          {areFiltersActive() && (
            <button
              onClick={clearAll}
              className="btn btn-danger text-nowrap me-2"
              style={{ minHeight: "45px", marginBottom: "15px" }}
            >
              Clear All
            </button>
          )}
          <select
            value={sort}
            className="chosen-single form-select"
            onChange={sortHandler}
          >
            <option value="created_desc">Sort by (Default - Newest)</option>
            <option value="created_asc">Date Added (Oldest)</option>
            {/* Add other relevant sort options if needed */}
          </select>
          {/* Removed Per Page dropdown */}
        </div>
      </div>

      <div className="row"> {content} </div>

      {/* Render Pagination if more than one page */}
      { totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
      )}

      {/* Removed Show More Button Logic */}
    </>
  );
};

export default FilterJobsBox;
