'use client'; // Add this directive for client components

import React, { useState, useEffect } from 'react';
import Categories from "./Categories";
import RecentPost from "./RecentPost";
import SearchBox from "./SearchBox";
import TagList from "./TagList";
import { createClient } from '../../../utils/supabase/client'; // Correct client import

const BlogSidebar = () => {
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true); // Optional: for loading state

  useEffect(() => {
    const supabase = createClient(); // Instantiate client-side Supabase client

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('blog_categories')
          .select('name, slug')
          .order('name', { ascending: true });

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch Recent Posts
        const { data: recentPostsData, error: recentPostsError } = await supabase
          .from('blog_posts')
          .select('title, slug, published_at')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(5);

        if (recentPostsError) throw recentPostsError;
        setRecentPosts(recentPostsData || []);

        // Fetch Tags
        const { data: tagsData, error: tagsError } = await supabase
          .from('blog_tags')
          .select('name, slug')
          .order('name', { ascending: true }); // Or order by usage count later

        if (tagsError) throw tagsError;
        setTags(tagsData || []);

      } catch (error) {
        console.error("Error fetching blog sidebar data:", error);
        // Handle errors appropriately, maybe set an error state
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs once on mount

  // Data fetching moved to useEffect
  // Optional: Add loading indicators based on the 'loading' state
  // if (loading) {
  //   return <aside className="sidebar blog-sidebar">Loading...</aside>;
  // }


  return (
    <aside className="sidebar blog-sidebar">
      {/* <!-- Search Widget --> */}
      <div className="sidebar-widget search-widget">
        <div className="sidebar-title">
          <h4>Search by Keywords</h4>
        </div>
        <div className="search-box">
          <SearchBox /> {/* Search remains client-side for now */}
        </div>
      </div>

      {/* <!-- Category Widget --> */}
      <div className="sidebar-widget catagory-widget">
        <div className="sidebar-title">
          <h4>Categories</h4>
        </div>
        <ul className="catagory-list">
          {/* Pass fetched categories */}
          <Categories categories={categories} />
        </ul>
      </div>

      {/* <!-- Recent Post Widget --> */}
      <div className="sidebar-widget recent-post">
        <div className="sidebar-title">
          <h4>Recent Posts</h4>
        </div>
        <div className="widget-content">
          {/* Pass fetched recent posts */}
          <RecentPost recentPosts={recentPosts} />
        </div>
      </div>

      {/* <!-- Tag Widget --> */}
      <div className="sidebar-widget">
        <div className="sidebar-title">
          <h4>Tags</h4>
        </div>
        <ul className="tag-list">
          {/* Pass fetched tags */}
          <TagList tags={tags} />
        </ul>
      </div>
    </aside>
  );
};

export default BlogSidebar;
