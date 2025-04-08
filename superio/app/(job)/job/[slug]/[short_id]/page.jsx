import dynamic from "next/dynamic";
// import jobs from "@/data/job-featured"; // Removed static import
import { notFound } from 'next/navigation'; // Import notFound
import { createClient } from "@/utils/supabase/server"; // Import server-side client
import { cookies } from 'next/headers'; // Import cookies

import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader from "@/components/header/DefaulHeader";
import MobileMenu from "@/components/header/MobileMenu";
import RelatedJobs from "@/components/job-single-pages/related-jobs/RelatedJobs";
import JobOverView from "@/components/job-single-pages/job-overview/JobOverView";
import JobSkills from "@/components/job-single-pages/shared-components/JobSkills";
import CompnayInfo from "@/components/job-single-pages/shared-components/CompanyInfo";
import MapJobFinder from "@/components/job-listing-pages/components/MapJobFinder";
import SocialTwo from "@/components/job-single-pages/social/SocialTwo";
import JobDetailsDescriptions from "@/components/job-single-pages/shared-components/JobDetailsDescriptions";
import ApplyJobModalContent from "@/components/job-single-pages/shared-components/ApplyJobModalContent";
import Image from "next/image";

// Helper function to fetch job data (used by metadata and page)
async function getJobData(slug, short_id) { // Use slug and short_id parameters
  const cookieStore = cookies(); // Get cookies
  const supabase = createClient(cookieStore); // Initialize server client

  // Log initialization
  console.log(`[Debug getJobData] Initialized Supabase server client for slug: ${slug}, short_id: ${short_id}`);

  const { data: jobData, error } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      description,
      created_at,
      valid_through,
      salary_min,
      salary_max,
      salary_unit,
      salary_currency,
      skills,
      responsibilities,
      requirements,
      employment_type,
      job_location_type,
      applicant_location_requirements,
      street_address,
      address_locality,
      address_region,
      postal_code,
      address_country,
      company:companies ( name, logo_url, website, description ),
      experience_level:experience_levels ( name ),
      status
    `)
    .eq('slug', slug) // Query by slug
    .eq('short_id', short_id) // Query by short_id
    // .eq('status', 'active') // Filter removed - will check status after fetching
    .maybeSingle(); // Use maybeSingle to return null if not found, instead of error

  // Log the raw result BEFORE checking for errors or null data
  console.log(`[Debug getJobData] slug: ${slug}, short_id: ${short_id}, Raw Supabase Result:`, { jobData, error });

  if (error) {
    console.error("Error fetching job data:", error);
    return null;
  }
  // Check if job exists AND if its status is 'active'
  if (!jobData || jobData.status !== 'active') {
     console.log(`[Debug getJobData] Job data not found or not active for slug: ${slug}, short_id: ${short_id}. Status: ${jobData?.status}`);
     return null; // Return null if not found OR not active
  }

  // Return the raw data plus some convenient aliases for display components
  // Raw data fields are needed for JSON-LD generation
  const displaySalary = jobData.salary_min && jobData.salary_max
      ? `$${jobData.salary_min.toLocaleString()} - $${jobData.salary_max.toLocaleString()}${jobData.salary_unit ? ` (${jobData.salary_unit})` : ''}`
      : 'Salary not specified';

  return {
      ...jobData, // Includes all fetched fields like id, title, description, created_at, valid_through, salary_*, address_*, employment_type etc.
      jobTitle: jobData.title, // Alias for display
      companyName: jobData.company?.name, // Alias for display
      companyLogo: jobData.company?.logo_url, // Alias for display
      experienceLevelName: jobData.experience_level?.name, // Alias for display
      displaySalary: displaySalary, // Formatted salary string for display
      postedDate: new Date(jobData.created_at).toLocaleDateString(), // Formatted date for display
      jobSkills: jobData.skills || [], // Alias for display
      // Note: jobTypeName is removed as we now use the employment_type array
  };
}


// Function to generate dynamic metadata
export async function generateMetadata({ params }) {
  // Extract slug directly from params
  const { slug, short_id } = params; // Use params.slug and params.short_id

  if (!slug || !short_id) {
      // Handle case where slug or short_id is missing
      console.error("Metadata: slug or short_id missing from params", params);
      return { title: "Invalid Job URL", description: "The job URL is not valid." };
  }
  // 'slug' is also available via params.slug if needed for metadata

  const job = await getJobData(slug, short_id); // Fetch data using slug and short_id

  if (!job) {
    return {
      title: "Job Not Found | My ABA Jobs",
      description: "The requested job could not be found on My ABA Jobs.",
    };
  }

  // Construct dynamic title and description
  const title = `${job.jobTitle} at ${job.companyName || 'Company'} | My ABA Jobs`;
  // Use new address fields for description if available, otherwise fallback
  const locationString = job.address_locality ? `${job.address_locality}, ${job.address_region || job.address_country}` : 'N/A';
  const description = `Apply for the ${job.jobTitle} position at ${job.companyName || 'Company'} located in ${locationString}. Find more ABA jobs on My ABA Jobs.`;

  return {
    title: title,
    description: description,
  };
}


const JobSingleDynamicV1 = async ({ params }) => {
  // Extract slug directly from params
  const { slug, short_id } = params; // Use params.slug and params.short_id

  if (!slug || !short_id) {
      // Handle case where slug or short_id is missing
      console.error("Page: slug or short_id missing from params", params);
      notFound();
  }
  // 'slug' is also available via params.slug if needed by the page component

  const job = await getJobData(slug, short_id); // Fetch data using slug and short_id

  // If job not found, render the 404 page
  if (!job) {
    notFound();
  }

  // --- Prepare JSON-LD Data ---
  const jobPostingJSONLD = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description, // Ensure this contains valid HTML as required by Google
    "identifier": {
      "@type": "PropertyValue",
      "name": job.company?.name || "My ABA Jobs", // Use company name or site name
      "value": job.id // Use job ID as unique identifier
    },
    "datePosted": job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : undefined, // Format YYYY-MM-DD
    "validThrough": job.valid_through ? new Date(job.valid_through).toISOString() : undefined, // Full ISO 8601 format
    "employmentType": job.employment_type && job.employment_type.length > 0 ? job.employment_type : undefined, // Pass array directly
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company?.name,
      "sameAs": job.company?.website || undefined, // Use company website if available
      "logo": job.company?.logo_url || undefined // Use company logo if available
    },
    // --- Location Logic ---
    // Include jobLocation only if address_country is present and it's NOT remote-only
    ...(job.address_country && job.job_location_type !== 'TELECOMMUTE' ? {
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": job.street_address || undefined,
          "addressLocality": job.address_locality || undefined,
          "addressRegion": job.address_region || undefined,
          "postalCode": job.postal_code || undefined,
          "addressCountry": job.address_country // Required
        }
      }
    } : {}),
    // --- Remote Work Logic ---
    ...(job.job_location_type === 'TELECOMMUTE' ? {
      "jobLocationType": "TELECOMMUTE",
      // Pass applicant_location_requirements directly if it's valid JSON from DB
      "applicantLocationRequirements": job.applicant_location_requirements || undefined
    } : {}),
    // --- Salary Logic ---
    ...(job.salary_min && job.salary_max && job.salary_unit && job.salary_currency ? {
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": job.salary_currency, // e.g., "USD"
        "value": {
          "@type": "QuantitativeValue",
          "minValue": job.salary_min,
          "maxValue": job.salary_max,
          "unitText": job.salary_unit // e.g., "YEAR", "HOUR" (ensure matches Google's allowed values)
        }
      }
    } : {})
    // TODO: Add other recommended fields like experienceRequirements, educationRequirements if data is available
  };


  return (
    <>
      {/* Inject JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJSONLD) }}
      />
      {/* <!-- Header Span --> */}
      <span className="header-span"></span>

      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader />
      {/* <!--End Main Header --> */}

      <MobileMenu />
      {/* End MobileMenu */}

      {/* <!-- Job Detail Section --> */}
      <section className="job-detail-section">
        <div className="upper-box">
          <div className="auto-container">
            <div className="job-block-seven">
              <div className="inner-box">
                <div className="content">
                  <span className="company-logo">
                    <Image
                      width={100}
                      height={98}
                      src={job.companyLogo || "/images/logo.svg"} // Use fetched data with correct fallback
                      alt={`${job.companyName || 'Company'} logo`}
                    />
                  </span>
                  <h4>{job.jobTitle}</h4>

                  <ul className="job-info">
                    {job.companyName && (
                        <li>
                            <span className="icon flaticon-briefcase"></span>
                            {job.companyName}
                        </li>
                    )}
                    {/* Display structured location */}
                    {(job.address_locality || job.address_region || job.address_country) && (
                        <li>
                            <span className="icon flaticon-map-locator"></span>
                            {`${job.address_locality || ''}${job.address_locality && (job.address_region || job.address_country) ? ', ' : ''}${job.address_region || ''}${(job.address_locality || job.address_region) && job.address_country ? ' ' : ''}${job.address_country || ''}`}
                        </li>
                    )}
                    {job.postedDate && (
                        <li>
                            <span className="icon flaticon-clock-3"></span>{" "}
                            {job.postedDate}
                        </li>
                    )}
                    {/* Use displaySalary which includes unit */}
                    {job.displaySalary && job.displaySalary !== 'Salary not specified' && (
                         <li>
                             <span className="icon flaticon-money"></span>{" "}
                             {job.displaySalary}
                         </li>
                     )}
                  </ul>
                  {/* End .job-info */}

                  {/* Display employment types from the array */}
                  {job.employment_type && job.employment_type.length > 0 && (
                    <ul className="job-other-info">
                       {job.employment_type.map((type) => (
                           <li key={type} className="time">{type.replace(/_/g, ' ')}</li> // Format display
                       ))}
                    </ul>
                   )}
                  {/* End .job-other-info */}
                </div>
                {/* End .content */}

                <div className="btn-box">
                  {/* TODO: Implement Apply Job functionality */}
                  <a
                    href="#"
                    className="theme-btn btn-style-one"
                    // data-bs-toggle="modal" // Re-enable when modal/apply logic is ready
                    // data-bs-target="#applyJobModal"
                  >
                    Apply For Job
                  </a>
                   {/* TODO: Implement Bookmark functionality */}
                  <button className="bookmark-btn">
                    <i className="flaticon-bookmark"></i>
                  </button>
                </div>
                {/* End apply for job btn */}

                {/* <!-- Modal --> */}
                {/* <div
                  className="modal fade"
                  id="applyJobModal"
                  tabIndex="-1"
                  aria-hidden="true"
                >
                  <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="apply-modal-content modal-content">
                      <div className="text-center">
                        <h3 className="title">Apply for this job</h3>
                        <button
                          type="button"
                          className="closed-modal"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      <ApplyJobModalContent />
                    </div>
                  </div>
                </div> */}
                {/* End .modal */}
              </div>
            </div>
            {/* <!-- Job Block --> */}
          </div>
        </div>
        {/* <!-- Upper Box --> */}

        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                {/* Pass fetched job data to child components */}
                <JobDetailsDescriptions job={job} />
                {/* End jobdetails content */}

                <div className="other-options">
                  <div className="social-share">
                    <h5>Share this job</h5>
                    <SocialTwo />
                  </div>
                </div>
                {/* <!-- Other Options --> */}

                <div className="related-jobs">
                  <div className="title-box">
                    <h3>Related Jobs</h3>
                    {/* TODO: Fetch related jobs dynamically */}
                    {/* <div className="text">
                      2020 jobs live - 293 added today.
                    </div> */}
                  </div>
                  {/* End title box */}

                  {/* Pass job category/location/etc. to RelatedJobs if needed */}
                  <RelatedJobs />
                </div>
                {/* <!-- Related Jobs --> */}
              </div>
              {/* End .content-column */}

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget">
                    {/* <!-- Job Overview --> */}
                    <h4 className="widget-title">Job Overview</h4>
                    <JobOverView job={job} />

                    {/* <!-- Map Widget --> */}
                    {/* Use structured address for map if available */}
                    {(job.address_locality || job.address_country) && (
                        <>
                            <h4 className="widget-title mt-5">Job Location</h4>
                            <div className="widget-content">
                                <div className="map-outer">
                                    <div style={{ height: "300px", width: "100%" }}>
                                        {/* Pass structured address components or a combined string */}
                                        <MapJobFinder
                                            location={`${job.street_address || ''} ${job.address_locality || ''} ${job.address_region || ''} ${job.postal_code || ''} ${job.address_country || ''}`.trim()}
                                            // Alternatively, pass individual components if MapJobFinder supports it
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {/* <!--  Map Widget --> */}

                    {job.jobSkills && job.jobSkills.length > 0 && (
                        <>
                            <h4 className="widget-title">Job Skills</h4>
                            <div className="widget-content">
                                <JobSkills job={job} />
                            </div>
                        </>
                    )}
                    {/* <!-- Job Skills --> */}
                  </div>
                  {/* End .sidebar-widget */}

                  {job.company && ( // Only show company info if available
                    <div className="sidebar-widget company-widget">
                      <div className="widget-content">
                        <div className="company-title">
                          <div className="company-logo">
                            <Image
                              width={54}
                              height={53}
                              src={job.companyLogo || "/images/logo.svg"} // Use correct fallback
                              alt="Company Logo"
                            />
                          </div>
                          <h5 className="company-name">{job.companyName}</h5>
                          {/* TODO: Link to company profile page */}
                          {/* <a href="#" className="profile-link">
                            View company profile
                          </a> */}
                        </div>
                        {/* End company title */}

                        <CompnayInfo company={job.company} />

                        {job.company.website && (
                            <div className="btn-box">
                                <a
                                href={job.company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="theme-btn btn-style-three"
                                >
                                {job.company.website}
                                </a>
                            </div>
                        )}
                        {/* End btn-box */}
                      </div>
                    </div>
                  )}
                  {/* End .company-widget */}
                </aside>
                {/* End .sidebar */}
              </div>
              {/* End .sidebar-column */}
            </div>
          </div>
        </div>
        {/* <!-- job-detail-outer--> */}
      </section>
      {/* <!-- End Job Detail Section --> */}

      <FooterDefault footerStyle="alternate5" />
      {/* <!-- End Main Footer --> */}
    </>
  );
};

// Keep dynamic import but remove ssr:false if data fetching is server-side
// export default dynamic(() => Promise.resolve(JobSingleDynamicV1), {
//   ssr: false,
// });
export default JobSingleDynamicV1; // Use standard export for Server Component
