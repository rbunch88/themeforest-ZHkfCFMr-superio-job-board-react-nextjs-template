// Accept job data as a prop
const JobOverView = ({ job }) => {
  // Basic check if job data is available
  if (!job) {
    return <div className="widget-content">Loading job overview...</div>;
  }

  // Helper function to format date (can be moved to a utils file later)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'Invalid Date';
    }
  };

  return (
    <div className="widget-content">
      <ul className="job-overview">
        {job.created_at && (
          <li>
            <i className="icon icon-calendar"></i>
            <h5>Date Posted:</h5>
            <span>{formatDate(job.created_at)}</span>
          </li>
        )}
        {/* Expiration date might need a separate field 'valid_through' in the DB */}
        {/* <li>
          <i className="icon icon-expiry"></i>
          <h5>Expiration date:</h5>
          <span>{formatDate(job.valid_through) || 'N/A'}</span>
        </li> */}
        {job.location && (
          <li>
            <i className="icon icon-location"></i>
            <h5>Location:</h5>
            <span>{job.location}</span>
          </li>
        )}
        {job.jobTitle && (
          <li>
            <i className="icon icon-user-2"></i>
            <h5>Job Title:</h5>
            <span>{job.jobTitle}</span>
          </li>
        )}
         {job.jobTypeName && ( // Display Job Type Name
          <li>
            <i className="icon icon-pin"></i> {/* Using a generic pin icon */}
            <h5>Job Type:</h5>
            <span>{job.jobTypeName}</span>
          </li>
        )}
         {job.experienceLevelName && ( // Display Experience Level Name
          <li>
            <i className="icon icon-level"></i> {/* Using a generic level icon */}
            <h5>Experience Level:</h5>
            <span>{job.experienceLevelName}</span>
          </li>
        )}
        {/* Hours might need a dedicated field */}
        {/* <li>
          <i className="icon icon-clock"></i>
          <h5>Hours:</h5>
          <span>50h / week</span>
        </li> */}
        {/* Rate might be derived from salary */}
        {/* <li>
          <i className="icon icon-rate"></i>
          <h5>Rate:</h5>
          <span>$15 - $25 / hour</span>
        </li> */}
        {job.salary && job.salary !== 'Not specified' && (
          <li>
            <i className="icon icon-salary"></i>
            <h5>Salary:</h5>
            <span>{job.salary}</span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default JobOverView;
