'use client'

import { useState, useEffect } from "react";
import { supabase } from "../../../../../../utils/supabaseClient"; // Adjust path
import Select from "react-select";
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

const FormInfoBox = () => {
    // Profile & Candidate Data State
    const [profileId, setProfileId] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [designation, setDesignation] = useState(''); // Job Title in form
    const [phone, setPhone] = useState('');
    const [contactEmail, setContactEmail] = useState(''); // Separate from login email
    // const [website, setWebsite] = useState(''); // Removed per plan
    const [hourlyRate, setHourlyRate] = useState(''); // Keep hourly rate from schema
    const [experienceLevelId, setExperienceLevelId] = useState('');
    // const [age, setAge] = useState(''); // Removed per plan
    // const [educationLevel, setEducationLevel] = useState(''); // Removed per plan
    // const [languages, setLanguages] = useState(''); // Removed per plan
    const [skills, setSkills] = useState([]); // For multi-select, maps to candidates.skills
    // const [allowInListing, setAllowInListing] = useState(true); // Removed per plan
    const [bio, setBio] = useState(''); // Description

    // Dropdown Options States
    const [experienceLevelOptions, setExperienceLevelOptions] = useState([]);
    // TODO: Fetch or allow creation of skill options for the Select component

    // UI States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch initial profile and candidate data
    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            setError(null);
            if (!supabase) {
                 setError("Database connection not available.");
                 setLoading(false);
                 return;
            }

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session?.user) {
                setError("You must be logged in.");
                setLoading(false);
                return;
            }
            const userId = session.user.id;
            setProfileId(userId); // Set profileId for updates

            try {
                // Fetch profile and candidate data together
                const { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select(`
                        first_name,
                        last_name,
                        phone,
                        contact_email,
                        candidate:candidates (
                            designation,
                            hourly_rate,
                            experience_level_id,
                            skills,
                            bio
                        )
                    `)
                    .eq('id', userId)
                    .maybeSingle(); // Use maybeSingle as candidate might not exist yet

                if (fetchError) throw fetchError;

                if (data) {
                    setFirstName(data.first_name || '');
                    setLastName(data.last_name || '');
                    setPhone(data.phone || '');
                    setContactEmail(data.contact_email || '');

                    if (data.candidate) {
                        setDesignation(data.candidate.designation || '');
                        setHourlyRate(data.candidate.hourly_rate || '');
                        setExperienceLevelId(data.candidate.experience_level_id || '');
                        // Map skills array to react-select format { value: 'skill', label: 'skill' }
                        setSkills((data.candidate.skills || []).map(skill => ({ value: skill, label: skill })));
                        setBio(data.candidate.bio || '');
                    }
                } else {
                    // Handle case where profile exists but maybe candidate doesn't?
                    // This might happen if the trigger failed initially.
                    console.warn("Profile found, but no candidate data linked.");
                }

                 // Fetch Experience Levels for dropdown
                const { data: expLevels, error: expError } = await supabase.from('experience_levels').select('id, name').order('id'); // Or logical order
                if (expError) throw expError;
                setExperienceLevelOptions(expLevels || []);


            } catch (err) {
                console.error("Error fetching profile data:", err);
                setError(`Failed to load profile data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [supabase]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMessage('');

        if (!supabase || !profileId) {
            setError("Cannot save data. User ID or connection missing.");
            setSaving(false);
            return;
        }

        // Data for 'profiles' table
        const profileData = {
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            contact_email: contactEmail || null,
            updated_at: new Date().toISOString(),
        };

        // Data for 'candidates' table
        const candidateData = {
            profile_id: profileId, // Link to profiles table
            designation: designation || null,
            hourly_rate: hourlyRate || null,
            experience_level_id: experienceLevelId || null,
            skills: skills.map(skill => skill.value) || [], // Store just the skill strings
            bio: bio || null,
            updated_at: new Date().toISOString(),
        };

        try {
            // 1. Update profiles table
            const { error: profileUpdateError } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', profileId);

            if (profileUpdateError) throw profileUpdateError;

            // 2. Upsert candidates table
            // Upsert will insert if no row matches profile_id, or update if it does.
            const { error: candidateUpsertError } = await supabase
                .from('candidates')
                .upsert(candidateData, { onConflict: 'profile_id' });

            if (candidateUpsertError) throw candidateUpsertError;

            setSuccessMessage("Profile updated successfully!");

        } catch (err) {
            console.error("Error updating profile:", err);
            setError(`Failed to update profile: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

     if (loading) {
        return <div className="widget-content">Loading profile...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="default-form">
            <div className="row">
                {/* <!-- Input --> */}
                <div className="form-group col-lg-6 col-md-12">
                    <label>First Name *</label>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="e.g., John"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                 <div className="form-group col-lg-6 col-md-12">
                    <label>Last Name *</label>
                    <input
                        type="text"
                        name="lastName"
                        placeholder="e.g., Doe"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>

                {/* <!-- Input --> */}
                <div className="form-group col-lg-6 col-md-12">
                    <label>Job Title (Designation) *</label>
                    <input
                        type="text"
                        name="designation"
                        placeholder="e.g., BCBA Supervisor, RBT"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                    />
                </div>

                {/* <!-- Input --> */}
                <div className="form-group col-lg-6 col-md-12">
                    <label>Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="e.g., 123-456-7890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                {/* <!-- Input --> */}
                <div className="form-group col-lg-6 col-md-12">
                    <label>Contact Email</label>
                    <input
                        type="email"
                        name="contactEmail"
                        placeholder="Contact email (if different from login)"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                    />
                </div>

                 {/* <!-- Input --> */}
                <div className="form-group col-lg-6 col-md-12">
                    <label>Hourly Rate ($) (Optional)</label>
                    <input
                        type="number"
                        name="hourlyRate"
                        placeholder="e.g., 50"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                    />
                </div>


                {/* Experience Level Dropdown */}
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

                 {/* Skills Multi-select */}
                 <div className="form-group col-lg-6 col-md-12">
                    <label>Skills</label>
                    <Select
                        isMulti
                        name="skills"
                        options={[]} // TODO: Populate with suggestions or fetch distinct skills
                        components={animatedComponents}
                        isCreatable={true} // Allow users to create new skills
                        placeholder="Select or type skills..."
                        value={skills}
                        onChange={setSkills}
                        className="basic-multi-select"
                        classNamePrefix="select"
                    />
                 </div>


                {/* Removed Website, Salary Ranges, Age, Education Level, Languages, Categories, AllowInSearch */}

                {/* <!-- Bio --> */}
                <div className="form-group col-lg-12 col-md-12">
                    <label>Description (Bio)</label>
                    <textarea
                        placeholder="Tell us about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    ></textarea>
                </div>

                {/* <!-- Input --> */}
                <div className="form-group col-lg-6 col-md-12">
                     {error && <div className="text-danger mb-2">{error}</div>}
                     {successMessage && <div className="text-success mb-2">{successMessage}</div>}
                    <button type="submit" className="theme-btn btn-style-one" disabled={saving || loading}>
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default FormInfoBox;
