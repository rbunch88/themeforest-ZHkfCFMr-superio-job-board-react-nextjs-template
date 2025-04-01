import { createServerClient } from "@/utils/supabaseClient";
import { notFound } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { format } from 'date-fns';
// Import components needed for the details page layout (adjust paths as needed)
import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader from "@/components/header/DefaulHeader";
import MobileMenu from "@/components/header/MobileMenu";
import BlogSidebar from "@/components/blog-meu-pages/blog-sidebar"; // Re-use sidebar
// Potentially import specific detail components if they exist or create new ones
// import BlogContent from "@/components/blog-meu-pages/blog-details/BlogContent";
// import BlogTags from "@/components/blog-meu-pages/blog-details/BlogTags";
// import AuthorInfo from "@/components/blog-meu-pages/blog-details/AuthorInfo";

// Enable ISR - Revalidate every hour, for example
export const revalidate = 3600;

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'MMMM d, yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return '';
  }
};

// Function to get image URL safely
const getImageUrl = (supabase, path, bucket = 'blog_images', placeholder = "/images/resource/blog/news-1.jpg") => {
    if (!path) return placeholder;
    try {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data?.publicUrl || placeholder;
    } catch (error) {
        console.error(`Error getting image public URL from ${bucket}:`, error);
        return placeholder;
    }
};


// Generate Metadata for SEO
export async function generateMetadata({ params }) {
  const supabase = createServerClient();
  const { slug } = params;

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !post) {
    // Return default metadata or handle not found scenario
    return {
      title: "Blog Post Not Found | My ABA Jobs",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${post.title} | My ABA Jobs Blog`,
    description: post.excerpt || "Read this article on My ABA Jobs.", // Fallback description
    // Add other metadata like openGraph if needed
  };
}

// Main Page Component
const BlogDetailsPage = async ({ params }) => {
  const supabase = createServerClient();
  const { slug } = params;

  // Fetch the full blog post data
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:profiles ( first_name, last_name, avatar_url ),
      category:blog_categories ( name, slug ),
      tags:blog_post_tags ( tag:blog_tags ( name, slug ) )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !post) {
    console.error(`Error fetching blog post with slug ${slug}:`, error);
    notFound(); // Render the 404 page if post not found or error occurs
  }

  const postDate = formatDate(post.published_at);
  const featuredImageUrl = getImageUrl(supabase, post.featured_image_url);
  const authorImageUrl = getImageUrl(supabase, post.author?.avatar_url, 'avatars', '/images/resource/candidate-1.png'); // Placeholder avatar

  // Extract tag names cleanly
  const postTags = post.tags?.map(t => t.tag).filter(Boolean) || [];

  return (
    <>
      {/* <!-- Header Span --> */}
      <span className="header-span"></span>

      <LoginPopup />
      <DefaulHeader />
      <MobileMenu />

      {/* <!-- Blog Single --> */}
      <section className="blog-single-section">
        <div className="auto-container">
          <div className="upper-box">
            <h1>{post.title}</h1>
            <ul className="post-info">
              {postDate && <li>{postDate}</li>}
              {post.category?.name && (
                <li>
                  <Link href={`/blog-list-v1?category=${post.category.slug}`}>
                    {post.category.name}
                  </Link>
                </li>
              )}
              {/* Add comment count later if implemented */}
            </ul>
          </div>
          {/* End upper-box */}

          <div className="post-content">
            <figure className="main-image">
              <Image
                width={1100} // Adjust width as needed for layout
                height={500} // Adjust height as needed
                style={{ width: '100%', height: 'auto' }}
                src={featuredImageUrl}
                alt={post.title}
              />
            </figure>

            {/* Render the main blog content */}
            {/* IMPORTANT: If content is HTML, use dangerouslySetInnerHTML carefully. */}
            {/* If content is Markdown, use a library like react-markdown */}
            <div className="text" dangerouslySetInnerHTML={{ __html: post.content || '' }}>
              {/* Assuming post.content is safe HTML for now */}
            </div>

            {/* <!-- Post Tags --> */}
            {postTags.length > 0 && (
              <div className="post-tags">
                <div className="tags">
                  <span>Tags: </span>
                  {postTags.map((tag) => (
                    <Link key={tag.slug} href={`/blog-list-v1?tag=${tag.slug}`}>
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* <!-- Author Box --> */}
            {post.author && (
              <div className="author-box">
                <figure className="author-image">
                  <Image
                    width={100}
                    height={100}
                    src={authorImageUrl}
                    alt={`${post.author.first_name} ${post.author.last_name}`}
                  />
                </figure>
                <h4 className="name">{`${post.author.first_name} ${post.author.last_name}`}</h4>
                {/* Add author bio later if available in profiles table */}
                {/* <p className="designation">Author Designation</p> */}
                {/* <div className="text">Author bio...</div> */}
              </div>
            )}

            {/* Add Comment Section Component Here Later */}
            {/* <BlogComments /> */}

            {/* Add Comment Form Component Here Later */}
            {/* <CommentForm /> */}

          </div>
          {/* End post-content */}
        </div>
        {/* End auto-container */}
      </section>
      {/* <!-- End Blog Single Section --> */}


      <FooterDefault footerStyle="alternate5" />
    </>
  );
};

export default BlogDetailsPage;