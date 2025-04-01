import Link from "next/link";

// Accept tags prop (array of { name: string, slug: string })
const TagList = ({ tags = [] }) => {
  return (
    <>
      {tags.length === 0 && <li>No tags found.</li>}
      {tags.map((tag) => (
        <li key={tag.slug}> {/* Use slug as key */}
          {/* Link to the blog list page, filtering by tag slug */}
          <Link href={`/blog-list-v1?tag=${tag.slug}`}>
            {tag.name}
          </Link>
        </li>
      ))}
    </>
  );
};

export default TagList;
