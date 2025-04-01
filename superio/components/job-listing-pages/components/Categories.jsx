'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCategory } from "../../../features/filter/filterSlice";
import { supabase } from "../../../utils/supabaseClient"; // Import supabase client

const Categories = () => {
    const { jobList } = useSelector((state) => state.filter) || {};
    const [categories, setCategories] = useState([]); // State for fetched categories
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const dispatch = useDispatch();

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
                const { data, error: fetchError } = await supabase
                    .from('job_categories')
                    .select('id, name')
                    .order('name', { ascending: true }); // Order alphabetically

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

        fetchCategories();
    }, []); // Empty dependency array ensures this runs only once on mount

    // category handler - dispatches the selected category's UUID
    const categoryHandler = (e) => {
        dispatch(addCategory(e.target.value)); // e.target.value will be the category UUID
    };

    return (
        <>
            <select
                className="form-select"
                value={jobList.category || ""} // Use the category UUID from Redux state, default to empty string
                onChange={categoryHandler}
                disabled={loading || error} // Disable while loading or if error occurred
            >
                <option value="">Choose a category</option>
                {loading && <option value="">Loading...</option>}
                {error && <option value="">Error loading</option>}
                {!loading && !error && categories.map((cat) => (
                    <option key={cat.id} value={cat.id}> {/* Use UUID as value */}
                        {cat.name}
                    </option>
                ))}
            </select>
            <span className="icon flaticon-briefcase"></span>
        </>
    );
};

export default Categories;
