

'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
// Removed Redux imports

const Tag = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedTag = searchParams.get('tag'); // Get selected tag from URL

    // --- TEMPORARY Placeholder for available tags ---
    // TODO: Replace this with actual data fetching or props
    const tags = [
        { id: 1, name: 'App', value: 'app' },
        { id: 2, name: 'Design', value: 'design' },
        { id: 3, name: 'Digital', value: 'digital' },
        { id: 4, name: 'React', value: 'react' },
        { id: 5, name: 'UI', value: 'ui' },
        { id: 6, name: 'Remote', value: 'remote' },
    ];
    // --- End Temporary Placeholder ---

    const handleTagClick = useCallback((tagValue) => {
        const params = new URLSearchParams(searchParams);
        const currentTag = params.get('tag');

        if (currentTag === tagValue) {
            // If the clicked tag is already active, remove it
            params.delete('tag');
        } else {
            // Otherwise, set the new tag
            params.set('tag', tagValue);
        }

        params.set('page', '1'); // Reset page
        router.push(`/jobs?${params.toString()}`, { scroll: false });

    }, [searchParams, router]);

    return (
        <ul className="tags-style-one">
            {tags?.map((item) => (
                <li
                    className={item.value === selectedTag ? "active" : ""} // Highlight based on URL param
                    onClick={() => handleTagClick(item.value)} // Use the new handler
                    key={item.id}
                >
                    {item.name}
                </li>
            ))}
        </ul>
    );
};

export default Tag;
