'use client'

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "@/utils/supabase/client"; // Import from new client utility

// Removed Redux imports

const Categories = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient(); // Initialize new client

    const currentCategory = searchParams.get('category') || ""; // Get current category from URL

    const [categories, setCategories] = useState([]); // State for fetched categories
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch categories from Supabase on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            setError(null);
            if (!supabase) {
                setError('Supabase client not available');
                setLoading(false);
                return;
            }
            try {
                // Fetch categories including their slugs
                const { data, error: fetchError } = await supabase
                    .from('job_categories')
                    .select('id, name')
                    .order('name', { ascending: true });

                if (fetchError) throw fetchError;

                setCategories(data || []);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError(err.message || "Failed to fetch categories.");
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if supabase client is available
        if (supabase) {
            fetchCategories();
        }
    }, [supabase]); // Dependency on supabase client instance

    // category handler - updates the URL search parameter
    const categoryHandler = (e) => {
        const newCategorySlug = e.target.value;
        const params = new URLSearchParams(searchParams);

        if (newCategorySlug) {
            params.set('category', newCategorySlug);
        } else {
            params.delete('category'); // Remove category if "Choose a category" is selected
        }
        params.set('page', '1'); // Reset page on filter change
        // Assuming this component is used on the /jobs page
        router.push(`/jobs?${params.toString()}`, { scroll: false });
    };

    return (
        <>
            <select
                className="form-select"
                value={currentCategory} // Control value from URL search param
                onChange={categoryHandler}
                disabled={loading || error || !supabase} // Disable if loading, error, or no client
            >
                <option value="">Choose a category</option>
                {loading && <option value="" disabled>Loading...</option>}
                {error && <option value="" disabled>Error loading</option>}
                {!loading && !error && categories.map((cat) => (
                    // Use slug as the value for the URL parameter
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                ))}
            </select>
            <span className="icon flaticon-briefcase"></span>
        </>
    );
};

export default Categories;
