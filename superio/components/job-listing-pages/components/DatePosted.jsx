
'use client'
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
// Removed Redux imports
import Select from 'react-select';

const DatePosted = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedDateValue = searchParams.get('date_posted') || 'all'; // Default to 'all' if not present

    // --- TEMPORARY Placeholder for available date options ---
    // TODO: Replace this with actual data fetching or props
    const datePostList = [ // Renamed for clarity
        { id: 1, name: 'All', value: 'all' },
        { id: 2, name: 'Last 24 Hours', value: 'last-24-hours' },
        { id: 3, name: 'Last 7 Days', value: 'last-7-days' },
        { id: 4, name: 'Last 14 Days', value: 'last-14-days' },
        { id: 5, name: 'Last 30 Days', value: 'last-30-days' },
    ];
    // --- End Temporary Placeholder ---

    // Transform datePostList for react-select options
    const dateOptions = useMemo(() =>
        datePostList.map(date => ({ value: date.value, label: date.name })),
    [datePostList]);

    // Find the selected option object based on the value from URL
    const selectedValue = useMemo(() =>
        dateOptions.find(option => option.value === selectedDateValue) || dateOptions[0], // Default to 'All'
    [dateOptions, selectedDateValue]);

    const handleDateChange = useCallback((selectedOption) => {
        const value = selectedOption ? selectedOption.value : 'all'; // Get value or default to 'all'
        const params = new URLSearchParams(searchParams);

        if (value === 'all') {
            params.delete('date_posted'); // Remove param if 'All' is selected
        } else {
            params.set('date_posted', value);
        }

        params.set('page', '1'); // Reset page
        router.push(`/jobs?${params.toString()}`, { scroll: false });

    }, [searchParams, router]);

    return (
        <div className="form-group"> {/* Added form-group wrapper */}
            <Select
                name="date_posted"
                options={dateOptions}
                className="basic-single"
                classNamePrefix="select"
                onChange={handleDateChange}
                value={selectedValue}
                isClearable={false} // Since 'All' is an option, no need to clear
                placeholder="Select Date Posted..."
            />
        </div>
    );
};

export default DatePosted;
