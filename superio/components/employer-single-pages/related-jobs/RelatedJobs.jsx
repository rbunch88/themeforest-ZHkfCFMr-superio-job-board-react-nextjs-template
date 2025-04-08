'use client' // Make it a client component

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client"; // Adjust path if needed

const RelatedJobs = ({ employerId }) => { // Accept employerId as prop
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedJobs = async () => {
      if (!employerId) {
        setLoading(false);
        return; // Cannot fetch jobs without employerId
      }
       if (!supabase) {
         console.error("Supabase client not available for related jobs.");
         setLoading(false);
         return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            location,
            created_at,
            salary_min,
            salary_max,
            slug,       // Fetch slug
            short_id,   // Fetch short_id
            salary_unit,
            company:companies!inner( name, logo_url ),
            job_type:job_types ( name )
          `)
          .eq('company_id', employerId) // Filter by the current employer's ID
          .eq('status', 'active') // Only show active jobs
          .order('created_at', { ascending: false }) // Show newest first
          .limit(4); // Limit the number of jobs shown

        if (fetchError) throw fetchError;

        // Format data slightly
        const formattedJobs = data?.map(item => ({
            ...item,
            jobTitle: item.title,
            companyName: item.company?.name, // Company name should be the same, but good practice
            companyLogo: item.company?.logo_url,
            jobTypeName: item.job_type?.name,
            slug: item.slug, // Ensure slug is passed through
            short_id: item.short_id, // Ensure short_id is passed through
            postedDate: new Date(item.created_at).toLocaleDateString(),
            salary: item.salary_min && item.salary_max
                ? `$${item.salary_min} - $${item.salary_max}${item.salary_unit ? ` (${item.salary_unit})` : ''}`
                : 'Not specified',
        })) || [];

        setRelatedJobs(formattedJobs);

      } catch (err) {
        console.error("Error fetching related jobs for employer:", err);
        setError("Could not load related jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedJobs();
  }, [employerId, supabase]); // Re-fetch if employerId changes

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  // No need to show "No related jobs" if the count is handled in the parent title

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
                  src={item.companyLogo || "/images/resource/company-logo/company_logo_placeholder.png"}
                  alt={`${item.companyName} logo`}
                />
              </span>
              <h4>
                <Link href={item.slug && item.short_id ? `/job-single-v1/${item.slug}-${item.short_id}` : '#'}>{item.jobTitle}</Link>
              </h4>

              <ul className="job-info">
                {/* Company name is redundant here as it's the current employer's page */}
                {/* <li>
                  <span className="icon flaticon-briefcase"></span>
                  {item.companyName}
                </li> */}
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
                {item.salary && item.salary !== 'Not specified' && (
                    <li>
                        <span className="icon flaticon-money"></span> {item.salary}
                    </li>
                )}
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
