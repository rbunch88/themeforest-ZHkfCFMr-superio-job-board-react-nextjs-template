'use client'

import { useState, useEffect } from "react";
import { supabase } from "../../../../../utils/supabaseClient"; // Adjust path if needed
import { useRouter } from 'next/navigation';
import Select from "react-select";
import makeAnimated from 'react-select/animated'; // For animated multi-select
// import Map from "../../../Map"; // Assuming Map component needs refactoring or isn't used for submission directly

const animatedComponents = makeAnimated();

const PostBoxForm = () => {
  const router = useRouter();

  // Form Field States
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  // const [email, setEmail] = useState(''); // Likely use logged-in user's email?
  // const [username, setUsername] = useState(''); // Not typically needed for job post
  const [jobTypeId, setJobTypeId] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryUnit, setSalaryUnit] = useState('YEAR'); // Default to yearly
  const [experienceLevelId, setExperienceLevelId] = useState('');
  // const [gender, setGender] = useState(''); // Gender not in schema
  const [industry, setIndustry] = useState(''); // Assuming industry maps to category? Or add category dropdown
  const [categoryId, setCategoryId] = useState(''); // Added for Job Category
  // const [qualification, setQualification] = useState(''); // Qualification not implemented yet
  const [deadlineDate, setDeadlineDate] = useState(''); // valid_through
  const [applicationUrl, setApplicationUrl] = useState(''); // Added for application link
  const [skills, setSkills] = useState([]); // For multi-select skills/tags

  // Location Fields
  const [country, setCountry] = useState(''); // Need dynamic country/city lists or free text?
  const [city, setCity] = useState('');
  const [fullAddress, setFullAddress] = useState(''); // Combined location string for DB
  // const [mapQuery, setMapQuery] = useState(''); // For map search input
  // const [latitude, setLatitude] = useState(''); // Lat/Lng might be complex, store fullAddress for now
  // const [longitude, setLongitude] = useState('');

  // Dropdown Options States
  const [jobTypeOptions, setJobTypeOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [experienceLevelOptions, setExperienceLevelOptions] = useState([]);
  // const [specialismOptions, setSpecialismOptions] = useState([]); // Use skills/tags instead?

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch dropdown options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      if (!supabase) return;
      try {
        // Fetch Job Types
        const { data: jobTypes, error: jtError } = await supabase.from('job_types').select('id, name').order('name');
        if (jtError) throw jtError;
        setJobTypeOptions(jobTypes || []);

        // Fetch Categories
        const { data: categories, error: catError } = await supabase.from('job_categories').select('id, name').order('name');
        if (catError) throw catError;
        setCategoryOptions(categories || []);

        // Fetch Experience Levels
        const { data: expLevels, error: expError } = await supabase.from('experience_levels').select('id, name').order('id'); // Or logical order
        if (expError) throw expError;
        setExperienceLevelOptions(expLevels || []);

        // TODO: Fetch distinct skills/tags if needed for suggestions, or allow free input

      } catch (err) {
        console.error("Error fetching dropdown options:", err);
        setError("Failed to load form options.");
      }
    };
    fetchOptions();
  }, [supabase]);

  // Combine address fields into fullAddress
  useEffect(() => {
    // Basic combination, might need refinement based on desired format
    const parts = [fullAddress.split(', ')[0], city, country].filter(Boolean); // Keep existing address part if manually typed
    setFullAddress(parts.join(', '));
  }, [city, country]); // Update when city or country changes


  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    if (!supabase) {
        setError("Database connection not available.");
        setLoading(false);
        return;
    }

    // 1. Get User and Company ID
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
        setError("You must be logged in to post a job.");
        setLoading(false);
        return;
    }
    const userId = session.user.id;

    const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (companyError || !companyData) {
        setError("Could not find your company profile. Please ensure it's set up.");
        setLoading(false);
        return;
    }
    const companyId = companyData.id;

    // 2. Construct Job Data object matching DB schema
    const jobData = {
      title: jobTitle,
      description: jobDescription,
      company_id: companyId,
      posted_by_user_id: userId,
      job_type_id: jobTypeId || null,
      category_id: categoryId || null,
      experience_level_id: experienceLevelId || null,
      salary_min: salaryMin || null,
      salary_max: salaryMax || null,
      salary_unit: (salaryMin || salaryMax) ? salaryUnit : null, // Only set unit if salary provided
      location: fullAddress || null, // Use combined address
      application_url: applicationUrl || null,
      valid_through: deadlineDate || null, // Ensure date format is compatible or null
      skills: skills.map(skill => skill.value) || null, // Extract values from react-select state
      status: 'active', // Default to active? Or 'pending'?
      // Add other fields like responsibilities, requirements if form includes them
    };

    // 3. Insert into Supabase
    try {
        const { data, error: insertError } = await supabase
            .from('jobs')
            .insert([jobData])
            .select(); // Optionally select the inserted data

        if (insertError) {
            throw insertError;
        }

        setSuccessMessage("Job posted successfully!");
        // Optionally clear form or redirect
        // router.push('/employers-dashboard/manage-jobs'); // Example redirect

        // Reset form fields (optional)
        setJobTitle('');
        setJobDescription('');
        setJobTypeId('');
        setSalaryMin('');
        setSalaryMax('');
        setSalaryUnit('YEAR');
        setExperienceLevelId('');
        setCategoryId('');
        setDeadlineDate('');
        setApplicationUrl('');
        setSkills([]);
        setCountry('');
        setCity('');
        setFullAddress('');


    } catch (err) {
        console.error("Error posting job:", err);
        setError(`Failed to post job: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };


  return (
    <form className="default-form" onSubmit={handleSubmit}>
      <div className="row">
        {/* <!-- Input --> */}
        <div className="form-group col-lg-12 col-md-12">
          <label>Job Title *</label>
          <input
            type="text"
            name="jobTitle"
            placeholder="Title"
            required
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        {/* <!-- About Company --> */}
        <div className="form-group col-lg-12 col-md-12">
          <label>Job Description *</label>
          <textarea
            placeholder="Job description..."
            required
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Job Type */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Job Type *</label>
          <select
            className="chosen-single form-select"
            required
            value={jobTypeId}
            onChange={(e) => setJobTypeId(e.target.value)}
          >
            <option value="">Select Job Type</option>
            {jobTypeOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>

         {/* Category */}
         <div className="form-group col-lg-6 col-md-12">
          <label>Job Category *</label>
          <select
            className="chosen-single form-select"
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select Category</option>
             {categoryOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>

        {/* Experience Level */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Experience Level *</label>
          <select
            className="chosen-single form-select"
            required
            value={experienceLevelId}
            onChange={(e) => setExperienceLevelId(e.target.value)}
          >
            <option value="">Select Experience Level</option>
             {experienceLevelOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>

        {/* Skills / Specialisms */}
        <div className="form-group col-lg-6 col-md-12">
           <label>Skills (Optional)</label>
           <Select
            isMulti
            name="skills"
            options={[]} // TODO: Populate with suggestions or allow creation
            components={animatedComponents}
            isCreatable={true} // Allow users to create new skills/tags
            placeholder="e.g. Data Analysis, Parent Training"
            value={skills}
            onChange={setSkills} // react-select handles the array state
            className="basic-multi-select"
            classNamePrefix="select"
           />
         </div>


        {/* Salary */}
        <div className="form-group col-lg-4 col-md-12">
          <label>Salary Minimum (Optional)</label>
           <input
            type="number"
            name="salaryMin"
            placeholder="e.g., 60000"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
          />
        </div>
         <div className="form-group col-lg-4 col-md-12">
          <label>Salary Maximum (Optional)</label>
           <input
            type="number"
            name="salaryMax"
            placeholder="e.g., 80000"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
          />
        </div>
         <div className="form-group col-lg-4 col-md-12">
          <label>Salary Rate</label>
          <select
            className="chosen-single form-select"
            value={salaryUnit}
            onChange={(e) => setSalaryUnit(e.target.value)}
            disabled={!salaryMin && !salaryMax} // Disable if no salary entered
          >
            <option value="YEAR">Yearly</option>
            <option value="MONTH">Monthly</option>
            <option value="HOUR">Hourly</option>
          </select>
        </div>


        {/* Application Deadline */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Application Deadline Date (Optional)</label>
          <input
            type="date" // Use date input type
            name="deadlineDate"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
           />
        </div>

         {/* Application URL */}
        <div className="form-group col-lg-6 col-md-12">
          <label>External Apply Link (Optional)</label>
          <input
            type="url"
            name="applicationUrl"
            placeholder="https://..."
            value={applicationUrl}
            onChange={(e) => setApplicationUrl(e.target.value)}
          />
        </div>


        {/* Location Fields */}
        {/* TODO: Consider using a dedicated location component or library */}
        <div className="form-group col-lg-12 col-md-12">
          <label>Full Address / Location Description *</label>
          <input
            type="text"
            name="fullAddress"
            placeholder="e.g., 123 Main St, Anytown, CA 90210 or 'Remote'"
            required
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
          />
        </div>

        {/* Map Section - Keep static or implement dynamic search later */}
        {/* <div className="form-group col-lg-12 col-md-12">
          <label>Find On Map (Optional)</label>
          <input type="text" name="mapQuery" placeholder="Search location..." />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <button type="button" className="theme-btn btn-style-three">Search Location</button>
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <div className="map-outer">
            <div style={{ height: "420px", width: "100%" }}>
              <Map />
            </div>
          </div>
        </div> */}

        {/* <!-- Input --> */}
        <div className="form-group col-lg-12 col-md-12 text-right">
           {error && <div className="text-danger mb-3">{error}</div>}
           {successMessage && <div className="text-success mb-3">{successMessage}</div>}
          <button className="theme-btn btn-style-one" type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PostBoxForm;
