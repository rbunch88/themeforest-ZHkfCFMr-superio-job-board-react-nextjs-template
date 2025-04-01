'use client'

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../utils/supabaseClient"; // Import supabase client
import ListingShowing from "../components/ListingShowing"; // Keep for pagination UI
// import candidatesData from "../../../data/candidates"; // Removed static import
import {
  // addCategory, // Removed
  // addDestination, // Skipping destination
  addDateAppliedCheck, // Renamed action
  addKeyword,
  addLocation,
  addPerPage,
  addSort,
  addExperienceCheck, // Action for experience filter
  clearExperienceF, // Action to clear experience filter state
} from "../../../features/filter/candidateFilterSlice"; // Ensure correct slice
import {
  clearDateApplied, // Renamed action
  clearExperience, // Action to clear experience UI state
} from "../../../features/candidate/candidateSlice"; // Ensure correct slice

const ITEMS_PER_PAGE = 10; // Or adjust as needed

const FilterTopBox = () => {
  const [fetchedApplicants, setFetchedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalApplicantsCount, setTotalApplicantsCount] = useState(0);
  const [employerCompanyId, setEmployerCompanyId] = useState(null); // State for employer's company ID
  const [showMoreLoading, setShowMoreLoading] = useState(false); // State for pagination loading

  const dispatch = useDispatch();
  const {
    keyword,
    location,
    // destination, // Skipping destination filter
    // category, // Removed category filter
    // candidateGender, // Removed gender filter
    dateApplied, // Renamed from datePost
    experiences, // Expecting array of experience level UUIDs
    // qualifications, // Removed qualification filter
    sort,
    perPage,
  } = useSelector((state) => state.candidateFilter) || {};

  // --- Fetch Employer Company ID ---
  useEffect(() => {
    const fetchEmployerCompany = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (companyError) {
          console.error("Error fetching employer company ID:", companyError);
          setError("Could not verify employer information.");
        } else if (companyData) {
          setEmployerCompanyId(companyData.id);
        } else {
             setError("Employer company not found."); // Handle case where user is employer but has no company
        }
      } else {
          // This shouldn't happen due to middleware, but handle defensively
          setError("User not logged in.");
      }
    };
    fetchEmployerCompany();
  }, [supabase]);


  // --- Effect hook to fetch applicants data when filters or employer ID change ---
  useEffect(() => {
    // Don't fetch until we have the employer's company ID
    if (!employerCompanyId) {
        setLoading(false); // Stop loading if we can't get employer ID
        return;
    }

    const fetchApplicants = async () => {
      setLoading(true);
      setError(null);

      if (!supabase) {
        setError('Supabase client not available');
        setLoading(false);
        return;
      }

      try {
        // Base query: Select applications for the employer's company
        let query = supabase
          .from('applications')
          .select(`
            id,
            application_date,
            status,
            job:jobs!inner ( title, company_id ),
            profile:profiles!inner (
                id,
                first_name,
                last_name,
                avatar_url,
                slug,       // Fetch slug
                short_id,   // Fetch short_id
                candidate:candidates!inner (
                    designation,
                    location,
                    hourly_rate,
                    skills,
                    experience_level:experience_levels ( name )
                )
            )
          `, { count: 'exact' })
          .eq('job.company_id', employerCompanyId); // Filter by employer's company ID

        // --- Apply Filters ---
        if (keyword) {
          // Search in applicant name, designation, skills
          query = query.or(
            `profile.first_name.ilike.%${keyword}%,profile.last_name.ilike.%${keyword}%,profile.candidate.designation.ilike.%${keyword}%,profile.candidate.skills.cs.{${keyword}}`
          );
        }
        if (location) {
          query = query.ilike('profile.candidate.location', `%${location}%`);
        }
        if (dateApplied && dateApplied !== 'all') {
           const dateFilter = new Date();
           let isValidDateFilter = true;
           if (dateApplied === 'last-24-hours') dateFilter.setDate(dateFilter.getDate() - 1);
           else if (dateApplied === 'last-7-days') dateFilter.setDate(dateFilter.getDate() - 7);
           else if (dateApplied === 'last-14-days') dateFilter.setDate(dateFilter.getDate() - 14);
           else if (dateApplied === 'last-30-days') dateFilter.setDate(dateFilter.getDate() - 30);
           else isValidDateFilter = false;

           if (isValidDateFilter) {
             query = query.gte('application_date', dateFilter.toISOString());
           }
        }
        if (experiences && experiences.length > 0) {
           // Filter based on the candidate's experience level ID
           query = query.in('profile.candidate.experience_level_id', experiences);
        }
        // --- Destination/Radius filter skipped ---
        // --- Category, Gender, Qualification filters removed ---

        // --- Apply Sorting ---
        if (sort === 'asc') { // Sort by application date ascending (oldest first)
          query = query.order('application_date', { ascending: true });
        } else { // Default or 'des': Sort by application date descending (newest first)
          query = query.order('application_date', { ascending: false });
        }

        // --- Apply Pagination ---
        const rangeStart = perPage.start || 0;
        const itemsToFetch = (perPage.end && perPage.end > rangeStart) ? perPage.end - rangeStart : ITEMS_PER_PAGE;
        const rangeEnd = rangeStart + itemsToFetch - 1;

        query = query.range(rangeStart, rangeEnd);

        const { data, error: fetchError, count } = await query;

        if (fetchError) {
          throw fetchError;
        }

        // Process data for easier access in JSX
        const processedData = data?.map(app => ({
            id: app.profile.id, // Use profile ID as key for candidate block
            application_id: app.id,
            name: `${app.profile.first_name || ''} ${app.profile.last_name || ''}`.trim(),
            avatar: app.profile.avatar_url,
            designation: app.profile.candidate?.designation,
            location: app.profile.candidate?.location,
            slug: app.profile.slug, // Add slug
            short_id: app.profile.short_id, // Add short_id
            hourlyRate: app.profile.candidate?.hourly_rate,
            tags: app.profile.candidate?.skills || [],
            appliedDate: app.application_date,
            jobTitleAppliedFor: app.job?.title,
            applicationStatus: app.status,
            // Add experience level name if needed for display
            experienceLevelName: app.profile.candidate?.experience_level?.name
        })) || [];

        setFetchedApplicants(processedData);
        setTotalApplicantsCount(count || 0);

      } catch (err) {
        console.error("Error fetching applicants:", err);
        setError(err.message || "Failed to fetch applicants.");
        setFetchedApplicants([]);
        setTotalApplicantsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [
      employerCompanyId, // Re-fetch if employer changes (though unlikely in this context)
      keyword, location, dateApplied, experiences, // candidateFilter parts
      sort, perPage, // candidateFilter parts
      supabase, dispatch
  ]);

  // Handler for the "Show More" button
  const handleShowMore = async () => {
    setShowMoreLoading(true);
    setError(null);

    if (!supabase || !employerCompanyId) {
      setError('Supabase client or Employer ID not available');
      setShowMoreLoading(false);
      return;
    }

    try {
      const currentLength = fetchedApplicants.length;
      const rangeStart = currentLength;
      const rangeEnd = currentLength + ITEMS_PER_PAGE - 1;

      // Re-build the query with the same filters and sorting as in useEffect
      let query = supabase
        .from('applications')
        .select(`
          id,
          application_date,
          status,
          job:jobs!inner ( title, company_id ),
          profile:profiles!inner (
              id,
              first_name,
              last_name,
              avatar_url,
              slug,       // Fetch slug
              short_id,   // Fetch short_id
              candidate:candidates!inner (
                  designation,
                  location,
                  hourly_rate,
                  skills,
                  experience_level:experience_levels ( name )
              )
          )
        `)
        .eq('job.company_id', employerCompanyId);

      // --- Apply Filters (Mirroring useEffect logic) ---
      if (keyword) {
        query = query.or(
          `profile.first_name.ilike.%${keyword}%,profile.last_name.ilike.%${keyword}%,profile.candidate.designation.ilike.%${keyword}%,profile.candidate.skills.cs.{${keyword}}`
        );
      }
      if (location) {
        query = query.ilike('profile.candidate.location', `%${location}%`);
      }
      if (dateApplied && dateApplied !== 'all') {
         const dateFilter = new Date();
         let isValidDateFilter = true;
         if (dateApplied === 'last-24-hours') dateFilter.setDate(dateFilter.getDate() - 1);
         else if (dateApplied === 'last-7-days') dateFilter.setDate(dateFilter.getDate() - 7);
         else if (dateApplied === 'last-14-days') dateFilter.setDate(dateFilter.getDate() - 14);
         else if (dateApplied === 'last-30-days') dateFilter.setDate(dateFilter.getDate() - 30);
         else isValidDateFilter = false;
         if (isValidDateFilter) query = query.gte('application_date', dateFilter.toISOString());
      }
      if (experiences && experiences.length > 0) {
         query = query.in('profile.candidate.experience_level_id', experiences);
      }

      // --- Apply Sorting (Mirroring useEffect logic) ---
      if (sort === 'asc') {
        query = query.order('application_date', { ascending: true });
      } else {
        query = query.order('application_date', { ascending: false });
      }

      // --- Apply Range for the NEXT page ---
      query = query.range(rangeStart, rangeEnd);

      const { data: nextApplicantsData, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Process data
      const processedData = nextApplicantsData?.map(app => ({
          id: app.profile.id,
          application_id: app.id,
          name: `${app.profile.first_name || ''} ${app.profile.last_name || ''}`.trim(),
          avatar: app.profile.avatar_url,
          designation: app.profile.candidate?.designation,
          location: app.profile.candidate?.location,
          slug: app.profile.slug, // Add slug
          short_id: app.profile.short_id, // Add short_id
          hourlyRate: app.profile.candidate?.hourly_rate,
          tags: app.profile.candidate?.skills || [],
          appliedDate: app.application_date,
          jobTitleAppliedFor: app.job?.title,
          applicationStatus: app.status,
          experienceLevelName: app.profile.candidate?.experience_level?.name
      })) || [];

      // Append new applicants to the existing list
      if (processedData.length > 0) {
        setFetchedApplicants(prevApplicants => [...prevApplicants, ...processedData]);
      }

    } catch (err) {
      console.error("Error fetching more applicants:", err);
      setError(err.message || "Failed to fetch more applicants.");
    } finally {
      setShowMoreLoading(false);
    }
  };



  // --- Render fetched applicants ---
  let content;
  if (!employerCompanyId && !error) {
      content = <div className="text-center p-5">Verifying employer status...</div>; // Show message while fetching employer ID
  } else if (loading) {
    content = <div className="text-center p-5">Loading applicants...</div>;
  } else if (error) {
    content = <div className="alert alert-danger mx-3">Error loading applicants: {error}</div>;
  } else if (fetchedApplicants.length === 0) {
    content = <div className="text-center p-5">No applicants found matching your criteria.</div>;
  } else {
    content = fetchedApplicants.map((applicant) => (
      <div className="candidate-block-three" key={applicant.id}> {/* Use profile ID */}
        <div className="inner-box">
          <div className="content">
            <figure className="image">
              <Image
                width={90}
                height={90}
                src={applicant.avatar || "/images/resource/default-avatar.png"} // Use fetched avatar
                alt={`${applicant.name} avatar`}
              />
            </figure>
            <h4 className="name">
              {/* Link to the candidate single page */}
              <Link href={applicant.slug && applicant.short_id ? `/candidates-single-v2/${applicant.slug}-${applicant.short_id}` : '#'}>
                {applicant.name || 'Unnamed Candidate'}
              </Link>
            </h4>

            <ul className="candidate-info">
              {applicant.designation && <li className="designation">{applicant.designation}</li>}
              {applicant.location && (
                <li>
                  <span className="icon flaticon-map-locator"></span>{" "}
                  {applicant.location}
                </li>
              )}
              {applicant.hourlyRate && (
                <li>
                  <span className="icon flaticon-money"></span> $
                  {applicant.hourlyRate} / hour
                </li>
              )}
               {applicant.appliedDate && (
                 <li>
                   <span className="icon flaticon-calendar"></span> Applied: {new Date(applicant.appliedDate).toLocaleDateString()}
                 </li>
               )}
               {applicant.jobTitleAppliedFor && (
                 <li>
                   <span className="icon flaticon-briefcase"></span> For: {applicant.jobTitleAppliedFor}
                 </li>
               )}
            </ul>
            {/* End candidate-info */}

            {applicant.tags.length > 0 && (
                <ul className="post-tags">
                {applicant.tags.map((val, i) => (
                    <li key={i}>
                    {/* Link for tags might not be applicable here, just display */}
                    <span>{val}</span>
                    </li>
                ))}
                </ul>
            )}
          </div>
          {/* End content */}

          <div className="btn-box">
             {/* TODO: Implement bookmarking if needed */}
            {/* <button className="bookmark-btn me-2">
              <span className="flaticon-bookmark"></span>
            </button> */}

            <Link
              href={applicant.slug && applicant.short_id ? `/candidates-single-v2/${applicant.slug}-${applicant.short_id}` : '#'} // Link to candidate profile
              className="theme-btn btn-style-three"
            >
              <span className="btn-title">View Profile</span>
            </Link>
             {/* TODO: Add buttons/dropdown for changing application status */}
             {/* Example: <button>Update Status</button> */}
          </div>
          {/* End btn-box */}
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

  // clear handler
  const clearHandler = () => {
    dispatch(addKeyword(""));
    dispatch(addLocation(""));
    // dispatch(addDestination({ min: 0, max: 100 })); // Skipped
    // dispatch(addCategory("")); // Removed
    // dispatch(addCandidateGender("")); // Removed
    dispatch(addDateAppliedCheck(1)); // Reset date to 'All' (assuming ID 1 is 'All')
    dispatch(clearDateApplied()); // Clear UI state for date
    dispatch(clearExperienceF()); // Clear filter state for experience
    dispatch(clearExperience()); // Clear UI state for experience
    // dispatch(clearQualification()); // Removed
    // dispatch(clearQualificationF()); // Removed
    dispatch(addSort("")); // Reset sort
    dispatch(addPerPage({ start: 0, end: 0 })); // Reset pagination
  };

  return (
    <>
      <div className="ls-switcher">
        <div className="showing-result">
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
            Showing <strong>{loading ? '...' : fetchedApplicants.length}</strong> of {totalApplicantsCount} Applicants
          </div>
        </div>
        {/* End showing-result */}

        <div className="sort-by">
          {keyword !== "" ||
          location !== "" ||
          // destination.min !== 0 || // Skipped
          // destination.max !== 100 || // Skipped
          // category !== "" || // Removed
          // candidateGender !== "" || // Removed
          dateApplied !== "all" || // Check if date filter is not 'All'
          experiences?.length !== 0 ||
          // qualifications?.length !== 0 || // Removed
          sort !== "" ||
          perPage?.start !== 0 ||
          perPage?.end !== 0 ? (
            <button
              className="btn btn-danger text-nowrap me-2"
              style={{ minHeight: "45px", marginBottom: "15px" }}
              onClick={clearHandler}
            >
              Clear All
            </button>
          ) : undefined}

          <select
            onChange={sortHandler}
            className="chosen-single form-select"
            value={sort}
          >
            <option value="">Sort by (Default: Newest Applied)</option>
            <option value="des">Newest Applied</option>
            <option value="asc">Oldest Applied</option>
            {/* Add other sort options if needed, e.g., by name */}
          </select>
          {/* End select */}

          <select
            className="chosen-single form-select ms-3 "
            onChange={perPageHandler}
            value={JSON.stringify(perPage)}
          >
             <option
              value={JSON.stringify({
                start: 0,
                end: 0, // Signifies default/load initial ITEMS_PER_PAGE
              })}
            >
              Default ({ITEMS_PER_PAGE})
            </option>
             <option
              value={JSON.stringify({
                start: 0,
                end: 15, // Fetch items 0-14
              })}
            >
              15 per page
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

      {content}

      {/* <!-- Listing Show More --> */}
      <div className="ls-show-more">
         {/* Only show if there are more applicants to load */}
         {!loading && fetchedApplicants.length < totalApplicantsCount && (
           <>
             <p>Showing {fetchedApplicants.length} of {totalApplicantsCount} Applicants</p>
             <div className="bar">
               <span className="bar-inner" style={{ width: `${totalApplicantsCount > 0 ? (fetchedApplicants.length / totalApplicantsCount) * 100 : 0}%` }}></span>
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
         {/* Optionally show a message when all applicants are loaded */}
         {!loading && fetchedApplicants.length > 0 && fetchedApplicants.length >= totalApplicantsCount && (
            <p>All applicants loaded.</p>
         )}
      </div>
    </>
  );
};

export default FilterTopBox;
