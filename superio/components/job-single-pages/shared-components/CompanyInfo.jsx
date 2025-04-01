import Social from "../social/Social";

// Accept company data as a prop
const CompanyInfo = ({ company }) => {
  // Basic check if company data is available
  if (!company) {
    return <div className="widget-content">Loading company info...</div>;
  }

  return (
    <ul className="company-info">
      {/* TODO: Fetch and display industry from company table if needed */}
      {/* {company.industry && (
        <li>
          Primary industry: <span>{company.industry}</span>
        </li>
      )} */}
      {company.size && ( // Assuming 'size' field exists in companies table
        <li>
          Company size: <span>{company.size}</span>
        </li>
      )}
      {company.founded_year && ( // Assuming 'founded_year' field exists
        <li>
          Founded in: <span>{company.founded_year}</span>
        </li>
      )}
      {/* TODO: Add phone and email fields to companies table if needed */}
      {/* {company.phone && (
        <li>
          Phone: <span>{company.phone}</span>
        </li>
      )}
      {company.email && (
        <li>
          Email: <span>{company.email}</span>
        </li>
      )} */}
      {company.location && ( // Assuming 'location' field exists (might be headquarters)
        <li>
          Location: <span>{company.location}</span>
        </li>
      )}
      {/* TODO: Fetch and display social media links dynamically if stored */}
      <li>
        Social media:
        <Social /> {/* Keep static social links for now */}
      </li>
    </ul>
  );
};

export default CompanyInfo;
