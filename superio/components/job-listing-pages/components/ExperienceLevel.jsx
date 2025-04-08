
'use client'
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
// Removed Redux imports
import Select from 'react-select';

const ExperienceLevel = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedExperience = searchParams.getAll('experience'); // Get array from URL

    // --- TEMPORARY Placeholder for available experience levels ---
    // TODO: Replace this with actual data fetching or props
    const experienceLevelList = [ // Renamed for clarity
        { id: 1, name: 'Fresh', value: 'fresh' },
        { id: 2, name: '1 Year', value: '1-year' },
        { id: 3, name: '2 Years', value: '2-years' },
        { id: 4, name: '3 Years', value: '3-years' },
        { id: 5, name: '4 Years', value: '4-years' },
    ];
    // --- End Temporary Placeholder ---

    // Transform experienceLevelList for react-select options
    const experienceOptions = useMemo(() =>
        experienceLevelList.map(level => ({ value: level.value, label: level.name })),
    [experienceLevelList]);

    // Transform selectedExperience from URL into the format react-select expects for its value prop
    const selectedValue = useMemo(() =>
        experienceOptions.filter(option => selectedExperience.includes(option.value)),
    [experienceOptions, selectedExperience]);


    const handleExperienceChange = useCallback((selectedOptions) => {
        const params = new URLSearchParams(searchParams);

        // Remove all existing experience params
        params.delete('experience');

        // Add the new selected levels back to the params
        if (selectedOptions) {
            selectedOptions.forEach(option => params.append('experience', option.value));
        }

        params.set('page', '1'); // Reset page
        router.push(`/jobs?${params.toString()}`, { scroll: false });

    }, [searchParams, router]);

    return (
        <div className="form-group"> {/* Added form-group wrapper */}
             <Select
                isMulti
                name="experience_level"
                options={experienceOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={handleExperienceChange}
                value={selectedValue}
                placeholder="Select Experience Level(s)..."
            />
            {/* Removed View More button as it's less relevant for dropdown */}
        </div>
    );
};

export default ExperienceLevel;
