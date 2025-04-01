'use client'

import { useState, useEffect } from "react";
import { supabase } from "../../../../../../utils/supabaseClient"; // Adjust path
import Image from "next/image";

const AvatarUploader = () => { // Renamed component function for clarity
    const [avatarFile, setAvatarFile] = useState(null); // Store the selected file object
    const [profileId, setProfileId] = useState(null);
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(null);

    // UI States
    const [loading, setLoading] = useState(true); // For initial fetch
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch initial profile data (avatar url and id)
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
                const { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select('avatar_url') // Select avatar_url
                    .eq('id', userId)
                    .single();

                if (fetchError && fetchError.code !== 'PGRST116') { // Ignore 'not found' error initially
                    throw fetchError;
                }

                if (data && data.avatar_url) {
                    // Construct full URL from the stored path
                    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.avatar_url);
                    setCurrentAvatarUrl(urlData?.publicUrl || null);
                } else {
                    setCurrentAvatarUrl(null); // No avatar set yet
                }
            } catch (err) {
                console.error("Error fetching profile avatar data:", err);
                setError(`Failed to load profile data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [supabase]);


    // Handle file selection and trigger upload
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        await handleUpload(file); // Upload immediately
    };

    // Handle the actual upload and DB update
    const handleUpload = async (file) => {
        setUploading(true);
        setError(null);
        setSuccessMessage('');

        if (!file || !profileId) {
            setError("No file selected or user profile ID missing.");
            setUploading(false);
            return;
        }

        const bucket = 'avatars';
        const fileExt = file.name.split('.').pop();
        const fileName = `avatar_${Date.now()}.${fileExt}`;
        // Use profileId in the path for organization and RLS policies
        const filePath = `${profileId}/${fileName}`;

        try {
            // Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true, // Overwrite if file with same name exists (or handle versions)
                });

            if (uploadError) throw uploadError;

            // Update the profiles table with the new file path
            const { error: dbError } = await supabase
                .from('profiles')
                .update({ avatar_url: filePath, updated_at: new Date().toISOString() })
                .eq('id', profileId);

            if (dbError) throw dbError;

            // Get public URL to update UI state immediately
             const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
             const publicUrl = urlData?.publicUrl;

             if (publicUrl) {
                 setCurrentAvatarUrl(publicUrl);
             } else {
                 // Fallback or refetch if URL generation fails
                 console.warn("Could not get public URL immediately after upload.");
                 // Optionally refetch profile data here
             }

            setAvatarFile(null); // Clear file input state after successful upload
            setSuccessMessage(`Avatar uploaded successfully!`);

        } catch (err) {
            console.error(`Error uploading avatar:`, err);
            setError(`Upload failed: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };


    return (
        <>
            <div className="uploading-outer">
                <div className="uploadButton">
                    <input
                        className="uploadButton-input"
                        type="file"
                        name="avatar"
                        accept="image/*"
                        id="upload-avatar" // Changed id for clarity
                        onChange={handleFileChange}
                        disabled={uploading || loading || !profileId} // Disable while busy or if no profile ID
                    />
                    <label
                        className="uploadButton-button ripple-effect"
                        htmlFor="upload-avatar"
                    >
                        {uploading ? 'Uploading...' : 'Browse Avatar'}
                    </label>
                    <span className="uploadButton-file-name">
                         {avatarFile ? avatarFile.name : (currentAvatarUrl ? 'Current avatar loaded' : 'No avatar selected')}
                    </span>
                </div>
                <div className="text">
                    Max file size is 1MB. Suitable files are .jpg & .png. Recommended: Square image.
                    {loading && <div className="mt-2">Loading current avatar...</div>}
                    {currentAvatarUrl && !loading && (
                        <div style={{ marginTop: '10px' }}>
                            Current Avatar: <Image src={currentAvatarUrl} alt="Current Avatar" width={100} height={100} style={{ objectFit: 'cover', borderRadius: '50%' }} />
                        </div>
                    )}
                     {!currentAvatarUrl && !loading && <div className="mt-2">No current avatar.</div>}
                </div>
                 {error && <div className="text-danger mt-2">{error}</div>}
                 {successMessage && <div className="text-success mt-2">{successMessage}</div>}
            </div>
        </>
    );
};

export default AvatarUploader; // Export with the new function name
