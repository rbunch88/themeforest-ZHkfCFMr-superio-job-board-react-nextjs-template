'use client'

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import _ from 'lodash'; // Import lodash for debouncing

// Removed Redux imports

const SearchBox = () => { // Remove searchParams from props
    const router = useRouter();
    const searchParams = useSearchParams(); // Use the hook
    const currentSearch = searchParams.get('search') || ''; // Get initial value from URL
    const [searchValue, setSearchValue] = useState(currentSearch);

    // Debounced function to update URL
    const debouncedUpdateUrl = useCallback(
        _.debounce((value) => {
            const params = new URLSearchParams(searchParams);
            if (value) {
                params.set('search', value);
            } else {
                params.delete('search'); // Remove param if search is empty
            }
            params.set('page', '1'); // Reset to page 1 on new search
            router.push(`/employers?${params.toString()}`, { scroll: false }); // Use scroll: false to prevent jumping to top
        }, 500), // 500ms debounce delay
        [searchParams, router] // Dependencies for useCallback
    );

    // Update local state and trigger debounced URL update on change
    const handleChange = (e) => {
        const newValue = e.target.value;
        setSearchValue(newValue);
        debouncedUpdateUrl(newValue);
    };

    // Effect to update local state if URL changes externally (e.g., browser back/forward)
    useEffect(() => {
        setSearchValue(currentSearch);
    }, [currentSearch]);


    return (
        <>
            <input
                type="text"
                name="listing-search"
                placeholder="Company name or keyword" // Updated placeholder
                value={searchValue}
                onChange={handleChange}
            />
            <span className="icon flaticon-search-3"></span>
        </>
    );
};

export default SearchBox;
