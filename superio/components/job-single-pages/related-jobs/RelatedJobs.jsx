'use client' // Make it a client component

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient"; // Adjust path if needed

const RelatedJobs = ({ job }) => { // Accept current job as prop
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedJobs = async () => {
      // Ensure we have the current job and its category/location to find related ones
      if (!job || (!job.category_id && !job.location)) {
        setLoading(false);
        return; // Cannot fetch related jobs without criteria
      }
      if (!supabase) {
         console.error("Supabase client not available for related jobs.");
         setLoading(false);
         return;
      }

      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('jobs')
          .select(`
            id,
            title,
            location,
            created_at,
            slug,       // Fetch slug
            short_id,   // Fetch short_id
            company:companies ( name, logo_url ),
            job_type:job_types ( name )
          `)
          .eq('status', 'active') // Only show active jobs
          .neq('id', job.id) // Exclude the current job itself
          .limit(4); // Limit the number of related jobs

        // Prioritize finding jobs in the same category, then same location if category is missing
        if (job.category_id) {
          query = query.eq('category_id', job.category_id);
        } else if (job.location) {
          // Basic location matching (might need refinement for better relevance)
          query = query.ilike('location', `%${job.location.split(',')[0]}%`); // Match city part?
        } else {
            // Fallback if no category or location - maybe fetch latest?
             query = query.order('created_at', { ascending: false });
        }

        // Add ordering if needed, e.g., by date
        query = query.order('created_at', { ascending: false });


        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // Format data slightly
        const formattedJobs = data?.map(item => ({
            ...item,
            jobTitle: item.title,
            companyName: item.company?.name,
            slug: item.slug, // Ensure slug is passed through
            short_id: item.short_id, // Ensure short_id is passed through
            companyLogo: item.company?.logo_url,
            jobTypeName: item.job_type?.name,
            postedDate: new Date(item.created_at).toLocaleDateString(),
            // Add salary/time if needed and fetched
        })) || [];

        setRelatedJobs(formattedJobs);

      } catch (err) {
        console.error("Error fetching related jobs:", err);
        setError("Could not load related jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedJobs();
  }, [job, supabase]); // Re-fetch if the main job changes

  if (loading) {
    return <div>Loading related jobs...</div>;
  }

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  if (relatedJobs.length === 0) {
    return <div>No related jobs found.</div>;
  }

  return (
    <>
      {relatedJobs.map((item) => (
        <div className="job-block" key={item.id}>
          <div className="inner-box">
            <div className="content">
              <span className="company-logo">
                <Image
                  width={50}
                  height={49}
                  src={item.companyLogo || "/images/resource/default-logo.png"}
                  alt={`${item.companyName || 'Company'} logo`}
                />
              </span>
              <h4>
                <Link href={item.slug && item.short_id ? `/job-single-v1/${item.slug}-${item.short_id}` : '#'}>{item.jobTitle}</Link>
              </h4>

              <ul className="job-info">
                {item.companyName && (
                    <li>
                        <span className="icon flaticon-briefcase"></span>
                        {item.companyName}
                    </li>
                )}
                {item.location && (
                    <li>
                        <span className="icon flaticon-map-locator"></span>
                        {item.location}
                    </li>
                )}
                 {item.postedDate && (
                    <li>
                        <span className="icon flaticon-clock-3"></span> {item.postedDate}
                    </li>
                 )}
                {/* Add salary if fetched and available */}
                {/* <li>
                  <span className="icon flaticon-money"></span> {item.salary}
                </li> */}
              </ul>
              {/* End .job-info */}

              {item.jobTypeName && (
                 <ul className="job-other-info">
                    <li className="time">{item.jobTypeName}</li>
                 </ul>
              )}
              {/* End .job-other-info */}

              {/* TODO: Implement bookmarking if needed */}
              {/* <button className="bookmark-btn">
                <span className="flaticon-bookmark"></span>
              </button> */}
            </div>
          </div>
        </div>
        // End job-block
      ))}
    </>
  );
};

export default RelatedJobs;
