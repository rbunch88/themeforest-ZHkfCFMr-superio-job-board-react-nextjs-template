'use client'

import { useState, useEffect } from "react";
import { supabase } from "../../../../../../utils/supabaseClient"; // Adjust path if needed
import Select from "react-select"; // Keep if needed for industry/category

// Define Team Size options (can be moved to a constants file)
const teamSizeOptions = [
    { value: "1-10", label: "1-10" },
    { value: "11-50", label: "11-50" },
    { value: "51-100", label: "51-100" },
    { value: "101-500", label: "101-500" },
    { value: "501-1000", label: "501-1000" },
    { value: "1001-5000", label: "1001-5000" },
    { value: "5000+", label: "5000+" },
];

const FormInfoBox = () => {
    // Company Data State
    const [companyId, setCompanyId] = useState(null);
    const [companyName, setCompanyName] = useState('');
    // const [email, setEmail] = useState(''); // Email likely tied to user profile, not company directly?
    // const [phone, setPhone] = useState(''); // Add if needed in ContactInfoBox or here
    const [website, setWebsite] = useState('');
    const [foundedYear, setFoundedYear] = useState('');
    const [teamSize, setTeamSize] = useState('');
    // const [categories, setCategories] = useState([]); // For multi-select if needed (e.g., industry tags)
    const [description, setDescription] = useState('');
    // const [allowInListing, setAllowInListing] = useState(true); // Add if needed

    // UI State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch initial company data
    useEffect(() => {
        const fetchCompanyData = async () => {
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

            try {
                const { data, error: fetchError } = await supabase
                    .from('companies')
                    .select('*') // Select all fields for the form
                    .eq('user_id', userId)
                    .single();

                if (fetchError) {
                    if (fetchError.code === 'PGRST116') { // Code for no rows found
                         setError("No company profile found. Please create one if needed."); // Or redirect to a create page
                    } else {
                        throw fetchError;
                    }
                }

                if (data) {
                    setCompanyId(data.id);
                    setCompanyName(data.name || '');
                    setWebsite(data.website || '');
                    setFoundedYear(data.founded_year || '');
                    setTeamSize(data.size || '');
                    setDescription(data.description || '');
                    // Set other fields like industry, location if they are part of this form
                }
            } catch (err) {
                console.error("Error fetching company data:", err);
                setError(`Failed to load company data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyData();
    }, [supabase]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMessage('');

        if (!supabase || !companyId) {
            setError("Cannot save data. Company ID or connection missing.");
            setSaving(false);
            return;
        }

        const updatedData = {
            name: companyName,
            website: website,
            founded_year: foundedYear || null, // Ensure null if empty
            size: teamSize || null,
            description: description,
            updated_at: new Date().toISOString(), // Update timestamp
            // Add other fields as needed
        };

        try {
            const { error: updateError } = await supabase
                .from('companies')
                .update(updatedData)
                .eq('id', companyId); // Ensure update targets the correct company

            if (updateError) {
                throw updateError;
            }

            setSuccessMessage("Profile updated successfully!");
            // Optionally re-fetch data or assume state is correct
        } catch (err) {
            console.error("Error updating company profile:", err);
            setError(`Failed to update profile: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="widget-content">Loading profile...</div>;
    }

     if (error && !companyId) { // Show error prominently if profile couldn't be loaded
        return <div className="widget-content"><div className="alert alert-danger">{error}</div></div>;
    }

    return (
        <form className="default-form" onSubmit={handleSubmit}>
            <div className="row">
                {/* <!-- Input --> */}
                <div className="form-group col-lg-6 col-md-12">
                    <label>Company name *</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Company Name"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                    />
                </div>

                {/* <!-- Input --> */}
                {/* Email might be handled in user profile settings, not company */}
                {/* <div className="form-group col-lg-6 col-md-12">
                    <label>Email address</label>
                    <input type="email" name="email" placeholder="Company Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div> */}

                {/* Phone might be in ContactInfoBox */}
                {/* <div className="form-group col-lg-6 col-md-12">
                    <label>Phone</label>
                    <input type="tel" name="phone" placeholder="Company Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div> */}

                {/* <!-- Input --> */}
                <div className="form-group col-lg-6 col-md-12">
                    <label>Website</label>
                    <input
                        type="url"
                        name="website"
                        placeholder="https://..."
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                    />
                </div>

                {/* <!-- Input --> */}
                <div className="form-group col-lg-6 col-md-12">
                    <label>Est. Since (Year)</label>
                    <input
                        type="number" // Use number type for year
                        name="foundedYear"
                        placeholder="e.g., 2010"
                        value={foundedYear}
                        onChange={(e) => setFoundedYear(e.target.value)}
                    />
                </div>

                {/* <!-- Input --> */}
                <div className="form-group col-lg-6 col-md-12">
                    <label>Team Size</label>
                    <select
                        className="chosen-single form-select"
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                    >
                        <option value="">Select Size</option>
                        {teamSizeOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* <!-- Search Select --> */}
                {/* TODO: Implement Industry/Category select if needed */}
                {/* <div className="form-group col-lg-6 col-md-12">
                    <label>Industry </label>
                    <Select ... />
                </div> */}

                {/* Allow In Search & Listing - Needs schema field */}
                {/* <div className="form-group col-lg-6 col-md-12">
                    <label>Allow In Search & Listing</label>
                    <select className="chosen-single form-select" value={allowInListing ? 'Yes' : 'No'} onChange={(e) => setAllowInListing(e.target.value === 'Yes')}>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div> */}

                {/* <!-- About Company --> */}
                <div className="form-group col-lg-12 col-md-12">
                    <label>About Company</label>
                    <textarea
                        placeholder="Company description..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>

                {/* <!-- Input --> */}
                <div className="form-group col-lg-6 col-md-12">
                    {error && <div className="text-danger mb-2">{error}</div>}
                    {successMessage && <div className="text-success mb-2">{successMessage}</div>}
                    <button className="theme-btn btn-style-one" type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default FormInfoBox;
