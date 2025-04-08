
'use client'
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
// Removed Redux imports
import Select from 'react-select';

const JobType = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedJobTypes = searchParams.getAll('job_type'); // Get array of selected types from URL

    // --- TEMPORARY Placeholder for available job types ---
    // TODO: Replace this with actual data fetching or props
    const jobTypeList = [
        { id: 1, name: 'Full-time', value: 'full-time' },
        { id: 2, name: 'Part-time', value: 'part-time' },
        { id: 3, name: 'Temporary', value: 'temporary' },
        { id: 4, name: 'Contract', value: 'contract' },
        { id: 5, name: 'Internship', value: 'internship' },
    ];
    // --- End Temporary Placeholder ---

    // Transform jobTypeList for react-select options
    const jobTypeOptions = useMemo(() =>
        jobTypeList.map(type => ({ value: type.value, label: type.name })),
    [jobTypeList]);

    // Transform selectedJobTypes from URL into the format react-select expects for its value prop
    const selectedValue = useMemo(() =>
        jobTypeOptions.filter(option => selectedJobTypes.includes(option.value)),
    [jobTypeOptions, selectedJobTypes]);

    const handleJobTypeChange = useCallback((selectedOptions) => {
        const params = new URLSearchParams(searchParams);

        // Remove all existing job_type params
        params.delete('job_type');

        // Add the new selected types back to the params
        if (selectedOptions) {
            selectedOptions.forEach(option => params.append('job_type', option.value));
        }

        params.set('page', '1'); // Reset page
        router.push(`/jobs?${params.toString()}`, { scroll: false });

    }, [searchParams, router]);

    return (
        <div className="form-group"> {/* Added form-group wrapper for consistent styling */}
            <Select
                isMulti
                name="job_type"
                options={jobTypeOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={handleJobTypeChange}
                value={selectedValue}
                placeholder="Select Job Type(s)..."
            />
        </div>
    );
};

export default JobType;
