
'use client'

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
// Removed Redux imports

const SearchBox = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const debounceTimeoutRef = useRef(null); // Ref to store debounce timeout ID

    // --- Debounced URL Update Function ---
    const updateURLDebounced = useCallback((newKeyword) => {
        // Clear any existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Set a new timeout
        debounceTimeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (newKeyword) {
                params.set('keyword', newKeyword);
            } else {
                params.delete('keyword');
            }
            params.set('page', '1'); // Reset page
            router.push(`/jobs?${params.toString()}`, { scroll: false });
        }, 500); // 500ms debounce delay
    }, [searchParams, router]);


    // --- Input Change Handler ---
    const handleKeywordChange = (e) => {
        const newKeyword = e.target.value;
        setKeyword(newKeyword); // Update local state immediately
        updateURLDebounced(newKeyword); // Trigger debounced URL update
    };

    // --- Sync local state with URL changes ---
    useEffect(() => {
        const urlKeyword = searchParams.get('keyword') || '';
        if (keyword !== urlKeyword) {
            setKeyword(urlKeyword);
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
                placeholder="Job title, keywords, or company"
                value={keyword}
                onChange={handleKeywordChange}
            />
            <span className="icon flaticon-search-3"></span>
        </>
    );
};

export default SearchBox;
