'use client'

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../../utils/supabaseClient"; // Adjust path

const MyCertifications = () => {
    const [allCertTypes, setAllCertTypes] = useState([]);
    const [selectedCertIds, setSelectedCertIds] = useState(new Set()); // Use a Set for efficient add/delete/check
    const [profileId, setProfileId] = useState(null);

    // UI States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch all certification types and user's current selections
    const fetchData = useCallback(async () => {
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
        setProfileId(userId);

        try {
            // Fetch all available certification types
            const { data: typesData, error: typesError } = await supabase
                .from('certification_types')
                .select('id, name')
                .order('name');
            if (typesError) throw typesError;
            setAllCertTypes(typesData || []);

            // Fetch current user's selected certification IDs
            const { data: selectedData, error: selectedError } = await supabase
                .from('candidate_certifications')
                .select('certification_type_id')
                .eq('candidate_profile_id', userId);
            if (selectedError) throw selectedError;

            // Populate the Set with selected IDs
            setSelectedCertIds(new Set(selectedData.map(item => item.certification_type_id)));

        } catch (err) {
            console.error("Error fetching certification data:", err);
            setError(`Failed to load certification data: ${err.message}`);
            setAllCertTypes([]);
            setSelectedCertIds(new Set());
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]); // Run fetch function on mount

    // Handle checkbox change
    const handleCheckboxChange = (event) => {
        const certId = event.target.value;
        const isChecked = event.target.checked;

        setSelectedCertIds(prevIds => {
            const newIds = new Set(prevIds);
            if (isChecked) {
                newIds.add(certId);
            } else {
                newIds.delete(certId);
            }
            return newIds;
        });
    };

    // Handle saving changes
    const handleSaveCertifications = async () => {
        setSaving(true);
        setError(null);
        setSuccessMessage('');

        if (!supabase || !profileId) {
            setError("Cannot save data. User ID or connection missing.");
            setSaving(false);
            return;
        }

        try {
            // 1. Delete existing certifications for the user
            const { error: deleteError } = await supabase
                .from('candidate_certifications')
                .delete()
                .eq('candidate_profile_id', profileId);

            if (deleteError) throw deleteError;

            // 2. Insert new certifications if any are selected
            if (selectedCertIds.size > 0) {
                const certificationsToInsert = Array.from(selectedCertIds).map(certId => ({
                    candidate_profile_id: profileId,
                    certification_type_id: certId,
                }));

                const { error: insertError } = await supabase
                    .from('candidate_certifications')
                    .insert(certificationsToInsert);

                if (insertError) throw insertError;
            }

            setSuccessMessage("Certifications updated successfully!");

        } catch (err) {
            console.error("Error saving certifications:", err);
            setError(`Failed to save certifications: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div>Loading certifications...</div>;
    }

     if (error && allCertTypes.length === 0) { // Show error only if loading failed completely
        return <div className="alert alert-danger">{error}</div>;
    }


    return (
        <div className="ls-widget">
            <div className="tabs-box">
                <div className="widget-title">
                    <h4>My Certifications</h4>
                </div>
                <div className="widget-content">
                     {error && <div className="alert alert-warning">{error}</div>} {/* Show non-critical errors */}
                     {successMessage && <div className="alert alert-success">{successMessage}</div>}

                    {allCertTypes.length === 0 && !loading && !error && (
                        <p>No certification types found.</p>
                    )}

                    {allCertTypes.length > 0 && (
                         <form onSubmit={(e) => { e.preventDefault(); handleSaveCertifications(); }}>
                            <div className="row">
                                {/* Render checkboxes */}
                                {allCertTypes.map(cert => (
                                    <div className="col-lg-6 col-md-12" key={cert.id}>
                                        <div className="form-group">
                                             <div className="ui-checkbox">
                                                <input
                                                    id={`cert-${cert.id}`}
                                                    type="checkbox"
                                                    value={cert.id}
                                                    checked={selectedCertIds.has(cert.id)}
                                                    onChange={handleCheckboxChange}
                                                />
                                                 <label htmlFor={`cert-${cert.id}`} className="mb-0">{cert.name}</label>
                                             </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                             <div className="form-group col-lg-12 col-md-12 mt-3">
                                <button type="submit" className="theme-btn btn-style-one" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Certifications'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyCertifications;