'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // To preserve other query params

const BlogPagination = ({ currentPage = 1, totalPages = 1 }) => {
  const searchParams = useSearchParams(); // Get current search params

  // Function to create page link preserving other query params
  const createPageURL = (pageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `/blog-list-v1?${params.toString()}`;
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    // Basic pagination: show all pages. Could be enhanced later for large numbers.
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <li key={i}>
          <Link
            href={createPageURL(i)}
            className={i === currentPage ? "current-page" : ""}
          >
            {i}
          </Link>
        </li>
      );
    }
    return pageNumbers;
  };

  // Don't render pagination if there's only one page or less
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="ls-pagination">
      <ul>
        {/* Previous Page Link */}
        <li className={`prev ${currentPage === 1 ? 'disabled' : ''}`}>
          {currentPage > 1 ? (
            <Link href={createPageURL(currentPage - 1)}>
              <i className="fa fa-arrow-left"></i>
            </Link>
          ) : (
            <span><i className="fa fa-arrow-left"></i></span> // Non-clickable span when disabled
          )}
        </li>
        {/* End li */}

        {/* Page Number Links */}
        {renderPageNumbers()}

        {/* Next Page Link */}
        <li className={`next ${currentPage === totalPages ? 'disabled' : ''}`}>
          {currentPage < totalPages ? (
            <Link href={createPageURL(currentPage + 1)}>
              <i className="fa fa-arrow-right"></i>
            </Link>
          ) : (
            <span><i className="fa fa-arrow-right"></i></span> // Non-clickable span when disabled
          )}
        </li>
      </ul>
    </nav>
  );
};

export default BlogPagination;
