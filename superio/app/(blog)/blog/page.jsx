import BlogList from "@/components/blog-meu-pages/blog-list-v1";
import { createClient } from '@/utils/supabase/server'; // Import from server utility
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export const metadata = {
  title: "ABA Career Insights & News | My ABA Jobs Blog",
  description: "Read the latest articles on ABA careers, job searching, professional development, and industry news on the My ABA Jobs blog.",
};

// Enable ISR - Revalidate every hour, for example
export const revalidate = 3600;

const BlogListPage = async ({ searchParams }) => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore); // Use the utility function with cookieStore
  const itemsPerPage = 6; // Number of posts per page

  // --- Pagination ---
  const page = parseInt(searchParams.page || '1', 10);
  const currentPage = Math.max(page, 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage - 1;

  // --- Filtering ---
  const categorySlug = searchParams.category;
  const tagSlug = searchParams.tag;

  // --- Base Query ---
  let query = supabase
    .from('blog_posts')
    .select('*, author:profiles(first_name, last_name), category:blog_categories!inner(name, slug)', { count: 'exact' }) // Use inner join for category filtering
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  // --- Apply Filters ---
  if (categorySlug) {
    query = query.eq('category.slug', categorySlug);
  }

  if (tagSlug) {
    // Need to join with blog_post_tags and blog_tags
    // This requires a more complex query or potentially a database function
    // For now, let's fetch all and filter client-side or implement tag filtering later
    // Alternatively, adjust the select to join tags:
    // query = supabase
    //   .from('blog_posts')
    //   .select('*, author:profiles(first_name, last_name), category:blog_categories!inner(name, slug), tags:blog_tags!inner(slug)', { count: 'exact' })
    //   .eq('status', 'published')
    //   .eq('tags.slug', tagSlug) // Filter by tag slug
    //   .order('published_at', { ascending: false });

     // Let's keep it simple for now and fetch without tag filter first
     console.warn("Tag filtering not fully implemented in this query yet.");
  }


  // --- Fetch Data with Pagination ---
  const { data: posts, error, count } = await query.range(startIndex, endIndex);

  if (error) {
    console.error("Error fetching blog posts:", error);
    // Consider showing an error message to the user
  }

  if (!posts && !error) {
      // It's possible count is 0, which is not an error, but means no posts found
      console.log("No blog posts found matching criteria.");
  }

  // --- Calculate Total Pages ---
  const totalPosts = count || 0;
  const totalPages = Math.ceil(totalPosts / itemsPerPage);

  // Optional: Redirect if page number is out of bounds
  if (currentPage > totalPages && totalPages > 0) {
     // Redirect to last page? Or first page? Or show not found?
     // For now, let's allow showing an empty page, pagination component should handle this.
     console.log(`Current page ${currentPage} exceeds total pages ${totalPages}`);
  }


  return (
    <>
      {/* Pass fetched data and pagination info to the layout/display component */}
      <BlogList
        posts={posts || []}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </>
  );
};

export default BlogListPage;
