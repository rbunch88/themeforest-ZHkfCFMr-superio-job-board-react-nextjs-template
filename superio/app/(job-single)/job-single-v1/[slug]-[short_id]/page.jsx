import dynamic from "next/dynamic";
// import jobs from "@/data/job-featured"; // Removed static import
import { notFound } from 'next/navigation'; // Import notFound
import { supabase } from "@/utils/supabaseClient"; // Import supabase client (adjust path if needed)

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
async function getJobData(short_id) { // Updated function signature
  if (!supabase) {
    console.error("Supabase client not available for fetching job data.");
    return null;
  }
  const { data: jobData, error } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      description,
      location,
      created_at,
      salary_min,
      salary_max,
      salary_unit,
      skills,
      responsibilities,
      requirements,
      company:companies ( name, logo_url, website, description ),
      job_type:job_types ( name ),
      experience_level:experience_levels ( name )
    `)
    .eq('id', id)
    .eq('short_id', short_id) // Query by short_id instead of id
    .eq('status', 'active') // Ensure only active jobs are shown
    .maybeSingle(); // Use maybeSingle to return null if not found, instead of error

  if (error) {
    console.error("Error fetching job data:", error);
    return null;
  }
  if (!jobData) {
     return null; // Explicitly return null if not found
  }

  // Format data slightly for easier use in components
  return {
      ...jobData,
      jobTitle: jobData.title, // Add alias for consistency with old static data structure if needed
      companyName: jobData.company?.name,
      companyLogo: jobData.company?.logo_url,
      jobTypeName: jobData.job_type?.name,
      experienceLevelName: jobData.experience_level?.name,
      // Combine salary info
      salary: jobData.salary_min && jobData.salary_max
          ? `$${jobData.salary_min} - $${jobData.salary_max}${jobData.salary_unit ? ` (${jobData.salary_unit})` : ''}`
          : 'Not specified',
      // Format date
      postedDate: new Date(jobData.created_at).toLocaleDateString(),
      // Map skills array if needed by JobSkills component
      jobSkills: jobData.skills || [],
  };
}


// Function to generate dynamic metadata
export async function generateMetadata({ params }) {
  // Extract short_id from the combined parameter
  const combinedParam = params['slug]-[short_id'];
  const short_id = combinedParam?.split('-').pop();

  if (!short_id) {
      // Handle case where parameter is invalid or missing short_id
      return { title: "Invalid Job URL", description: "The job URL is not valid." };
  }

  const job = await getJobData(short_id);

  if (!job) {
    return {
      title: "Job Not Found | My ABA Jobs",
      description: "The requested job could not be found on My ABA Jobs.",
    };
  }

  // Construct dynamic title and description
  const title = `${job.jobTitle} at ${job.companyName || 'Company'} | My ABA Jobs`;
  const description = `Apply for the ${job.jobTitle} position at ${job.companyName || 'Company'} located in ${job.location || 'N/A'}. Find more ABA jobs on My ABA Jobs.`;

  return {
    title: title,
    description: description,
  };
}


const JobSingleDynamicV1 = async ({ params }) => {
  // Extract short_id from the combined parameter
  const combinedParam = params['slug]-[short_id'];
  const short_id = combinedParam?.split('-').pop();

  if (!short_id) {
      // Handle case where parameter is invalid or missing short_id
      // This might be redundant if generateMetadata handles it, but good for safety
      notFound();
  }

  const job = await getJobData(short_id);

  // If job not found, render the 404 page
  if (!job) {
    notFound();
  }

  return (
    <>
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
                      src={job.companyLogo || "/images/resource/default-logo.png"} // Use fetched data
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
                    {job.location && (
                        <li>
                            <span className="icon flaticon-map-locator"></span>
                            {job.location}
                        </li>
                    )}
                    {job.postedDate && (
                        <li>
                            <span className="icon flaticon-clock-3"></span>{" "}
                            {job.postedDate}
                        </li>
                    )}
                    {job.salary && job.salary !== 'Not specified' && (
                        <li>
                            <span className="icon flaticon-money"></span>{" "}
                            {job.salary}
                        </li>
                    )}
                  </ul>
                  {/* End .job-info */}

                  {job.jobTypeName && (
                    <ul className="job-other-info">
                       {/* Assuming jobTypeName holds a single string like "Full Time" */}
                       {/* Adjust styling/class based on actual needs */}
                       <li className="time">{job.jobTypeName}</li>
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
                    {job.location && ( // Only show map if location exists
                        <>
                            <h4 className="widget-title mt-5">Job Location</h4>
                            <div className="widget-content">
                            <div className="map-outer">
                                <div style={{ height: "300px", width: "100%" }}>
                                {/* TODO: Pass location to MapJobFinder */}
                                <MapJobFinder location={job.location} />
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
                              src={job.companyLogo || "/images/resource/default-logo.png"}
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
