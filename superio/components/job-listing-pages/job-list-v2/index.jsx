'use client' // Make it a client component to use hooks

import { useEffect } from "react"; // Import useEffect
import { useDispatch } from "react-redux"; // Import useDispatch
import { supabase } from "../../../utils/supabaseClient"; // Import supabase client
import { setJobTypes, setExperienceLevels, setTags } from "../../../features/job/jobSlice"; // Import new actions

import FooterDefault from "../../../components/footer/common-footer";
import LoginPopup from "../../common/form/login/LoginPopup";
import DefaulHeader2 from "../../header/DefaulHeader2";
import MobileMenu from "../../header/MobileMenu";
import FilterJobsBox from "./FilterJobsBox";
import JobSearchForm from "./JobSearchForm";
import FilterSidebar from "./FilterSidebar";

const Index = () => { // Renamed component to avoid conflict with 'index' import if any
  const dispatch = useDispatch();

  // Fetch filter options data on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (!supabase) {
        console.error('Supabase client not available');
        return;
      }

      try {
        // Fetch Job Types
        const { data: jobTypesData, error: jobTypesError } = await supabase
          .from('job_types')
          .select('id, name')
          .order('name', { ascending: true });
        if (jobTypesError) throw jobTypesError;
        dispatch(setJobTypes(jobTypesData || []));

        // Fetch Experience Levels
        const { data: experienceLevelsData, error: experienceLevelsError } = await supabase
          .from('experience_levels')
          .select('id, name')
          .order('name', { ascending: true }); // Consider a more logical order if needed
        if (experienceLevelsError) throw experienceLevelsError;
        dispatch(setExperienceLevels(experienceLevelsData || []));

        // Fetch distinct Tags/Skills from the jobs table (adjust if a dedicated tags table exists)
        // This is less efficient than a dedicated table but works for now.
        // Consider creating a database function/view for better performance if needed.
        const { data: skillsData, error: skillsError } = await supabase
            .rpc('get_distinct_skills'); // Assuming an RPC function 'get_distinct_skills' exists

        if (skillsError) {
             console.warn("Could not fetch distinct skills via RPC, trying direct query (less efficient)...");
             // Fallback: Fetch all skills (can be large and slow)
             const { data: allSkillsData, error: allSkillsError } = await supabase
                .from('jobs')
                .select('skills');
             if (allSkillsError) throw allSkillsError;

             // Process to get unique skills
             const allSkills = allSkillsData.flatMap(job => job.skills || []);
             const uniqueSkills = [...new Set(allSkills)].filter(skill => skill); // Remove null/empty
             // Format for the state: { id, name, value }
             const formattedTags = uniqueSkills.map((skill, index) => ({
                 id: `tag-${index}`, // Generate a simple ID
                 name: skill,
                 value: skill,
             }));
             dispatch(setTags(formattedTags || []));

        } else {
             // Format data from RPC if needed (assuming RPC returns array of strings)
             const formattedTags = skillsData.map((skill, index) => ({
                 id: `tag-${index}`, // Generate a simple ID
                 name: skill,
                 value: skill,
             }));
            dispatch(setTags(formattedTags || []));
        }


      } catch (error) {
        console.error("Error fetching filter options:", error);
        // Optionally dispatch error actions to update UI
      }
    };

    fetchFilterOptions();
  }, [dispatch]); // Dependency array includes dispatch

  return (
    <>
      {/* <!-- Header Span --> */}
      <span className="header-span"></span>

      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader2 />
      {/* End Header with upload cv btn */}

      <MobileMenu />
      {/* End MobileMenu */}

      <section className="page-title style-two">
        <div className="auto-container">
          <JobSearchForm />
          {/* <!-- Job Search Form --> */}
        </div>
      </section>
      {/* <!--End Page Title--> */}

      <section className="ls-section">
        <div className="auto-container">
          <div className="row">
            <div
              className="offcanvas offcanvas-start"
              tabIndex="-1"
              id="filter-sidebar"
              aria-labelledby="offcanvasLabel"
            >
              <div className="filters-column hide-left">
                <FilterSidebar />
              </div>
            </div>
            {/* End filter column for tablet and mobile devices */}

            <div className="filters-column hidden-1023 col-lg-4 col-md-12 col-sm-12">
              <FilterSidebar />
            </div>
            {/* <!-- End Filters Column --> */}

            <div className="content-column col-lg-8 col-md-12 col-sm-12">
              <div className="ls-outer">
                <FilterJobsBox />
                {/* <!-- ls Switcher --> */}
              </div>
            </div>
            {/* <!-- End Content Column --> */}
          </div>
          {/* End row */}
        </div>
        {/* End container */}
      </section>
      {/* <!--End Listing Page Section --> */}

      <FooterDefault footerStyle="alternate5" />
      {/* <!-- End Main Footer --> */}
    </>
  );
};

export default Index; // Export the renamed component
