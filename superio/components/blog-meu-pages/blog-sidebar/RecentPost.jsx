import Link from "next/link";
import { format } from 'date-fns'; // For date formatting

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    // Use a shorter format for recent posts, e.g., 'MMM d, yyyy'
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return ''; // Return empty string or some default on error
  }
};

// Accept recentPosts prop (array of { title: string, slug: string, published_at: string })
const RecentPost = ({ recentPosts = [] }) => {
  return (
    <>
      {recentPosts.length === 0 && <p>No recent posts found.</p>}
      {recentPosts.map((post) => {
        const postDate = formatDate(post.published_at);
        return (
          <article className="post" key={post.slug}> {/* Use slug as key */}
            {/* Image removed as it's not fetched in the parent component */}
            {/* <div className="post-thumb"> ... </div> */}
            <h6>
              <Link href={`/blog-details/${post.slug}`}>{post.title || 'Untitled Post'}</Link>
            </h6>
            {postDate && (
              <div className="post-info">{postDate}</div>
            )}
          </article>
        );
      })}
    </>
  );
};

export default RecentPost;
