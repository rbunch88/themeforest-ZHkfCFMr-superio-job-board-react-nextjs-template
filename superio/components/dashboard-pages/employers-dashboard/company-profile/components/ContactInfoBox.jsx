'use client'

import { useState, useEffect } from "react";
import { supabase } from "../../../../../utils/supabaseClient"; // Adjust path if needed
// import Map from "../../../Map"; // Map display might be separate

const ContactInfoBox = () => {
    // State for location and UI
    const [companyId, setCompanyId] = useState(null); // Need company ID to update
    const [location, setLocation] = useState(''); // Corresponds to headquarters_location
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch initial company location data
    useEffect(() => {
        const fetchCompanyLocation = async () => {
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
                    .select('id, headquarters_location') // Select ID and location
                    .eq('user_id', userId)
                    .single();

                if (fetchError) {
                     if (fetchError.code === 'PGRST116') { // No company found
                         setError("No company profile found.");
                    } else {
                        throw fetchError;
                    }
                }

                if (data) {
                    setCompanyId(data.id);
                    setLocation(data.headquarters_location || '');
                }
            } catch (err) {
                console.error("Error fetching company location:", err);
                setError(`Failed to load location data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyLocation();
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
            headquarters_location: location,
            updated_at: new Date().toISOString(),
        };

        try {
            const { error: updateError } = await supabase
                .from('companies')
                .update(updatedData)
                .eq('id', companyId);

            if (updateError) {
                throw updateError;
            }

            setSuccessMessage("Contact information updated successfully!");

        } catch (err) {
            console.error("Error updating contact info:", err);
            setError(`Failed to update contact info: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

     if (loading) {
        return <div className="widget-content">Loading contact info...</div>;
    }

    // Don't render form if initial load failed significantly (no companyId)
    if (error && !companyId) {
        return <div className="widget-content"><div className="alert alert-danger">{error}</div></div>;
    }


    return (
        <form className="default-form" onSubmit={handleSubmit}>
            <div className="row">
                 {/* Country/City dropdowns removed - using single text input for now */}
                {/* <div className="form-group col-lg-6 col-md-12"> ... </div> */}
                {/* <div className="form-group col-lg-6 col-md-12"> ... </div> */}

                {/* <!-- Input --> */}
                <div className="form-group col-lg-12 col-md-12">
                    <label>Company Location / Address</label>
                    <input
                        type="text"
                        name="location"
                        placeholder="e.g., 123 Main St, Anytown, CA or 'Remote'"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>

                {/* Map related fields removed for now */}
                {/* <div className="form-group col-lg-6 col-md-12"> ... Find On Map ... </div> */}
                {/* <div className="form-group col-lg-3 col-md-12"> ... Latitude ... </div> */}
                {/* <div className="form-group col-lg-3 col-md-12"> ... Longitude ... </div> */}
                {/* <div className="form-group col-lg-12 col-md-12"> ... Search Location Button ... </div> */}
                {/* <div className="form-group col-lg-12 col-md-12"> ... Map Display ... </div> */}

                {/* <!-- Input --> */}
                <div className="form-group col-lg-12 col-md-12">
                    {error && <div className="text-danger mb-2">{error}</div>}
                    {successMessage && <div className="text-success mb-2">{successMessage}</div>}
                    <button type="submit" className="theme-btn btn-style-one" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ContactInfoBox;
