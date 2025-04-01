'use client'

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../../utils/supabaseClient"; // Adjust path

// Allowed file types
const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const CvUploader = () => {
    const [profileId, setProfileId] = useState(null);
    const [currentResumePath, setCurrentResumePath] = useState(null); // Store the path from DB
    const [currentResumeUrl, setCurrentResumeUrl] = useState(null); // Public URL for download
    const [currentResumeFilename, setCurrentResumeFilename] = useState('');

    // UI States
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true); // For initial fetch
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState('');

    // --- Fetch initial resume data ---
    const fetchResumeData = useCallback(async () => {
        setLoading(true);
        setError('');
        setSuccessMessage(''); // Clear messages on refetch
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
            const { data, error: fetchError } = await supabase
                .from('candidates')
                .select('resume_url') // Select only the resume path
                .eq('profile_id', userId)
                .maybeSingle(); // Use maybeSingle as candidate might not exist

            if (fetchError) throw fetchError;

            if (data?.resume_url) {
                setCurrentResumePath(data.resume_url);
                // Derive filename from path
                setCurrentResumeFilename(data.resume_url.split('/').pop());
                // Get public URL for download link
                const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(data.resume_url);
                setCurrentResumeUrl(urlData?.publicUrl || null);
            } else {
                setCurrentResumePath(null);
                setCurrentResumeUrl(null);
                setCurrentResumeFilename('');
            }
        } catch (err) {
            console.error("Error fetching resume data:", err);
            setError(`Failed to load resume data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchResumeData();
    }, [fetchResumeData]);

    // --- Handle File Selection ---
    const handleFileChange = (event) => {
        setError(''); // Clear previous errors
        setSuccessMessage('');
        const file = event.target.files[0];
        if (!file) {
            setSelectedFile(null);
            return;
        }

        // Validate type
        if (!allowedTypes.includes(file.type)) {
            setError("Invalid file type. Only .pdf, .doc, .docx are allowed.");
            setSelectedFile(null);
            event.target.value = null; // Clear the input
            return;
        }

        // Validate size
        if (file.size > MAX_FILE_SIZE_BYTES) {
            setError(`File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.`);
            setSelectedFile(null);
            event.target.value = null; // Clear the input
            return;
        }

        setSelectedFile(file);
    };

    // --- Handle Upload ---
    const handleUpload = async () => {
        if (!selectedFile || !profileId) {
            setError("Please select a file to upload.");
            return;
        }

        setUploading(true);
        setError('');
        setSuccessMessage('');

        const bucket = 'resumes';
        const fileExt = selectedFile.name.split('.').pop();
        // Sanitize filename slightly (optional, storage might handle it)
        const safeBaseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `${safeBaseName}_${Date.now()}.${fileExt}`;
        const filePath = `${profileId}/${fileName}`; // Store under profileId folder

        try {
            // If there's an existing resume, delete it from storage first
            if (currentResumePath) {
                const { error: deleteStorageError } = await supabase.storage
                    .from(bucket)
                    .remove([currentResumePath]);
                if (deleteStorageError) {
                    // Log error but attempt to continue upload anyway
                    console.error("Error deleting old resume from storage:", deleteStorageError);
                }
            }

            // Upload the new file
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false, // Don't upsert, we handle deletion first
                });

            if (uploadError) throw uploadError;

            // Update the candidates table with the new file path
            const { error: dbError } = await supabase
                .from('candidates')
                .update({ resume_url: filePath, updated_at: new Date().toISOString() })
                .eq('profile_id', profileId);

            if (dbError) throw dbError;

            // Update UI state
            setCurrentResumePath(filePath);
            setCurrentResumeFilename(fileName);
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
            setCurrentResumeUrl(urlData?.publicUrl || null);
            setSelectedFile(null); // Clear selected file
            document.getElementById('upload-cv').value = null; // Clear the file input visually
            setSuccessMessage("Resume uploaded successfully!");

        } catch (err) {
            console.error("Error uploading resume:", err);
            setError(`Upload failed: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

     // --- Handle Delete ---
     const handleDelete = async () => {
        if (!currentResumePath || !profileId) {
            setError("No resume to delete.");
            return;
        }

        // Confirmation dialog
        if (!window.confirm(`Are you sure you want to delete "${currentResumeFilename}"?`)) {
            return;
        }

        setDeleting(true);
        setError('');
        setSuccessMessage('');

        try {
            // 1. Delete from storage
            const { error: deleteStorageError } = await supabase.storage
                .from('resumes')
                .remove([currentResumePath]);

            if (deleteStorageError) throw deleteStorageError;

            // 2. Update database record
            const { error: dbError } = await supabase
                .from('candidates')
                .update({ resume_url: null, updated_at: new Date().toISOString() })
                .eq('profile_id', profileId);

            if (dbError) throw dbError;

            // 3. Update UI state
            setCurrentResumePath(null);
            setCurrentResumeUrl(null);
            setCurrentResumeFilename('');
            setSuccessMessage("Resume deleted successfully.");

        } catch (err) {
            console.error("Error deleting resume:", err);
            setError(`Deletion failed: ${err.message}`);
        } finally {
            setDeleting(false);
        }
    };


    return (
        <>
            {/* Start Upload resume */}
            <div className="uploading-resume">
                <div className="uploadButton">
                    <input
                        className="uploadButton-input"
                        type="file"
                        name="resume"
                        accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        id="upload-cv" // Changed ID
                        onChange={handleFileChange}
                        disabled={uploading || deleting || loading}
                    />
                    <label className="cv-uploadButton" htmlFor="upload-cv">
                        <span className="title">Drop file here or click to upload</span>
                        <span className="text">
                            Upload Resume (Max {MAX_FILE_SIZE_MB}MB). Allowed types: .pdf, .doc, .docx
                        </span>
                        {/* Display selected file name */}
                        {selectedFile && <span className="text-success mt-1 d-block">Selected: {selectedFile.name}</span>}
                        <span className="theme-btn btn-style-one">
                            {uploading ? 'Uploading...' : 'Select Resume File'}
                        </span>
                        {error && <p className="ui-danger mb-0 mt-2">{error}</p>}
                        {successMessage && <p className="text-success mb-0 mt-2">{successMessage}</p>}
                    </label>
                </div>
                 {/* Add upload button, only visible when a file is selected */}
                 {selectedFile && !uploading && (
                    <button
                        type="button"
                        className="theme-btn btn-style-one mt-3"
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload Selected Resume'}
                    </button>
                )}
            </div>
            {/* End upload-resume */}

            {/* Start Current Resume Display */}
            <div className="files-outer mt-4">
                 <div className="widget-title">
                    <h4>Current Resume</h4>
                </div>
                {loading && <p>Loading resume info...</p>}
                {!loading && currentResumePath && currentResumeFilename && (
                    <div className="file-edit-box">
                        <span className="title">{currentResumeFilename}</span>
                        <div className="edit-btns">
                            {currentResumeUrl && (
                                <a href={currentResumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary me-2">
                                    <span className="la la-download"></span> Download
                                </a>
                            )}
                            <button onClick={handleDelete} disabled={deleting} className="btn btn-sm btn-danger">
                                {deleting ? <span className="spinner-border spinner-border-sm"></span> : <span className="la la-trash"></span>} Delete
                            </button>
                        </div>
                    </div>
                )}
                 {!loading && !currentResumePath && !error && (
                    <p>No resume uploaded yet.</p>
                 )}
                 {!loading && !currentResumePath && error && error !== "No company profile found." && ( // Show error if loading failed but wasn't just 'not found'
                     <p className="text-danger">Could not load resume information.</p>
                 )}
            </div>
            {/* End Current Resume Display */}
        </>
    );
};

export default CvUploader;
