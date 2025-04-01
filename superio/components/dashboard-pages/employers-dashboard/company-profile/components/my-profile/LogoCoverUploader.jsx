'use client'

import { useState, useEffect } from "react";
import { supabase } from "../../../../../../utils/supabaseClient"; // Adjust path
import Image from "next/image"; // Import Image component

const LogoCoverUploader = () => {
    const [logoFile, setLogoFile] = useState(null); // Store the selected file object
    // const [coverFile, setCoverFile] = useState(null); // Cover image state (skipped for now)

    const [companyId, setCompanyId] = useState(null);
    const [currentLogoUrl, setCurrentLogoUrl] = useState(null);
    // const [currentCoverUrl, setCurrentCoverUrl] = useState(null); // Cover image state

    // UI States
    const [loading, setLoading] = useState(true); // For initial fetch
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch initial company data (logo url and id)
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
                    .select('id, logo_url') // Select ID and logo_url
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
                    // Construct full URL if only path is stored, or use directly if full URL is stored
                    if (data.logo_url) {
                         // Assuming logo_url stores the path, construct the public URL
                         const { data: urlData } = supabase.storage.from('company-logos').getPublicUrl(data.logo_url);
                         setCurrentLogoUrl(urlData?.publicUrl || null);
                    } else {
                        setCurrentLogoUrl(null);
                    }
                    // Fetch/set cover URL similarly if implemented
                }
            } catch (err) {
                console.error("Error fetching company logo data:", err);
                setError(`Failed to load company data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyData();
    }, [supabase]);


    // Handle file selection and trigger upload
    const handleFileChange = async (event, type) => {
        const file = event.target.files[0];
        if (!file) return;

        if (type === 'logo') {
            setLogoFile(file);
            await handleUpload(file, 'logo'); // Upload immediately
        }
        // else if (type === 'cover') {
        //     setCoverFile(file);
        //     await handleUpload(file, 'cover'); // Upload immediately
        // }
    };

    // Handle the actual upload and DB update
    const handleUpload = async (file, type) => {
        setUploading(true);
        setError(null);
        setSuccessMessage('');

        if (!file || !companyId) {
            setError("No file selected or company ID missing.");
            setUploading(false);
            return;
        }

        const bucket = 'company-logos'; // Or 'company-covers'
        const fileExt = file.name.split('.').pop();
        const fileName = `${type}_${Date.now()}.${fileExt}`;
        const filePath = `${companyId}/${fileName}`; // Store under company ID folder

        try {
            // Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true, // Overwrite if file with same name exists (optional)
                });

            if (uploadError) throw uploadError;

            // Get public URL (or just use filePath if preferred)
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
            const publicUrl = urlData?.publicUrl;

            if (!publicUrl) {
                throw new Error("Could not get public URL after upload.");
            }

            // Update the companies table with the new file path/URL
            const updateData = type === 'logo' ? { logo_url: filePath } : { cover_url: filePath }; // Adjust field names
            updateData.updated_at = new Date().toISOString();

            const { error: dbError } = await supabase
                .from('companies')
                .update(updateData)
                .eq('id', companyId);

            if (dbError) throw dbError;

            // Update UI state
            if (type === 'logo') {
                setCurrentLogoUrl(publicUrl);
                setLogoFile(null); // Clear file input state after successful upload
            }
            // else if (type === 'cover') {
            //     setCurrentCoverUrl(publicUrl);
            //     setCoverFile(null);
            // }

            setSuccessMessage(`${type === 'logo' ? 'Logo' : 'Cover'} uploaded successfully!`);

        } catch (err) {
            console.error(`Error uploading ${type}:`, err);
            setError(`Upload failed: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };


    return (
        <>
            {/* Logo Upload */}
            <div className="uploading-outer">
                <div className="uploadButton">
                    <input
                        className="uploadButton-input"
                        type="file"
                        name="logo"
                        accept="image/*"
                        id="upload-logo"
                        onChange={(e) => handleFileChange(e, 'logo')}
                        disabled={uploading || loading || !companyId} // Disable while busy or if no company ID
                    />
                    <label
                        className="uploadButton-button ripple-effect"
                        htmlFor="upload-logo"
                    >
                        {uploading && logoFile ? 'Uploading...' : 'Browse Logo'}
                    </label>
                    <span className="uploadButton-file-name">
                         {logoFile ? logoFile.name : (currentLogoUrl ? 'Current logo loaded' : '')}
                    </span>
                </div>
                <div className="text">
                    Max file size is 1MB. Suitable files are .jpg & .png. Recommended size: 300x300 pixels.
                    {currentLogoUrl && (
                        <div style={{ marginTop: '10px' }}>
                            Current Logo: <Image src={currentLogoUrl} alt="Current Company Logo" width={50} height={50} style={{ objectFit: 'contain' }} />
                        </div>
                    )}
                </div>
                 {error && <div className="text-danger mt-2">{error}</div>}
                 {successMessage && <div className="text-success mt-2">{successMessage}</div>}
            </div>

            {/* Cover Image Upload (Optional - Skipped for now) */}
            {/* <div className="uploading-outer">
                <div className="uploadButton">
                     <input ... onChange={(e) => handleFileChange(e, 'cover')} ... />
                     <label ... > Browse Cover </label>
                     ...
                </div>
                <div className="text"> ... </div>
                 {currentCoverUrl && ( ... display current cover ... )}
            </div> */}
        </>
    );
};

export default LogoCoverUploader;
