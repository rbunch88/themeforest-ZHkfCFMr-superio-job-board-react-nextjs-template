'use client'

import { useState, useEffect } from "react";
import { supabase } from "../../../../../utils/supabaseClient"; // Adjust path if needed

const SocialNetworkBox = () => {
    // State for social links
    const [companyId, setCompanyId] = useState(null); // Need company ID to update
    const [facebookLink, setFacebookLink] = useState('');
    const [twitterLink, setTwitterLink] = useState('');
    const [linkedinLink, setLinkedinLink] = useState('');
    const [googlePlusLink, setGooglePlusLink] = useState(''); // Keep or remove based on relevance

    // UI State
    const [loading, setLoading] = useState(true); // For initial data fetch
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

     // Fetch initial company social data (if fields existed)
    useEffect(() => {
        const fetchCompanySocials = async () => {
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
                // Assuming social fields like 'facebook_url', 'twitter_url' exist on companies table
                const { data, error: fetchError } = await supabase
                    .from('companies')
                    .select('id, facebook_url, twitter_url, linkedin_url, google_plus_url') // Example field names
                    .eq('user_id', userId)
                    .single();

                 if (fetchError) {
                     if (fetchError.code === 'PGRST116') { // No company found
                         setError("No company profile found.");
                    } else {
                        // If fields don't exist yet, this might error - handle gracefully
                        console.warn("Could not fetch social fields (they might not exist yet):", fetchError.message);
                        // Still need the company ID if found by user_id lookup
                         const { data: idData, error: idError } = await supabase.from('companies').select('id').eq('user_id', userId).single();
                         if (idData) setCompanyId(idData.id);
                         else if (!idError) setError("No company profile found."); // If ID also not found
                         else throw idError; // Throw other errors
                    }
                }

                if (data) {
                    setCompanyId(data.id);
                    setFacebookLink(data.facebook_url || '');
                    setTwitterLink(data.twitter_url || '');
                    setLinkedinLink(data.linkedin_url || '');
                    setGooglePlusLink(data.google_plus_url || '');
                }
            } catch (err) {
                console.error("Error fetching company social data:", err);
                setError(`Failed to load social data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanySocials();
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

        // Construct data ONLY if fields exist in schema
        const updatedData = {
            // facebook_url: facebookLink || null,
            // twitter_url: twitterLink || null,
            // linkedin_url: linkedinLink || null,
            // google_plus_url: googlePlusLink || null,
             updated_at: new Date().toISOString(), // Always update timestamp
        };

        // Check if there's anything to update besides timestamp
        const fieldsToUpdate = Object.keys(updatedData).filter(key => key !== 'updated_at');

        if (fieldsToUpdate.length === 0) {
             setError("No social media fields are configured in the database yet.");
             setSaving(false);
             return;
        }


        try {
            const { error: updateError } = await supabase
                .from('companies')
                .update(updatedData)
                .eq('id', companyId);

            if (updateError) {
                throw updateError;
            }

            setSuccessMessage("Social links updated successfully!");

        } catch (err) {
            console.error("Error updating social links:", err);
            setError(`Failed to update social links: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

     if (loading) {
        return <div className="widget-content">Loading social info...</div>;
    }

    // Don't render form if initial load failed significantly (no companyId)
     if (error && !companyId && !loading) { // Check loading false to avoid showing error during initial fetch
        return <div className="widget-content"><div className="alert alert-danger">{error}</div></div>;
    }


  return (
    <form className="default-form" onSubmit={handleSubmit}>
      <div className="row">
        {/* <!-- Input --> */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Facebook</label>
          <input
            type="url"
            name="facebookLink"
            placeholder="https://www.facebook.com/..."
            value={facebookLink}
            onChange={(e) => setFacebookLink(e.target.value)}
            // required // Make optional unless schema requires it
          />
        </div>

        {/* <!-- Input --> */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Twitter</label>
          <input
            type="url"
            name="twitterLink"
            placeholder="https://www.twitter.com/..."
            value={twitterLink}
            onChange={(e) => setTwitterLink(e.target.value)}
            // required
           />
        </div>

        {/* <!-- Input --> */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Linkedin</label>
          <input
            type="url"
            name="linkedinLink"
            placeholder="https://www.linkedin.com/..."
            value={linkedinLink}
            onChange={(e) => setLinkedinLink(e.target.value)}
            // required
           />
        </div>

        {/* <!-- Input --> */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Google Plus (Optional)</label>
          <input
            type="url"
            name="googlePlusLink"
            placeholder="https://plus.google.com/..."
            value={googlePlusLink}
            onChange={(e) => setGooglePlusLink(e.target.value)}
            // required
           />
        </div>

        {/* <!-- Input --> */}
        <div className="form-group col-lg-6 col-md-12">
           {error && <div className="text-danger mb-2">{error}</div>}
           {successMessage && <div className="text-success mb-2">{successMessage}</div>}
          <button type="submit" className="theme-btn btn-style-one" disabled={saving || !companyId}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SocialNetworkBox;
