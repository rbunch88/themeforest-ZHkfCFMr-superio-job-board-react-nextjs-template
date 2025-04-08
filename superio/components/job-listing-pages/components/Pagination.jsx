import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPaginationItems = () => {
    // Use totalPages prop
    const items = [];

    for (let page = 1; page <= totalPages; page++) {
      const isCurrentPage = page === currentPage;
      const className = isCurrentPage ? "current-page" : "";

      items.push(
        <li key={page}>
          <span className={className} onClick={() => onPageChange(page)}>
            {page}
          </span>
        </li>
      );
    }

    return items;
  };

  return (
    <nav className="ls-pagination">
      <ul>
        <li className="prev">
          {currentPage > 1 && ( // Only show if not on first page
            <span onClick={handlePrevClick}>
              <i className="fa fa-arrow-left"></i>
            </span>
          )}
        </li>
        {renderPaginationItems()}
        <li className="next">
          {currentPage < totalPages && ( // Only show if not on last page
            <span onClick={handleNextClick}>
              <i className="fa fa-arrow-right"></i>
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
