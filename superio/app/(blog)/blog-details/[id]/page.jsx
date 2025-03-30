import dynamic from "next/dynamic";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader from "@/components/header/DefaulHeader";
import MobileMenu from "@/components/header/MobileMenu";
import DetailsContent from "@/components/blog-meu-pages/blog-details/details-content";
import blogs from "@/data/blogs";
import Image from "next/image";

// Function to generate dynamic metadata
export async function generateMetadata({ params }) {
  const id = params.id;
  const blog = blogs.find((item) => item.id == id); // Find the specific blog post

  if (!blog) {
    // Fallback if blog post not found
    return {
      title: "Blog Post Not Found | My ABA Jobs",
      description: "The requested blog post could not be found on the My ABA Jobs blog.",
    };
  }

  // Construct dynamic title and description
  // Using blogSingleTitle if available, otherwise a generic title
  const title = `${blog.blogSingleTitle || 'Blog Post'} | My ABA Jobs Blog`;
  // Description could be improved later if blog data includes excerpts
  const description = `Read the article "${blog.blogSingleTitle || 'Blog Post'}" on the My ABA Jobs blog for insights into ABA careers and the industry.`; // Corrected typo

  return {
    title: title,
    description: description,
  };
}

const BlogDetailsDynamic = ({ params }) => {
  const id = params.id;

  const blog = blogs.find((item) => item.id == id) || blogs[0];

  return (
    <>
      {/* <!-- Header Span --> */}
      <span className="header-span"></span>

      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader />
      {/* <!--End Main Header --> */}

      <MobileMenu />
      {/* End MobileMenu */}

      {/* <!-- Blog Single --> */}
      <section className="blog-single">
        <div className="auto-container">
          <div className="upper-box">
            <h3>{blog?.blogSingleTitle}</h3>

            <ul className="post-info">
              <li>
                <span className="thumb">
                  <Image
                    width={30}
                    height={30}
                    src={"/images/resource/thumb-1.png"}
                    alt="resource"
                  />
                </span>
                Alison Dawn
              </li>
              <li>August 31, 2021</li>
              <li>12 Comment</li>
            </ul>
            {/* End post info */}
          </div>
        </div>
        {/* End auto-container */}

        <figure className="main-image">
          <Image width={1903} height={595} src={blog?.img} alt="resource" />
        </figure>

        <DetailsContent />
      </section>
      {/* <!-- End Blog Single --> */}

      <FooterDefault footerStyle="alternate5" />
      {/* <!-- End Main Footer --> */}
    </>
  );
};

export default dynamic(() => Promise.resolve(BlogDetailsDynamic), {
  ssr: false,
});
