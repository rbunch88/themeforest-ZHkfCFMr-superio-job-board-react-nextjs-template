import dynamic from "next/dynamic";
import { notFound } from 'next/navigation';
import { supabase } from "@/utils/supabaseClient"; // Adjust path if needed

// import employersInfo from "@/data/topCompany"; // Removed static import
import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader from "@/components/header/DefaulHeader";
import MobileMenu from "@/components/header/MobileMenu";
import JobDetailsDescriptions from "@/components/employer-single-pages/shared-components/JobDetailsDescriptions"; // Displays company description
import RelatedJobs from "@/components/employer-single-pages/related-jobs/RelatedJobs"; // Displays jobs by this company
import MapJobFinder from "@/components/job-listing-pages/components/MapJobFinder"; // Reusable map
import Social from "@/components/employer-single-pages/social/Social"; // Static social links for now
import PrivateMessageBox from "@/components/employer-single-pages/shared-components/PrivateMessageBox"; // Static form for now
import Image from "next/image";

// Helper function to fetch employer data
async function getEmployerData(short_id) { // Updated function signature
  if (!supabase) {
    console.error("Supabase client not available for fetching employer data.");
    return null;
  }
  // Fetch company and count of their active jobs
  const { data: employerData, error } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      description,
      logo_url,
      website,
      headquarters_location,
      industry,
      size,
      founded_year,
      jobs!inner(count)
    `)
    .eq('id', id)
    .eq('short_id', short_id) // Query by short_id instead of id
    .eq('jobs.status', 'active') // Count only active jobs
    .maybeSingle();

  if (error) {
    console.error("Error fetching employer data:", error);
    return null;
  }
   if (!employerData) {
     return null; // Explicitly return null if not found
  }

  // Format data
  return {
      ...employerData,
      openJobsCount: employerData.jobs[0]?.count || 0,
      // Add aliases if needed by child components expecting different prop names
      img: employerData.logo_url, // Alias for compatibility if needed
      location: employerData.headquarters_location, // Alias
      // Add dummy phone/email if needed by static components, or update components
      phone: "N/A",
      email: "N/A",
  };
}

// Function to generate dynamic metadata
export async function generateMetadata({ params }) {
  // Extract short_id from the combined parameter
  const combinedParam = params['slug]-[short_id'];
  const short_id = combinedParam?.split('-').pop();

  if (!short_id) {
      return { title: "Invalid Employer URL", description: "The employer URL is not valid." };
  }

  const employer = await getEmployerData(short_id);

  if (!employer) {
    return {
      title: "Employer Not Found | My ABA Jobs",
      description: "The requested employer profile could not be found on My ABA Jobs.",
    };
  }

  // Construct dynamic title and description
  const title = `${employer.name || 'Employer'} | Employer Profile | My ABA Jobs`;
  const description = `Learn more about ${employer.name || 'this employer'}, hiring on My ABA Jobs. View open positions and company details.`;

  return {
    title: title,
    description: description,
  };
}

const EmployersSingleV2 = async ({ params }) => {
  // Extract short_id from the combined parameter
  const combinedParam = params['slug]-[short_id'];
  const short_id = combinedParam?.split('-').pop();

  if (!short_id) {
      notFound(); // Handle invalid URL
  }

  const employer = await getEmployerData(short_id);

  // If employer not found, render the 404 page
  if (!employer) {
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
        {/* <!-- job-detail-outer--> */}
        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                {/* Pass employer description to JobDetailsDescriptions */}
                <JobDetailsDescriptions description={employer.description} />
                {/* End job-detail */}

                {/* <!-- Related Jobs --> */}
                <div className="related-jobs">
                  <div className="title-box">
                    <h3>{employer.openJobsCount || '0'} Open Position{employer.openJobsCount !== 1 ? 's' : ''}</h3>
                    {/* Optional: Add text like "at [Company Name]" */}
                  </div>
                  {/* End .title-box */}

                  {/* Pass employer ID to fetch related jobs */}
                  <RelatedJobs employerId={employer.id} />
                  {/* End RelatedJobs */}
                </div>
                {/* <!-- Related Jobs --> */}
              </div>
              {/* End .content-column */}

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  {/* TODO: Implement Private Message functionality */}
                  {/* <div className="btn-box">
                    <button
                      className="theme-btn btn-style-one"
                      data-bs-toggle="modal"
                      data-bs-target="#privateMessage"
                    >
                      Private Message
                    </button>
                    <button className="bookmark-btn">
                      <i className="flaticon-bookmark"></i>
                    </button>
                  </div> */}
                  {/* End btn-box */}

                  {/* <!-- Modal --> */}
                  {/* <div
                    className="modal fade"
                    id="privateMessage"
                    tabIndex="-1"
                    aria-hidden="true"
                  >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                      <div className="apply-modal-content modal-content">
                        <div className="text-center">
                          <h3 className="title">
                            Send message to {employer.name}
                          </h3>
                          <button
                            type="button"
                            className="closed-modal"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          ></button>
                        </div>
                        <PrivateMessageBox />
                      </div>
                    </div>
                  </div> */}
                  {/* End .modal */}

                  <div className="sidebar-widget company-widget">
                    <div className="widget-content">
                      <div className="company-title">
                        <span className="company-logo">
                          <Image
                            width={60}
                            height={60}
                            src={employer.img || "/images/resource/default-logo.png"} // Use fetched logo
                            alt={`${employer.name} logo`}
                          />
                        </span>
                        <h4 className="mb-1">{employer.name}</h4>
                        <a href="#related-jobs-section" className="company-link"> {/* Link to related jobs section */}
                          Open Jobs – {employer.openJobsCount}
                        </a>
                      </div>
                      {/* End company-title */}

                      {/*  compnay-info */}
                      <ul className="company-info">
                        {employer.industry && (
                            <li>
                                Primary industry: <span>{employer.industry}</span>
                            </li>
                        )}
                        {employer.size && (
                            <li>
                                Company size: <span>{employer.size}</span>
                            </li>
                        )}
                        {employer.founded_year && (
                            <li>
                                Founded in: <span>{employer.founded_year}</span>
                            </li>
                        )}
                        {/* Add Phone/Email if available in schema */}
                        {/* <li> Phone: <span>{employer.phone}</span> </li> */}
                        {/* <li> Email: <span>{employer.email}</span> </li> */}
                        {employer.location && (
                            <li>
                                Location: <span>{employer.location}</span>
                            </li>
                        )}
                        <li>
                          Social media:
                          <Social /> {/* Static for now */}
                        </li>
                      </ul>
                      {/* End compnay-info */}

                      {employer.website && (
                        <div className="btn-box">
                            <a
                            href={employer.website.startsWith('http') ? employer.website : `https://${employer.website}`} // Ensure protocol
                            target="_blank"
                            rel="noopener noreferrer"
                            className="theme-btn btn-style-three"
                            >
                            {employer.website}
                            </a>
                        </div>
                      )}
                      {/* btn-box */}
                    </div>
                  </div>
                  {/* End company-widget */}

                  {employer.location && (
                    <div className="sidebar-widget">
                      {/* <!-- Map Widget --> */}
                      <h4 className="widget-title">Location</h4>
                      <div className="widget-content">
                        <div style={{ height: "300px", width: "100%" }}>
                          <MapJobFinder location={employer.location} />
                        </div>
                      </div>
                      {/* <!--  Map Widget --> */}
                    </div>
                  )}
                  {/* End sidebar-widget */}
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

// Use standard export for Server Component
export default EmployersSingleV2;
