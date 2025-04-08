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
  // Removed jobTypeId, replaced with employmentType
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryUnit, setSalaryUnit] = useState('YEAR'); // Default to yearly
  const [salaryCurrency, setSalaryCurrency] = useState('USD'); // Added currency, default USD
  const [experienceLevelId, setExperienceLevelId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(''); // valid_through
  // applicationUrl state is declared later, removing duplicate here
  const [applicationUrl, setApplicationUrl] = useState('');
  const [skills, setSkills] = useState([]); // For multi-select skills/tags
  const [employmentType, setEmploymentType] = useState([]); // New state for employment type array

  // New Structured Location Fields
  const [streetAddress, setStreetAddress] = useState('');
  const [addressLocality, setAddressLocality] = useState(''); // City
  const [addressRegion, setAddressRegion] = useState(''); // State/Region
  const [postalCode, setPostalCode] = useState('');
  const [addressCountry, setAddressCountry] = useState(''); // Country Code (e.g., US)

  // Remote Work Fields
  const [isRemote, setIsRemote] = useState(false); // Controls visibility of remote options
  const [jobLocationType, setJobLocationType] = useState(''); // Stores 'TELECOMMUTE'
  const [applicantLocationRequirements, setApplicantLocationRequirements] = useState(''); // Textarea for JSON input

  // Dropdown Options States
  // Removed jobTypeOptions
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [experienceLevelOptions, setExperienceLevelOptions] = useState([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch dropdown options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      if (!supabase) return;
      try {
        // Removed Job Type fetch

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

  // Removed useEffect for combining address fields


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
    // 2. Construct Job Data object matching NEW DB schema
    let applicantReqsJson = null;
    if (isRemote && applicantLocationRequirements) {
        try {
            // Attempt to parse JSON, ensure it's an array or object as needed by schema
            const parsed = JSON.parse(applicantLocationRequirements);
            // Basic validation: check if it's an object or array
            if (typeof parsed === 'object' && parsed !== null) {
                 applicantReqsJson = parsed;
            } else {
                throw new Error("Applicant location requirements must be valid JSON (object or array).");
            }
        } catch (jsonError) {
            setError(`Invalid JSON format for Applicant Location Requirements: ${jsonError.message}`);
            setLoading(false);
            return;
        }
    }

    const jobData = {
      title: jobTitle,
      description: jobDescription,
      company_id: companyId,
      posted_by_user_id: userId,
      category_id: categoryId || null,
      experience_level_id: experienceLevelId || null,
      salary_min: salaryMin || null,
      salary_max: salaryMax || null,
      salary_unit: (salaryMin || salaryMax) ? salaryUnit : null,
      salary_currency: (salaryMin || salaryMax) ? salaryCurrency : null, // Add currency
      application_url: applicationUrl || null,
      valid_through: deadlineDate || null,
      skills: skills.map(skill => skill.value) || null,
      status: 'active', // Or 'pending'
      // New Fields
      street_address: streetAddress || null,
      address_locality: addressLocality || null,
      address_region: addressRegion || null,
      postal_code: postalCode || null,
      address_country: addressCountry || null,
      employment_type: employmentType.map(type => type.value) || null, // Extract values from react-select
      job_location_type: isRemote ? 'TELECOMMUTE' : null,
      applicant_location_requirements: applicantReqsJson, // Use parsed JSON
      // Removed 'location' field
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
        // Removed setJobTypeId
        setSalaryMin('');
        setSalaryMax('');
        setSalaryUnit('YEAR');
        setSalaryCurrency('USD'); // Reset currency
        setExperienceLevelId('');
        setCategoryId('');
        setDeadlineDate('');
        setApplicationUrl('');
        setSkills([]);
        setEmploymentType([]); // Reset employment type
        // Reset new address fields
        setStreetAddress('');
        setAddressLocality('');
        setAddressRegion('');
        setPostalCode('');
        setAddressCountry('');
        // Reset remote fields
        setIsRemote(false);
        setJobLocationType('');
        setApplicantLocationRequirements('');


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

        {/* Employment Type (Multi-Select) */}
        <div className="form-group col-lg-6 col-md-12">
           <label>Employment Type(s) *</label>
           <Select
            isMulti
            name="employmentType"
            options={[ // Use Google's exact enum values
                { value: 'FULL_TIME', label: 'Full Time' },
                { value: 'PART_TIME', label: 'Part Time' },
                { value: 'CONTRACTOR', label: 'Contractor' },
                { value: 'TEMPORARY', label: 'Temporary' },
                { value: 'INTERN', label: 'Intern' },
                { value: 'VOLUNTEER', label: 'Volunteer' },
                { value: 'PER_DIEM', label: 'Per Diem' },
                { value: 'OTHER', label: 'Other' },
            ]}
            components={animatedComponents}
            placeholder="Select one or more..."
            value={employmentType}
            onChange={setEmploymentType} // react-select handles the array state
            className="basic-multi-select"
            classNamePrefix="select"
            required // Add required if needed
           />
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


        {/* Salary Section */}
        <div className="form-group col-lg-3 col-md-12">
          <label>Salary Minimum</label>
           <input type="number" name="salaryMin" placeholder="e.g., 60000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
        </div>
         <div className="form-group col-lg-3 col-md-12">
          <label>Salary Maximum</label>
           <input type="number" name="salaryMax" placeholder="e.g., 80000" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
        </div>
         <div className="form-group col-lg-3 col-md-12">
          <label>Salary Rate</label>
          <select className="chosen-single form-select" value={salaryUnit} onChange={(e) => setSalaryUnit(e.target.value)} disabled={!salaryMin && !salaryMax}>
            {/* Use Google's exact enum values */}
            <option value="YEAR">Yearly</option>
            <option value="MONTH">Monthly</option>
            <option value="WEEK">Weekly</option>
            <option value="DAY">Daily</option>
            <option value="HOUR">Hourly</option>
          </select>
        </div>
         <div className="form-group col-lg-3 col-md-12">
          <label>Salary Currency</label>
           <input type="text" name="salaryCurrency" placeholder="e.g., USD" value={salaryCurrency} onChange={(e) => setSalaryCurrency(e.target.value)} disabled={!salaryMin && !salaryMax} maxLength="3" />
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


        {/* --- Location Section --- */}
        <div className="form-group col-12">
            <label>Job Location Type</label>
            <div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="isRemoteCheckbox"
                        checked={isRemote}
                        onChange={(e) => setIsRemote(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="isRemoteCheckbox">
                        This is a fully remote position (TELECOMMUTE)
                    </label>
                </div>
            </div>
        </div>

        {/* Conditional Physical Address Fields */}
        {!isRemote && (
            <>
                <div className="form-group col-lg-6 col-md-12">
                    <label>Street Address</label>
                    <input type="text" name="streetAddress" placeholder="e.g., 123 Main St" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
                </div>
                 <div className="form-group col-lg-6 col-md-12">
                    <label>City *</label>
                    <input type="text" name="addressLocality" placeholder="e.g., Anytown" required value={addressLocality} onChange={(e) => setAddressLocality(e.target.value)} />
                </div>
                 <div className="form-group col-lg-4 col-md-12">
                    <label>State / Region *</label>
                    <input type="text" name="addressRegion" placeholder="e.g., CA" required value={addressRegion} onChange={(e) => setAddressRegion(e.target.value)} />
                </div>
                 <div className="form-group col-lg-4 col-md-12">
                    <label>Postal Code</label>
                    <input type="text" name="postalCode" placeholder="e.g., 90210" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                </div>
                 <div className="form-group col-lg-4 col-md-12">
                    <label>Country Code *</label>
                    <input type="text" name="addressCountry" placeholder="e.g., US" required value={addressCountry} onChange={(e) => setAddressCountry(e.target.value)} maxLength="2" />
                </div>
            </>
        )}

        {/* Conditional Remote Location Requirements */}
        {isRemote && (
             <div className="form-group col-lg-12 col-md-12">
                <label>Applicant Location Requirements (JSON format) *</label>
                <textarea
                    name="applicantLocationRequirements"
                    placeholder='e.g., [{"@type": "Country", "name": "USA"}] or [{"@type": "State", "name": "Texas, USA"}]'
                    required={isRemote} // Required only if remote is checked
                    value={applicantLocationRequirements}
                    onChange={(e) => setApplicantLocationRequirements(e.target.value)}
                    rows="3"
                ></textarea>
                <small className="form-text text-muted">Enter valid JSON specifying required countries or states. See Google JobPosting docs for examples.</small>
            </div>
        )}

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
