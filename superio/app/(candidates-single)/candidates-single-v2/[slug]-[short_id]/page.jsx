import dynamic from "next/dynamic";
import { notFound } from 'next/navigation';
import { supabase } from "@/utils/supabaseClient"; // Adjust path if needed

// import candidates from "@/data/candidates"; // Removed static import
// import candidateResume from "@/data/candidateResume"; // Removed static import

import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader from "@/components/header/DefaulHeader";
import MobileMenu from "@/components/header/MobileMenu";
import Contact from "@/components/candidates-single-pages/shared-components/Contact"; // Keep for sidebar
import GalleryBox from "@/components/candidates-single-pages/shared-components/GalleryBox"; // Keep for now, might need dynamic data later
import Social from "@/components/candidates-single-pages/social/Social"; // Keep static social links
import JobSkills from "@/components/candidates-single-pages/shared-components/JobSkills"; // Will pass skills prop
import AboutVideo from "@/components/candidates-single-pages/shared-components/AboutVideo"; // Keep static video for now
import Image from "next/image";

// Helper function to fetch candidate data
async function getCandidateData(short_id) { // Updated function signature
  if (!supabase) {
    console.error("Supabase client not available for fetching candidate data.");
    return null;
  }
  // Fetch profile and candidate details, joining experience level
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      avatar_url,
      created_at,
      candidate:candidates!inner (
        profile_id,
        designation,
        location,
        hourly_rate,
        skills,
        bio,
        resume_url,
        education_history,
        work_history,
        experience_level:experience_levels ( name )
      )
    `)
    .eq('id', id)
    .eq('short_id', short_id) // Query by short_id (assuming short_id is on profiles table)
    .eq('role', 'candidate') // Ensure we only fetch candidates
    .maybeSingle();

  if (error) {
    console.error("Error fetching candidate data:", error);
    return null;
  }
   if (!profileData) {
     return null; // Explicitly return null if not found
  }

  // Format data slightly for easier use
  return {
      ...profileData,
      name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
      avatar: profileData.avatar_url,
      // Flatten candidate data for easier access if preferred
      ...profileData.candidate,
      experienceLevelName: profileData.candidate?.experience_level?.name,
      memberSince: new Date(profileData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      // Map skills array if needed by JobSkills component
      tags: profileData.candidate?.skills || [],
      // Parse JSONB fields
      educationHistory: profileData.candidate?.education_history || [],
      workHistory: profileData.candidate?.work_history || [],
  };
}


// Function to generate dynamic metadata
export async function generateMetadata({ params }) {
  // Extract short_id from the combined parameter
  const combinedParam = params['slug]-[short_id'];
  const short_id = combinedParam?.split('-').pop();

  if (!short_id) {
      return { title: "Invalid Candidate URL", description: "The candidate URL is not valid." };
  }

  const candidate = await getCandidateData(short_id);

  if (!candidate) {
    return {
      title: "Candidate Not Found | My ABA Jobs",
      description: "The requested candidate profile could not be found on My ABA Jobs.",
    };
  }

  // Construct dynamic title and description
  const title = `${candidate.name || 'Candidate'} | ${candidate.designation || 'ABA Professional'} | My ABA Jobs`;
  const description = `View the profile of ${candidate.name || 'Candidate'}, a ${candidate.designation || 'skilled ABA professional'} based in ${candidate.location || 'N/A'}, on My ABA Jobs.`;

  return {
    title: title,
    description: description,
  };
}

const CandidateSingleDynamicV2 = async ({ params }) => {
  // Extract short_id from the combined parameter
  const combinedParam = params['slug]-[short_id'];
  const short_id = combinedParam?.split('-').pop();

  if (!short_id) {
      notFound(); // Handle invalid URL
  }

  const candidate = await getCandidateData(short_id);

  // If candidate not found, render the 404 page
  if (!candidate) {
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
      <section className="candidate-detail-section">
        <div className="candidate-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="candidate-block-five">
                  <div className="inner-box">
                    <div className="content">
                      <figure className="image">
                        <Image
                          width={100}
                          height={100}
                          src={candidate.avatar || "/images/resource/default-avatar.png"} // Use fetched avatar
                          alt={`${candidate.name} avatar`}
                        />
                      </figure>
                      <h4 className="name">{candidate.name}</h4>

                      <ul className="candidate-info">
                        {candidate.designation && <li className="designation">{candidate.designation}</li>}
                        {candidate.location && (
                            <li>
                                <span className="icon flaticon-map-locator"></span>
                                {candidate.location}
                            </li>
                        )}
                        {candidate.hourlyRate && (
                            <li>
                                <span className="icon flaticon-money"></span> $
                                {candidate.hourlyRate} / hour
                            </li>
                        )}
                        {candidate.memberSince && (
                            <li>
                                <span className="icon flaticon-clock"></span> Member
                                Since {candidate.memberSince}
                            </li>
                        )}
                      </ul>

                      {candidate.tags && candidate.tags.length > 0 && (
                        <ul className="post-tags">
                            {candidate.tags.map((val, i) => (
                            <li key={i}>{val}</li>
                            ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                {/*  <!-- Candidate block Five --> */}

                <div className="job-detail">
                  {/* Display candidate bio */}
                  {candidate.bio ? (
                    <>
                      <h4>About Candidate</h4>
                      <p>{candidate.bio}</p>
                    </>
                  ) : (
                     <p>No bio provided.</p>
                  )}


                  {/* TODO: About Video - needs a video URL field in candidate table */}
                  {/* {candidate.video_url && (
                    <div className="video-outer">
                        <h4>Candidates About</h4>
                        <AboutVideo videoUrl={candidate.video_url} />
                    </div>
                  )} */}
                  {/* <!-- About Video Box --> */}

                  {/* <!-- Candidate Resume Start --> */}
                  {/* Education History */}
                  {candidate.educationHistory && candidate.educationHistory.length > 0 && (
                    <div className="resume-outer theme-blue"> {/* Example theme */}
                      <div className="upper-title">
                        <h4>Education</h4>
                      </div>
                      {candidate.educationHistory.map((edu, index) => (
                        <div className="resume-block" key={`edu-${index}`}>
                          <div className="inner">
                            <span className="name">{edu.year_start || ''}{edu.year_end ? ` - ${edu.year_end}` : '- Present'}</span>
                            <div className="title-box">
                              <div className="info-box">
                                <h3>{edu.degree}</h3>
                                <span>{edu.institution}</span>
                              </div>
                            </div>
                            {/* <div className="text">{edu.description || ''}</div> */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Work History */}
                   {candidate.workHistory && candidate.workHistory.length > 0 && (
                    <div className="resume-outer theme-yellow"> {/* Example theme */}
                      <div className="upper-title">
                        <h4>Work Experience</h4>
                      </div>
                      {candidate.workHistory.map((work, index) => (
                        <div className="resume-block" key={`work-${index}`}>
                          <div className="inner">
                            <span className="name">{work.duration || ''}</span>
                            <div className="title-box">
                              <div className="info-box">
                                <h3>{work.title}</h3>
                                <span>{work.company}</span>
                              </div>
                            </div>
                            <div className="text">{work.description || ''}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* <!-- Candidate Resume End --> */}

                  {/* TODO: Portfolio/Gallery - needs data source */}
                  {/* <div className="portfolio-outer">
                    <div className="row">
                      <GalleryBox />
                    </div>
                  </div> */}
                  {/* <!-- Portfolio --> */}
                </div>
                {/* End job-details */}
              </div>
              {/* End .content-column */}

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="btn-box">
                    {/* TODO: Implement Download CV functionality using candidate.resume_url */}
                    {candidate.resume_url ? (
                         <a
                            className="theme-btn btn-style-one"
                            href={candidate.resume_url} // Assuming direct link or needs signed URL
                            target="_blank" // Open in new tab
                            rel="noopener noreferrer"
                            // download // Optional: suggest download
                        >
                            Download CV
                        </a>
                    ) : (
                         <button className="theme-btn btn-style-one" disabled>CV Not Available</button>
                    )}

                    {/* TODO: Implement bookmarking */}
                    {/* <button className="bookmark-btn">
                      <i className="flaticon-bookmark"></i>
                    </button> */}
                  </div>

                  <div className="sidebar-widget">
                    <div className="widget-content">
                      <ul className="job-overview">
                        {candidate.experienceLevelName && (
                            <li>
                                <i className="icon icon-calendar"></i>
                                <h5>Experience:</h5>
                                <span>{candidate.experienceLevelName}</span>
                            </li>
                        )}
                        {/* Age needs calculation or dedicated field */}
                        {/* <li>
                          <i className="icon icon-expiry"></i>
                          <h5>Age:</h5>
                          <span>28-33 Years</span>
                        </li> */}
                        {/* Current/Expected Salary needs dedicated fields */}
                        {/* <li>
                          <i className="icon icon-rate"></i>
                          <h5>Current Salary:</h5>
                          <span>11K - 15K</span>
                        </li>
                        <li>
                          <i className="icon icon-salary"></i>
                          <h5>Expected Salary:</h5>
                          <span>26K - 30K</span>
                        </li> */}
                        {/* Gender needs dedicated field */}
                        {/* <li>
                          <i className="icon icon-user-2"></i>
                          <h5>Gender:</h5>
                          <span>Female</span>
                        </li> */}
                        {/* Language needs dedicated field */}
                        {/* <li>
                          <i className="icon icon-language"></i>
                          <h5>Language:</h5>
                          <span>English, German, Spanish</span>
                        </li> */}
                        {/* Education Level might be derived from educationHistory */}
                        {/* <li>
                          <i className="icon icon-degree"></i>
                          <h5>Education Level:</h5>
                          <span>Master Degree</span>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                  {/* End .sidebar-widget conadidate overview */}

                  <div className="sidebar-widget social-media-widget">
                    <h4 className="widget-title">Social media</h4>
                    <div className="widget-content">
                      <div className="social-links">
                        <Social /> {/* Static for now */}
                      </div>
                    </div>
                  </div>
                  {/* End .sidebar-widget social-media-widget */}

                  {candidate.tags && candidate.tags.length > 0 && (
                    <div className="sidebar-widget">
                        <h4 className="widget-title">Professional Skills</h4>
                        <div className="widget-content">
                        <JobSkills skills={candidate.tags} /> {/* Pass skills */}
                        </div>
                    </div>
                  )}
                  {/* End .sidebar-widget skill widget */}

                  {/* TODO: Implement Contact Form functionality */}
                  {/* <div className="sidebar-widget contact-widget">
                    <h4 className="widget-title">Contact Us</h4>
                    <div className="widget-content">
                      <div className="default-form">
                        <Contact />
                      </div>
                    </div>
                  </div> */}
                  {/* End .sidebar-widget contact-widget */}
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
export default CandidateSingleDynamicV2;
