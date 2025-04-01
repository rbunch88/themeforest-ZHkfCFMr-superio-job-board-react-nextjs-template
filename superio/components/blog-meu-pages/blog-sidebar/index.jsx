import Categories from "./Categories";
import RecentPost from "./RecentPost";
import SearchBox from "./SearchBox";
import TagList from "./TagList";
import { createServerClient } from "@/utils/supabaseClient";

// Convert to async component to fetch data
const BlogSidebar = async () => {
  const supabase = createServerClient();

  // Fetch Categories
  const { data: categories, error: categoriesError } = await supabase
    .from('blog_categories')
    .select('name, slug')
    .order('name', { ascending: true });

  if (categoriesError) {
    console.error("Error fetching blog categories:", categoriesError);
  }

  // Fetch Recent Posts (e.g., latest 5)
  const { data: recentPosts, error: recentPostsError } = await supabase
    .from('blog_posts')
    .select('title, slug, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5);

  if (recentPostsError) {
    console.error("Error fetching recent blog posts:", recentPostsError);
  }

  // Fetch Tags (fetch all for now, could optimize later)
  const { data: tags, error: tagsError } = await supabase
    .from('blog_tags')
    .select('name, slug')
    .order('name', { ascending: true }); // Or order by usage count later

  if (tagsError) {
    console.error("Error fetching blog tags:", tagsError);
  }


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
          <Categories categories={categories || []} />
        </ul>
      </div>

      {/* <!-- Recent Post Widget --> */}
      <div className="sidebar-widget recent-post">
        <div className="sidebar-title">
          <h4>Recent Posts</h4>
        </div>
        <div className="widget-content">
          {/* Pass fetched recent posts */}
          <RecentPost recentPosts={recentPosts || []} />
        </div>
      </div>

      {/* <!-- Tag Widget --> */}
      <div className="sidebar-widget">
        <div className="sidebar-title">
          <h4>Tags</h4>
        </div>
        <ul className="tag-list">
          {/* Pass fetched tags */}
          <TagList tags={tags || []} />
        </ul>
      </div>
    </aside>
  );
};

export default BlogSidebar;
