
'use client'

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
// Removed Redux imports

const LocationBox = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [location, setLocation] = useState(searchParams.get('location') || '');
    const debounceTimeoutRef = useRef(null); // Ref for debounce timeout

    // --- Debounced URL Update ---
    const updateURLDebounced = useCallback((newLocation) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (newLocation) {
                params.set('location', newLocation);
            } else {
                params.delete('location');
            }
            params.set('page', '1'); // Reset page
            router.push(`/jobs?${params.toString()}`, { scroll: false });
        }, 500); // 500ms delay
    }, [searchParams, router]);

    // --- Input Change Handler ---
    const handleLocationChange = (e) => {
        const newLocation = e.target.value;
        setLocation(newLocation); // Update local state immediately
        updateURLDebounced(newLocation); // Trigger debounced URL update
    };

    // --- Sync local state with URL ---
    useEffect(() => {
        const urlLocation = searchParams.get('location') || '';
        if (location !== urlLocation) {
            setLocation(urlLocation);
        }
        // Only depend on searchParams
    }, [searchParams]);

    // --- Cleanup debounce on unmount ---
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <input
                type="text"
                name="listing-search"
                placeholder="City or postcode"
                value={location}
                onChange={handleLocationChange}
            />
            <span className="icon flaticon-map-locator"></span>
        </>
    );
};

export default LocationBox;
