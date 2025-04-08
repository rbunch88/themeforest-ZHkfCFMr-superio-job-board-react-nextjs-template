'use client'

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import _ from 'lodash'; // Import lodash for debouncing

// Removed Redux imports

const LocationBox = () => { // Removed searchParams from props
    const router = useRouter();
    const searchParams = useSearchParams(); // Use the hook
    const currentLocation = searchParams.get('location') || ''; // Get initial value from URL
    const [locationValue, setLocationValue] = useState(currentLocation);

    // Debounced function to update URL
    const debouncedUpdateUrl = useCallback(
        _.debounce((value) => {
            const params = new URLSearchParams(searchParams);
            if (value) {
                params.set('location', value);
            } else {
                params.delete('location'); // Remove param if location is empty
            }
            params.set('page', '1'); // Reset to page 1 on new location filter
            router.push(`/employers?${params.toString()}`, { scroll: false }); // Use scroll: false
        }, 500), // 500ms debounce delay
        [searchParams, router] // Dependencies for useCallback
    );

    // Update local state and trigger debounced URL update on change
    const handleChange = (e) => {
        const newValue = e.target.value;
        setLocationValue(newValue);
        debouncedUpdateUrl(newValue);
    };

     // Effect to update local state if URL changes externally
    useEffect(() => {
        setLocationValue(currentLocation);
    }, [currentLocation]);

    return (
        <>
            <input
                type="text"
                name="listing-search" // Consider changing name if needed, though not critical
                placeholder="City or postcode"
                value={locationValue}
                onChange={handleChange}
            />
            <span className="icon flaticon-map-locator"></span>
        </>
    );
};

export default LocationBox;
