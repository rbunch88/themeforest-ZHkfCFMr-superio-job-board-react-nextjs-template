import Link from "next/link";
import Image from "next/image";
import { createServerClient } from "@/utils/supabaseClient"; // To get public URL for images
import { format } from 'date-fns'; // For date formatting

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'MMMM d, yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return ''; // Return empty string or some default on error
  }
};

const Blog6 = ({ posts = [] }) => { // Accept posts prop, default to empty array
  const supabase = createServerClient(); // Get Supabase client instance

  // Function to get public URL safely
  const getImageUrl = (path) => {
    if (!path) return "/images/resource/blog/news-1.jpg"; // Default placeholder
    try {
        const { data } = supabase.storage.from('blog_images').getPublicUrl(path);
        return data?.publicUrl || "/images/resource/blog/news-1.jpg"; // Return placeholder if URL is null/undefined
    } catch (error) {
        console.error("Error getting image public URL:", error);
        return "/images/resource/blog/news-1.jpg"; // Fallback on error
    }
  };


  return (
    <>
      {posts.length === 0 && <p>No blog posts found.</p>}
      {posts.map((post) => {
        const imageUrl = getImageUrl(post.featured_image_url);
        const postDate = formatDate(post.published_at);

        return (
          <div className="news-block col-lg-6 col-md-6 col-sm-12" key={post.id}>
            <div className="inner-box">
              <div className="image-box">
                <figure className="image">
                  <Link href={`/blog-details/${post.slug}`}>
                    <Image
                      width={389}
                      height={258}
                      style={{ width: '100%', height: 'auto' }} // Maintain aspect ratio
                      src={imageUrl}
                      alt={post.title || "Blog post image"}
                    />
                  </Link>
                </figure>
              </div>
              {/* End image-box */}

              <div className="lower-content">
                <ul className="post-meta">
                  {postDate && (
                    <li>
                      {/* Link removed as date is not usually clickable */}
                      <span>{postDate}</span>
                    </li>
                  )}
                  {post.category?.name && (
                     <li>
                       {/* Link to category filter page */}
                       <Link href={`/blog-list-v1?category=${post.category.slug}`}>
                         {post.category.name}
                       </Link>
                     </li>
                  )}
                  {/* Comment count removed for now */}
                </ul>
                {/* End post meta */}

                <h3>
                  <Link href={`/blog-details/${post.slug}`}>{post.title || 'Untitled Post'}</Link>
                </h3>

                {post.excerpt && (
                  <p className="text">{post.excerpt}</p>
                )}
                <Link href={`/blog-details/${post.slug}`} className="read-more">
                  Read More <i className="fa fa-angle-right"></i>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Blog6;
