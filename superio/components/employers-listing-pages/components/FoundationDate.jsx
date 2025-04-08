'use client'

import { useEffect, useState, useCallback } from "react";
import { Range, getTrackBackground } from "react-range"; // Import react-range
import { useRouter } from 'next/navigation';
import _ from 'lodash'; // Import lodash for debouncing
import { useSearchParams } from 'next/navigation';
// Removed Redux imports

const DEFAULT_MIN = 1900;
const DEFAULT_MAX = 2028; // Adjust if needed

const FoundationDate = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Get initial values from URL
    const urlMinStr = searchParams?.get('foundation_min');
    const urlMaxStr = searchParams?.get('foundation_max');

    const parsedMin = parseInt(urlMinStr, 10); // Try parsing
    const parsedMax = parseInt(urlMaxStr, 10); // Try parsing

    // Set state, defaulting to DEFAULT_MIN/MAX if parsing resulted in NaN or value was null/undefined
    const [values, setValues] = useState([
        isNaN(parsedMin) ? DEFAULT_MIN : parsedMin,
        isNaN(parsedMax) ? DEFAULT_MAX : parsedMax,
    ]);

    // Debounced function to update URL
    const debouncedUpdateUrl = useCallback(
        _.debounce((newValues) => { // Adapt to receive array
            const params = new URLSearchParams(searchParams);
            let changed = false;

            // Set or delete min value
            // Use array indexing
            if (newValues[0] !== DEFAULT_MIN) {
                params.set('foundation_min', newValues[0]);
                changed = true;
            } else {
                params.delete('foundation_min');
            }

            // Set or delete max value
            // Use array indexing
            if (newValues[1] !== DEFAULT_MAX) {
                params.set('foundation_max', newValues[1]);
                changed = true;
            } else {
                params.delete('foundation_max');
            }

            // Only push router if a value actually changed and is different from default
            if (changed) {
                 params.set('page', '1'); // Reset to page 1 when filter changes
                 router.push(`/employers?${params.toString()}`, { scroll: false });
            } else if (!params.has('foundation_min') && !params.has('foundation_max') && (initialMin !== DEFAULT_MIN || initialMax !== DEFAULT_MAX)) {
                 // If both params were removed and they were previously set, update URL
                 params.set('page', '1');
                 router.push(`/employers?${params.toString()}`, { scroll: false });
            }

        }, 800), // 800ms debounce delay for slider
        [searchParams, router] // Dependencies: Re-create debounce if searchParams or router changes
    );


    // Update local state and trigger debounced URL update on change
    // Adapt handler for react-range (passes array)
    const handleOnChange = (newValues) => {
        setValues(newValues); // Update local state immediately for slider responsiveness
        // Pass object expected by debouncedUpdateUrl
        debouncedUpdateUrl({ min: newValues[0], max: newValues[1] });
    };

    // Effect to update local state if URL changes externally
     useEffect(() => {
        const urlMinStr = searchParams?.get('foundation_min');
        const urlMaxStr = searchParams?.get('foundation_max');
        const urlMin = parseInt(urlMinStr, 10);
        const urlMax = parseInt(urlMaxStr, 10);
        setValues([
             isNaN(urlMin) ? DEFAULT_MIN : urlMin,
             isNaN(urlMax) ? DEFAULT_MAX : urlMax
        ]); // Update state array with NaN check
    }, [searchParams]);


    return (
        <div className="range-slider-one salary-range">
            <Range
                step={1}
                min={DEFAULT_MIN}
                max={DEFAULT_MAX}
                values={values}
                allowOverlap={false} // Similar to allowSameValues={false}
                onChange={(newValues) => handleOnChange(newValues)}
                renderTrack={({ props, children }) => (
                    <div
                        {...props}
                        style={{
                            ...props.style,
                            height: '6px',
                            width: '100%',
                            background: getTrackBackground({
                                values: values,
                                colors: ['#ccc', '#007bff', '#ccc'], // Adjust colors
                                min: DEFAULT_MIN,
                                max: DEFAULT_MAX
                            }),
                            borderRadius: '4px'
                        }}
                    >
                        {children}
                    </div>
                )}
                renderThumb={({ props }) => (
                    <div
                        {...props}
                        style={{
                            ...props.style,
                            height: '18px',
                            width: '18px',
                            backgroundColor: '#007bff', // Adjust thumb color
                            borderRadius: '50%',
                            boxShadow: '0px 2px 6px #AAA'
                        }}
                    />
                )}
            />
            <div className="input-outer">
                <div className="amount-outer">
                    <span className="d-inline-flex align-items-center">
                        {/* Display values from the state array */}
                        <span className="min">{values[0]}</span>
                        <span className="max ms-2">{values[1]}</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FoundationDate;
