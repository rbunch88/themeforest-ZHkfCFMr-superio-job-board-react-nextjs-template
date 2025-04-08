
'use client'
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
// Removed Redux filter imports
// Note: Still potentially using Redux for job data (jobTypeList, etc.) - needs separate handling if removing Redux entirely.

export default function JobSelect() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get current values from URL parameters
    const currentJobType = searchParams.get('job_type') || ""; // Assuming single select for this component
    const currentDatePosted = searchParams.get('date_posted') || "all";
    const currentExperience = searchParams.get('experience') || ""; // Assuming single select for this component
    const currentSalaryMin = searchParams.get('salary_min') || "0";
    const currentSalaryMax = searchParams.get('salary_max') || "200000";

    // --- TEMPORARY Placeholders for dropdown options ---
    // TODO: Replace these with actual data fetching or props if removing Redux job slice
    const jobTypeList = [
        { id: 1, name: 'Full-time', value: 'full-time' },
        { id: 2, name: 'Part-time', value: 'part-time' },
        // Add other types as needed
    ];
    const datePost = [
         { id: 1, name: 'All', value: 'all' },
         { id: 2, name: 'Last 24 Hours', value: 'last-24-hours' },
         { id: 3, name: 'Last 7 Days', value: 'last-7-days' },
         { id: 4, name: 'Last 14 Days', value: 'last-14-days' },
         { id: 5, name: 'Last 30 Days', value: 'last-30-days' },
    ];
    const experienceLevel = [ // Renamed from experienceLavel for consistency
        { id: 1, name: 'Fresh', value: 'fresh' },
        { id: 2, name: '1 Year', value: '1-year' },
        { id: 3, name: '2 Years', value: '2-years' },
        // Add other levels as needed
    ];
     // Define salary options structure for easier matching
     const salaryOptions = [
        { name: "Salary estimate", min: 0, max: 200000 },
        { name: "0 - 5000", min: 0, max: 5000 },
        { name: "5000 - 10000", min: 5000, max: 10000 },
        { name: "10000 - 15000", min: 10000, max: 15000 },
        { name: "200,000+", min: 200000, max: 200000 }, // Represents 200k+
    ];
    // --- End Temporary Placeholders ---

    // --- Generic URL update function ---
    const updateUrlParam = useCallback((key, value, isDefault = false) => {
        const params = new URLSearchParams(searchParams);
        if (isDefault || !value) {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        params.set('page', '1');
        router.push(`/jobs?${params.toString()}`, { scroll: false });
    }, [searchParams, router]);

    // --- Specific Handlers ---
    const jobTypeHandler = useCallback((e) => {
        updateUrlParam('job_type', e.target.value, e.target.value === "");
    }, [updateUrlParam]);

    const datePostHandler = useCallback((e) => {
        updateUrlParam('date_posted', e.target.value, e.target.value === "all");
    }, [updateUrlParam]);

    const experienceHandler = useCallback((e) => {
        updateUrlParam('experience', e.target.value, e.target.value === ""); // Assuming empty value means default
    }, [updateUrlParam]);

    const salaryHandler = useCallback((e) => {
        const selectedOption = JSON.parse(e.target.value);
        const params = new URLSearchParams(searchParams);

        // Handle default case
        if (selectedOption.min === 0 && selectedOption.max === 200000) {
             params.delete('salary_min');
             params.delete('salary_max');
        } else {
            params.set('salary_min', selectedOption.min.toString());
            params.set('salary_max', selectedOption.max.toString());
        }

        params.set('page', '1');
        router.push(`/jobs?${params.toString()}`, { scroll: false });
    }, [searchParams, router]);

     // Determine the current stringified salary value for the dropdown
    const getCurrentSalaryValue = () => {
        const min = parseInt(currentSalaryMin, 10);
        const max = parseInt(currentSalaryMax, 10);
        // Find the matching option based on min/max from URL
        const match = salaryOptions.find(opt => opt.min === min && opt.max === max);
        // Default to the "Salary estimate" option if no exact match
        return match ? JSON.stringify({ min: match.min, max: match.max }) : JSON.stringify({ min: 0, max: 200000 });
    };

    // Removed old Redux handlers

    return (
        <>
            <div className="showing-result">
                <div className="top-filters">
                    <div className="form-group">
                        <select
                            onChange={jobTypeHandler}
                            className="chosen-single form-select"
                            value={currentJobType} // Use value from URL
                        >
                            <option value="">Job Type</option>
                            {jobTypeList.map((item) => ( // Use placeholder data
                                <option value={item.value} key={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* End job type filter */}

                    <div className="form-group">
                        <select
                            onChange={datePostHandler}
                            className="chosen-single form-select"
                            value={currentDatePosted} // Use value from URL
                        >
                            {datePost.map((item) => ( // Use placeholder data
                                <option value={item.value} key={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* End date posted filter */}

                    <div className="form-group">
                        <select
                            onChange={experienceHandler}
                            className="chosen-single form-select"
                            value={currentExperience} // Use value from URL
                        >
                            <option value="">Experience Level</option> {/* Add default empty value */}
                            {experienceLevel.map((item) => ( // Use placeholder data
                                <option value={item.value} key={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* End ecperience level filter */}

                    <div className="form-group">
                        <select
                            onChange={salaryHandler}
                            className="chosen-single form-select"
                            value={getCurrentSalaryValue()} // Use calculated value from URL
                        >
                            {/* Render options from salaryOptions array */}
                            {salaryOptions.map((opt, index) => (
                                <option
                                    key={index}
                                    value={JSON.stringify({ min: opt.min, max: opt.max })}
                                >
                                    {opt.name}
                                </option>
                            ))}

                        </select>
                    </div>
                    {/* End salary estimate filter */}
                </div>
            </div>
        </>
    );
}
