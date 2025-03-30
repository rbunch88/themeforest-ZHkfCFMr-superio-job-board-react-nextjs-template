'use client'

import Link from "next/link";
// import jobs from "../../../data/job-featured"; // Removed static import
import { useState, useEffect } from "react"; // Added useState, useEffect
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../utils/supabaseClient"; // Import supabase client
import {
  addCategory,
  addDatePosted,
  addDestination,
  addKeyword,
  addLocation,
  addPerPage,
  addSalary,
  addSort,
  addTag,
  clearExperience,
  clearJobType,
} from "../../../features/filter/filterSlice";
import {
  clearDatePostToggle,
  clearExperienceToggle,
  clearJobTypeToggle,
} from "../../../features/job/jobSlice";
import Image from "next/image";

const ITEMS_PER_PAGE = 10; // Define how many items to load per page/click

const FilterJobsBox = () => {
  const [fetchedJobs, setFetchedJobs] = useState([]); // State for fetched jobs
  const [loading, setLoading] = useState(true); // Initial loading state
  const [showMoreLoading, setShowMoreLoading] = useState(false); // Loading state for "Show More"
  const [error, setError] = useState(null); // Error state
  const [totalJobsCount, setTotalJobsCount] = useState(0); // State for total job count for pagination

  const { jobList, jobSort } = useSelector((state) => state.filter);
  const {
    keyword,
    location,
    destination, // Note: Destination/radius filter needs geospatial query in Supabase (complex, skipping for now)
    category,
    jobType, // This likely holds the ID now, needs adjustment in filter logic
    datePosted,
    experience, // This likely holds IDs now, needs adjustment in filter logic
    salary,
    tag, // Tag filtering might need a separate table or array column
  } = jobList || {};

  const { sort, perPage } = jobSort;

  const dispatch = useDispatch();

  // Effect hook to fetch data when filters change
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      if (!supabase) {
        setError('Supabase client not available');
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('jobs')
          .select(`
            id,
            title,
            location,
            created_at,
            job_type_id,
            experience_level_id,
            salary_min,
            salary_max,
            salary_unit,
            company:companies ( name, logo_url )
          `, { count: 'exact' }) // Request count for pagination
          .eq('status', 'active'); // Only fetch active jobs

        // --- Apply Filters ---
        if (keyword) {
          // Search in title and description
          query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
        }
        if (location) {
          query = query.ilike('location', `%${location}%`);
        }
        if (category) {
           // Assuming category state holds the category UUID
          query = query.eq('category_id', category);
        }
        if (jobType && jobType.length > 0) {
           // Assuming jobType state holds an array of job_type UUIDs
          query = query.in('job_type_id', jobType);
        }
        if (experience && experience.length > 0) {
           // Assuming experience state holds an array of experience_level UUIDs
          query = query.in('experience_level_id', experience);
        }
        if (datePosted && datePosted !== 'all') {
          const dateFilter = new Date();
          let isValidDateFilter = true;
          if (datePosted === 'last-24-hours') {
            dateFilter.setDate(dateFilter.getDate() - 1);
          } else if (datePosted === 'last-7-days') {
            dateFilter.setDate(dateFilter.getDate() - 7);
          } else if (datePosted === 'last-14-days') {
            dateFilter.setDate(dateFilter.getDate() - 14);
          } else if (datePosted === 'last-30-days') {
            dateFilter.setDate(dateFilter.getDate() - 30);
          } else {
            isValidDateFilter = false; // Handle unexpected values
          }
          if (isValidDateFilter) {
            query = query.gte('created_at', dateFilter.toISOString());
          }
        }
        // Salary Filter Logic (Example: Find jobs where the filter range overlaps the job's range)
        if (salary?.min > 0 || salary?.max < 20000) { // Apply only if slider moved
            // Job range must start before filter max AND end after filter min
            if (salary.min > 0) {
                 query = query.or(`(salary_max.gte.${salary.min},salary_min.is.null,salary_max.is.null)`); // Job max >= filter min (or salary null)
            }
             if (salary.max < 20000) { // Assuming 20000 is max value
                 query = query.or(`(salary_min.lte.${salary.max},salary_min.is.null,salary_max.is.null)`); // Job min <= filter max (or salary null)
             }
             // This simple OR might include jobs outside the range if only one condition matches.
             // More precise overlap logic might be needed depending on exact requirements.
        }
        if (tag) {
           // Assuming 'tag' corresponds to a value in the 'skills' array column
          query = query.contains('skills', [tag]);
        }
        // --- Destination/Radius filter skipped for now ---

        // --- Apply Sorting ---
        if (sort === 'asc') {
          query = query.order('created_at', { ascending: true });
        } else { // Default or 'des'
          query = query.order('created_at', { ascending: false });
        }

        // --- Apply Pagination ---
        const rangeStart = perPage.start || 0;
        const itemsPerPage = (perPage.end && perPage.end > 0) ? perPage.end - rangeStart : 10; // Default 10 items if end is 0
        const rangeEnd = rangeStart + itemsPerPage - 1;
        query = query.range(rangeStart, rangeEnd);


        const { data, error: fetchError, count } = await query;

        if (fetchError) {
          throw fetchError;
        }

        setFetchedJobs(data || []);
        setTotalJobsCount(count || 0);

      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(err.message || "Failed to fetch jobs.");
        setFetchedJobs([]);
        setTotalJobsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [
      keyword, location, category, jobType, datePosted, experience, salary, tag, // jobList parts
      sort, perPage, // jobSort parts
      supabase, dispatch // Removed perPage from dependencies
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
      const currentLength = fetchedJobs.length;
      const rangeStart = currentLength;
      const rangeEnd = currentLength + ITEMS_PER_PAGE - 1;

      // Re-build the query with the same filters and sorting as in useEffect
      let query = supabase
        .from('jobs')
        .select(`
          id,
          title,
          location,
          created_at,
          job_type_id,
          experience_level_id,
          salary_min,
          salary_max,
          salary_unit,
          company:companies ( name, logo_url )
        `) // No count needed for subsequent fetches
        .eq('status', 'active');

      // --- Apply Filters (Mirroring useEffect logic) ---
      if (keyword) {
        query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
      }
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }
      if (category) {
        query = query.eq('category_id', category);
      }
      if (jobType && jobType.length > 0) {
        query = query.in('job_type_id', jobType);
      }
      if (experience && experience.length > 0) {
        query = query.in('experience_level_id', experience);
      }
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
      if (salary?.min > 0 || salary?.max < 20000) {
          if (salary.min > 0) query = query.or(`(salary_max.gte.${salary.min},salary_min.is.null,salary_max.is.null)`);
          if (salary.max < 20000) query = query.or(`(salary_min.lte.${salary.max},salary_min.is.null,salary_max.is.null)`);
      }
      if (tag) {
        query = query.contains('skills', [tag]);
      }
      // --- Destination/Radius filter skipped ---

      // --- Apply Sorting (Mirroring useEffect logic) ---
      if (sort === 'asc') {
        query = query.order('created_at', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // --- Apply Range for the NEXT page ---
      query = query.range(rangeStart, rangeEnd);

      const { data: nextJobs, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Append new jobs to the existing list
      if (nextJobs && nextJobs.length > 0) {
        setFetchedJobs(prevJobs => [...prevJobs, ...nextJobs]);
      }

    } catch (err) {
      console.error("Error fetching more jobs:", err);
      // Keep existing jobs displayed, but show an error
      setError(err.message || "Failed to fetch more jobs.");
    } finally {
      setShowMoreLoading(false);
    }
  };


  // --- Render fetched jobs ---
  let content;

  if (loading) {
    content = <div className="text-center p-5">Loading jobs...</div>;
  } else if (error) {
    content = <div className="alert alert-danger mx-3">Error loading jobs: {error}</div>;
  } else if (fetchedJobs.length === 0) {
    content = <div className="text-center p-5">No jobs found matching your criteria.</div>;
  } else {
    content = fetchedJobs?.map((item) => (
       <div className="job-block" key={item.id}>
         <div className="inner-box">
           <div className="content">
             <span className="company-logo">
               <Image width={50} height={49} src={item.company?.logo_url || "/images/resource/default-logo.png"} alt="Company Logo" />
             </span>
             <h4>
               {/* Link to the correct single job page (v2) */}
               <Link href={`/job-single-v2/${item.id}`}>{item.title}</Link>
             </h4>

             <ul className="job-info">
               <li>
                 <span className="icon flaticon-briefcase"></span>
                 {item.company?.name || "N/A"}
               </li>
               <li>
                 <span className="icon flaticon-map-locator"></span>
                 {item.location || "N/A"}
               </li>
               <li>
                 <span className="icon flaticon-clock-3"></span>
                 {new Date(item.created_at).toLocaleDateString()}
               </li>
               <li>
                 <span className="icon flaticon-money"></span>
                 {item.salary_min && item.salary_max ? `$${item.salary_min} - $${item.salary_max}` : "N/A"} {item.salary_unit ? `(${item.salary_unit})` : ''}
               </li>
             </ul>

             <ul className="job-other-info">
               {/* TODO: Fetch and display job type name based on item.job_type_id */}
               {/* Example placeholder: <li className="time">Full Time</li> */}
             </ul>
           </div>
         </div>
       </div>
     ));
  }


  // sort handler
  const sortHandler = (e) => {
    dispatch(addSort(e.target.value));
  };

  // per page handler
  const perPageHandler = (e) => {
    const pageData = JSON.parse(e.target.value);
    dispatch(addPerPage(pageData));
  };

  // clear all filters
  const clearAll = () => {
    dispatch(addKeyword(""));
    dispatch(addLocation(""));
    dispatch(addDestination({ min: 0, max: 100 }));
    dispatch(addCategory(""));
    dispatch(clearJobType());
    dispatch(clearJobTypeToggle());
    dispatch(addDatePosted(""));
    dispatch(clearDatePostToggle());
    dispatch(clearExperience());
    dispatch(clearExperienceToggle());
    dispatch(addSalary({ min: 0, max: 20000 }));
    dispatch(addTag(""));
    dispatch(addSort(""));
    dispatch(addPerPage({ start: 0, end: 0 }));
  };

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
          {/* Collapsible sidebar button */}

          <div className="text">
            {/* Update count based on fetched data */}
            Show <strong>{loading ? '...' : fetchedJobs.length}</strong> of {totalJobsCount} jobs
          </div>
        </div>
        {/* End show-result */}

        <div className="sort-by">
          {keyword !== "" ||
          location !== "" ||
          destination?.min !== 0 ||
          destination?.max !== 100 ||
          category !== "" ||
          jobType?.length !== 0 ||
          datePosted !== "" ||
          experience?.length !== 0 ||
          salary?.min !== 0 ||
          salary?.max !== 20000 ||
          tag !== "" ||
          sort !== "" ||
          perPage.start !== 0 ||
          perPage.end !== 0 ? ( // Check if any filter is active
            <button
              onClick={clearAll}
              className="btn btn-danger text-nowrap me-2"
              style={{ minHeight: "45px", marginBottom: "15px" }}
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
            <option value="asc">Newest</option>
            <option value="des">Oldest</option>
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
                end: 0, // Using end: 0 to signify 'All' might need adjustment based on total count
              })}
            >
              All
            </option>
            <option
              value={JSON.stringify({
                start: 0,
                end: 15, // Represents fetching items 0-14
              })}
            >
              15 per page
            </option>
            <option
              value={JSON.stringify({
                start: 0,
                end: 20, // Represents fetching items 0-19
              })}
            >
              20 per page
            </option>
            <option
              value={JSON.stringify({
                start: 0,
                end: 30, // Represents fetching items 0-29
              })}
            >
              30 per page
            </option>
          </select>
          {/* End select */}
        </div>
      </div>
      {/* End top filter bar box */}
      {content}
      {/* <!-- List Show More --> */}
      <div className="ls-show-more">
         {/* Only show if there are more jobs to load */}
         {!loading && fetchedJobs.length < totalJobsCount && (
           <>
             <p>Showing {fetchedJobs.length} of {totalJobsCount} Jobs</p>
             <div className="bar">
               <span className="bar-inner" style={{ width: `${totalJobsCount > 0 ? (fetchedJobs.length / totalJobsCount) * 100 : 0}%` }}></span>
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
         {/* Optionally show a message when all jobs are loaded */}
         {!loading && fetchedJobs.length > 0 && fetchedJobs.length >= totalJobsCount && (
            <p>All jobs loaded.</p>
         )}
      </div>
    </>
  );
};

export default FilterJobsBox;
