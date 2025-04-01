import Link from "next/link";

// Accept categories prop (array of { name: string, slug: string })
const Categories = ({ categories = [] }) => {
  return (
    <>
      {categories.length === 0 && <li>No categories found.</li>}
      {categories.map((category) => (
        <li key={category.slug}> {/* Use slug as key */}
          {/* Link to the blog list page, filtering by category slug */}
          <Link href={`/blog-list-v1?category=${category.slug}`}>
            {category.name}
          </Link>
          {/* Optional: Add post count per category later if needed */}
        </li>
      ))}
    </>
  );
};

export default Categories;
